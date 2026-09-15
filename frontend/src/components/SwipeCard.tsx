import { useState } from 'react'
import { motion, useAnimation, type PanInfo } from 'framer-motion'
import { Clock, ExternalLink } from 'lucide-react'
import type { Course } from '@/types'
import { TrustBadgePill } from '@/components/ui/Badge'

const SWIPE_THRESHOLD = 120

export function SwipeCard({
  course,
  isTop,
  stackIndex,
  onSwiped,
}: {
  course: Course
  isTop: boolean
  stackIndex: number
  onSwiped: (direction: 'left' | 'right') => void
}) {
  const controls = useAnimation()
  const [exitX, setExitX] = useState(0)

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x > SWIPE_THRESHOLD) {
      setExitX(600)
      controls.start({ x: 600, opacity: 0, rotate: 18, transition: { duration: 0.35 } }).then(() =>
        onSwiped('right')
      )
    } else if (info.offset.x < -SWIPE_THRESHOLD) {
      setExitX(-600)
      controls.start({ x: -600, opacity: 0, rotate: -18, transition: { duration: 0.35 } }).then(() =>
        onSwiped('left')
      )
    } else {
      controls.start({ x: 0, rotate: 0, transition: { type: 'spring', stiffness: 400, damping: 30 } })
    }
  }

  const scale = 1 - Math.min(stackIndex, 2) * 0.045
  const yOffset = Math.min(stackIndex, 2) * 14

  return (
    <motion.div
      className="absolute inset-0"
      style={{ zIndex: 50 - stackIndex }}
      initial={{ scale, y: yOffset, opacity: stackIndex > 2 ? 0 : 1 }}
      animate={{ scale, y: yOffset, opacity: stackIndex > 2 ? 0 : 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 26 }}
    >
      <motion.div
        drag={isTop ? 'x' : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.9}
        onDragEnd={handleDragEnd}
        animate={controls}
        whileDrag={{ rotate: exitX === 0 ? undefined : undefined }}
        className={`flex h-full w-full flex-col overflow-hidden rounded-card border border-amber-200 bg-white shadow-card ${
          isTop ? 'cursor-grab active:cursor-grabbing' : ''
        }`}
      >
        <div className="flex flex-1 flex-col justify-between bg-gradient-to-b from-amber-50 to-white p-6">
          <div>
            <div className="flex flex-wrap gap-1.5">
              {course.badges.map((b) => (
                <TrustBadgePill key={b} badge={b} />
              ))}
            </div>
            <h3 className="mt-4 font-display text-2xl font-semibold leading-tight text-ink">
              {course.title}
            </h3>
            <p className="mt-2 text-sm text-ink/60">{course.issuer}</p>
            <p className="mt-4 text-base leading-snug text-ink/80">{course.outcome}</p>
          </div>

          <div>
            <div className="mb-3 flex flex-wrap gap-1.5">
              {course.skills.slice(0, 4).map((s) => (
                <span key={s} className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
                  {s}
                </span>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-amber-100 pt-3 text-xs text-ink/50">
              <span className="inline-flex items-center gap-1">
                <Clock size={13} /> ~{course.durationHours}h to complete
              </span>
              <span className="inline-flex items-center gap-1">
                <ExternalLink size={13} /> view details on tap
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
