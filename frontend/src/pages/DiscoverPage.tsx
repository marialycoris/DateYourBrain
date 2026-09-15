import { useEffect, useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { SwipeDeck } from '@/components/SwipeDeck'
import { useAuth } from '@/context/AuthContext'
import { coursesApi, trackerApi } from '@/lib/api'
import type { Course } from '@/types'

export default function DiscoverPage() {
  const { user } = useAuth()
  const [courses, setCourses] = useState<Course[] | null>(null)
  const [savedCount, setSavedCount] = useState(0)

  useEffect(() => {
    coursesApi.listActive().then(setCourses)
  }, [])

  const handleSwipe = async (course: Course, direction: 'left' | 'right') => {
    if (!user) return
    if (direction === 'right') setSavedCount((c) => c + 1)
    await trackerApi.logSwipe(course.id, user.id, direction)
  }

  return (
    <AppShell>
      <div className="mb-5 flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Discover</h1>
          <p className="mt-1 text-sm text-ink/55">Vetted, free-to-certify courses — swipe to sort.</p>
        </div>
        {savedCount > 0 && (
          <span className="rounded-full bg-amber-400 px-3 py-1 text-xs font-semibold text-ink">
            +{savedCount} saved
          </span>
        )}
      </div>

      {courses === null ? (
        <div className="flex h-[26rem] items-center justify-center text-sm text-ink/40">Loading courses…</div>
      ) : (
        <SwipeDeck courses={courses} onSwipe={handleSwipe} />
      )}
    </AppShell>
  )
}
