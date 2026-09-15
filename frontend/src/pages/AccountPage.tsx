import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, KeyRound, LogOut } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useAuth } from '@/context/AuthContext'
import { auth } from '@/lib/api'

export default function AccountPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const openPassword = () => {
    setError('')
    setSuccess(false)
    setCurrent('')
    setNext('')
    setConfirm('')
    setPasswordOpen(true)
  }

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

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await logout()
      navigate('/login')
    } finally {
      setLoggingOut(false)
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
        <h2 className="font-display text-lg font-semibold text-ink">Security</h2>
        <div className="mt-4 space-y-3">
          <Button
            variant="secondary"
            fullWidth
            onClick={openPassword}
            className="flex items-center justify-center gap-2"
          >
            <KeyRound size={16} /> Change password
          </Button>
          <Button
            variant="danger"
            fullWidth
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center justify-center gap-2"
          >
            <LogOut size={16} /> {loggingOut ? 'Signing out…' : 'Log out'}
          </Button>
        </div>
      </div>

      <Modal
        open={passwordOpen}
        onClose={() => setPasswordOpen(false)}
        title="Change password"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <Button type="submit" fullWidth disabled={loading}>
            {loading ? 'Saving…' : 'Update password'}
          </Button>
        </form>
      </Modal>
    </AppShell>
  )
}