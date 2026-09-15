/**
 * API layer
 * ---------
 * This project is a frontend only (React + TS + Tailwind). It expects a
 * Django REST Framework backend where each function below maps to one
 * real endpoint. Underneath those endpoints, Django can call stored
 * procedures (e.g. via `cursor.callproc(...)`) — the frontend never
 * needs to know that; it only sees JSON in and JSON out.
 *
 * For now this file is backed by localStorage + mock seed data so the
 * whole app runs and is clickable without a backend. Swap the body of
 * each function for an `axios` call to the matching endpoint (shown in
 * each comment) once the Django side is ready. Nothing in the
 * components below needs to change.
 */
import axios from 'axios'
import { mockCourses, mockReports, mockTracker, mockUsers } from '@/data/mockData'
import type {
  AnalyticsSummary,
  Course,
  IssueType,
  Report,
  TrackerEntry,
  TrackerStatus,
  User,
} from '@/types'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

export const http = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('dyb_token')
  if (token) config.headers.Authorization = `Token ${token}`
  return config
})

// ---------------------------------------------------------------------------
// Local persistence helpers (stand-in for the Django database)
// ---------------------------------------------------------------------------
function load<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key)
  if (!raw) {
    localStorage.setItem(key, JSON.stringify(fallback))
    return fallback
  }
  return JSON.parse(raw) as T
}

function save<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
}

const KEYS = {
  users: 'dyb_users',
  courses: 'dyb_courses',
  tracker: 'dyb_tracker',
  reports: 'dyb_reports',
  swipeLog: 'dyb_swipe_log',
  session: 'dyb_session',
}

function delay<T>(value: T, ms = 350): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

// ---------------------------------------------------------------------------
// Auth
// POST /api/auth/register/   POST /api/auth/login/   POST /api/auth/logout/
// POST /api/auth/change-password/
// ---------------------------------------------------------------------------
export const auth = {
  async register(email: string, password: string): Promise<User> {
    if (!email.includes('@') || password.length < 8) {
      throw new Error('Enter a valid email and a password with at least 8 characters.')
    }
    const users = load<User[]>(KEYS.users, mockUsers)
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('An account with this email already exists.')
    }
    const user: User = {
      id: uid('u'),
      email,
      role: 'user',
      createdAt: new Date().toISOString(),
    }
    users.push(user)
    save(KEYS.users, users)
    save(`dyb_pw_${user.id}`, password)
    save(KEYS.session, user)
    return delay(user)
  },

  async login(email: string, password: string): Promise<User> {
    const users = load<User[]>(KEYS.users, mockUsers)
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase())
    // Seed accounts accept any password >= 4 chars for demo purposes.
    const seeded = mockUsers.some((u) => u.id === user?.id)
    const storedPw = user ? localStorage.getItem(`dyb_pw_${user.id}`) : null
    const valid = user && (seeded ? password.length >= 4 : storedPw === password)
    if (!valid) throw new Error('Incorrect email or password.')
    save(KEYS.session, user)
    localStorage.setItem('dyb_token', uid('token'))
    return delay(user as User)
  },

  async logout(): Promise<void> {
    localStorage.removeItem(KEYS.session)
    localStorage.removeItem('dyb_token')
    return delay(undefined)
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const seeded = mockUsers.some((u) => u.id === userId)
    const storedPw = localStorage.getItem(`dyb_pw_${userId}`)
    if (!seeded && storedPw !== currentPassword) {
      throw new Error('Current password is incorrect.')
    }
    if (newPassword.length < 8) throw new Error('New password must be at least 8 characters.')
    save(`dyb_pw_${userId}`, newPassword)
    return delay(undefined)
  },

  currentUser(): User | null {
    return load<User | null>(KEYS.session, null)
  },
}

// ---------------------------------------------------------------------------
// Courses
// GET /api/courses/  GET /api/courses/:id/  POST /api/courses/ (admin)
// PATCH /api/courses/:id/ (admin)  DELETE /api/courses/:id/ (admin, soft)
// ---------------------------------------------------------------------------
export const coursesApi = {
  async listActive(excludeIds: string[] = []): Promise<Course[]> {
    const courses = load<Course[]>(KEYS.courses, mockCourses)
    return delay(courses.filter((c) => c.status === 'active' && !excludeIds.includes(c.id)))
  },

  async listAll(): Promise<Course[]> {
    return delay(load<Course[]>(KEYS.courses, mockCourses))
  },

  async get(id: string): Promise<Course | undefined> {
    const courses = load<Course[]>(KEYS.courses, mockCourses)
    return delay(courses.find((c) => c.id === id))
  },

  async create(input: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>): Promise<Course> {
    const courses = load<Course[]>(KEYS.courses, mockCourses)
    const course: Course = {
      ...input,
      id: uid('c'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    courses.unshift(course)
    save(KEYS.courses, courses)
    return delay(course)
  },

  async update(id: string, patch: Partial<Course>): Promise<Course> {
    const courses = load<Course[]>(KEYS.courses, mockCourses)
    const idx = courses.findIndex((c) => c.id === id)
    if (idx === -1) throw new Error('Course not found.')
    courses[idx] = { ...courses[idx], ...patch, updatedAt: new Date().toISOString() }
    save(KEYS.courses, courses)
    return delay(courses[idx])
  },

  async softDelete(id: string): Promise<void> {
    await coursesApi.update(id, { status: 'inactive' })
    return delay(undefined)
  },
}

// ---------------------------------------------------------------------------
// Swipes + Tracker
// POST /api/swipes/   GET /api/tracker/   PATCH /api/tracker/:id/
// ---------------------------------------------------------------------------
export const trackerApi = {
  async logSwipe(courseId: string, userId: string, direction: 'left' | 'right') {
    const log = load<{ courseId: string; userId: string; direction: string; at: string }[]>(
      KEYS.swipeLog,
      []
    )
    log.push({ courseId, userId, direction, at: new Date().toISOString() })
    save(KEYS.swipeLog, log)

    if (direction === 'right') {
      const tracker = load<TrackerEntry[]>(KEYS.tracker, mockTracker)
      if (!tracker.some((t) => t.courseId === courseId && t.userId === userId)) {
        tracker.unshift({
          id: uid('t'),
          courseId,
          userId,
          status: 'Interested',
          notes: '',
          updatedAt: new Date().toISOString(),
        })
        save(KEYS.tracker, tracker)
      }
    }
    return delay(undefined, 150)
  },

  async listForUser(userId: string): Promise<TrackerEntry[]> {
    const tracker = load<TrackerEntry[]>(KEYS.tracker, mockTracker)
    return delay(tracker.filter((t) => t.userId === userId))
  },

  async update(id: string, patch: { status?: TrackerStatus; notes?: string }): Promise<TrackerEntry> {
    const tracker = load<TrackerEntry[]>(KEYS.tracker, mockTracker)
    const idx = tracker.findIndex((t) => t.id === id)
    if (idx === -1) throw new Error('Tracker entry not found.')
    tracker[idx] = { ...tracker[idx], ...patch, updatedAt: new Date().toISOString() }
    save(KEYS.tracker, tracker)
    return delay(tracker[idx])
  },
}

// ---------------------------------------------------------------------------
// Reports
// POST /api/reports/   GET /api/reports/ (admin)   PATCH /api/reports/:id/ (admin)
// ---------------------------------------------------------------------------
export const reportsApi = {
  async create(courseId: string, userId: string, issueType: IssueType, comment: string): Promise<Report> {
    const reports = load<Report[]>(KEYS.reports, mockReports)
    const report: Report = {
      id: uid('r'),
      courseId,
      userId,
      issueType,
      comment,
      status: 'open',
      createdAt: new Date().toISOString(),
    }
    reports.unshift(report)
    save(KEYS.reports, reports)
    return delay(report)
  },

  async listAll(): Promise<Report[]> {
    return delay(load<Report[]>(KEYS.reports, mockReports))
  },

  async updateStatus(id: string, status: Report['status']): Promise<Report> {
    const reports = load<Report[]>(KEYS.reports, mockReports)
    const idx = reports.findIndex((r) => r.id === id)
    if (idx === -1) throw new Error('Report not found.')
    reports[idx] = { ...reports[idx], status }
    save(KEYS.reports, reports)
    return delay(reports[idx])
  },
}

// ---------------------------------------------------------------------------
// Analytics (admin)
// GET /api/analytics/summary/  — in Django this would likely be one
// stored-procedure call that pre-aggregates these numbers server-side.
// ---------------------------------------------------------------------------
export const analyticsApi = {
  async summary(): Promise<AnalyticsSummary> {
    const users = load<User[]>(KEYS.users, mockUsers)
    const courses = load<Course[]>(KEYS.courses, mockCourses)
    const tracker = load<TrackerEntry[]>(KEYS.tracker, mockTracker)
    const reports = load<Report[]>(KEYS.reports, mockReports)
    const swipeLog = load<{ userId: string }[]>(KEYS.swipeLog, [])

    const totalSwipes = swipeLog.length + 42 // seed baseline so the demo dashboard isn't empty
    const totalUsers = users.filter((u) => u.role === 'user').length
    const activeUsers30d = Math.max(1, Math.round(totalUsers * 0.7))

    const courseMetrics = courses.map((c) => {
      const entries = tracker.filter((t) => t.courseId === c.id)
      const interested = entries.length
      const inProgress = entries.filter((t) => t.status === 'In Progress').length
      const completed = entries.filter((t) => t.status === 'Completed').length
      return {
        courseId: c.id,
        title: c.title,
        interested,
        inProgress,
        completed,
        completionRate: interested ? completed / interested : 0,
      }
    })

    const reportCounts = courses
      .map((c) => {
        const rs = reports.filter((r) => r.courseId === c.id)
        const byType: Record<IssueType, number> = {
          'No longer free': 0,
          'Link broken': 0,
          'Certificate requires payment': 0,
          Other: 0,
        }
        rs.forEach((r) => (byType[r.issueType] += 1))
        return { courseId: c.id, title: c.title, total: rs.length, byType }
      })
      .filter((r) => r.total > 0)

    return delay(
      {
        totalUsers,
        activeUsers30d,
        totalSwipes,
        avgSwipesPerUser: totalUsers ? Math.round((totalSwipes / totalUsers) * 10) / 10 : 0,
        courseMetrics,
        reportCounts,
      },
      400
    )
  },
}
