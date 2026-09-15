import type { SVGProps } from 'react'

export function LogoMark({
  size = 40,
  ...rest
}: { size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      {/* Brain outline */}
      <path
        d="
          M24 35
          C20.5 37 16 35.2 16 31.5
          C13.5 31 12 28.8 12.8 26.5
          C10.8 24.5 11.5 21.2 14 20.2
          C13.7 17.2 16.2 14.8 19.2 15.2
          C20.2 12.5 23.2 11.5 25.2 13.3
          C27.2 11.5 30.2 12.5 30.8 15.2
          C33.8 14.8 36.3 17.2 36 20.2
          C38.5 21.2 39.2 24.5 37.2 26.5
          C38 28.8 36.5 31 34 31.5
          C34 35.2 29.5 37 26 35
          Z
        "
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Brain center */}
      <path
        d="
          M24 14
          C22.5 16 23.5 18 24 19.5
          C24.5 21 22.5 22 21.5 23
          C20.5 24 21 25.5 22 26
          C23 26.5 23 28 22 29
          C21 30 21.5 32 23 34
        "
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {/* Subtle swipe line */}
      <path
        d="M8 39H18"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      <path
        d="M30 39H40"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  )
}
/**
 * Logo — full horizontal lockup (mark + wordmark). Use on auth screens
 * and anywhere there's room to spell out the name.
 */
export function Logo({ markSize = 40 }: { markSize?: number }) {
  return (
    <div className="inline-flex items-center gap-3">
      <LogoMark
        size={markSize}
        className="text-amber-600"
      />

      <span className="font-display text-lg font-bold leading-none text-ink">
        Date Your
        <br />
        <span className="text-amber-600">Brain</span>
      </span>
    </div>
  )
}