import { FormEvent, useEffect, useMemo, useState } from 'react'
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  MapPin,
  Phone,
  Plus,
  Trash2,
  User as UserIcon,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import {
  APPOINTMENT_STATUS_LABEL,
  APPOINTMENT_STATUS_STYLE,
  Appointment,
  AppointmentStatus,
  Client,
  Professional,
  ProfessionalSchedule,
  Service,
} from '../lib/types'
import {
  addMinutesToTime,
  dateToYmd,
  formatCurrency,
  formatTimeStr,
  timeStrToMinutes,
  toSqlTime,
  ymdToDate,
} from '../lib/format'
import Modal from '../components/Modal'

interface AppointmentFormState {
  client_id: string
  professional_id: string
  service_id: string
  appointment_date: string
  start_time: string
  status: AppointmentStatus
}

const emptyForm = (date?: string): AppointmentFormState => ({
  client_id: '',
  professional_id: '',
  service_id: '',
  appointment_date: date ?? dateToYmd(new Date()),
  start_time: '09:00',
  status: 'SCHEDULED',
})

const statuses: AppointmentStatus[] = ['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']

const WEEKDAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const HOURS = Array.from({ length: 12 }, (_, i) => i + 8) // 8h–19h

const startOfWeek = (date: Date): Date => {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - d.getDay())
  return d
}

const addDays = (date: Date, n: number): Date => {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

const getInitials = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('') || '?'

const eventColor = (idx: number) => {
  const palettes = [
    'bg-brand-100 text-brand-700 ring-brand-200 dark:bg-brand-500/20 dark:text-brand-100 dark:ring-brand-500/40',
    'bg-accent-100 text-accent-700 ring-accent-200 dark:bg-accent-500/20 dark:text-accent-100 dark:ring-accent-500/40',
    'bg-cyan-100 text-cyan-700 ring-cyan-200 dark:bg-cyan-500/20 dark:text-cyan-100 dark:ring-cyan-500/40',
    'bg-emerald-100 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-100 dark:ring-emerald-500/40',
    'bg-violet-100 text-violet-700 ring-violet-200 dark:bg-violet-500/20 dark:text-violet-100 dark:ring-violet-500/40',
  ]
  return palettes[idx % palettes.length]
}

export default function Agenda() {
  const [weekAnchor, setWeekAnchor] = useState<Date>(() => startOfWeek(new Date()))
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [schedules, setSchedules] = useState<ProfessionalSchedule[]>([])
  const [proFilter, setProFilter] = useState<string>('all')
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<AppointmentFormState>(emptyForm())
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekAnchor, i)),
    [weekAnchor],
  )

  const weekStartYmd = dateToYmd(weekDays[0])
  const weekEndYmd = dateToYmd(addDays(weekDays[6], 1))

  const loadAux = async () => {
    const [c, p, s, sch] = await Promise.all([
      supabase.from('clients').select('*').order('full_name'),
      supabase.from('professionals').select('*').order('name'),
      supabase.from('services').select('*, categories(*)').order('name'),
      supabase.from('professional_schedules').select('*'),
    ])
    setClients((c.data as Client[] | null) ?? [])
    setProfessionals((p.data as Professional[] | null) ?? [])
    setServices((s.data as Service[] | null) ?? [])
    setSchedules((sch.data as ProfessionalSchedule[] | null) ?? [])
  }

  const loadAppointments = async () => {
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('appointments')
      .select('*, clients(*), professionals(*), services(*, categories(*))')
      .gte('appointment_date', weekStartYmd)
      .lt('appointment_date', weekEndYmd)
      .order('appointment_date', { ascending: true })
      .order('start_time', { ascending: true })
    if (err) setError(err.message)
    setAppointments((data as Appointment[] | null) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    loadAux()
  }, [])

  useEffect(() => {
    loadAppointments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStartYmd])

  const filtered = useMemo(() => {
    if (proFilter === 'all') return appointments
    return appointments.filter((a) => a.professional_id === proFilter)
  }, [appointments, proFilter])

  const appointmentsByDay = useMemo(() => {
    const map = new Map<string, Appointment[]>()
    for (const a of filtered) {
      const list = map.get(a.appointment_date) ?? []
      list.push(a)
      map.set(a.appointment_date, list)
    }
    return map
  }, [filtered])

  const selectedAppointment = useMemo(() => {
    if (!selectedAppointmentId) return filtered[0] ?? null
    return filtered.find((a) => a.id === selectedAppointmentId) ?? filtered[0] ?? null
  }, [filtered, selectedAppointmentId])

  const upcoming = useMemo(
    () => filtered.filter((a) => a.id !== selectedAppointment?.id).slice(0, 4),
    [filtered, selectedAppointment],
  )

  const shiftWeek = (delta: number) => {
    setWeekAnchor(addDays(weekAnchor, delta * 7))
    setSelectedAppointmentId(null)
  }

  const goThisWeek = () => {
    setWeekAnchor(startOfWeek(new Date()))
    setSelectedAppointmentId(null)
  }

  const openCreate = (date?: Date) => {
    setForm(emptyForm(date ? dateToYmd(date) : dateToYmd(weekDays[0])))
    setFormError(null)
    setModalOpen(true)
  }

  const handleDelete = async (a: Appointment) => {
    if (!confirm('Excluir este agendamento?')) return
    const { error: err } = await supabase.from('appointments').delete().eq('id', a.id)
    if (err) {
      alert(`Erro ao excluir: ${err.message}`)
      return
    }
    await loadAppointments()
  }

  const handleStatusChange = async (a: Appointment, status: AppointmentStatus) => {
    const { error: err } = await supabase.from('appointments').update({ status }).eq('id', a.id)
    if (err) {
      alert(`Erro ao atualizar status: ${err.message}`)
      return
    }
    await loadAppointments()
  }

  const validateAgainstSchedule = (
    professionalId: string,
    appointmentDateStr: string,
    startStr: string,
    endStr: string,
  ): string | null => {
    const dow = ymdToDate(appointmentDateStr).getDay()
    const proSchedules = schedules.filter(
      (s) => s.professional_id === professionalId && s.day_of_week === dow,
    )
    if (proSchedules.length === 0) {
      return 'Profissional não possui grade configurada para este dia da semana.'
    }
    const working = proSchedules.find((s) => s.is_working)
    if (!working) return 'Profissional não atende neste dia da semana.'

    const startMin = timeStrToMinutes(startStr)
    const endMin = timeStrToMinutes(endStr)
    const winStart = timeStrToMinutes(working.start_time)
    const winEnd = timeStrToMinutes(working.end_time)
    if (endMin <= startMin) {
      return 'O serviço cruza a meia-noite. Escolha um horário anterior.'
    }
    if (startMin < winStart || endMin > winEnd) {
      return `Horário fora da grade do profissional (${formatTimeStr(working.start_time)} - ${formatTimeStr(working.end_time)}).`
    }
    return null
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormError(null)
    setSaving(true)
    try {
      const service = services.find((s) => s.id === form.service_id)
      if (!service) throw new Error('Selecione um serviço.')
      if (!form.client_id) throw new Error('Selecione um cliente.')
      if (!form.professional_id) throw new Error('Selecione um profissional.')

      const startStr = form.start_time
      const endStr = addMinutesToTime(startStr, service.duration_minutes ?? 0)

      const validationError = validateAgainstSchedule(
        form.professional_id,
        form.appointment_date,
        startStr,
        endStr,
      )
      if (validationError) throw new Error(validationError)

      const payload = {
        client_id: form.client_id,
        professional_id: form.professional_id,
        service_id: form.service_id,
        appointment_date: form.appointment_date,
        start_time: toSqlTime(startStr),
        end_time: toSqlTime(endStr),
        status: form.status,
        price_charged: service.price ?? 0,
      }

      const { error: err } = await supabase.from('appointments').insert(payload)
      if (err) throw err

      setModalOpen(false)
      await loadAppointments()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar.'
      setFormError(message)
    } finally {
      setSaving(false)
    }
  }

  const isToday = (d: Date) => {
    const today = new Date()
    return (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    )
  }

  const weekRangeLabel = `${weekDays[0].toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} – ${weekDays[6].toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}`

  return (
    <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
      <section className="min-w-0">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Agenda
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Visualize e crie agendamentos respeitando a grade dos profissionais
            </p>
          </div>
          <button type="button" className="btn-primary" onClick={() => openCreate()}>
            <Plus size={16} /> Novo agendamento
          </button>
        </div>

        <div className="card mb-6 flex flex-wrap items-center gap-3 p-4">
          <button
            type="button"
            className="icon-btn"
            onClick={() => shiftWeek(-1)}
            aria-label="Semana anterior"
          >
            <ChevronLeft size={16} />
          </button>
          <button type="button" className="btn-secondary" onClick={goThisWeek}>
            Esta semana
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={() => shiftWeek(1)}
            aria-label="Próxima semana"
          >
            <ChevronRight size={16} />
          </button>
          <div className="text-sm font-bold capitalize tracking-tight text-slate-900 dark:text-slate-100">
            {weekRangeLabel}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden text-xs font-semibold uppercase tracking-wider text-slate-500 sm:inline">
              Profissional
            </span>
            <select
              className="input max-w-[220px] !py-2.5"
              value={proFilter}
              onChange={(e) => setProFilter(e.target.value)}
            >
              <option value="all">Todos</option>
              {professionals.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="card overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center px-6 py-24 text-slate-500 dark:text-slate-400">
              <Loader2 size={20} className="mr-2 animate-spin" /> Carregando agenda...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[820px]">
                <div className="grid grid-cols-[64px_repeat(7,minmax(0,1fr))] border-b border-slate-100 dark:border-slate-800">
                  <div />
                  {weekDays.map((d, i) => {
                    const today = isToday(d)
                    return (
                      <button
                        type="button"
                        key={i}
                        onClick={() => openCreate(d)}
                        className={`flex flex-col items-center gap-1 px-2 py-4 text-center transition hover:bg-slate-50 dark:hover:bg-slate-800 ${
                          today ? 'bg-brand-50/60 dark:bg-brand-500/10' : ''
                        }`}
                      >
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          {WEEKDAY_LABELS[d.getDay()]}
                        </span>
                        <span
                          className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                            today
                              ? 'bg-gradient-cta text-white shadow-chic'
                              : 'text-slate-700 dark:text-slate-200'
                          }`}
                        >
                          {d.getDate()}
                        </span>
                      </button>
                    )
                  })}
                </div>
                <div className="grid grid-cols-[64px_repeat(7,minmax(0,1fr))]">
                  {HOURS.map((h, hourIdx) => (
                    <div key={`row-${h}`} className="contents">
                      <div className="border-t border-slate-100 px-2 py-3 text-[10px] font-semibold text-slate-400 dark:border-slate-800">
                        {String(h).padStart(2, '0')}:00
                      </div>
                      {weekDays.map((d, dayIdx) => {
                        const dayList = appointmentsByDay.get(dateToYmd(d)) ?? []
                        const slotEvents = dayList.filter((a) => {
                          const startH = parseInt(a.start_time.slice(0, 2), 10)
                          return startH === h
                        })
                        return (
                          <div
                            key={`cell-${h}-${dayIdx}`}
                            className="relative min-h-[60px] border-t border-l border-slate-100 px-1 py-1 dark:border-slate-800"
                          >
                            {slotEvents.map((a) => {
                              const idx = filtered.indexOf(a)
                              return (
                                <button
                                  type="button"
                                  key={a.id}
                                  onClick={() => setSelectedAppointmentId(a.id)}
                                  className={`mb-1 w-full rounded-2xl px-2.5 py-1.5 text-left text-[11px] font-semibold ring-1 transition hover:scale-[1.02] ${eventColor(
                                    idx,
                                  )} ${
                                    selectedAppointment?.id === a.id
                                      ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-900'
                                      : ''
                                  }`}
                                >
                                  <div className="flex items-center justify-between gap-1">
                                    <span>{formatTimeStr(a.start_time)}</span>
                                    <span className="opacity-70">·</span>
                                    <span className="truncate">
                                      {a.services?.name ?? 'Serviço'}
                                    </span>
                                  </div>
                                  <div className="mt-0.5 truncate text-[10px] font-medium opacity-80">
                                    {a.clients?.full_name ?? '—'}
                                  </div>
                                </button>
                              )
                            })}
                            {slotEvents.length === 0 && hourIdx === 0 && (
                              <span className="pointer-events-none absolute inset-0 hidden items-center justify-center text-[10px] text-slate-300 group-hover:flex" />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
        {selectedAppointment ? (
          <div className="card overflow-hidden">
            <div className="relative bg-gradient-to-br from-brand-500 to-accent-500 px-6 py-7 text-white">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur">
                Em andamento
              </span>
              <div className="mt-3 text-lg font-bold leading-tight">
                {selectedAppointment.services?.name ?? 'Serviço'}
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-sm font-medium text-white/80">
                <Clock size={13} />
                {formatTimeStr(selectedAppointment.start_time)} —{' '}
                {formatTimeStr(selectedAppointment.end_time)}
              </div>
            </div>
            <div className="space-y-5 px-6 py-6">
              <div className="flex items-center gap-3">
                <div className="avatar avatar-blue h-12 w-12">
                  {getInitials(selectedAppointment.clients?.full_name ?? 'KL')}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Paciente
                  </div>
                  <div className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
                    {selectedAppointment.clients?.full_name ?? '—'}
                  </div>
                </div>
                <button type="button" className="icon-btn-blue ml-auto" aria-label="Ligar">
                  <Phone size={14} />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <div className="avatar avatar-pink h-12 w-12">
                  {getInitials(selectedAppointment.professionals?.name ?? 'KL')}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Profissional
                  </div>
                  <div className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
                    {selectedAppointment.professionals?.name ?? '—'}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-slate-50 px-3 py-2.5 dark:bg-slate-800/60">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Data
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {ymdToDate(selectedAppointment.appointment_date).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                    })}
                  </div>
                </div>
                <div className="rounded-2xl bg-slate-50 px-3 py-2.5 dark:bg-slate-800/60">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Valor
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {formatCurrency(selectedAppointment.price_charged)}
                  </div>
                </div>
              </div>
              <div>
                <label className="label">Status</label>
                <select
                  className={`badge ${APPOINTMENT_STATUS_STYLE[selectedAppointment.status]} w-full cursor-pointer border-0 px-3 py-2`}
                  value={selectedAppointment.status}
                  onChange={(e) =>
                    handleStatusChange(selectedAppointment, e.target.value as AppointmentStatus)
                  }
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {APPOINTMENT_STATUS_LABEL[s]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button type="button" className="btn-secondary flex-1 !px-3">
                  <MapPin size={14} /> Local
                </button>
                <button
                  type="button"
                  className="icon-btn-danger"
                  aria-label="Excluir agendamento"
                  onClick={() => handleDelete(selectedAppointment)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="card flex flex-col items-center gap-3 px-6 py-12 text-center">
            <CalendarDays size={32} className="text-slate-300" />
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Nenhum atendimento selecionado
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Clique em um bloco da agenda para visualizar detalhes.
            </p>
          </div>
        )}

        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Próximos da semana
            </h4>
            <span className="text-xs font-semibold text-slate-400">{upcoming.length}</span>
          </div>
          {upcoming.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 px-4 py-6 text-center text-xs text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
              Sem outros agendamentos nesta semana.
            </div>
          ) : (
            <ul className="space-y-3">
              {upcoming.map((a, idx) => {
                const pink = idx % 2 === 1
                return (
                  <li key={a.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedAppointmentId(a.id)}
                      className="flex w-full items-center gap-3 rounded-2xl bg-slate-50 p-3 text-left transition hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800"
                    >
                      <div className={`avatar ${pink ? 'avatar-pink' : 'avatar-blue'} h-10 w-10`}>
                        {getInitials(a.clients?.full_name ?? 'KL')}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs font-semibold text-slate-900 dark:text-slate-100">
                          {a.clients?.full_name ?? '—'}
                        </div>
                        <div className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                          {a.services?.name ?? 'Serviço'}
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-slate-700 shadow-card dark:bg-slate-900 dark:text-slate-200">
                          <Clock size={10} />
                          {formatTimeStr(a.start_time)}
                        </span>
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </aside>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Novo agendamento" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="label">Paciente</label>
              <select
                required
                className="input"
                value={form.client_id}
                onChange={(e) => setForm({ ...form, client_id: e.target.value })}
              >
                <option value="">Selecione um paciente</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Profissional</label>
              <select
                required
                className="input"
                value={form.professional_id}
                onChange={(e) => setForm({ ...form, professional_id: e.target.value })}
              >
                <option value="">Selecione um profissional</option>
                {professionals.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="label">Serviço</label>
              <select
                required
                className="input"
                value={form.service_id}
                onChange={(e) => setForm({ ...form, service_id: e.target.value })}
              >
                <option value="">Selecione um serviço</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} — {s.duration_minutes} min — {formatCurrency(s.price)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Data</label>
              <input
                type="date"
                required
                className="input"
                value={form.appointment_date}
                onChange={(e) => setForm({ ...form, appointment_date: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Horário</label>
              <input
                type="time"
                required
                className="input"
                value={form.start_time}
                onChange={(e) => setForm({ ...form, start_time: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Status</label>
              <select
                className="input"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as AppointmentStatus })}
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {APPOINTMENT_STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {formError && (
            <div className="rounded-2xl bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
              {formError}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving && <Loader2 size={16} className="animate-spin" />}
              <UserIcon size={14} />
              Agendar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
