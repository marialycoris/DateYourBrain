import { ShieldCheck, BadgeCheck, GraduationCap, Sparkles } from 'lucide-react'
import type { TrustBadge, TrackerStatus } from '@/types'

const badgeStyle: Record<TrustBadge, { icon: React.ReactNode; classes: string }> = {
  Accredited: { icon: <ShieldCheck size={13} />, classes: 'bg-amber-800 text-amber-50' },
  'Industry cert': { icon: <BadgeCheck size={13} />, classes: 'bg-amber-600 text-amber-50' },
  'Free cert': { icon: <Sparkles size={13} />, classes: 'bg-amber-300 text-amber-900' },
  'University-issued': { icon: <GraduationCap size={13} />, classes: 'bg-amber-700 text-amber-50' },
}

export function TrustBadgePill({ badge }: { badge: TrustBadge }) {
  const { icon, classes } = badgeStyle[badge]
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${classes}`}>
      {icon}
      {badge}
    </span>
  )
}

export function StatusPill({ status }: { status: TrackerStatus }) {
  const map: Record<TrackerStatus, string> = {
    Interested: 'bg-amber-100 text-amber-800',
    Ongoing: 'bg-amber-400 text-ink',
    Completed: 'bg-ink text-amber-50',
  }
  return <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${map[status]}`}>{status}</span>
}
