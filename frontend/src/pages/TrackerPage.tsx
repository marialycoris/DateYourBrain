import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { StatusPill } from '@/components/ui/Badge'
import { Select, Textarea } from '@/components/ui/Input'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/context/AuthContext'
import { coursesApi, trackerApi } from '@/lib/api'
import type { Course, TrackerEntry, TrackerStatus } from '@/types'

const STATUS_FILTERS: (TrackerStatus | 'All')[] = ['All', 'Interested', 'Ongoing', 'Completed']

interface PendingChange {
  entry: TrackerEntry
  course: Course
  next: TrackerStatus
}

interface PendingNote {
  entry: TrackerEntry
  course: Course
  notes: string
  resolve: (saved: boolean) => void
}

export default function TrackerPage() {
  const { user } = useAuth()
  const toast = useToast()
  const [entries, setEntries] = useState<TrackerEntry[]>([])
  const [courses, setCourses] = useState<Record<string, Course>>({})
  const [statusFilter, setStatusFilter] = useState<TrackerStatus | 'All'>('All')
  const [issuerFilter, setIssuerFilter] = useState('All')
  const [pending, setPending] = useState<PendingChange | null>(null)
  const [pendingNote, setPendingNote] = useState<PendingNote | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) return
    Promise.all([trackerApi.listForUser(user.id), coursesApi.listActive()]).then(([tracker, activeCourses]) => {
      setEntries(tracker)
      setCourses(Object.fromEntries(activeCourses.map((c) => [c.id, c])))
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

  const requestSaveNotes = (entry: TrackerEntry, course: Course, notes: string) =>
    new Promise<boolean>((resolve) => setPendingNote({ entry, course, notes, resolve }))

  const confirmNoteSave = async () => {
    if (!pendingNote) return
    setSaving(true)
    try {
      const updated = await trackerApi.update(pendingNote.entry.id, { notes: pendingNote.notes })
      setEntries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)))
      toast.success('Note saved.')
      pendingNote.resolve(true)
      setPendingNote(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save the note — please try again.")
      pendingNote.resolve(false)
      setPendingNote(null)
    } finally {
      setSaving(false)
    }
  }

  const confirmStatusChange = async () => {
    if (!pending) return
    setSaving(true)
    try {
      const updated = await trackerApi.update(pending.entry.id, { status: pending.next })
      setEntries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)))
      toast.success(`"${pending.course.title}" is now ${pending.next}.`)
      setPending(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't update the status — please try again.")
    } finally {
      setSaving(false)
    }
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
            <TrackerCard
              key={entry.id}
              entry={entry}
              course={course}
              onStatusChange={(e, c, next) => setPending({ entry: e, course: c, next })}
              onSaveNotes={requestSaveNotes}
            />
          )
        })}
      </div>

      <ConfirmModal
        open={!!pending}
        onClose={() => {
          if (!saving) setPending(null)
        }}
        onConfirm={confirmStatusChange}
        title={pending?.next === 'Completed' ? 'Mark as completed?' : 'Change status?'}
        message={
          pending
            ? pending.next === 'Completed'
              ? `You're marking "${pending.course.title}" as Completed.`
              : `"${pending.course.title}" will move from ${pending.entry.status} to ${pending.next}. You can change this again later.`
            : ''
        }
        warning={
          pending?.next === 'Completed'
            ? 'Once a course is marked Completed, its status can no longer be changed.'
            : undefined
        }
        confirmLabel={
          pending ? (pending.next === 'Completed' ? 'Yes, Mark as Completed' : `Move to ${pending.next}`) : 'Confirm'
        }
        busy={saving}
      />

      <ConfirmModal
        open={!!pendingNote}
        onClose={() => {
          if (!saving) {
            pendingNote?.resolve(false)
            setPendingNote(null)
          }
        }}
        onConfirm={confirmNoteSave}
        title="Save note?"
        message={pendingNote ? `Your note on "${pendingNote.course.title}" will be saved.` : ''}
        confirmLabel="Save note"
        busy={saving}
      />
    </AppShell>
  )
}

function TrackerCard({
  entry,
  course,
  onStatusChange,
  onSaveNotes,
}: {
  entry: TrackerEntry
  course: Course
  onStatusChange: (entry: TrackerEntry, course: Course, next: TrackerStatus) => void
  onSaveNotes: (entry: TrackerEntry, course: Course, notes: string) => Promise<boolean>
}) {
  const [notes, setNotes] = useState(entry.notes)
  const [editingNotes, setEditingNotes] = useState(false)
  const completed = entry.status === 'Completed'

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

      {completed ? (
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-medium text-ink/60">
          <Lock size={13} /> Completed — status is locked
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {(['Interested', 'Ongoing', 'Completed'] as TrackerStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => onStatusChange(entry, course, s)}
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
      )}

      {editingNotes ? (
        <div className="mt-3 space-y-2">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Certificate link, reminders, next steps…"
          />
          <div className="flex gap-2">
            <button
              onClick={async () => {
                if (await onSaveNotes(entry, course, notes)) setEditingNotes(false)
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
