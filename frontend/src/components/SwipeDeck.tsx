import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, Info, X } from 'lucide-react'
import { SwipeCard } from '@/components/SwipeCard'
import { Button } from '@/components/ui/Button'
import type { Course } from '@/types'

export function SwipeDeck({
  courses,
  onSwipe,
}: {
  courses: Course[]
  onSwipe: (course: Course, direction: 'left' | 'right') => void
}) {
  const navigate = useNavigate()
  const [dismissed, setDismissed] = useState<string[]>([])

  const visible = useMemo(() => courses.filter((c) => !dismissed.includes(c.id)).slice(0, 4), [
    courses,
    dismissed,
  ])
  const current = visible[0]

  const handleSwipe = (course: Course, direction: 'left' | 'right') => {
    setDismissed((d) => [...d, course.id])
    onSwipe(course, direction)
  }

  if (!current) {
    return (
      <div className="flex h-[26rem] flex-col items-center justify-center rounded-card border border-dashed border-amber-300 bg-amber-50/60 px-8 text-center lg:h-[32rem]">
        <p className="font-display text-xl font-semibold text-ink">You're through today's stack</p>
        <p className="mt-2 text-sm text-ink/60">
          Check your tracker, or come back later — the admin team adds newly vetted courses regularly.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="relative h-[26rem] w-full lg:h-[32rem]">
        {visible
          .map((course, i) => (
            <SwipeCard
              key={course.id}
              course={course}
              isTop={i === 0}
              stackIndex={i}
              onSwiped={(direction) => handleSwipe(course, direction)}
            />
          ))
          .reverse()}
      </div>

      <div className="mt-6 flex items-center justify-center gap-4">
        <button
          onClick={() => handleSwipe(current, 'left')}
          className="flex h-14 w-14 items-center justify-center rounded-full border border-amber-200 bg-white text-ink/60 shadow-card transition hover:border-signal hover:text-signal"
          aria-label="Not interested"
        >
          <X size={22} />
        </button>
        <button
          onClick={() => navigate(`/courses/${current.id}`)}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-amber-200 bg-white text-ink/50 shadow-card hover:text-ink"
          aria-label="View details"
        >
          <Info size={18} />
        </button>
        <button
          onClick={() => handleSwipe(current, 'right')}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-ink text-amber-300 shadow-card transition hover:bg-ink/90"
          aria-label="Interested"
        >
          <Heart size={22} fill="currentColor" />
        </button>
      </div>
      <p className="mt-3 text-center text-xs text-ink/40">
        Swipe right to save to your tracker, left to pass — or use the buttons.
      </p>
    </div>
  )
}

export function EmptyCoursesNotice() {
  return (
    <div className="rounded-card border border-amber-200 bg-white p-6 text-center text-sm text-ink/60">
      No courses to show right now.
      <Button variant="ghost" size="sm" className="mt-3" onClick={() => window.location.reload()}>
        Refresh
      </Button>
    </div>
  )
}
