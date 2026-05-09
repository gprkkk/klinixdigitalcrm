import { FormEvent, useEffect, useMemo, useState } from 'react'
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
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
import PageHeader from '../components/PageHeader'
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

const dayLabel = (d: Date): string =>
  d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })

export default function Agenda() {
  const [date, setDate] = useState<string>(dateToYmd(new Date()))
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [schedules, setSchedules] = useState<ProfessionalSchedule[]>([])
  const [proFilter, setProFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<AppointmentFormState>(emptyForm())
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

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
      .eq('appointment_date', date)
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
  }, [date])

  const filtered = useMemo(() => {
    if (proFilter === 'all') return appointments
    return appointments.filter((a) => a.professional_id === proFilter)
  }, [appointments, proFilter])

  const shiftDay = (delta: number) => {
    const d = ymdToDate(date)
    d.setDate(d.getDate() + delta)
    setDate(dateToYmd(d))
  }
  const goToday = () => setDate(dateToYmd(new Date()))

  const openCreate = () => {
    setForm(emptyForm(date))
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
      if (form.appointment_date !== date) {
        setDate(form.appointment_date)
      } else {
        await loadAppointments()
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar.'
      setFormError(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Agenda"
        description="Visualize e crie agendamentos respeitando a grade dos profissionais."
        actions={
          <button type="button" className="btn-primary" onClick={openCreate}>
            <Plus size={16} /> Novo agendamento
          </button>
        }
      />

      <div className="card mb-4 flex flex-wrap items-center gap-3 p-4">
        <button type="button" className="btn-secondary" onClick={() => shiftDay(-1)} aria-label="Dia anterior">
          <ChevronLeft size={16} />
        </button>
        <button type="button" className="btn-secondary" onClick={goToday}>
          Hoje
        </button>
        <button type="button" className="btn-secondary" onClick={() => shiftDay(1)} aria-label="Próximo dia">
          <ChevronRight size={16} />
        </button>
        <input
          type="date"
          className="input max-w-[180px]"
          value={date}
          onChange={(e) => {
            if (!e.target.value) return
            setDate(e.target.value)
          }}
        />
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-slate-500 dark:text-slate-400">Profissional:</span>
          <select
            className="input max-w-[220px]"
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

      <div className="mb-4 text-sm font-medium capitalize text-slate-700 dark:text-slate-200">{dayLabel(ymdToDate(date))}</div>

      {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{error}</div>}

      {loading ? (
        <div className="card flex items-center justify-center px-6 py-16 text-slate-500 dark:text-slate-400">
          <Loader2 size={20} className="mr-2 animate-spin" /> Carregando agenda...
        </div>
      ) : filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center px-6 py-16 text-center">
          <CalendarDays size={32} className="mb-3 text-slate-400 dark:text-slate-500" />
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Nenhum agendamento neste dia</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Crie um novo agendamento ou navegue para outro dia.
          </p>
          <button type="button" className="btn-primary mt-4" onClick={openCreate}>
            <Plus size={16} /> Novo agendamento
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((a) => (
            <div key={a.id} className="card flex flex-wrap items-center gap-4 p-4">
              <div className="flex min-w-[100px] flex-col items-center justify-center rounded-xl bg-brand-50 px-4 py-2 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
                <Clock size={14} />
                <div className="mt-1 text-sm font-semibold">{formatTimeStr(a.start_time)}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{formatTimeStr(a.end_time)}</div>
              </div>
              <div className="min-w-[200px] flex-1">
                <div className="font-semibold text-slate-900 dark:text-slate-100">
                  {a.services?.name ?? 'Serviço removido'}
                </div>
                <div className="mt-1 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <UserIcon size={14} />
                  {a.clients?.full_name ?? '—'}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">com {a.professionals?.name ?? '—'}</div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {formatCurrency(a.price_charged)}
                </span>
                <select
                  className={`badge ${APPOINTMENT_STATUS_STYLE[a.status]} cursor-pointer border-0 bg-transparent`}
                  value={a.status}
                  onChange={(e) => handleStatusChange(a, e.target.value as AppointmentStatus)}
                  style={{ appearance: 'none' }}
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {APPOINTMENT_STATUS_LABEL[s]}
                    </option>
                  ))}
                </select>
              </div>
              <button type="button" className="btn-danger" onClick={() => handleDelete(a)}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Novo agendamento" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="label">Cliente</label>
              <select
                required
                className="input"
                value={form.client_id}
                onChange={(e) => setForm({ ...form, client_id: e.target.value })}
              >
                <option value="">Selecione um cliente</option>
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
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{formError}</div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving && <Loader2 size={16} className="animate-spin" />}
              Agendar
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}
