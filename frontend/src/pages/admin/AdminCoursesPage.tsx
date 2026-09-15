import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Trash2, Pencil } from 'lucide-react'
import { AdminShell } from '@/components/layout/AdminShell'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { coursesApi } from '@/lib/api'
import type { Course } from '@/types'

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [query, setQuery] = useState('')
  const [pendingDelete, setPendingDelete] = useState<Course | null>(null)

  const refresh = () => coursesApi.listAll().then(setCourses)
  useEffect(() => {
    refresh()
  }, [])

  const filtered = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.issuer.toLowerCase().includes(query.toLowerCase())
  )

  const confirmDelete = async () => {
    if (!pendingDelete) return
    await coursesApi.softDelete(pendingDelete.id)
    setPendingDelete(null)
    refresh()
  }

  return (
    <AdminShell>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Courses</h1>
          <p className="mt-1 text-sm text-ink/55">{courses.length} in the catalog, vetted before publishing.</p>
        </div>
        <Link to="/admin/courses/new">
          <Button>
            <span className="inline-flex items-center gap-1.5">
              <Plus size={16} /> Add course
            </span>
          </Button>
        </Link>
      </div>

      <div className="relative mt-5 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title or issuer"
          className="w-full rounded-xl border border-amber-200 bg-white/70 py-2.5 pl-9 pr-3.5 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
        />
      </div>

      <div className="mt-5 overflow-hidden rounded-card border border-amber-200 bg-white/70">
        <table className="w-full text-left text-sm">
          <thead className="bg-amber-100/70 text-xs font-semibold text-ink/60">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Issuer</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-t border-amber-100">
                <td className="max-w-xs truncate px-4 py-3 font-medium text-ink">{c.title}</td>
                <td className="px-4 py-3 text-ink/70">{c.issuer}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      c.status === 'active' ? 'bg-amber-200 text-amber-900' : 'bg-ink/10 text-ink/50'
                    }`}
                  >
                    {c.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-ink/50">{new Date(c.updatedAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Link
                      to={`/admin/courses/${c.id}`}
                      className="rounded-full p-2 text-ink/50 hover:bg-amber-100 hover:text-ink"
                      aria-label="Edit"
                    >
                      <Pencil size={15} />
                    </Link>
                    <button
                      onClick={() => setPendingDelete(c)}
                      className="rounded-full p-2 text-ink/50 hover:bg-signal/10 hover:text-signal"
                      aria-label="Deactivate"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={!!pendingDelete} onClose={() => setPendingDelete(null)} title="Deactivate course">
        <p className="text-sm text-ink/70">
          "{pendingDelete?.title}" will be hidden from the swipe deck immediately. This is a soft delete —
          the record stays in the database and can be reactivated later.
        </p>
        <div className="mt-5 flex gap-2">
          <Button variant="danger" onClick={confirmDelete}>
            Deactivate
          </Button>
          <Button variant="ghost" onClick={() => setPendingDelete(null)}>
            Cancel
          </Button>
        </div>
      </Modal>
    </AdminShell>
  )
}
