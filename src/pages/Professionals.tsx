import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Loader2, Pencil, Plus, Search, Trash2, UserCog } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { DAYS_OF_WEEK, Professional, ProfessionalSchedule } from '../lib/types'
import PageHeader from '../components/PageHeader'
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

export default function Professionals() {
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [schedules, setSchedules] = useState<Record<string, ProfessionalSchedule[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

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
    if (!q) return professionals
    return professionals.filter((p) => p.name.toLowerCase().includes(q))
  }, [professionals, search])

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
      <PageHeader
        title="Profissionais"
        description="Cadastre profissionais e configure suas grades de horários."
        actions={
          <button type="button" className="btn-primary" onClick={openCreate}>
            <Plus size={16} /> Novo profissional
          </button>
        }
      />

      <div className="mb-4 flex items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por nome"
            className="input pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{error}</div>}

      {loading ? (
        <div className="card flex items-center justify-center px-6 py-16 text-slate-500 dark:text-slate-400">
          <Loader2 size={20} className="mr-2 animate-spin" /> Carregando profissionais...
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<UserCog size={32} />}
          title="Nenhum profissional cadastrado"
          description="Adicione profissionais para poder vinculá-los aos agendamentos."
          action={
            <button type="button" className="btn-primary" onClick={openCreate}>
              <Plus size={16} /> Novo profissional
            </button>
          }
        />
      ) : (
        <div className="card overflow-hidden">
          <table className="table-base">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Status</th>
                <th>Horários</th>
                <th className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((pro) => (
                <tr key={pro.id}>
                  <td className="font-medium text-slate-900 dark:text-slate-100">{pro.name}</td>
                  <td>
                    {pro.is_active === false ? (
                      <span className="badge bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300">Inativo</span>
                    ) : (
                      <span className="badge bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">Ativo</span>
                    )}
                  </td>
                  <td>
                    <span className="badge bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">{summarizeSchedule(pro.id)}</span>
                  </td>
                  <td>
                    <div className="flex justify-end gap-2">
                      <button type="button" className="btn-secondary" onClick={() => openEdit(pro)}>
                        <Pencil size={14} /> Editar
                      </button>
                      <button type="button" className="btn-danger" onClick={() => handleDelete(pro)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
            <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/40">
              {form.schedules.map((s, idx) => {
                const day = DAYS_OF_WEEK.find((d) => d.value === s.day_of_week)
                return (
                  <div
                    key={s.day_of_week}
                    className="grid grid-cols-12 items-center gap-2 rounded-lg bg-white px-3 py-2 shadow-sm dark:bg-slate-800"
                  >
                    <div className="col-span-3 text-sm font-medium text-slate-700 dark:text-slate-200">{day?.label}</div>
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
                      <label htmlFor={`active-${s.day_of_week}`} className="text-sm text-slate-600 dark:text-slate-300">
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
                    <div className="col-span-1 text-center text-xs text-slate-400 dark:text-slate-500">até</div>
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
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{formError}</div>
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
