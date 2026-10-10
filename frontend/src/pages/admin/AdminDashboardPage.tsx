import { useEffect, useState } from 'react'
import { Users, UserCheck, MousePointerClick, TrendingUp } from 'lucide-react'
import { AdminShell } from '@/components/layout/AdminShell'
import { StatCard } from '@/components/ui/StatCard'
import { analyticsApi } from '@/lib/api'
import type { AnalyticsSummary } from '@/types'

export default function AdminDashboardPage() {
  const [data, setData] = useState<AnalyticsSummary | null>(null)

  useEffect(() => {
    analyticsApi.summary().then(setData)
  }, [])

  return (
    <AdminShell>
      <h1 className="font-display text-2xl font-semibold text-ink">Analytics</h1>
      <p className="mt-1 text-sm text-ink/55">Engagement and course-curation signals at a glance.</p>

      {!data ? (
        <p className="mt-8 text-sm text-ink/40">Loading…</p>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Registered users" value={data.totalUsers} icon={<Users size={18} />} />
            <StatCard
              label="Active users (30d)"
              value={data.activeUsers30d}
              icon={<UserCheck size={18} />}
            />
            <StatCard label="Total swipes" value={data.totalSwipes} icon={<MousePointerClick size={18} />} />
            <StatCard
              label="Avg swipes / user"
              value={data.avgSwipesPerUser}
              icon={<TrendingUp size={18} />}
            />
          </div>

          <div className="mt-8">
            <h2 className="font-display text-lg font-semibold text-ink">Course-level metrics</h2>
            <div className="mt-3 overflow-x-auto rounded-card border border-amber-200 bg-white/70">
              <table className="min-w-[640px] w-full text-left text-sm">
                <thead className="bg-amber-100/70 text-xs font-semibold text-ink/60">
                  <tr>
                    <th className="px-4 py-3">Course</th>
                    <th className="px-4 py-3">Interested</th>
                    <th className="px-4 py-3">In progress</th>
                    <th className="px-4 py-3">Completed</th>
                    <th className="px-4 py-3">Completion rate</th>
                  </tr>
                </thead>
                <tbody>
                  {data.courseMetrics.map((m) => (
                    <tr key={m.courseId} className="border-t border-amber-100">
                      <td className="max-w-xs truncate px-4 py-3 font-medium text-ink">{m.title}</td>
                      <td className="px-4 py-3 text-ink/70">{m.interested}</td>
                      <td className="px-4 py-3 text-ink/70">{m.inProgress}</td>
                      <td className="px-4 py-3 text-ink/70">{m.completed}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-amber-200 px-2 py-0.5 text-xs font-semibold text-amber-900">
                          {Math.round(m.completionRate * 100)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="font-display text-lg font-semibold text-ink">Issue reports by course</h2>
            {data.reportCounts.length === 0 ? (
              <p className="mt-3 text-sm text-ink/45">No reports yet — nothing flagged by learners.</p>
            ) : (
              <div className="mt-3 space-y-2">
                {data.reportCounts.map((r) => (
                  <div
                    key={r.courseId}
                    className="flex items-center justify-between rounded-xl border border-amber-200 bg-white/70 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-ink">{r.title}</p>
                      <p className="mt-0.5 text-xs text-ink/50">
                        {Object.entries(r.byType)
                          .filter(([, n]) => n > 0)
                          .map(([type, n]) => `${n} ${type.toLowerCase()}`)
                          .join(', ')}
                      </p>
                    </div>
                    <span className="rounded-full bg-signal/10 px-2.5 py-1 text-xs font-semibold text-signal">
                      {r.total} report{r.total > 1 ? 's' : ''}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </AdminShell>
  )
}
