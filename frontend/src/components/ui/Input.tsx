import { type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes, forwardRef } from 'react'

interface FieldWrapProps {
  label?: string
  error?: string
  hint?: string
  children: React.ReactNode
}

export function FieldWrap({ label, error, hint, children }: FieldWrapProps) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>}
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-ink-faint text-ink/50">{hint}</span>}
      {error && <span className="mt-1 block text-xs font-medium text-signal">{error}</span>}
    </label>
  )
}

const baseInputClasses =
  'w-full rounded-xl border border-amber-200 bg-white/70 px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/35 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', ...rest }, ref) => (
    <FieldWrap label={label} error={error} hint={hint}>
      <input ref={ref} className={`${baseInputClasses} ${error ? 'border-signal' : ''} ${className}`} {...rest} />
    </FieldWrap>
  )
)
Input.displayName = 'Input'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className = '', ...rest }, ref) => (
    <FieldWrap label={label} error={error} hint={hint}>
      <textarea ref={ref} className={`${baseInputClasses} min-h-[96px] resize-y ${error ? 'border-signal' : ''} ${className}`} {...rest} />
    </FieldWrap>
  )
)
Textarea.displayName = 'Textarea'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, className = '', children, ...rest }, ref) => (
    <FieldWrap label={label} error={error} hint={hint}>
      <select ref={ref} className={`${baseInputClasses} ${error ? 'border-signal' : ''} ${className}`} {...rest}>
        {children}
      </select>
    </FieldWrap>
  )
)
Select.displayName = 'Select'
