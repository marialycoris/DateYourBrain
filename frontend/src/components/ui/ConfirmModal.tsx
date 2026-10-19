import { AlertTriangle } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

/**
 * ConfirmModal — generic "are you sure?" dialog. Pair it with a toast for the
 * resulting success/failure. Pass `warning` for irreversible actions so the
 * stakes are spelled out before the user commits.
 */
export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  warning,
  confirmLabel = 'Confirm',
  variant = 'primary',
  busy = false,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  warning?: string
  confirmLabel?: string
  variant?: 'primary' | 'secondary' | 'danger'
  busy?: boolean
}) {
  return (
    <Modal open={open} onClose={busy ? () => {} : onClose} title={title}>
      <p className="text-sm leading-relaxed text-ink/70">{message}</p>

      {warning && (
        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-signal/30 bg-signal/10 px-3.5 py-3">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-signal" />
          <p className="text-sm font-medium leading-snug text-signal">{warning}</p>
        </div>
      )}

      <div className="mt-5 flex justify-end gap-2">
        <Button onClick={onConfirm} disabled={busy} variant={variant}>
          {busy ? 'Saving…' : confirmLabel}
        </Button>
        <Button variant="ghost" onClick={onClose} disabled={busy}>
          Cancel
        </Button>
      </div>
    </Modal>
  )
}
