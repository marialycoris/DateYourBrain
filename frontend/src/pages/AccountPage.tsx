import { useState, type FormEvent } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/context/AuthContext'
import { auth } from '@/lib/api'

export default function AccountPage() {
  const { user } = useAuth()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    if (next !== confirm) {
      setError('New passwords do not match.')
      return
    }
    if (!user) return
    setLoading(true)
    try {
      await auth.changePassword(user.id, current, next)
      setSuccess(true)
      setCurrent('')
      setNext('')
      setConfirm('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppShell>
      <h1 className="font-display text-2xl font-semibold text-ink">Your account</h1>

      <div className="mt-5 rounded-card border border-amber-200 bg-white/70 p-5">
        <p className="text-xs font-medium text-ink/45">Signed in as</p>
        <p className="mt-1 text-sm font-semibold text-ink">{user?.email}</p>
        <span className="mt-2 inline-block rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium capitalize text-amber-800">
          {user?.role} account
        </span>
      </div>

      <div className="mt-6 rounded-card border border-amber-200 bg-white/70 p-5">
        <h2 className="font-display text-lg font-semibold text-ink">Change password</h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <Input
            label="Current password"
            type="password"
            required
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          />
          <Input
            label="New password"
            type="password"
            required
            hint="At least 8 characters."
            value={next}
            onChange={(e) => setNext(e.target.value)}
          />
          <Input
            label="Confirm new password"
            type="password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          {error && <p className="text-sm font-medium text-signal">{error}</p>}
          {success && (
            <p className="flex items-center gap-1.5 text-sm font-medium text-amber-700">
              <CheckCircle2 size={16} /> Password updated.
            </p>
          )}
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving…' : 'Update password'}
          </Button>
        </form>
      </div>
    </AppShell>
  )
}
