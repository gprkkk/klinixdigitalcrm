import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Stethoscope,
  Sparkles,
  Star,
  MessageCircle,
  LogOut,
  Sun,
  Moon,
  Search,
  Bell,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'

const navItems = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/app/agenda', label: 'Agenda', icon: CalendarDays },
  { to: '/app/clientes', label: 'Pacientes', icon: Users },
  { to: '/app/profissionais', label: 'Profissionais', icon: Stethoscope },
  { to: '/app/servicos', label: 'Tratamentos', icon: Sparkles },
  { to: '/app/avaliacoes', label: 'Avaliações', icon: Star },
  { to: '/app/mensagens', label: 'Mensagens', icon: MessageCircle },
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
  const userInitials = (user?.email ?? 'KL').slice(0, 2).toUpperCase()

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950">
      <aside className="flex w-64 shrink-0 flex-col bg-white px-5 py-7 dark:bg-slate-900">
        <div className="flex items-center gap-3 pb-7">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-cta text-white shadow-glow">
            <Sparkles size={20} />
          </div>
          <div>
            <div className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Klinix
            </div>
            <div className="-mt-1 text-xs font-medium tracking-wider text-slate-400 dark:text-slate-500">
              .digital
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-full px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? 'bg-gradient-cta text-white shadow-chic'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={18}
                      className={isActive ? '' : 'text-slate-400 group-hover:text-slate-700 dark:text-slate-500'}
                    />
                    <span className="flex-1">{item.label}</span>
                    {isActive && (
                      <span
                        aria-hidden
                        className="h-1.5 w-1.5 rounded-full bg-accent-300"
                      />
                    )}
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>

        <div className="space-y-2 pt-5">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
            className="flex w-full items-center justify-between rounded-full px-4 py-3 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <span className="flex items-center gap-3">
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
          <div className="mt-4 flex items-center gap-3 rounded-full bg-slate-50 px-3 py-2 dark:bg-slate-800">
            <div className="avatar avatar-blue h-9 w-9 text-xs">{userInitials}</div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-semibold text-slate-700 dark:text-slate-200">
                {user?.email ?? 'Admin'}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400">Online</div>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="icon-btn h-8 w-8"
              aria-label="Sair"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-30 flex flex-wrap items-center gap-4 bg-slate-50/85 px-10 py-6 backdrop-blur-xl dark:bg-slate-950/80">
          <div className="relative w-full max-w-md">
            <Search
              size={16}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Pesquisar pacientes, agendamentos..."
              className="w-full rounded-full border border-transparent bg-white py-3 pl-11 pr-4 text-sm text-slate-700 shadow-card placeholder:text-slate-400 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:bg-slate-900 dark:text-slate-200"
            />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button type="button" className="icon-btn" aria-label="Notificações">
              <Bell size={16} />
            </button>
            <div className="flex items-center gap-3 rounded-full bg-white px-3 py-1.5 shadow-card dark:bg-slate-900">
              <div className="avatar avatar-pink h-8 w-8 text-xs">{userInitials}</div>
              <div className="hidden flex-col leading-tight md:flex">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                  Dra. Klinix
                </span>
                <span className="text-[10px] uppercase tracking-wider text-slate-400">
                  Administradora
                </span>
              </div>
            </div>
          </div>
        </header>
        <div className="px-10 pb-10">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
