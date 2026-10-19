import { type ReactNode, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { BarChart3, BookOpen, Flag, LogOut, Menu, MonitorSmartphone, Route, X } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { LogoMark } from '../Logo'

const links = [
  { to: '/admin', label: 'Analytics', icon: BarChart3, end: true },
  { to: '/admin/courses', label: 'Courses', icon: BookOpen },
  { to: '/admin/paths', label: 'Learning Paths', icon: Route },
  { to: '/admin/reports', label: 'Reports', icon: Flag },
]

export function AdminShell({ children }: { children: ReactNode }) {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const closeMenu = () => setMenuOpen(false)

  const sidebar = (
    <>
      <div className="mb-8 flex items-center gap-2 px-1">
        <LogoMark size={48} className="mx-auto mb-4" />
        <div className="leading-tight">
          <p className="font-display text-base font-semibold text-ink">Date Your Brain</p>
          <p className="text-xs text-ink/50">Admin panel</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={closeMenu}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive ? 'bg-ink text-amber-300' : 'text-ink/60 hover:bg-amber-100'
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={() => {
          closeMenu()
          navigate('/discover')
        }}
        className="mb-2 flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-ink/60 hover:bg-amber-100"
      >
        <MonitorSmartphone size={17} />
        View learner app
      </button>
      <button
        onClick={handleLogout}
        className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-ink/60 hover:bg-amber-100 hover:text-signal"
      >
        <LogOut size={17} />
        Log out
      </button>
    </>
  )

  return (
    <div className="flex min-h-screen bg-paper">
      <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-amber-200/70 bg-amber-50/90 px-4 py-2.5 backdrop-blur md:hidden">
        <button
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          className="rounded-lg p-1.5 text-ink/70 transition hover:bg-amber-100"
        >
          <Menu size={20} />
        </button>
        <p className="font-display text-sm font-semibold text-ink">Date Your Brain · Admin</p>
        <LogoMark size={26} />
      </header>

      <div className={`fixed inset-0 z-50 md:hidden ${menuOpen ? '' : 'pointer-events-none'}`}>
        <div
          className={`absolute inset-0 bg-ink/40 transition-opacity ${menuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={closeMenu}
        />
        <aside
          className={`absolute inset-y-0 left-0 flex w-72 flex-col bg-amber-50 px-5 py-6 shadow-stack transition-transform ${
            menuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <button
            onClick={closeMenu}
            aria-label="Close menu"
            className="absolute right-3 top-3 rounded-lg p-1.5 text-ink/60 transition hover:bg-amber-100 hover:text-ink"
          >
            <X size={18} />
          </button>
          {sidebar}
        </aside>
      </div>

      <aside className="hidden w-64 flex-col border-r border-amber-200/70 bg-amber-50/60 px-5 py-6 md:flex">
        {sidebar}
      </aside>

      <main className="min-w-0 flex-1 overflow-y-auto px-4 py-6 pt-16 sm:px-6 md:px-8 md:pt-8 md:pb-10 lg:px-10">
        {children}
      </main>
    </div>
  )
}