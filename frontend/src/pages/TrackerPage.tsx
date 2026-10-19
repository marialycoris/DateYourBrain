import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink, Lock } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { StatusPill, TrustBadgePill } from '@/components/ui/Badge'
import { Select, Textarea } from '@/components/ui/Input'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/context/AuthContext'
import { coursesApi, trackerApi } from '@/lib/api'
import type { Course, TrackerEntry, TrackerStatus } from '@/types'

const STATUS_FILTERS: (TrackerStatus | 'All')[] = ['All', 'Interested', 'Ongoing', 'Completed']
const STATUSES: TrackerStatus[] = ['Interested', 'Ongoing', 'Completed']

/** True on lg+ — switches the tracker to the list + detail-pane layout. */
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
  const isDesktop = useIsDesktop()
  const [entries, setEntries] = useState<TrackerEntry[]>([])
  const [courses, setCourses] = useState<Record<string, Course>>({})
  const [statusFilter, setStatusFilter] = useState<TrackerStatus | 'All'>('All')
  const [issuerFilter, setIssuerFilter] = useState('All')
  const [selectedId, setSelectedId] = useState<string | null>(null)
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

  // Desktop pane: follow the clicked entry, falling back to the first one so
  // the right column is never empty while the list has rows.
  const selected = filtered.find((e) => e.id === selectedId) ?? filtered[0] ?? null
  const selectedCourse = selected ? courses[selected.courseId] : null

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
    <AppShell wide>
      <div className="mx-auto max-w-5xl">
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

        {/* Mobile: single column of full cards. Desktop: compact clickable list
            on the left, selected course's info + tracker controls on the right. */}
        <div className="mt-5 flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:items-start lg:gap-6">
          <div className="space-y-3">
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
                  compact={isDesktop}
                  selected={isDesktop && selected?.id === entry.id}
                  onSelect={(e) => setSelectedId(e.id)}
                  onStatusChange={(e, c, next) => setPending({ entry: e, course: c, next })}
                  onSaveNotes={requestSaveNotes}
                />
              )
            })}
          </div>

          {isDesktop && selected && selectedCourse && (
            <aside className="lg:sticky lg:top-24">
              <TrackerDetailPane
                key={selected.id}
                entry={selected}
                course={selectedCourse}
                onStatusChange={(e, c, next) => setPending({ entry: e, course: c, next })}
                onSaveNotes={requestSaveNotes}
              />
            </aside>
          )}
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
      </div>
    </AppShell>
  )
}

function StatusControls({
  entry,
  course,
  onStatusChange,
}: {
  entry: TrackerEntry
  course: Course
  onStatusChange: (entry: TrackerEntry, course: Course, next: TrackerStatus) => void
}) {
  if (entry.status === 'Completed') {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-medium text-ink/60">
        <Lock size={13} /> Completed — status is locked
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {STATUSES.map((s) => (
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
  )
}

function NotesEditor({
  entry,
  course,
  onSaveNotes,
}: {
  entry: TrackerEntry
  course: Course
  onSaveNotes: (entry: TrackerEntry, course: Course, notes: string) => Promise<boolean>
}) {
  const [notes, setNotes] = useState(entry.notes)
  const [editingNotes, setEditingNotes] = useState(false)

  if (editingNotes) {
    return (
      <div className="space-y-2">
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
    )
  }

  return (
    <button onClick={() => setEditingNotes(true)} className="text-left text-xs text-ink/50 hover:text-ink">
      {entry.notes ? `📝 ${entry.notes}` : '+ Add a note'}
    </button>
  )
}

function TrackerCard({
  entry,
  course,
  compact = false,
  selected = false,
  onSelect,
  onStatusChange,
  onSaveNotes,
}: {
  entry: TrackerEntry
  course: Course
  compact?: boolean
  selected?: boolean
  onSelect?: (entry: TrackerEntry) => void
  onStatusChange: (entry: TrackerEntry, course: Course, next: TrackerStatus) => void
  onSaveNotes: (entry: TrackerEntry, course: Course, notes: string) => Promise<boolean>
}) {
  const cardClass = `w-full rounded-card border p-4 text-left transition ${
    selected
      ? 'border-amber-500 bg-amber-50/90 ring-1 ring-amber-400'
      : 'border-amber-200 bg-white/70 hover:border-amber-300'
  }`

  const header = (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        {compact ? (
          <p className="line-clamp-2 font-semibold text-ink">{course.title}</p>
        ) : (
          <Link to={`/courses/${course.id}`} className="line-clamp-2 font-semibold text-ink hover:underline">
            {course.title}
          </Link>
        )}
        <p className="mt-0.5 text-xs text-ink/50">{course.issuer}</p>
      </div>
      <StatusPill status={entry.status} />
    </div>
  )

  if (compact) {
    return (
      <button type="button" onClick={() => onSelect?.(entry)} className={cardClass}>
        {header}
      </button>
    )
  }

  return (
    <div className={cardClass}>
      {header}
      <div className="mt-3">
        <StatusControls entry={entry} course={course} onStatusChange={onStatusChange} />
      </div>
      <div className="mt-3">
        <NotesEditor entry={entry} course={course} onSaveNotes={onSaveNotes} />
      </div>
    </div>
  )
}

/**
 * TrackerDetailPane — desktop-only right column. Shows the selected course's
 * full info (badges, description, skills, vetting notes) plus the same status
 * and notes controls the mobile cards carry inline.
 */
function TrackerDetailPane({
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
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink/45">Your tracker</p>
          <StatusPill status={entry.status} />
        </div>
        <div className="mt-2.5">
          <StatusControls entry={entry} course={course} onStatusChange={onStatusChange} />
        </div>
        <div className="mt-3">
          <NotesEditor entry={entry} course={course} onSaveNotes={onSaveNotes} />
        </div>
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
          Full details
        </Link>
      </div>
    </div>
  )
}
