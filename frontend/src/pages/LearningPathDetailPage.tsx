import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { StatusPill } from '@/components/ui/Badge'
import { useAuth } from '@/context/AuthContext'
import { pathsApi, trackerApi } from '@/lib/api'
import type { LearningPath, TrackerEntry } from '@/types'

export default function LearningPathDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [path, setPath] = useState<LearningPath | null | undefined>(undefined)
  const [entries, setEntries] = useState<TrackerEntry[]>([])

  useEffect(() => {
    if (!id) return
    pathsApi.get(id).then(setPath).catch(() => setPath(null))
  }, [id])

  useEffect(() => {
    if (!user) return
    trackerApi.listForUser(user.id).then(setEntries).catch(() => setEntries([]))
  }, [user])

  const statusFor = (courseId: string) =>
    entries.find((e) => String(e.courseId) === String(courseId))?.status ?? null

  if (path === undefined) {
    return (
      <AppShell>
        <p className="text-sm text-ink/40">Loading path…</p>
      </AppShell>
    )
  }

  if (path === null || path.status !== 'active') {
    return (
      <AppShell>
        <Link
          to="/discover"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink/55 transition hover:text-ink"
        >
          <ArrowLeft size={15} /> Back to Discover
        </Link>
        <div className="mt-6 rounded-card border border-dashed border-amber-300 bg-amber-50/50 p-8 text-center">
          <p className="font-display text-lg font-semibold text-ink">
            This learning path is no longer available.
          </p>
          <p className="mt-1 text-sm text-ink/55">Browse Discover for other courses and paths.</p>
        </div>
      </AppShell>
    )
  }

  const total = path.courses.length
  const done = path.courses.filter((c) => statusFor(c.id) === 'Completed').length
  const hours = path.courses.reduce((sum, c) => sum + c.durationHours, 0)
  const percent = total ? Math.round((done / total) * 100) : 0

  return (
    <AppShell>
      <Link
        to="/discover"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink/55 transition hover:text-ink"
      >
        <ArrowLeft size={15} /> Back to Discover
      </Link>

      <h1 className="mt-4 font-display text-2xl font-semibold text-ink">{path.title}</h1>
      {path.description && (
        <p className="mt-2 text-sm leading-relaxed text-ink/60">{path.description}</p>
      )}
      <p className="mt-2 text-xs text-ink/45">
        {total} {total === 1 ? 'course' : 'courses'} · ~{hours}h · {done} completed
      </p>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-amber-200">
        <div className="h-full rounded-full bg-amber-600 transition-all" style={{ width: `${percent}%` }} />
      </div>

      <div className="mt-5 space-y-2.5">
        {path.courses.map((course, i) => {
          const status = statusFor(course.id)
          return (
            <Link
              key={course.id}
              to={`/courses/${course.id}`}
              className="flex items-center gap-4 rounded-card border border-amber-200 bg-white/70 p-4 transition hover:border-amber-400 hover:bg-white"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-semibold text-ink/60">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-ink">{course.title}</p>
                <p className="truncate text-xs text-ink/50">
                  {course.issuer} · {course.durationHours}h
                </p>
              </div>
              {status ? (
                <StatusPill status={status} />
              ) : (
                <span className="shrink-0 rounded-full bg-ink/10 px-2.5 py-1 text-xs font-medium text-ink/50">
                  Not started
                </span>
              )}
              <ChevronRight size={16} className="shrink-0 text-ink/30" />
            </Link>
          )
        })}
      </div>
    </AppShell>
  )
}
