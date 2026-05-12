import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Calendar,
  Users,
  UserCog,
  Sparkles,
  LogOut,
  Stethoscope,
  Sun,
  Moon,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'

const navItems = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/app/agenda', label: 'Agenda', icon: Calendar },
  { to: '/app/clientes', label: 'Clientes', icon: Users },
  { to: '/app/profissionais', label: 'Profissionais', icon: UserCog },
  { to: '/app/servicos', label: 'Serviços', icon: Sparkles },
]

export default function Layout() {
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  const isDark = theme === 'dark'

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950">
      <aside className="flex w-64 flex-col border-r border-slate-200/70 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-cta text-white shadow-glow">
            <Stethoscope size={20} />
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Klinix
            </div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">.digital</div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-5">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 shadow-sm dark:bg-brand-500/15 dark:text-brand-200'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      aria-hidden
                      className={`absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full transition-all ${
                        isActive ? 'bg-gradient-pink opacity-100' : 'opacity-0'
                      }`}
                    />
                    <Icon size={18} />
                    {item.label}
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>

        <div className="border-t border-slate-100 p-4 space-y-2 dark:border-slate-800">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
            className="flex w-full items-center justify-between rounded-2xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <span className="flex items-center gap-2">
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
              {isDark ? 'Modo claro' : 'Modo escuro'}
            </span>
            <span
              className={`inline-flex h-5 w-9 items-center rounded-full p-0.5 transition ${
                isDark ? 'bg-gradient-cta' : 'bg-slate-200'
              }`}
            >
              <span
                className={`block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                  isDark ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </span>
          </button>
          <div className="truncate px-3 text-xs text-slate-500 dark:text-slate-400">{user?.email}</div>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-8 py-10">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
