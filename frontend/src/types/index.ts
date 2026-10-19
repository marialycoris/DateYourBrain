export type Role = 'user' | 'admin'

export interface User {
  id: string
  email: string
  role: Role
  createdAt: string
}

export type TrustBadge = 'Accredited' | 'Industry cert' | 'Free cert' | 'University-issued'

export interface Course {
  id: string
  title: string
  outcome: string // one-line outcome, shown on the swipe card
  description: string
  issuer: string
  durationHours: number
  skills: string[]
  badges: TrustBadge[]
  courseLink: string
  verificationNotes: string
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export type TrackerStatus = 'Interested' | 'Ongoing' | 'Completed'

export interface TrackerEntry {
  id: string
  courseId: string
  userId: string
  status: TrackerStatus
  notes: string
  updatedAt: string
}

export type IssueType =
  | 'No longer free'
  | 'Link broken'
  | 'Certificate requires payment'
  | 'Other'

export type IssueStatus = 'open' | 'reviewed' | 'resolved'

export interface Report {
  id: string
  courseId: string
  userId: string
  issueType: IssueType
  comment: string
  status: IssueStatus
  createdAt: string
}

export interface LearningPath {
  id: string
  title: string
  description: string
  status: 'active' | 'inactive'
  courses: Course[] // ordered — the sequence learners should follow
  createdAt: string
  updatedAt: string
}

export interface AnalyticsSummary {
  totalUsers: number
  activeUsers30d: number
  totalSwipes: number
  avgSwipesPerUser: number
  courseMetrics: {
    courseId: string
    title: string
    interested: number
    inProgress: number
    completed: number
    completionRate: number // completed / interested
  }[]
  reportCounts: {
    courseId: string
    title: string
    total: number
    byType: Record<IssueType, number>
  }[]
}
