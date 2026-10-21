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
  // One modal, two steps. Keeping a single Modal mounted avoids the flash you
  // get when one AnimatePresence overlay exits while another enters.
  const [passwordStep, setPasswordStep] = useState<'closed' | 'form' | 'confirm'>('closed')
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
    setPasswordStep('form')
  }

  const closePassword = () => {
    if (!loading) setPasswordStep('closed')
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (next !== confirm) {
      setError('New passwords do not match.')
      return
    }
    setPasswordStep('confirm')
  }

  const changePassword = async () => {
    if (!user || loading) return
    setLoading(true)
    try {
      await auth.changePassword(user.id, current, next)
      setPasswordStep('closed')
      toast.success('Password updated.')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong.'
      setError(message)
      setPasswordStep('form')
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    if (loggingOut) return
    setLoggingOut(true)
    await logout()
    // Leave `loggingOut` true — the modal unmounts with the page, so the button
    // never flickers back to "Log out" while the route swaps.
    navigate('/login', { replace: true })
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
        open={passwordStep !== 'closed'}
        onClose={closePassword}
        title={passwordStep === 'confirm' ? 'Change password?' : 'Change password'}
      >
        {passwordStep === 'confirm' ? (
          <>
            <p className="text-sm leading-relaxed text-ink/70">
              Your password will be updated immediately. You'll keep using the new one the next
              time you sign in.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button onClick={changePassword} disabled={loading}>
                {loading ? 'Saving…' : 'Yes, change it'}
              </Button>
              <Button variant="ghost" onClick={closePassword} disabled={loading}>
                Cancel
              </Button>
            </div>
          </>
        ) : (
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
              Continue
            </Button>
          </form>
        )}
      </Modal>

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