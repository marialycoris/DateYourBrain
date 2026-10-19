import { useEffect, useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { LearningPathBanner } from '@/components/LearningPathBanner'
import { SwipeDeck } from '@/components/SwipeDeck'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/context/AuthContext'
import { coursesApi, trackerApi } from '@/lib/api'
import type { Course } from '@/types'

export default function DiscoverPage() {
  const { user } = useAuth()
  const toast = useToast()
  const [courses, setCourses] = useState<Course[] | null>(null)
  const [savedCount, setSavedCount] = useState(0)

  useEffect(() => {
    if (!user) return
    // Courses already in the learner's tracker (saved or completed) are done
    // with discovery — fetch them first, then load the deck without them.
    trackerApi
      .listForUser(user.id)
      .then((entries) => coursesApi.listActive(entries.map((e) => String(e.courseId))))
      .then(setCourses)
      .catch(() => setCourses([]))
  }, [user])

  const handleSwipe = async (course: Course, direction: 'left' | 'right') => {
    if (!user) return
    try {
      await trackerApi.logSwipe(course.id, user.id, direction)
      if (direction === 'right') setSavedCount((c) => c + 1)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save that swipe — please try again.")
    }
  }

  return (
    <AppShell wide>
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

      {/* DOM order = mobile order (deck first, paths below). On lg the grid
          flips: paths land on the left, the deck on the right. */}
      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:items-start lg:gap-8">
        <div className="min-w-0 lg:order-2">
          {courses === null ? (
            <div className="mx-auto flex h-[26rem] w-full max-w-md items-center justify-center text-sm text-ink/40 lg:max-w-lg">
              Loading courses…
            </div>
          ) : (
            <div className="mx-auto w-full max-w-md lg:max-w-lg">
              <SwipeDeck courses={courses} onSwipe={handleSwipe} />
            </div>
          )}
        </div>

        <aside className="min-w-0 lg:order-1 lg:sticky lg:top-24">
          <LearningPathBanner />
        </aside>
      </div>
    </AppShell>
  )
}
