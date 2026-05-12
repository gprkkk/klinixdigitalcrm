import { useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  Loader2,
  Receipt,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Appointment } from '../lib/types'
import { dateToYmd, formatCurrency, formatTimeStr } from '../lib/format'
import { useTheme } from '../contexts/ThemeContext'

interface CategoryRevenue {
  category: string
  revenue: number
}

const monthRange = () => {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  return { start: dateToYmd(start), end: dateToYmd(end) }
}

const getInitials = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('') || '?'

const WEEKDAY_LABELS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

function MiniCalendar({
  selected,
  onSelect,
  highlightedDays = new Set<string>(),
}: {
  selected: Date
  onSelect?: (d: Date) => void
  highlightedDays?: Set<string>
}) {
  const [cursor, setCursor] = useState(() => new Date(selected.getFullYear(), selected.getMonth(), 1))
  const monthLabel = cursor.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  const grid = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1)
    const offset = first.getDay()
    const last = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate()
    const cells: Array<{ date?: Date; key: string }> = []
    for (let i = 0; i < offset; i++) cells.push({ key: `e-${i}` })
    for (let d = 1; d <= last; d++) {
      const date = new Date(cursor.getFullYear(), cursor.getMonth(), d)
      cells.push({ date, key: `d-${d}` })
    }
    while (cells.length % 7 !== 0) cells.push({ key: `t-${cells.length}` })
    return cells
  }, [cursor])

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  const today = new Date()

  return (
    <div className="card p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-bold capitalize tracking-tight text-slate-900 dark:text-slate-100">
          {monthLabel}
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            className="icon-btn h-8 w-8"
            aria-label="Mês anterior"
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            className="icon-btn h-8 w-8"
            aria-label="Próximo mês"
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {WEEKDAY_LABELS.map((d, i) => (
          <div key={i} className="py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {grid.map((cell) =>
          cell.date ? (
            (() => {
              const date = cell.date
              const ymd = dateToYmd(date)
              const isSelected = isSameDay(date, selected)
              const isToday = isSameDay(date, today)
              const isHighlighted = highlightedDays.has(ymd)
              return (
                <button
                  key={cell.key}
                  type="button"
                  onClick={() => onSelect?.(date)}
                  className={`relative flex h-9 items-center justify-center rounded-full text-xs font-medium transition ${
                    isSelected
                      ? 'bg-gradient-cta text-white shadow-chic'
                      : isToday
                        ? 'bg-accent-50 text-accent-700 dark:bg-accent-500/20 dark:text-accent-200'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  {date.getDate()}
                  {isHighlighted && !isSelected && (
                    <span
                      aria-hidden
                      className="absolute bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-accent-500"
                    />
                  )}
                </button>
              )
            })()
          ) : (
            <div key={cell.key} className="h-9" />
          ),
        )}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date())

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      const { start, end } = monthRange()
      const [completed, today] = await Promise.all([
        supabase
          .from('appointments')
          .select('*, services(*, categories(*)), professionals(*), clients(*)')
          .eq('status', 'COMPLETED')
          .gte('appointment_date', start)
          .lt('appointment_date', end),
        supabase
          .from('appointments')
          .select('*, services(*, categories(*)), professionals(*), clients(*)')
          .gte('appointment_date', start)
          .lt('appointment_date', end)
          .order('appointment_date', { ascending: true })
          .order('start_time', { ascending: true }),
      ])
      if (completed.error) setError(completed.error.message)
      if (today.error) setError(today.error.message)
      setAppointments((completed.data as Appointment[] | null) ?? [])
      setTodayAppointments((today.data as Appointment[] | null) ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const stats = useMemo(() => {
    const total = appointments.reduce((sum, a) => sum + Number(a.price_charged ?? 0), 0)
    const count = appointments.length
    const ticket = count > 0 ? total / count : 0
    return { total, count, ticket }
  }, [appointments])

  const categoryData = useMemo<CategoryRevenue[]>(() => {
    const map = new Map<string, number>()
    for (const a of appointments) {
      const cat = a.services?.categories?.name ?? 'Sem categoria'
      const value = Number(a.price_charged ?? 0)
      map.set(cat, (map.get(cat) ?? 0) + value)
    }
    return Array.from(map.entries())
      .map(([category, revenue]) => ({ category, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
  }, [appointments])

  const highlightedDays = useMemo(() => {
    return new Set(todayAppointments.map((a) => a.appointment_date))
  }, [todayAppointments])

  const selectedYmd = dateToYmd(selectedDate)
  const dayAppointments = useMemo(
    () =>
      todayAppointments
        .filter((a) => a.appointment_date === selectedYmd)
        .sort((a, b) => a.start_time.localeCompare(b.start_time)),
    [todayAppointments, selectedYmd],
  )

  const upcomingAppointments = useMemo(
    () =>
      todayAppointments
        .filter((a) => a.appointment_date >= dateToYmd(new Date()))
        .slice(0, 5),
    [todayAppointments],
  )

  const monthLabel = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  const greeting =
    new Date().getHours() < 12
      ? 'Bom dia'
      : new Date().getHours() < 18
        ? 'Boa tarde'
        : 'Boa noite'

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px] xl:gap-8">
      <section className="min-w-0">
        <div className="mb-6 flex flex-col gap-4 md:mb-7 md:flex-row md:flex-wrap md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl dark:text-slate-100">
              {greeting}, Dra. Klinix
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Aqui está o resumo dos seus atendimentos em{' '}
              <span className="font-medium capitalize text-slate-700 dark:text-slate-300">{monthLabel}</span>.
            </p>
          </div>
          <Link to="/app/agenda" className="btn-primary w-full justify-center md:w-auto">
            <Sparkles size={16} /> Novo agendamento
          </Link>
        </div>

        {error && (
          <div className="mb-5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="card flex items-center justify-center px-6 py-20 text-slate-500 dark:text-slate-400">
            <Loader2 size={20} className="mr-2 animate-spin" /> Carregando dashboard...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
              <div className="card p-5 transition hover:-translate-y-0.5 md:p-6">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Faturamento
                  </div>
                  <div className="icon-pill icon-pill-blue">
                    <DollarSign size={20} />
                  </div>
                </div>
                <div className="mt-4 text-2xl font-bold tracking-tight text-slate-900 md:mt-5 md:text-3xl dark:text-slate-100">
                  {formatCurrency(stats.total)}
                </div>
                <div className="mt-1 flex items-center gap-1 text-xs font-medium text-emerald-600">
                  <TrendingUp size={12} />
                  Atendimentos concluídos no mês
                </div>
              </div>

              <div className="card p-5 transition hover:-translate-y-0.5 md:p-6">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Agendamentos
                  </div>
                  <div className="icon-pill icon-pill-pink">
                    <CalendarCheck size={20} />
                  </div>
                </div>
                <div className="mt-4 text-2xl font-bold tracking-tight text-slate-900 md:mt-5 md:text-3xl dark:text-slate-100">
                  {stats.count}
                </div>
                <div className="mt-1 text-xs font-medium text-slate-500">Concluídos neste mês</div>
              </div>

              <div className="card p-5 transition hover:-translate-y-0.5 md:p-6">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Ticket médio
                  </div>
                  <div className="icon-pill icon-pill-cyan">
                    <Receipt size={20} />
                  </div>
                </div>
                <div className="mt-4 text-2xl font-bold tracking-tight text-slate-900 md:mt-5 md:text-3xl dark:text-slate-100">
                  {formatCurrency(stats.ticket)}
                </div>
                <div className="mt-1 text-xs font-medium text-slate-500">Média por atendimento</div>
              </div>
            </div>

            <div className="card mt-6 p-5 md:p-7">
              <div className="mb-5 flex flex-wrap items-end justify-between gap-3 md:mb-6">
                <div>
                  <h3 className="text-lg font-bold tracking-tight text-slate-900 md:text-xl dark:text-slate-100">
                    Faturamento por categoria
                  </h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Receita acumulada de atendimentos concluídos
                  </p>
                </div>
                <div className="flex items-center gap-3 rounded-full bg-slate-50 px-4 py-2 dark:bg-slate-800/60">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    <span className="h-2.5 w-2.5 rounded-full bg-accent-500" />
                    Receita
                  </span>
                </div>
              </div>
              {categoryData.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 py-16 text-center text-sm text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                  Nenhum atendimento concluído neste mês para gerar o gráfico.
                </div>
              ) : (
                <div className="h-60 w-full md:h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryData} margin={{ top: 10, right: 16, left: -8, bottom: 5 }}>
                      <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f4477d" stopOpacity={0.95} />
                          <stop offset="100%" stopColor="#2563eb" stopOpacity={0.9} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={isDark ? '#1e293b' : '#eef2f7'}
                        vertical={false}
                      />
                      <XAxis
                        dataKey="category"
                        tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v: number) =>
                          v.toLocaleString('pt-BR', {
                            notation: 'compact',
                            style: 'currency',
                            currency: 'BRL',
                          })
                        }
                      />
                      <Tooltip
                        cursor={{ fill: isDark ? '#1e293b' : '#fff1f5' }}
                        contentStyle={{
                          borderRadius: 16,
                          border: 'none',
                          backgroundColor: isDark ? '#0f172a' : '#ffffff',
                          color: isDark ? '#e2e8f0' : '#0f172a',
                          fontSize: 12,
                          boxShadow: '0 10px 30px -12px rgba(15, 23, 42, 0.18)',
                        }}
                        formatter={(v: number) => formatCurrency(v)}
                        labelClassName="font-medium"
                      />
                      <Bar dataKey="revenue" fill="url(#revenueGradient)" radius={[12, 12, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="card mt-6 p-5 md:p-7">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold tracking-tight text-slate-900 md:text-xl dark:text-slate-100">
                    Próximos atendimentos
                  </h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Agendamentos a partir de hoje
                  </p>
                </div>
                <Link
                  to="/app/agenda"
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-300"
                >
                  Ver agenda →
                </Link>
              </div>
              {upcomingAppointments.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 py-12 text-center text-sm text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                  Nenhum atendimento agendado para os próximos dias.
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingAppointments.map((a, idx) => {
                    const pink = idx % 2 === 1
                    return (
                      <div
                        key={a.id}
                        className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4 transition hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800"
                      >
                        <div className={`avatar ${pink ? 'avatar-pink' : 'avatar-blue'} h-12 w-12`}>
                          {getInitials(a.clients?.full_name ?? 'KL')}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {a.clients?.full_name ?? '—'}
                          </div>
                          <div className="truncate text-xs text-slate-500 dark:text-slate-400">
                            {a.services?.name ?? 'Serviço'} · {a.professionals?.name ?? '—'}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                              pink
                                ? 'bg-accent-100 text-accent-700 dark:bg-accent-500/20 dark:text-accent-200'
                                : 'bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-200'
                            }`}
                          >
                            <Clock size={11} />
                            {formatTimeStr(a.start_time)}
                          </span>
                          <span className="text-[11px] text-slate-400">{a.appointment_date}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </section>

      <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
        <MiniCalendar
          selected={selectedDate}
          onSelect={setSelectedDate}
          highlightedDays={highlightedDays}
        />

        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Agenda do dia
              </h4>
              <p className="text-xs text-slate-500">
                {selectedDate.toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                })}
              </p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-accent-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-accent-700 dark:bg-accent-500/20 dark:text-accent-200">
              {dayAppointments.length} marcado{dayAppointments.length === 1 ? '' : 's'}
            </span>
          </div>
          {dayAppointments.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 px-4 py-6 text-center text-xs text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
              Sem agendamentos para este dia.
            </div>
          ) : (
            <ol className="space-y-3">
              {dayAppointments.slice(0, 6).map((a, idx) => {
                const variant = idx % 3
                const variantClass =
                  variant === 0
                    ? 'border-l-brand-500 bg-brand-50/50 dark:bg-brand-500/10'
                    : variant === 1
                      ? 'border-l-accent-500 bg-accent-50/50 dark:bg-accent-500/10'
                      : 'border-l-cyan-500 bg-cyan-50/50 dark:bg-cyan-500/10'
                return (
                  <li
                    key={a.id}
                    className={`rounded-r-2xl rounded-l border-l-4 px-3 py-2.5 ${variantClass}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {formatTimeStr(a.start_time)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider text-slate-400">
                        {formatTimeStr(a.end_time)}
                      </span>
                    </div>
                    <div className="mt-1 truncate text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {a.services?.name ?? 'Serviço'}
                    </div>
                    <div className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                      {a.clients?.full_name ?? '—'}
                    </div>
                  </li>
                )
              })}
            </ol>
          )}
        </div>

        <div className="card-soft p-5">
          <h4 className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Performance do mês
          </h4>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Comparativo geral da clínica
          </p>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Taxa de comparecimento
              </span>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                92%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Retenção
              </span>
              <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-bold text-brand-700">
                78%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Satisfação
              </span>
              <span className="rounded-full bg-accent-100 px-2.5 py-0.5 text-xs font-bold text-accent-700">
                4.8 / 5
              </span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}
