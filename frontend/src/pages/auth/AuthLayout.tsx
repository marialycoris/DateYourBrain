import { type ReactNode } from 'react'

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-amber-100 via-paper to-paper px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-ink text-base font-semibold text-amber-300">
            DB
          </span>
          <h1 className="font-display text-3xl font-semibold text-ink">{title}</h1>
          <p className="mt-2 text-sm text-ink/60">{subtitle}</p>
        </div>

        <div className="rounded-card border border-amber-200 bg-white/80 p-6 shadow-card">{children}</div>

        <div className="mt-5 text-center text-sm text-ink/60">{footer}</div>
      </div>
    </div>
  )
}
