import { FormEvent, useEffect, useMemo, useState } from 'react'
import {
  Loader2,
  Mail,
  Pencil,
  Phone,
  Plus,
  Search,
  Star,
  Stethoscope,
  Trash2,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { DAYS_OF_WEEK, Professional, ProfessionalSchedule } from '../lib/types'
import Modal from '../components/Modal'
import EmptyState from '../components/EmptyState'

interface ScheduleRow {
  day_of_week: number
  start_time: string
  end_time: string
  is_working: boolean
}

interface ProfessionalFormState {
  id?: string
  name: string
  is_active: boolean
  schedules: ScheduleRow[]
}

const defaultSchedules = (): ScheduleRow[] =>
  DAYS_OF_WEEK.map((d) => ({
    day_of_week: d.value,
    start_time: '09:00',
    end_time: '18:00',
    is_working: d.value !== 6,
  }))

const emptyForm = (): ProfessionalFormState => ({
  name: '',
  is_active: true,
  schedules: defaultSchedules(),
})

const normalizeTime = (t: string | null | undefined): string => {
  if (!t) return ''
  const parts = t.split(':')
  return `${parts[0] ?? '00'}:${parts[1] ?? '00'}`
}

const getInitials = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('') || '?'

const SPECIALTIES = [
  'Dermatologia',
  'Estética facial',
  'Pós-operatório',
  'Massoterapia',
  'Procedimentos a laser',
  'Harmonização',
] as const

const fakeSpecialty = (id: string) => {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  return SPECIALTIES[hash % SPECIALTIES.length]
}

const fakeRating = (id: string) => {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 17 + id.charCodeAt(i)) >>> 0
  return 4.5 + ((hash % 10) / 20)
}

const Stars = ({ rating }: { rating: number }) => {
  const rounded = Math.round(rating)
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={11}
          className={i < rounded ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-700'}
        />
      ))}
    </span>
  )
}

export default function Professionals() {
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [schedules, setSchedules] = useState<Record<string, ProfessionalSchedule[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('all')

  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<ProfessionalFormState>(emptyForm())
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const loadData = async () => {
    setLoading(true)
    setError(null)
    const [{ data: pros, error: proErr }, { data: scheds, error: schedErr }] = await Promise.all([
      supabase.from('professionals').select('*').order('name', { ascending: true }),
      supabase.from('professional_schedules').select('*'),
    ])
    if (proErr) setError(proErr.message)
    if (schedErr) setError(schedErr.message)
    setProfessionals((pros as Professional[] | null) ?? [])
    const map: Record<string, ProfessionalSchedule[]> = {}
    for (const s of (scheds as ProfessionalSchedule[] | null) ?? []) {
      if (!map[s.professional_id]) map[s.professional_id] = []
      map[s.professional_id].push(s)
    }
    setSchedules(map)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return professionals.filter((p) => {
      if (specialtyFilter !== 'all' && fakeSpecialty(p.id) !== specialtyFilter) return false
      if (!q) return true
      return p.name.toLowerCase().includes(q)
    })
  }, [professionals, search, specialtyFilter])

  const openCreate = () => {
    setForm(emptyForm())
    setFormError(null)
    setModalOpen(true)
  }

  const openEdit = (pro: Professional) => {
    const existing = schedules[pro.id] ?? []
    const baseSchedules = defaultSchedules().map((d) => {
      const found = existing.find((s) => s.day_of_week === d.day_of_week)
      if (!found) return d
      return {
        day_of_week: d.day_of_week,
        start_time: normalizeTime(found.start_time),
        end_time: normalizeTime(found.end_time),
        is_working: !!found.is_working,
      }
    })
    setForm({
      id: pro.id,
      name: pro.name,
      is_active: pro.is_active ?? true,
      schedules: baseSchedules,
    })
    setFormError(null)
    setModalOpen(true)
  }

  const handleDelete = async (pro: Professional) => {
    if (!confirm(`Excluir o profissional "${pro.name}"? Os horários serão removidos.`)) return
    const { error: schedErr } = await supabase
      .from('professional_schedules')
      .delete()
      .eq('professional_id', pro.id)
    if (schedErr) {
      alert(`Erro ao excluir horários: ${schedErr.message}`)
      return
    }
    const { error: err } = await supabase.from('professionals').delete().eq('id', pro.id)
    if (err) {
      alert(`Erro ao excluir profissional: ${err.message}`)
      return
    }
    await loadData()
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormError(null)
    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        is_active: form.is_active,
      }

      let professionalId = form.id
      if (form.id) {
        const { error: err } = await supabase.from('professionals').update(payload).eq('id', form.id)
        if (err) throw err
      } else {
        const { data: created, error: err } = await supabase
          .from('professionals')
          .insert(payload)
          .select('*')
          .single()
        if (err) throw err
        professionalId = (created as Professional).id
      }

      if (!professionalId) throw new Error('ID do profissional inválido')

      const { error: delErr } = await supabase
        .from('professional_schedules')
        .delete()
        .eq('professional_id', professionalId)
      if (delErr) throw delErr

      const rows = form.schedules.map((s) => ({
        professional_id: professionalId,
        day_of_week: s.day_of_week,
        start_time: s.start_time,
        end_time: s.end_time,
        is_working: s.is_working,
      }))

      const { error: insErr } = await supabase.from('professional_schedules').insert(rows)
      if (insErr) throw insErr

      setModalOpen(false)
      await loadData()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar.'
      setFormError(message)
    } finally {
      setSaving(false)
    }
  }

  const summarizeSchedule = (proId: string): string => {
    const list = schedules[proId] ?? []
    const working = list.filter((s) => s.is_working)
    if (working.length === 0) return 'Sem horários ativos'
    return `${working.length} dias ativos`
  }

  return (
    <>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Profissionais
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Equipe da clínica com especialidades, grade de horários e contato rápido
          </p>
        </div>
        <button type="button" className="btn-primary" onClick={openCreate}>
          <Plus size={16} /> Novo profissional
        </button>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar profissional"
            className="input pl-11"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {(['all', ...SPECIALTIES] as const).map((cat) => (
          <button
            type="button"
            key={cat}
            onClick={() => setSpecialtyFilter(cat)}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              specialtyFilter === cat
                ? 'bg-gradient-cta text-white shadow-chic'
                : 'bg-white text-slate-600 shadow-card hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {cat === 'all' ? 'Todos especialistas' : cat}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="card flex items-center justify-center px-6 py-20 text-slate-500 dark:text-slate-400">
          <Loader2 size={20} className="mr-2 animate-spin" /> Carregando profissionais...
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Stethoscope size={32} />}
          title="Nenhum profissional cadastrado"
          description="Adicione profissionais para poder vinculá-los aos agendamentos."
          action={
            <button type="button" className="btn-primary" onClick={openCreate}>
              <Plus size={16} /> Novo profissional
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((pro, idx) => {
            const palette =
              idx % 3 === 0 ? 'avatar-blue' : idx % 3 === 1 ? 'avatar-pink' : 'avatar-cyan'
            const initials = getInitials(pro.name)
            const specialty = fakeSpecialty(pro.id)
            const rating = fakeRating(pro.id)
            return (
              <div
                key={pro.id}
                className="card flex flex-col gap-5 p-6 transition hover:-translate-y-0.5"
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`avatar ${palette} h-20 w-20 text-2xl`}>{initials}</div>
                  <h3 className="mt-4 text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
                    {pro.name}
                  </h3>
                  <span className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-slate-400">
                    ID #{pro.id.slice(0, 6).toUpperCase()}
                  </span>
                  <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-accent-50 px-3 py-1 text-xs font-semibold text-accent-700 dark:bg-accent-500/15 dark:text-accent-200">
                    {specialty}
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Stars rating={rating} />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      {rating.toFixed(1)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-slate-50 px-3 py-2.5 text-center dark:bg-slate-800/60">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Status
                    </div>
                    <div
                      className={`mt-0.5 text-xs font-bold ${
                        pro.is_active === false
                          ? 'text-slate-500'
                          : 'text-emerald-600 dark:text-emerald-300'
                      }`}
                    >
                      {pro.is_active === false ? 'Inativo' : 'Ativo'}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-3 py-2.5 text-center dark:bg-slate-800/60">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Grade
                    </div>
                    <div className="mt-0.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                      {summarizeSchedule(pro.id)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="icon-btn-blue"
                      aria-label="Telefone"
                    >
                      <Phone size={14} />
                    </button>
                    <button
                      type="button"
                      className="icon-btn-pink"
                      aria-label="Email"
                    >
                      <Mail size={14} />
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="icon-btn"
                      aria-label="Editar"
                      onClick={() => openEdit(pro)}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      className="icon-btn-danger"
                      aria-label="Excluir"
                      onClick={() => handleDelete(pro)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={form.id ? 'Editar profissional' : 'Novo profissional'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="label">Nome</label>
              <input
                required
                className="input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nome completo"
              />
            </div>
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-800"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                />
                Profissional ativo
              </label>
            </div>
          </div>

          <div>
            <label className="label">Grade de horários (Segunda a Sábado)</label>
            <div className="space-y-2 rounded-2xl bg-slate-50 p-3 dark:bg-slate-900/40">
              {form.schedules.map((s, idx) => {
                const day = DAYS_OF_WEEK.find((d) => d.value === s.day_of_week)
                return (
                  <div
                    key={s.day_of_week}
                    className="grid grid-cols-12 items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-card dark:bg-slate-800"
                  >
                    <div className="col-span-3 text-sm font-medium text-slate-700 dark:text-slate-200">
                      {day?.label}
                    </div>
                    <div className="col-span-2 flex items-center gap-2">
                      <input
                        id={`active-${s.day_of_week}`}
                        type="checkbox"
                        checked={s.is_working}
                        onChange={(e) => {
                          const next = [...form.schedules]
                          next[idx] = { ...s, is_working: e.target.checked }
                          setForm({ ...form, schedules: next })
                        }}
                        className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-900"
                      />
                      <label
                        htmlFor={`active-${s.day_of_week}`}
                        className="text-sm text-slate-600 dark:text-slate-300"
                      >
                        {s.is_working ? 'Ativo' : 'Inativo'}
                      </label>
                    </div>
                    <div className="col-span-3">
                      <input
                        type="time"
                        className="input"
                        value={s.start_time}
                        disabled={!s.is_working}
                        onChange={(e) => {
                          const next = [...form.schedules]
                          next[idx] = { ...s, start_time: e.target.value }
                          setForm({ ...form, schedules: next })
                        }}
                      />
                    </div>
                    <div className="col-span-1 text-center text-xs text-slate-400 dark:text-slate-500">
                      até
                    </div>
                    <div className="col-span-3">
                      <input
                        type="time"
                        className="input"
                        value={s.end_time}
                        disabled={!s.is_working}
                        onChange={(e) => {
                          const next = [...form.schedules]
                          next[idx] = { ...s, end_time: e.target.value }
                          setForm({ ...form, schedules: next })
                        }}
                      />
                    </div>
                  </div>
                )
              })}
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
              Salvar
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}
