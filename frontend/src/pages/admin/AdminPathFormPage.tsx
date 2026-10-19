import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ChevronDown, ChevronUp, Plus, Search, X } from 'lucide-react'
import { AdminShell } from '@/components/layout/AdminShell'
import { Input, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { coursesApi, pathsApi } from '@/lib/api'
import type { Course } from '@/types'

type FormState = {
  title: string
  description: string
  status: 'active' | 'inactive'
}

const empty: FormState = {
  title: '',
  description: '',
  status: 'active',
}

export default function AdminPathFormPage() {
  const { id } = useParams()
  const isNew = !id || id === 'new'
  const navigate = useNavigate()

  const [form, setForm] = useState<FormState>(empty)
  const [selected, setSelected] = useState<Course[]>([])
  const [catalog, setCatalog] = useState<Course[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    coursesApi.listAll().then(setCatalog)
    if (isNew) return
    pathsApi.get(id!).then((p) => {
      if (!p) return
      setForm({ title: p.title, description: p.description, status: p.status })
      setSelected(p.courses)
      setLoading(false)
    })
  }, [id, isNew])

  const selectedIds = useMemo(() => new Set(selected.map((c) => c.id)), [selected])

  const available = catalog.filter(
    (c) => !selectedIds.has(c.id) &&
      (c.title.toLowerCase().includes(query.toLowerCase()) ||
        c.issuer.toLowerCase().includes(query.toLowerCase()))
  )

  const addCourse = (course: Course) => {
    setSelected((s) => [...s, course])
    setQuery('')
  }

  const move = (index: number, direction: -1 | 1) => {
    setSelected((s) => {
      const next = [...s]
      const target = index + direction
      if (target < 0 || target >= next.length) return s
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  const remove = (courseId: string) => setSelected((s) => s.filter((c) => c.id !== courseId))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.title.trim()) {
      setError('Give the path a title.')
      return
    }
    if (selected.length === 0) {
      setError('Add at least one course to the path.')
      return
    }
    setSaving(true)
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      status: form.status,
      courseIds: selected.map((c) => c.id),
    }
    try {
      if (isNew) {
        await pathsApi.create(payload)
      } else {
        await pathsApi.update(id!, payload)
      }
      navigate('/admin/paths')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the path.')
    } finally {
      setSaving(false)
    }
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
        onClick={() => navigate('/admin/paths')}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink/55 hover:text-ink"
      >
        <ArrowLeft size={16} /> Back to learning paths
      </button>

      <h1 className="font-display text-2xl font-semibold text-ink">
        {isNew ? 'Create a learning path' : 'Edit learning path'}
      </h1>

      <form onSubmit={handleSubmit} className="mt-6 grid max-w-4xl gap-5">
        <Input
          label="Title"
          required
          placeholder="e.g. Launch Your Tech Career"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <Textarea
          label="Description"
          hint="Shown to learners above the path progress — explain the goal and the order."
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-card border border-amber-200 bg-white/70 p-4">
            <p className="text-sm font-semibold text-ink">Courses in this path</p>
            <p className="mt-1 text-xs text-ink/55">
              Learners follow this order — use the arrows to sequence them.
            </p>

            {selected.length === 0 ? (
              <p className="mt-4 rounded-xl border border-dashed border-amber-300 px-3 py-6 text-center text-xs text-ink/45">
                No courses yet — add some from the list.
              </p>
            ) : (
              <ol className="mt-3 space-y-2">
                {selected.map((course, index) => (
                  <li
                    key={course.id}
                    className="flex items-center gap-2 rounded-xl border border-amber-100 bg-amber-50/60 px-3 py-2"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-semibold text-amber-50">
                      {index + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-ink">{course.title}</span>
                      <span className="block truncate text-xs text-ink/50">{course.issuer}</span>
                    </span>
                    <span className="flex shrink-0 items-center">
                      <button
                        type="button"
                        onClick={() => move(index, -1)}
                        disabled={index === 0}
                        className="rounded-lg p-1.5 text-ink/50 hover:bg-amber-100 hover:text-ink disabled:opacity-30"
                        aria-label="Move up"
                      >
                        <ChevronUp size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => move(index, 1)}
                        disabled={index === selected.length - 1}
                        className="rounded-lg p-1.5 text-ink/50 hover:bg-amber-100 hover:text-ink disabled:opacity-30"
                        aria-label="Move down"
                      >
                        <ChevronDown size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(course.id)}
                        className="rounded-lg p-1.5 text-ink/50 hover:bg-signal/10 hover:text-signal"
                        aria-label="Remove"
                      >
                        <X size={15} />
                      </button>
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </div>

          <div className="rounded-card border border-amber-200 bg-white/70 p-4">
            <p className="text-sm font-semibold text-ink">Add a course</p>
            <p className="mt-1 text-xs text-ink/55">Search the catalog and append it to the path.</p>

            <div className="relative mt-3">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title or issuer"
                className="w-full rounded-xl border border-amber-200 bg-white/70 py-2.5 pl-9 pr-3.5 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
              />
            </div>

            <ul className="mt-3 max-h-72 space-y-2 overflow-y-auto">
              {available.length === 0 && (
                <li className="px-1 py-4 text-center text-xs text-ink/45">
                  {catalog.length === 0 ? 'Loading courses…' : 'No matching courses left to add.'}
                </li>
              )}
              {available.map((course) => (
                <li
                  key={course.id}
                  className="flex items-center gap-2 rounded-xl border border-amber-100 px-3 py-2"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-ink">{course.title}</span>
                    <span className="block truncate text-xs text-ink/50">
                      {course.issuer} · {course.durationHours}h · {course.status}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => addCourse(course)}
                    className="shrink-0 rounded-full bg-amber-100 p-1.5 text-ink hover:bg-amber-200"
                    aria-label={`Add ${course.title}`}
                  >
                    <Plus size={15} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <label className="flex items-center gap-2.5 text-sm font-medium text-ink">
          <input
            type="checkbox"
            checked={form.status === 'active'}
            onChange={(e) => setForm({ ...form, status: e.target.checked ? 'active' : 'inactive' })}
            className="h-4 w-4 rounded border-amber-300 text-amber-600 focus:ring-amber-400"
          />
          Published (visible to learners)
        </label>

        <div className="flex gap-2">
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : isNew ? 'Create path' : 'Save changes'}
          </Button>
          <Button type="button" variant="ghost" onClick={() => navigate('/admin/paths')}>
            Cancel
          </Button>
        </div>
        {error && <p className="text-xs font-medium text-signal">{error}</p>}
      </form>
    </AdminShell>
  )
}
