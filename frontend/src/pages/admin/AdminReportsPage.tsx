import { useEffect, useState } from 'react'
import { AdminShell } from '@/components/layout/AdminShell'
import { reportsApi, coursesApi } from '@/lib/api'
import type { Course, IssueStatus, Report } from '@/types'

const STATUS_STYLES: Record<IssueStatus, string> = {
  open: 'bg-signal/10 text-signal',
  reviewed: 'bg-amber-200 text-amber-900',
  resolved: 'bg-ink/10 text-ink/50',
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [courses, setCourses] = useState<Record<string, Course>>({})
  const [filter, setFilter] = useState<IssueStatus | 'All'>('All')

  const refresh = () =>
    Promise.all([reportsApi.listAll(), coursesApi.listAll()]).then(([r, c]) => {
      setReports(r)
      setCourses(Object.fromEntries(c.map((course) => [course.id, course])))
    })

  useEffect(() => {
    refresh()
  }, [])

  const filtered = reports.filter((r) => filter === 'All' || r.status === filter)

  const setStatus = async (id: string, status: IssueStatus) => {
    await reportsApi.updateStatus(id, status)
    refresh()
  }

  return (
    <AdminShell>
      <h1 className="font-display text-2xl font-semibold text-ink">Reports</h1>
      <p className="mt-1 text-sm text-ink/55">Issues flagged by learners, newest first.</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {(['All', 'open', 'reviewed', 'resolved'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize transition ${
              filter === s ? 'bg-ink text-amber-300' : 'bg-amber-100 text-ink/60'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-3">
        {filtered.length === 0 && <p className="text-sm text-ink/45">No reports in this view.</p>}
        {filtered.map((r) => {
          const course = courses[r.courseId]
          return (
            <div key={r.id} className="rounded-card border border-amber-200 bg-white/70 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-ink">{course?.title ?? 'Unknown course'}</p>
                  <p className="mt-0.5 text-xs text-ink/50">
                    {r.issueType} · {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[r.status]}`}>
                  {r.status}
                </span>
              </div>
              {r.comment && <p className="mt-2 text-sm text-ink/70">{r.comment}</p>}
              <div className="mt-3 flex gap-2">
                {(['open', 'reviewed', 'resolved'] as IssueStatus[])
                  .filter((s) => s !== r.status)
                  .map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatus(r.id, s)}
                      className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium capitalize text-amber-800 hover:bg-amber-100"
                    >
                      Mark {s}
                    </button>
                  ))}
              </div>
            </div>
          )
        })}
      </div>
    </AdminShell>
  )
}
