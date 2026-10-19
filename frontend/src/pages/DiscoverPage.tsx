import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { LearningPathBanner } from '@/components/LearningPathBanner'
import { SwipeDeck } from '@/components/SwipeDeck'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/context/AuthContext'
import { coursesApi, trackerApi } from '@/lib/api'
import type { Course, TrackerEntry } from '@/types'

function DashboardStats({ entries }: { entries: TrackerEntry[] }) {
  const saved = entries.length
  const ongoing = entries.filter((e) => e.status === 'Ongoing').length
  const completed = entries.filter((e) => e.status === 'Completed').length
  const stats: [string, number][] = [
    ['Saved', saved],
    ['Ongoing', ongoing],
    ['Completed', completed],
  ]

  return (
    <section className="rounded-card border border-amber-200 bg-white/70 p-4">
      <h2 className="text-[11px] font-semibold uppercase tracking-wide text-ink/45">Your activity</h2>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {stats.map(([label, value]) => (
          <div key={label} className="rounded-xl bg-amber-50 px-2 py-3 text-center">
            <p className="font-display text-xl font-semibold text-ink">{value}</p>
            <p className="mt-0.5 text-[11px] text-ink/50">{label}</p>
          </div>
        ))}
      </div>
      <Link
        to="/tracker"
        className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-amber-700 transition hover:text-amber-900"
      >
        Open tracker <ChevronRight size={14} />
      </Link>
    </section>
  )
}

export default function DiscoverPage() {
  const { user } = useAuth()
  const toast = useToast()
  const [courses, setCourses] = useState<Course[] | null>(null)
  const [entries, setEntries] = useState<TrackerEntry[] | null>(null)
  const [savedCount, setSavedCount] = useState(0)

  useEffect(() => {
    if (!user) return
    // Courses already in the learner's tracker (saved or completed) are done
    // with discovery — fetch them first, then load the deck without them.
    trackerApi
      .listForUser(user.id)
      .then((tracker) => {
        setEntries(tracker)
        return coursesApi.listActive(tracker.map((e) => String(e.courseId)))
      })
      .then(setCourses)
      .catch(() => setCourses([]))
  }, [user])

  const handleSwipe = async (course: Course, direction: 'left' | 'right') => {
    if (!user) return
    try {
      await trackerApi.logSwipe(course.id, user.id, direction)
      if (direction === 'right') {
        setSavedCount((c) => c + 1)
        setEntries((prev) =>
          prev
            ? [
                ...prev,
                {
                  id: `${course.id}-${user.id}`,
                  courseId: course.id,
                  userId: user.id,
                  status: 'Interested' as const,
                  notes: '',
                  updatedAt: new Date().toISOString(),
                },
              ]
            : prev,
        )
      }
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
          flips: paths land on the left, the deck in the middle, and the stats
          panel wraps under the paths (its own third column on xl). */}
      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:items-start lg:gap-8 xl:grid-cols-[minmax(0,22rem)_minmax(0,1fr)_minmax(0,20rem)]">
        <div className="min-w-0 lg:order-2">
          {courses === null ? (
            <div className="mx-auto flex h-[26rem] w-full max-w-md items-center justify-center text-sm text-ink/40 lg:h-[32rem] lg:max-w-xl">
              Loading courses…
            </div>
          ) : (
            <div className="mx-auto w-full max-w-md lg:max-w-xl">
              <SwipeDeck courses={courses} onSwipe={handleSwipe} />
            </div>
          )}
        </div>

        <aside className="min-w-0 lg:order-1 lg:sticky lg:top-24">
          <LearningPathBanner />
        </aside>

        <aside className="min-w-0 lg:order-3">
          {entries && <DashboardStats entries={entries} />}
        </aside>
      </div>
    </AppShell>
  )
}
