import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Trash2, Pencil } from 'lucide-react'
import { AdminShell } from '@/components/layout/AdminShell'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { pathsApi } from '@/lib/api'
import type { LearningPath } from '@/types'

export default function AdminPathsPage() {
  const toast = useToast()
  const [paths, setPaths] = useState<LearningPath[]>([])
  const [pendingDelete, setPendingDelete] = useState<LearningPath | null>(null)
  const [deleting, setDeleting] = useState(false)

  const refresh = () => pathsApi.listAll().then(setPaths)
  useEffect(() => {
    refresh()
  }, [])

  const confirmDelete = async () => {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      await pathsApi.remove(pendingDelete.id)
      toast.success(`"${pendingDelete.title}" deactivated.`)
      setPendingDelete(null)
      refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't deactivate the path — please try again.")
    } finally {
      setDeleting(false)
    }
  }

  const totalHours = (path: LearningPath) =>
    path.courses.reduce((sum, c) => sum + c.durationHours, 0)

  return (
    <AdminShell>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Learning Paths</h1>
          <p className="mt-1 text-sm text-ink/55">
            Ordered course sequences that guide learners on what to take next.
          </p>
        </div>
        <Link to="/admin/paths/new" className="self-start sm:self-auto">
          <Button>
            <span className="inline-flex items-center gap-1.5">
              <Plus size={16} /> New path
            </span>
          </Button>
        </Link>
      </div>

      {paths.length === 0 ? (
        <div className="mt-8 rounded-card border border-dashed border-amber-300 bg-white/60 px-6 py-10 text-center">
          <p className="text-sm text-ink/55">No learning paths yet — create your first one.</p>
        </div>
      ) : (
        <div className="mt-5 overflow-x-auto rounded-card border border-amber-200 bg-white/70">
          <table className="min-w-[640px] w-full text-left text-sm">
            <thead className="bg-amber-100/70 text-xs font-semibold text-ink/60">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Courses</th>
                <th className="px-4 py-3">Est. hours</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paths.map((p) => (
                <tr key={p.id} className="border-t border-amber-100">
                  <td className="max-w-xs px-4 py-3">
                    <p className="truncate font-medium text-ink">{p.title}</p>
                    <p className="truncate text-xs text-ink/50">
                      {p.courses.length
                        ? p.courses.map((c) => c.issuer).filter((v, i, a) => a.indexOf(v) === i).join(' · ')
                        : 'No courses yet'}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-ink/70">{p.courses.length}</td>
                  <td className="px-4 py-3 text-ink/70">{totalHours(p)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        p.status === 'active' ? 'bg-amber-200 text-amber-900' : 'bg-ink/10 text-ink/50'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink/50">{new Date(p.updatedAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        to={`/admin/paths/${p.id}`}
                        className="rounded-full p-2 text-ink/50 hover:bg-amber-100 hover:text-ink"
                        aria-label="Edit"
                      >
                        <Pencil size={15} />
                      </Link>
                      <button
                        onClick={() => setPendingDelete(p)}
                        className="rounded-full p-2 text-ink/50 hover:bg-signal/10 hover:text-signal"
                        aria-label="Deactivate"
                        disabled={p.status === 'inactive'}
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
      )}

      <ConfirmModal
        open={!!pendingDelete}
        onClose={() => {
          if (!deleting) setPendingDelete(null)
        }}
        onConfirm={confirmDelete}
        title="Deactivate learning path"
        message={`"${pendingDelete?.title}" will be hidden from learners immediately. This is a soft delete — the record stays in the database.`}
        confirmLabel="Deactivate"
        variant="danger"
        busy={deleting}
      />
    </AdminShell>
  )
}
