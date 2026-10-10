import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { AdminShell } from '@/components/layout/AdminShell'
import { Input, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { coursesApi } from '@/lib/api'
import type { Course, TrustBadge } from '@/types'

const ALL_BADGES: TrustBadge[] = ['Accredited', 'Industry cert', 'Free cert', 'University-issued']

const CHECKLIST = [
  { key: 'issuerConfirmed', label: 'Issuer credibility confirmed' },
  { key: 'trulyFree', label: 'Certificate is truly free to obtain' },
  { key: 'verificationExists', label: 'Verification mechanism exists (badge URL, certificate ID, etc.)' },
  { key: 'contentCurrent', label: 'Content is up to date' },
] as const

type FormState = {
  title: string
  outcome: string
  description: string
  issuer: string
  durationHours: string
  skills: string
  badges: TrustBadge[]
  courseLink: string
  verificationNotes: string
  status: 'active' | 'inactive'
}

const empty: FormState = {
  title: '',
  outcome: '',
  description: '',
  issuer: '',
  durationHours: '',
  skills: '',
  badges: [],
  courseLink: '',
  verificationNotes: '',
  status: 'active',
}

export default function AdminCourseFormPage() {
  const { id } = useParams()
  const isNew = !id || id === 'new'
  const navigate = useNavigate()

  const [form, setForm] = useState<FormState>(empty)
  const [checklist, setChecklist] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isNew) return
    coursesApi.get(id!).then((c) => {
      if (!c) return
      setForm({
        title: c.title,
        outcome: c.outcome,
        description: c.description,
        issuer: c.issuer,
        durationHours: String(c.durationHours),
        skills: c.skills.join(', '),
        badges: c.badges,
        courseLink: c.courseLink,
        verificationNotes: c.verificationNotes,
        status: c.status,
      })
      setChecklist({ issuerConfirmed: true, trulyFree: true, verificationExists: true, contentCurrent: true })
      setLoading(false)
    })
  }, [id, isNew])

  const allChecked = CHECKLIST.every((item) => checklist[item.key])

  const toggleBadge = (badge: TrustBadge) => {
    setForm((f) => ({
      ...f,
      badges: f.badges.includes(badge) ? f.badges.filter((b) => b !== badge) : [...f.badges, badge],
    }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const payload: Omit<Course, 'id' | 'createdAt' | 'updatedAt'> = {
      title: form.title,
      outcome: form.outcome,
      description: form.description,
      issuer: form.issuer,
      durationHours: Number(form.durationHours) || 0,
      skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
      badges: form.badges,
      courseLink: form.courseLink,
      verificationNotes: form.verificationNotes,
      status: form.status,
    }
    if (isNew) {
      await coursesApi.create(payload)
    } else {
      await coursesApi.update(id!, payload)
    }
    setSaving(false)
    navigate('/admin/courses')
  }

  if (loading) {
    return (
      <AdminShell>
        <p className="text-sm text-ink/40">Loading…</p>
      </AdminShell>
    )
  }

  return (
    <AdminShell>
      <button
        onClick={() => navigate('/admin/courses')}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink/55 hover:text-ink"
      >
        <ArrowLeft size={16} /> Back to courses
      </button>

      <h1 className="font-display text-2xl font-semibold text-ink">
        {isNew ? 'Add a course' : 'Edit course'}
      </h1>

      <form onSubmit={handleSubmit} className="mt-6 grid max-w-3xl gap-5">
        <Input
          label="Title"
          required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <Input
          label="One-line outcome"
          required
          hint="Shown on the swipe card, keep it under ~80 characters."
          value={form.outcome}
          onChange={(e) => setForm({ ...form, outcome: e.target.value })}
        />
        <Textarea
          label="Full description"
          required
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Issuer"
            required
            value={form.issuer}
            onChange={(e) => setForm({ ...form, issuer: e.target.value })}
          />
          <Input
            label="Duration (hours)"
            type="number"
            min={0}
            required
            value={form.durationHours}
            onChange={(e) => setForm({ ...form, durationHours: e.target.value })}
          />
        </div>

        <Input
          label="Skills"
          hint="Comma-separated, e.g. SQL, Data Cleaning, Tableau"
          value={form.skills}
          onChange={(e) => setForm({ ...form, skills: e.target.value })}
        />

        <div>
          <span className="mb-1.5 block text-sm font-medium text-ink">Trust badges</span>
          <div className="flex flex-wrap gap-2">
            {ALL_BADGES.map((b) => (
              <button
                type="button"
                key={b}
                onClick={() => toggleBadge(b)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  form.badges.includes(b) ? 'bg-ink text-amber-300' : 'bg-amber-100 text-ink/60'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Course link"
          type="url"
          required
          value={form.courseLink}
          onChange={(e) => setForm({ ...form, courseLink: e.target.value })}
        />
        <Textarea
          label="Internal verification notes"
          hint="Not shown to learners as-is — informs the outcome shown on the course page."
          value={form.verificationNotes}
          onChange={(e) => setForm({ ...form, verificationNotes: e.target.value })}
        />

        <div className="rounded-card border border-amber-300 bg-amber-50/70 p-4">
          <p className="text-sm font-semibold text-ink">Pre-publish checklist</p>
          <p className="mt-1 text-xs text-ink/55">Confirm all four before this course goes live.</p>
          <div className="mt-3 space-y-2">
            {CHECKLIST.map((item) => (
              <label key={item.key} className="flex items-center gap-2.5 text-sm text-ink/80">
                <input
                  type="checkbox"
                  checked={!!checklist[item.key]}
                  onChange={(e) => setChecklist({ ...checklist, [item.key]: e.target.checked })}
                  className="h-4 w-4 rounded border-amber-300 text-amber-600 focus:ring-amber-400"
                />
                {item.label}
              </label>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2.5 text-sm font-medium text-ink">
          <input
            type="checkbox"
            checked={form.status === 'active'}
            onChange={(e) => setForm({ ...form, status: e.target.checked ? 'active' : 'inactive' })}
            className="h-4 w-4 rounded border-amber-300 text-amber-600 focus:ring-amber-400"
          />
          Published (visible in the swipe deck)
        </label>

        <div className="flex gap-2">
          <Button type="submit" disabled={saving || (form.status === 'active' && !allChecked)}>
            {saving ? 'Saving…' : isNew ? 'Publish course' : 'Save changes'}
          </Button>
          <Button type="button" variant="ghost" onClick={() => navigate('/admin/courses')}>
            Cancel
          </Button>
        </div>
        {form.status === 'active' && !allChecked && (
          <p className="text-xs text-signal">Complete the checklist above to publish this course as active.</p>
        )}
      </form>
    </AdminShell>
  )
}
