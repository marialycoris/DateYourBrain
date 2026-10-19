import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { KeyRound, LogOut } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/context/AuthContext'
import { auth } from '@/lib/api'

export default function AccountPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState(false)
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)

  const openPassword = () => {
    setError('')
    setCurrent('')
    setNext('')
    setConfirm('')
    setPasswordOpen(true)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (next !== confirm) {
      setError('New passwords do not match.')
      return
    }
    setConfirmPassword(true)
  }

  const changePassword = async () => {
    if (!user) return
    setLoading(true)
    try {
      await auth.changePassword(user.id, current, next)
      setConfirmPassword(false)
      setPasswordOpen(false)
      toast.success('Password updated.')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong.'
      setError(message)
      setConfirmPassword(false)
      toast.error(message)
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
      setLogoutOpen(false)
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
            onClick={() => setLogoutOpen(true)}
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
          <Button type="submit" fullWidth disabled={loading}>
            {loading ? 'Saving…' : 'Continue'}
          </Button>
        </form>
      </Modal>

      <ConfirmModal
        open={confirmPassword}
        onClose={() => {
          if (!loading) setConfirmPassword(false)
        }}
        onConfirm={changePassword}
        title="Change password?"
        message="Your password will be updated immediately. You'll keep using the new one the next time you sign in."
        confirmLabel="Yes, change it"
        busy={loading}
      />

      <ConfirmModal
        open={logoutOpen}
        onClose={() => {
          if (!loggingOut) setLogoutOpen(false)
        }}
        onConfirm={handleLogout}
        title="Log out?"
        message="You'll need to sign in again to access your tracker and learning paths."
        confirmLabel="Log out"
        variant="danger"
        busy={loggingOut}
      />
    </AppShell>
  )
}