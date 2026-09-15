import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-6 text-center">
      <p className="font-display text-6xl font-semibold text-amber-300">404</p>
      <p className="mt-3 text-ink/60">That page doesn't exist.</p>
      <Link to="/discover" className="mt-5 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-amber-50">
        Back to Discover
      </Link>
    </div>
  )
}
