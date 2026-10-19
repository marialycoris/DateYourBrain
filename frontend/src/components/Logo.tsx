import type { ImgHTMLAttributes } from 'react'
import dybLogo from '@/assets/dyb_logo.png'

export function LogoMark({
  size = 40,
  className = '',
  ...rest
}: { size?: number } & ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      src={dybLogo}
      alt="Date Your Brain logo"
      height={size}
      style={{ height: size, width: 'auto' }}
      className={className}
      {...rest}
    />
  )
}
/**
 * Logo — full horizontal lockup (mark + wordmark). Use on auth screens
 * and anywhere there's room to spell out the name.
 */
export function Logo({ markSize = 40 }: { markSize?: number }) {
  return (
    <div className="inline-flex items-center gap-3">
      <LogoMark size={markSize} />

      <span className="font-display text-lg font-bold leading-none text-ink">
        Date Your
        <br />
        <span className="text-amber-600">Brain</span>
      </span>
    </div>
  )
}
