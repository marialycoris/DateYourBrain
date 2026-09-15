import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, ExternalLink, Flag } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { TrustBadgePill } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Select, Textarea } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { useAuth } from '@/context/AuthContext'
import { coursesApi, reportsApi, trackerApi } from '@/lib/api'
import type { Course, IssueType } from '@/types'

const ISSUE_TYPES: IssueType[] = ['No longer free', 'Link broken', 'Certificate requires payment', 'Other']

export default function CourseDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [course, setCourse] = useState<Course | null | undefined>(undefined)
  const [reportOpen, setReportOpen] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!id) return
    coursesApi.get(id).then((c) => setCourse(c ?? null))
  }, [id])

  const handleSave = async () => {
    if (!user || !course) return
    await trackerApi.logSwipe(course.id, user.id, 'right')
    setSaved(true)
  }

  if (course === undefined) {
    return (
      <AppShell>
        <p className="py-10 text-center text-sm text-ink/40">Loading…</p>
      </AppShell>
    )
  }

  if (course === null) {
    return (
      <AppShell>
        <p className="py-10 text-center text-sm text-ink/50">Course not found.</p>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <button
        onClick={() => navigate(-1)}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink/55 hover:text-ink"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="flex flex-wrap gap-1.5">
        {course.badges.map((b) => (
          <TrustBadgePill key={b} badge={b} />
        ))}
      </div>

      <h1 className="mt-3 font-display text-2xl font-semibold leading-tight text-ink">{course.title}</h1>
      <p className="mt-1 text-sm text-ink/55">{course.issuer}</p>

      <p className="mt-4 text-base leading-relaxed text-ink/80">{course.description}</p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {course.skills.map((s) => (
          <span key={s} className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
            {s}
          </span>
        ))}
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-3 rounded-card border border-amber-200 bg-white/70 p-4 text-sm">
        <div>
          <dt className="text-xs text-ink/45">Time to complete</dt>
          <dd className="mt-0.5 font-medium text-ink">~{course.durationHours} hours</dd>
        </div>
        <div>
          <dt className="text-xs text-ink/45">Verified</dt>
          <dd className="mt-0.5 font-medium text-ink">{new Date(course.updatedAt).toLocaleDateString()}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-xs text-ink/45">Verification notes</dt>
          <dd className="mt-0.5 text-ink/75">{course.verificationNotes}</dd>
        </div>
      </dl>

      <div className="mt-6 flex flex-col gap-2.5">
        <a
          href={course.courseLink}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-ink px-4 py-3 text-sm font-medium text-amber-50"
        >
          <ExternalLink size={16} /> Go to course
        </a>
        <Button variant="secondary" onClick={handleSave} disabled={saved}>
          {saved ? (
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 size={16} /> Saved to tracker
            </span>
          ) : (
            'Save to tracker'
          )}
        </Button>
        <button
          onClick={() => setReportOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-ink/50 hover:text-signal"
        >
          <Flag size={15} /> Report a problem
        </button>
      </div>

      <ReportIssueModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        courseId={course.id}
      />
    </AppShell>
  )
}

function ReportIssueModal({
  open,
  onClose,
  courseId,
}: {
  open: boolean
  onClose: () => void
  courseId: string
}) {
  const { user } = useAuth()
  const [issueType, setIssueType] = useState<IssueType>('Certificate requires payment')
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!user) return
    setLoading(true)
    await reportsApi.create(courseId, user.id, issueType, comment)
    setLoading(false)
    setSubmitted(true)
  }

  const handleClose = () => {
    onClose()
    setTimeout(() => {
      setSubmitted(false)
      setComment('')
    }, 200)
  }

  return (
    <Modal open={open} onClose={handleClose} title="Report a problem">
      {submitted ? (
        <div className="py-4 text-center">
          <CheckCircle2 className="mx-auto mb-2 text-amber-600" size={28} />
          <p className="text-sm text-ink/70">
            Thanks — this goes straight to our admin queue for review.
          </p>
          <Button className="mt-4" onClick={handleClose} fullWidth>
            Done
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select label="Issue type" value={issueType} onChange={(e) => setIssueType(e.target.value as IssueType)}>
            {ISSUE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
          <Textarea
            label="Details (optional)"
            placeholder="What did you run into?"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <Button type="submit" fullWidth disabled={loading}>
            {loading ? 'Submitting…' : 'Submit report'}
          </Button>
        </form>
      )}
    </Modal>
  )
}
