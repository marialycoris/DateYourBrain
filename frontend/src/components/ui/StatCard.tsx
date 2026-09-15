import type { ReactNode } from 'react'

export function StatCard({
  label,
  value,
  sublabel,
  icon,
}: {
  label: string
  value: string | number
  sublabel?: string
  icon?: ReactNode
}) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-white/60 p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-ink/60">{label}</span>
        {icon && <span className="text-amber-500">{icon}</span>}
      </div>
      <div className="mt-2 font-display text-3xl font-semibold text-ink">{value}</div>
      {sublabel && <div className="mt-1 text-xs text-ink/45">{sublabel}</div>}
    </div>
  )
}
