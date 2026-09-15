import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { StatusPill } from '@/components/ui/Badge'
import { Select, Textarea } from '@/components/ui/Input'
import { useAuth } from '@/context/AuthContext'
import { coursesApi, trackerApi } from '@/lib/api'
import type { Course, TrackerEntry, TrackerStatus } from '@/types'

const STATUS_FILTERS: (TrackerStatus | 'All')[] = ['All', 'Interested', 'In Progress', 'Completed']

export default function TrackerPage() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<TrackerEntry[]>([])
  const [courses, setCourses] = useState<Record<string, Course>>({})
  const [statusFilter, setStatusFilter] = useState<TrackerStatus | 'All'>('All')
  const [issuerFilter, setIssuerFilter] = useState('All')

  useEffect(() => {
    if (!user) return
    Promise.all([trackerApi.listForUser(user.id), coursesApi.listAll()]).then(([tracker, allCourses]) => {
      setEntries(tracker)
      setCourses(Object.fromEntries(allCourses.map((c) => [c.id, c])))
    })
  }, [user])

  const issuers = useMemo(
    () => Array.from(new Set(entries.map((e) => courses[e.courseId]?.issuer).filter(Boolean))) as string[],
    [entries, courses]
  )

  const filtered = entries.filter((e) => {
    if (statusFilter !== 'All' && e.status !== statusFilter) return false
    if (issuerFilter !== 'All' && courses[e.courseId]?.issuer !== issuerFilter) return false
    return true
  })

  const updateEntry = async (id: string, patch: { status?: TrackerStatus; notes?: string }) => {
    const updated = await trackerApi.update(id, patch)
    setEntries((prev) => prev.map((e) => (e.id === id ? updated : e)))
  }

  return (
    <AppShell>
      <h1 className="font-display text-2xl font-semibold text-ink">Your tracker</h1>
      <p className="mt-1 text-sm text-ink/55">Courses you've swiped right on, in one library.</p>

      <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              statusFilter === s ? 'bg-ink text-amber-300' : 'bg-amber-100 text-ink/60'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {issuers.length > 1 && (
        <div className="mt-3 max-w-[12rem]">
          <Select value={issuerFilter} onChange={(e) => setIssuerFilter(e.target.value)}>
            <option value="All">All issuers</option>
            {issuers.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </Select>
        </div>
      )}

      <div className="mt-5 space-y-3">
        {filtered.length === 0 && (
          <p className="rounded-card border border-dashed border-amber-300 bg-amber-50/50 p-6 text-center text-sm text-ink/55">
            Nothing here yet — swipe right on a course in Discover to add it.
          </p>
        )}
        {filtered.map((entry) => {
          const course = courses[entry.courseId]
          if (!course) return null
          return (
            <TrackerCard key={entry.id} entry={entry} course={course} onUpdate={updateEntry} />
          )
        })}
      </div>
    </AppShell>
  )
}

function TrackerCard({
  entry,
  course,
  onUpdate,
}: {
  entry: TrackerEntry
  course: Course
  onUpdate: (id: string, patch: { status?: TrackerStatus; notes?: string }) => void
}) {
  const [notes, setNotes] = useState(entry.notes)
  const [editingNotes, setEditingNotes] = useState(false)

  return (
    <div className="rounded-card border border-amber-200 bg-white/70 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link to={`/courses/${course.id}`} className="line-clamp-2 font-semibold text-ink hover:underline">
            {course.title}
          </Link>
          <p className="mt-0.5 text-xs text-ink/50">{course.issuer}</p>
        </div>
        <StatusPill status={entry.status} />
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {(['Interested', 'In Progress', 'Completed'] as TrackerStatus[]).map((s) => (
          <button
            key={s}
            onClick={() => onUpdate(entry.id, { status: s })}
            disabled={entry.status === s}
            className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
              entry.status === s
                ? 'cursor-default bg-amber-200 text-ink/40'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            Mark {s}
          </button>
        ))}
      </div>

      {editingNotes ? (
        <div className="mt-3 space-y-2">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Certificate link, reminders, next steps…"
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                onUpdate(entry.id, { notes })
                setEditingNotes(false)
              }}
              className="rounded-full bg-ink px-3 py-1.5 text-xs font-medium text-amber-50"
            >
              Save note
            </button>
            <button
              onClick={() => {
                setNotes(entry.notes)
                setEditingNotes(false)
              }}
              className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-medium text-ink"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setEditingNotes(true)}
          className="mt-3 text-left text-xs text-ink/50 hover:text-ink"
        >
          {entry.notes ? `📝 ${entry.notes}` : '+ Add a note'}
        </button>
      )}
    </div>
  )
}
