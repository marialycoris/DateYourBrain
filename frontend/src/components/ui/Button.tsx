import { type ButtonHTMLAttributes, forwardRef } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  fullWidth?: boolean
}

const variants: Record<Variant, string> = {
  primary: 'bg-ink text-amber-50 hover:bg-ink/90 disabled:bg-ink/40',
  secondary: 'bg-amber-100 text-ink hover:bg-amber-150 disabled:bg-amber-50 disabled:text-ink/40',
  ghost: 'bg-transparent text-ink hover:bg-amber-100 disabled:text-ink/30',
  danger: 'bg-signal text-white hover:bg-signal/90 disabled:bg-signal/40',
}

const sizes: Record<Size, string> = {
  sm: 'text-sm px-3 py-1.5 rounded-full',
  md: 'text-sm px-4 py-2.5 rounded-full',
  lg: 'text-base px-6 py-3.5 rounded-full',
}

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ variant = 'primary', size = 'md', fullWidth, className = '', ...rest }, ref) => {
    return (
      <button
        ref={ref}
        className={`font-medium transition-colors duration-150 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${
          fullWidth ? 'w-full' : ''
        } ${className}`}
        {...rest}
      />
    )
  }
)
Button.displayName = 'Button'
