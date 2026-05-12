import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
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
  Menu,
  X,
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
  const location = useLocation()
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    setDrawerOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!drawerOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false)
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handler)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handler)
    }
  }, [drawerOpen])

  const handleSignOut = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  const isDark = theme === 'dark'
  const userInitials = (user?.email ?? 'KL').slice(0, 2).toUpperCase()

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between gap-3 pb-7">
        <div className="flex items-center gap-3">
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
        <button
          type="button"
          onClick={() => setDrawerOpen(false)}
          className="icon-btn h-9 w-9 md:hidden"
          aria-label="Fechar menu"
        >
          <X size={16} />
        </button>
      </div>

      <nav className="flex-1 space-y-1.5 overflow-y-auto">
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
    </>
  )

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col bg-white px-5 py-7 md:flex dark:bg-slate-900">
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-50 md:hidden ${drawerOpen ? '' : 'pointer-events-none'}`}
        aria-hidden={!drawerOpen}
      >
        <button
          type="button"
          tabIndex={drawerOpen ? 0 : -1}
          aria-label="Fechar menu"
          onClick={() => setDrawerOpen(false)}
          className={`absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity dark:bg-slate-950/70 ${
            drawerOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <aside
          className={`absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col bg-white px-5 py-6 shadow-pillow transition-transform duration-300 ease-out dark:bg-slate-900 ${
            drawerOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {sidebarContent}
        </aside>
      </div>

      <main className="flex-1 overflow-y-auto">
        {/* Mobile top bar */}
        <div className="sticky top-0 z-30 flex items-center justify-between gap-3 bg-white/90 px-4 py-3 shadow-card backdrop-blur-xl md:hidden dark:bg-slate-900/90">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Abrir menu"
            className="icon-btn h-10 w-10"
          >
            <Menu size={18} />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-cta text-white shadow-glow">
              <Sparkles size={14} />
            </div>
            <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Klinix<span className="text-slate-400">.digital</span>
            </span>
          </div>
          <button type="button" className="icon-btn h-10 w-10" aria-label="Notificações">
            <Bell size={16} />
          </button>
        </div>

        {/* Desktop header */}
        <header className="sticky top-0 z-20 hidden flex-wrap items-center gap-4 bg-slate-50/85 px-6 py-5 backdrop-blur-xl md:flex md:px-10 md:py-6 dark:bg-slate-950/80">
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
        <div className="px-4 pb-10 pt-5 md:px-10 md:pt-0">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
