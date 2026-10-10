/**
 * API layer
 * ---------
 * Talks to the Django REST Framework backend. Each function maps to exactly
 * one endpoint (shown in the comment above it). The backend runs heavy
 * aggregation inside MySQL stored procedures (e.g. the analytics summary) and
 * Django handles auth + CRUD. This file is the only thing pages import — the
 * UI never concerns itself with transports.
 *
 * Auth: a token is stored in localStorage under `dyb_token` and attached to
 * every request as `Authorization: Token <token>`.
 */
import axios from 'axios'
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

// A 401 means the stored token is stale or no longer valid on the server
// (e.g. the database was rebuilt). Self-heal: clear the dead session and
// bounce to the login page so the user isn't stranded in a half-authed state.
http.interceptors.response.use(
  (res) => res,
  (err) => {
    if (axios.isAxiosError(err) && err.response?.status === 401) {
      localStorage.removeItem('dyb_token')
      localStorage.removeItem('dyb_session')
      if (!window.location.pathname.startsWith('/login')) {
        window.location.assign('/login')
      }
    }
    return Promise.reject(err)
  },
)

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function readErrorMessage(err: unknown): Error {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as Record<string, unknown> | undefined
    if (data && typeof data === 'object') {
      if (typeof data.detail === 'string') return new Error(data.detail)
      const messages: string[] = []
      for (const value of Object.values(data)) {
        if (Array.isArray(value)) messages.push(...value.map(String))
        else if (typeof value === 'string') messages.push(value)
      }
      if (messages.length) return new Error(messages.join(' '))
    }
    return new Error('Server error — please try again.')
  }
  return err instanceof Error ? err : new Error('Something went wrong.')
}

// ---------------------------------------------------------------------------
// Auth
// POST /api/auth/register/   POST /api/auth/login/   POST /api/auth/logout/
// POST /api/auth/change-password/
// ---------------------------------------------------------------------------
export const auth = {
  async register(email: string, password: string): Promise<User> {
    try {
      const res = await http.post<{ user: User; token: string }>('/auth/register/', { email, password })
      localStorage.setItem('dyb_token', res.data.token)
      localStorage.setItem('dyb_session', JSON.stringify(res.data.user))
      return res.data.user
    } catch (err) {
      throw readErrorMessage(err)
    }
  },

  async login(email: string, password: string): Promise<User> {
    try {
      const res = await http.post<{ user: User; token: string }>('/auth/login/', { email, password })
      localStorage.setItem('dyb_token', res.data.token)
      localStorage.setItem('dyb_session', JSON.stringify(res.data.user))
      return res.data.user
    } catch (err) {
      throw readErrorMessage(err)
    }
  },

  async logout(): Promise<void> {
    try {
      await http.post('/auth/logout/')
    } catch {
      // Token may already be revoked — local sign-out still happens.
    } finally {
      localStorage.removeItem('dyb_token')
      localStorage.removeItem('dyb_session')
    }
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      await http.post('/auth/change-password/', {
        current_password: currentPassword,
        new_password: newPassword,
      })
    } catch (err) {
      throw readErrorMessage(err)
    }
  },

  currentUser(): User | null {
    try {
      return JSON.parse(localStorage.getItem('dyb_session') ?? 'null') as User | null
    } catch {
      return null
    }
  },
}

// ---------------------------------------------------------------------------
// Courses
// GET /api/courses/            GET /api/courses/:id/     GET /api/courses/all/
// POST /api/courses/ (admin)   PATCH /api/courses/:id/ (admin)
// DELETE /api/courses/:id/ (admin, soft)
// ---------------------------------------------------------------------------
export const coursesApi = {
  async listActive(excludeIds: string[] = []): Promise<Course[]> {
    const params = excludeIds.length ? { exclude: excludeIds.join(',') } : undefined
    const res = await http.get<Course[]>('/courses/', { params })
    return res.data
  },

  async listAll(): Promise<Course[]> {
    const res = await http.get<Course[]>('/courses/all/')
    return res.data
  },

  async get(id: string): Promise<Course | null> {
    try {
      const res = await http.get<Course>(`/courses/${id}/`)
      return res.data
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) return null
      throw readErrorMessage(err)
    }
  },

  async create(input: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>): Promise<Course> {
    const res = await http.post<Course>('/courses/', input)
    return res.data
  },

  async update(id: string, patch: Partial<Course>): Promise<Course> {
    const res = await http.patch<Course>(`/courses/${id}/`, patch)
    return res.data
  },

  async softDelete(id: string): Promise<void> {
    await http.delete(`/courses/${id}/`)
  },
}

// ---------------------------------------------------------------------------
// Swipes + Tracker
// POST /api/swipes/    GET /api/tracker/    PATCH /api/tracker/:id/
// ---------------------------------------------------------------------------
export const trackerApi = {
  async logSwipe(courseId: string, userId: string, direction: 'left' | 'right') {
    await http.post('/swipes/', { courseId, userId, direction })
  },

  async listForUser(userId: string): Promise<TrackerEntry[]> {
    const res = await http.get<TrackerEntry[]>('/tracker/')
    return res.data
  },

  async update(id: string, patch: { status?: TrackerStatus; notes?: string }): Promise<TrackerEntry> {
    const res = await http.patch<TrackerEntry>(`/tracker/${id}/`, patch)
    return res.data
  },
}

// ---------------------------------------------------------------------------
// Reports
// POST /api/reports/               GET /api/reports/admin/ (admin)
// PATCH /api/reports/admin/:id/ (admin)
// ---------------------------------------------------------------------------
export const reportsApi = {
  async create(courseId: string, userId: string, issueType: IssueType, comment: string): Promise<Report> {
    const res = await http.post<Report>('/reports/', { courseId, issueType, comment })
    return res.data
  },

  async listAll(): Promise<Report[]> {
    const res = await http.get<Report[]>('/reports/admin/')
    return res.data
  },

  async updateStatus(id: string, status: Report['status']): Promise<Report> {
    const res = await http.patch<Report>(`/reports/admin/${id}/`, { status })
    return res.data
  },
}

// ---------------------------------------------------------------------------
// Analytics (admin) — Django calls stored procedures for every number here
// GET /api/analytics/summary/
// ---------------------------------------------------------------------------
export const analyticsApi = {
  async summary(): Promise<AnalyticsSummary> {
    const res = await http.get<AnalyticsSummary>('/analytics/summary/')
    return res.data
  },
}