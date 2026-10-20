import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ChevronRight, ExternalLink, Route } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { StatusPill, TrustBadgePill } from '@/components/ui/Badge'
import { useAuth } from '@/context/AuthContext'
import { pathsApi, trackerApi } from '@/lib/api'
import type { Course, LearningPath, TrackerEntry, TrackerStatus } from '@/types'

/** True on lg+ — switches the path view to the list + detail-pane layout. */
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia('(min-width: 1024px)').matches)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const onChange = () => setIsDesktop(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return isDesktop
}

function statusFor(entries: TrackerEntry[], courseId: string) {
  return entries.find((e) => String(e.courseId) === String(courseId))?.status ?? null
}

function NotStartedPill() {
  return (
    <span className="shrink-0 rounded-full bg-ink/10 px-3 py-1 text-xs font-semibold text-ink/50">
      Not started
    </span>
  )
}

export default function LearningPathDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const isDesktop = useIsDesktop()
  const [path, setPath] = useState<LearningPath | null | undefined>(undefined)
  const [entries, setEntries] = useState<TrackerEntry[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    pathsApi.get(id).then(setPath).catch(() => setPath(null))
  }, [id])

  useEffect(() => {
    if (!user) return
    trackerApi.listForUser(user.id).then(setEntries).catch(() => setEntries([]))
  }, [user])

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
  const done = path.courses.filter((c) => statusFor(entries, c.id) === 'Completed').length
  const hours = path.courses.reduce((sum, c) => sum + c.durationHours, 0)
  const percent = total ? Math.round((done / total) * 100) : 0

  // Desktop pane: follow the clicked course, falling back to the first one so
  // the right column is never empty while the list has rows.
  const selectedIndex = path.courses.findIndex((c) => c.id === selectedId)
  const selected = selectedIndex >= 0 ? path.courses[selectedIndex] : path.courses[0] ?? null

  return (
    <AppShell wide>
      <div className="mx-auto max-w-5xl">
        <Link
          to="/discover"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink/55 transition hover:text-ink"
        >
          <ArrowLeft size={15} /> Back to Discover
        </Link>

        <div className="mt-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-amber-700">
          <Route size={13} /> Learning path
        </div>
        <h1 className="mt-1 font-display text-2xl font-semibold text-ink">{path.title}</h1>
        {path.description && (
          <p className="mt-2 text-sm leading-relaxed text-ink/60">{path.description}</p>
        )}
        <p className="mt-2 text-xs text-ink/45">
          {total} {total === 1 ? 'course' : 'courses'} · ~{hours}h · {done} completed
        </p>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-amber-200">
          <div className="h-full rounded-full bg-amber-600 transition-all" style={{ width: `${percent}%` }} />
        </div>

        {/* Mobile: single column of full cards. Desktop: compact clickable list
            on the left, selected course's info on the right — same split the
            tracker uses. */}
        <div className="mt-5 flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:items-start lg:gap-6">
          <div className="space-y-3">
            {total === 0 && (
              <p className="rounded-card border border-dashed border-amber-300 bg-amber-50/50 p-6 text-center text-sm text-ink/55">
                This path has no courses yet.
              </p>
            )}
            {path.courses.map((course, i) => {
              const status = statusFor(entries, course.id)
              return (
                <PathCourseCard
                  key={course.id}
                  course={course}
                  step={i + 1}
                  status={status}
                  compact={isDesktop}
                  selected={isDesktop && selected?.id === course.id}
                  onSelect={(c) => setSelectedId(c.id)}
                />
              )
            })}
          </div>

          {isDesktop && selected && (
            <aside className="lg:sticky lg:top-24">
              <PathCourseDetailPane
                key={selected.id}
                course={selected}
                step={selectedIndex >= 0 ? selectedIndex + 1 : 1}
                total={total}
                status={statusFor(entries, selected.id)}
              />
            </aside>
          )}
        </div>
      </div>
    </AppShell>
  )
}

function PathCourseCard({
  course,
  step,
  status,
  compact = false,
  selected = false,
  onSelect,
}: {
  course: Course
  step: number
  status: TrackerStatus | null
  compact?: boolean
  selected?: boolean
  onSelect?: (course: Course) => void
}) {
  const cardClass = `w-full rounded-card border p-4 text-left transition ${
    selected
      ? 'border-amber-500 bg-amber-50/90 ring-1 ring-amber-400'
      : 'border-amber-200 bg-white/70 hover:border-amber-300'
  }`

  const header = (
    <div className="flex items-start justify-between gap-3">
      <div className="flex min-w-0 items-start gap-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-semibold text-ink/60">
          {step}
        </span>
        <div className="min-w-0">
          {compact ? (
            <p className="line-clamp-2 font-semibold text-ink">{course.title}</p>
          ) : (
            <Link to={`/courses/${course.id}`} className="line-clamp-2 font-semibold text-ink hover:underline">
              {course.title}
            </Link>
          )}
          <p className="mt-0.5 text-xs text-ink/50">
            {course.issuer} · {course.durationHours}h
          </p>
        </div>
      </div>
      {status ? <StatusPill status={status} /> : <NotStartedPill />}
    </div>
  )

  if (compact) {
    return (
      <button type="button" onClick={() => onSelect?.(course)} className={cardClass}>
        {header}
      </button>
    )
  }

  return <div className={cardClass}>{header}</div>
}

/**
 * PathCourseDetailPane — desktop-only right column. Mirrors the tracker's
 * detail pane: the selected course's full info (badges, description, skills,
 * vetting notes) plus where it sits in the path and the learner's status.
 */
function PathCourseDetailPane({
  course,
  step,
  total,
  status,
}: {
  course: Course
  step: number
  total: number
  status: TrackerStatus | null
}) {
  return (
    <div className="rounded-card border border-amber-200 bg-white/70 p-5">
      <div className="flex flex-wrap gap-1.5">
        {course.badges.map((b) => (
          <TrustBadgePill key={b} badge={b} />
        ))}
      </div>

      <h2 className="mt-3 font-display text-xl font-semibold leading-tight text-ink">{course.title}</h2>
      <p className="mt-1 text-sm text-ink/55">{course.issuer}</p>
      {course.outcome && <p className="mt-2 text-sm font-medium text-ink/75">{course.outcome}</p>}

      <p className="mt-3 text-sm leading-relaxed text-ink/70">{course.description}</p>

      {course.skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {course.skills.map((s) => (
            <span key={s} className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
              {s}
            </span>
          ))}
        </div>
      )}

      <dl className="mt-4 grid grid-cols-2 gap-3 rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 text-sm">
        <div>
          <dt className="text-xs text-ink/45">Time to complete</dt>
          <dd className="mt-0.5 font-medium text-ink">~{course.durationHours} hours</dd>
        </div>
        <div>
          <dt className="text-xs text-ink/45">Verified</dt>
          <dd className="mt-0.5 font-medium text-ink">{new Date(course.updatedAt).toLocaleDateString()}</dd>
        </div>
        {course.verificationNotes && (
          <div className="col-span-2">
            <dt className="text-xs text-ink/45">Verification notes</dt>
            <dd className="mt-0.5 text-ink/75">{course.verificationNotes}</dd>
          </div>
        )}
      </dl>

      <div className="mt-4 border-t border-amber-100 pt-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink/45">
            Step {step} of {total}
          </p>
          {status ? <StatusPill status={status} /> : <NotStartedPill />}
        </div>
        <p className="mt-2 text-xs text-ink/50">
          Update your progress from the{' '}
          <Link to="/tracker" className="font-medium text-amber-700 hover:text-amber-900">
            Tracker
          </Link>
          .
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-amber-100 pt-4">
        <a
          href={course.courseLink}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-2 text-xs font-medium text-amber-50 transition hover:bg-ink/90"
        >
          <ExternalLink size={14} /> Go to course
        </a>
        <Link
          to={`/courses/${course.id}`}
          className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3.5 py-2 text-xs font-medium text-ink transition hover:bg-amber-200"
        >
          Full details <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  )
}
