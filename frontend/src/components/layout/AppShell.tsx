import { type ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Compass, LayoutGrid, UserRound } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { LogoMark } from '@/components/Logo'

const tabs = [
  { to: '/discover', label: 'Discover', icon: Compass },
  { to: '/tracker', label: 'Tracker', icon: LayoutGrid },
  { to: '/account', label: 'Account', icon: UserRound },
]

export function AppShell({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  const { user } = useAuth()
  const navigate = useNavigate()

  const shellWidth = wide ? 'max-w-md lg:max-w-6xl' : 'max-w-md'
  const shellPad = wide ? 'px-5 lg:px-8' : 'px-5'

  return (
    <div className={`mx-auto flex min-h-screen w-full ${shellWidth} flex-col bg-paper`}>
      <header className={`sticky top-0 z-30 flex items-center justify-between border-b border-amber-200/70 bg-paper/90 py-4 backdrop-blur ${shellPad}`}>
        <button onClick={() => navigate('/discover')} className="flex items-center gap-2">
          <LogoMark size={32} />
          <span className="font-display text-lg font-semibold leading-none text-ink">
            Date Your Brain
          </span>
        </button>
        {user?.role === 'admin' && (
          <button
            onClick={() => navigate('/admin')}
            className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-800"
          >
            Admin
          </button>
        )}
      </header>

      <main className={`flex-1 pb-24 pt-5 ${shellPad}`}>{children}</main>

      <nav
        className={`fixed bottom-0 left-1/2 z-30 w-full -translate-x-1/2 border-t border-amber-200/70 bg-paper/95 px-6 pb-[env(safe-area-inset-bottom)] backdrop-blur ${shellWidth}`}
      >
        <div className={`flex items-center justify-between py-2 ${wide ? 'lg:justify-center lg:gap-12' : ''}`}>
          {tabs.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 rounded-xl px-4 py-1.5 text-xs font-medium transition ${
                  isActive ? 'text-ink' : 'text-ink/40'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={20} strokeWidth={isActive ? 2.4 : 1.8} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
