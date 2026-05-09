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
import { CalendarCheck, DollarSign, Loader2, Receipt } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Appointment } from '../lib/types'
import { dateToYmd, formatCurrency } from '../lib/format'
import PageHeader from '../components/PageHeader'
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

export default function Dashboard() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      const { start, end } = monthRange()
      const { data, error: err } = await supabase
        .from('appointments')
        .select('*, services(*, categories(*))')
        .eq('status', 'COMPLETED')
        .gte('appointment_date', start)
        .lt('appointment_date', end)
      if (err) setError(err.message)
      setAppointments((data as Appointment[] | null) ?? [])
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

  const monthLabel = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={`Resumo de atendimentos concluídos em ${monthLabel}.`}
      />

      {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{error}</div>}

      {loading ? (
        <div className="card flex items-center justify-center px-6 py-16 text-slate-500 dark:text-slate-400">
          <Loader2 size={20} className="mr-2 animate-spin" /> Carregando dashboard...
        </div>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="card p-5">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Faturamento total</div>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
                  <DollarSign size={18} />
                </div>
              </div>
              <div className="mt-3 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                {formatCurrency(stats.total)}
              </div>
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">Atendimentos concluídos no mês</div>
            </div>

            <div className="card p-5">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Agendamentos</div>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
                  <CalendarCheck size={18} />
                </div>
              </div>
              <div className="mt-3 text-2xl font-semibold text-slate-900 dark:text-slate-100">{stats.count}</div>
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">Concluídos no mês atual</div>
            </div>

            <div className="card p-5">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Ticket médio</div>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300">
                  <Receipt size={18} />
                </div>
              </div>
              <div className="mt-3 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                {formatCurrency(stats.ticket)}
              </div>
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">Média por atendimento concluído</div>
            </div>
          </div>

          <div className="card p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Faturamento por categoria
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Soma de atendimentos concluídos no mês.</p>
              </div>
            </div>
            {categoryData.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">
                Nenhum atendimento concluído no mês para gerar o gráfico.
              </div>
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} margin={{ top: 5, right: 8, left: -12, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
                    <XAxis
                      dataKey="category"
                      tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }}
                      tickLine={false}
                      axisLine={{ stroke: isDark ? '#334155' : '#e2e8f0' }}
                    />
                    <YAxis
                      tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }}
                      tickLine={false}
                      axisLine={{ stroke: isDark ? '#334155' : '#e2e8f0' }}
                      tickFormatter={(v: number) =>
                        v.toLocaleString('pt-BR', {
                          notation: 'compact',
                          style: 'currency',
                          currency: 'BRL',
                        })
                      }
                    />
                    <Tooltip
                      cursor={{ fill: isDark ? '#1e293b' : '#f1f5f9' }}
                      contentStyle={{
                        borderRadius: 12,
                        border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                        backgroundColor: isDark ? '#0f172a' : '#ffffff',
                        color: isDark ? '#e2e8f0' : '#0f172a',
                        fontSize: 12,
                      }}
                      formatter={(v: number) => formatCurrency(v)}
                      labelClassName="font-medium"
                    />
                    <Bar dataKey="revenue" fill={isDark ? '#60a5fa' : '#2563eb'} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </>
      )}
    </>
  )
}
