import { type ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { BarChart3, BookOpen, Flag, LogOut, MonitorSmartphone } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const links = [
  { to: '/admin', label: 'Analytics', icon: BarChart3, end: true },
  { to: '/admin/courses', label: 'Courses', icon: BookOpen },
  { to: '/admin/reports', label: 'Reports', icon: Flag },
]

export function AdminShell({ children }: { children: ReactNode }) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen bg-paper">
      <aside className="flex w-64 flex-col border-r border-amber-200/70 bg-amber-50/60 px-5 py-6">
        <div className="mb-8 flex items-center gap-2 px-1">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-sm font-semibold text-amber-300">
            DB
          </span>
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
          onClick={() => navigate('/discover')}
          className="mb-2 flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-ink/60 hover:bg-amber-100"
        >
          <MonitorSmartphone size={17} />
          View learner app
        </button>
        <button
          onClick={async () => {
            await logout()
            navigate('/login')
          }}
          className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-ink/60 hover:bg-amber-100 hover:text-signal"
        >
          <LogOut size={17} />
          Log out
        </button>
      </aside>

      <main className="flex-1 overflow-y-auto px-10 py-8">{children}</main>
    </div>
  )
}
