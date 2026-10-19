import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Route } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { useAuth } from '@/context/AuthContext'
import { pathsApi, trackerApi } from '@/lib/api'
import type { LearningPath, TrackerEntry } from '@/types'

/** How many incomplete paths show inline — the rest live behind "See all". */
const MAX_VISIBLE = 3

function statusFor(entries: TrackerEntry[], courseId: string) {
  return entries.find((e) => String(e.courseId) === String(courseId))?.status ?? null
}

function PathCard({ path, entries }: { path: LearningPath; entries: TrackerEntry[] }) {
  const total = path.courses.length
  const done = path.courses.filter((c) => statusFor(entries, c.id) === 'Completed').length
  // Completed courses are never recommended again — skip straight to the next unfinished one.
  const next = path.courses.find((c) => statusFor(entries, c.id) !== 'Completed')
  const percent = total ? Math.round((done / total) * 100) : 0

  return (
    <section className="rounded-card border border-amber-300 bg-amber-50/80 p-4 shadow-card">
      <Link to={`/paths/${path.id}`} className="block group">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-amber-700">
            <Route size={13} /> Learning path
          </span>
          <span className="shrink-0 text-xs text-ink/50">
            {done} of {total} completed
          </span>
        </div>

        <h2 className="mt-1 font-display text-lg font-semibold leading-snug text-ink group-hover:underline">
          {path.title}
        </h2>
        {path.description && (
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink/55">{path.description}</p>
        )}

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-amber-200">
          <div className="h-full rounded-full bg-amber-600 transition-all" style={{ width: `${percent}%` }} />
        </div>
      </Link>

      {next ? (
        <div className="mt-3 flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink/45">Up next</p>
            <p className="truncate text-sm font-medium text-ink">{next.title}</p>
            <p className="truncate text-xs text-ink/50">
              {next.issuer} · {next.durationHours}h
              {statusFor(entries, next.id) && ` · ${statusFor(entries, next.id)}`}
            </p>
          </div>
          <Link
            to={`/courses/${next.id}`}
            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-ink px-3.5 py-2 text-xs font-medium text-amber-50 transition hover:bg-ink/90"
          >
            View <ChevronRight size={14} />
          </Link>
        </div>
      ) : (
        <p className="mt-3 text-sm font-medium text-ink">
          All {total} courses completed — path finished. Nice work.
        </p>
      )}
    </section>
  )
}

/**
 * LearningPathBanner — sits on the Discover page (left column on desktop,
 * below the swipe deck on mobile) and tells learners which course to take
 * next inside each active learning path. Progress comes from the learner's
 * tracker: a course counts as done once it's "Completed", and completed
 * courses are skipped when recommending the next one. Only the first
 * MAX_VISIBLE incomplete paths render inline; "See all" opens the rest.
 * Renders nothing when there are no active paths.
 */
export function LearningPathBanner() {
  const { user } = useAuth()
  const [paths, setPaths] = useState<LearningPath[] | null>(null)
  const [entries, setEntries] = useState<TrackerEntry[]>([])
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    let alive = true
    Promise.all([pathsApi.listActive(), trackerApi.listForUser(user?.id ?? '')])
      .then(([activePaths, tracker]) => {
        if (!alive) return
        setPaths(activePaths)
        setEntries(tracker)
      })
      .catch(() => {
        if (alive) setPaths([])
      })
    return () => {
      alive = false
    }
  }, [user?.id])

  if (paths === null) return null

  const active = paths.filter((p) => p.courses.length > 0)
  if (active.length === 0) return null

  const incomplete = active.filter((p) =>
    p.courses.some((c) => statusFor(entries, c.id) !== 'Completed'),
  )

  if (incomplete.length === 0) {
    return (
      <section className="rounded-card border border-amber-300 bg-amber-50/80 p-4 shadow-card">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-amber-700">
          <Route size={13} /> Learning path
        </span>
        <p className="mt-2 text-sm font-medium text-ink">
          You've completed every learning path. Nice work — check Discover for new courses.
        </p>
      </section>
    )
  }

  const displayed = incomplete.slice(0, MAX_VISIBLE)

  return (
    <>
      <div className="space-y-3">
        {displayed.map((path) => (
          <PathCard key={path.id} path={path} entries={entries} />
        ))}
        {incomplete.length > MAX_VISIBLE && (
          <button
            onClick={() => setShowAll(true)}
            className="px-1 text-sm font-medium text-amber-700 transition hover:text-amber-900"
          >
            See all ({incomplete.length})
          </button>
        )}
      </div>

      <Modal open={showAll} onClose={() => setShowAll(false)} title="All learning paths">
        <div className="max-h-[65vh] space-y-3 overflow-y-auto pr-1">
          {active.map((path) => (
            <PathCard key={path.id} path={path} entries={entries} />
          ))}
        </div>
      </Modal>
    </>
  )
}
