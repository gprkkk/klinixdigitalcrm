import { FormEvent, useEffect, useMemo, useState } from 'react'
import {
  ArrowUpRight,
  Cake,
  Loader2,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Client } from '../lib/types'
import { formatDate } from '../lib/format'
import Modal from '../components/Modal'
import EmptyState from '../components/EmptyState'

const getInitials = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('') || '?'

interface ClientFormState {
  id?: string
  full_name: string
  whatsapp: string
  birth_date: string
}

const emptyForm: ClientFormState = {
  full_name: '',
  whatsapp: '',
  birth_date: '',
}

type SegmentFilter = 'all' | 'withBirthday' | 'recent'

const AVATAR_PALETTES = ['avatar-blue', 'avatar-pink', 'avatar-cyan', 'avatar-mint', 'avatar-lavender']

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [segment, setSegment] = useState<SegmentFilter>('all')

  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<ClientFormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const loadData = async () => {
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('clients')
      .select('*')
      .order('full_name', { ascending: true })
    if (err) setError(err.message)
    setClients((data as Client[] | null) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return clients.filter((c) => {
      if (segment === 'withBirthday' && !c.birth_date) return false
      if (segment === 'recent' && !c.created_at) return false
      if (segment === 'recent' && c.created_at) {
        const created = new Date(c.created_at)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 3600 * 1000)
        if (created < thirtyDaysAgo) return false
      }
      if (!q) return true
      return (
        c.full_name.toLowerCase().includes(q) ||
        (c.whatsapp ?? '').toLowerCase().includes(q)
      )
    })
  }, [clients, search, segment])

  const openCreate = () => {
    setForm(emptyForm)
    setFormError(null)
    setModalOpen(true)
  }

  const openEdit = (c: Client) => {
    setForm({
      id: c.id,
      full_name: c.full_name,
      whatsapp: c.whatsapp ?? '',
      birth_date: c.birth_date ?? '',
    })
    setFormError(null)
    setModalOpen(true)
  }

  const handleDelete = async (c: Client) => {
    if (!confirm(`Excluir o cliente "${c.full_name}"?`)) return
    const { error: err } = await supabase.from('clients').delete().eq('id', c.id)
    if (err) {
      alert(`Erro ao excluir: ${err.message}`)
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
        full_name: form.full_name.trim(),
        whatsapp: form.whatsapp.trim() || null,
        birth_date: form.birth_date || null,
      }
      if (form.id) {
        const { error: err } = await supabase.from('clients').update(payload).eq('id', form.id)
        if (err) throw err
      } else {
        const { error: err } = await supabase.from('clients').insert(payload)
        if (err) throw err
      }
      setModalOpen(false)
      await loadData()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar.'
      setFormError(message)
    } finally {
      setSaving(false)
    }
  }

  const filters: { value: SegmentFilter; label: string }[] = [
    { value: 'all', label: 'Todos pacientes' },
    { value: 'withBirthday', label: 'Aniversariantes' },
    { value: 'recent', label: 'Novos (30 dias)' },
  ]

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 md:mb-7 md:flex-row md:flex-wrap md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl dark:text-slate-100">
            Pacientes
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Gerencie sua base de pacientes, fichas e contatos
          </p>
        </div>
        <button
          type="button"
          className="btn-primary w-full justify-center md:w-auto"
          onClick={openCreate}
        >
          <Plus size={16} /> Novo paciente
        </button>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou WhatsApp"
            className="input pl-11"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            type="button"
            key={f.value}
            onClick={() => setSegment(f.value)}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              segment === f.value
                ? 'bg-gradient-cta text-white shadow-chic'
                : 'bg-white text-slate-600 shadow-card hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {f.label}
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
          <Loader2 size={20} className="mr-2 animate-spin" /> Carregando pacientes...
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Users size={32} />}
          title="Nenhum paciente encontrado"
          description="Cadastre seus pacientes para gerenciar fichas e histórico."
          action={
            <button type="button" className="btn-primary" onClick={openCreate}>
              <Plus size={16} /> Novo paciente
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 xl:grid-cols-3">
          {filtered.map((c, idx) => {
            const palette = AVATAR_PALETTES[idx % AVATAR_PALETTES.length]
            return (
              <div
                key={c.id}
                className="card flex flex-col gap-5 p-6 transition hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-4">
                  <div className={`avatar ${palette} h-14 w-14`}>{getInitials(c.full_name)}</div>
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/app/clientes/${c.id}`}
                      className="block truncate text-base font-bold tracking-tight text-slate-900 hover:text-brand-700 dark:text-slate-100 dark:hover:text-brand-300"
                    >
                      {c.full_name}
                    </Link>
                    <div className="mt-0.5 truncate text-[11px] font-medium uppercase tracking-wider text-slate-400">
                      ID #{c.id.slice(0, 6).toUpperCase()}
                    </div>
                  </div>
                  {c.birth_date && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-accent-100 px-2.5 py-1 text-[10px] font-bold text-accent-700 dark:bg-accent-500/20 dark:text-accent-200">
                      <Cake size={11} />
                      {formatDate(c.birth_date)}
                    </span>
                  )}
                </div>

                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/40">
                  <div className="flex items-center gap-3">
                    <div className="icon-btn-blue h-9 w-9">
                      <Phone size={13} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        WhatsApp
                      </div>
                      <div className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {c.whatsapp || '—'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-auto flex items-center justify-between gap-2">
                  <Link
                    to={`/app/clientes/${c.id}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    Ver ficha <ArrowUpRight size={12} />
                  </Link>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="icon-btn"
                      aria-label="Editar paciente"
                      onClick={() => openEdit(c)}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      className="icon-btn-danger"
                      aria-label="Excluir paciente"
                      onClick={() => handleDelete(c)}
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
        title={form.id ? 'Editar paciente' : 'Novo paciente'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Nome</label>
            <input
              required
              className="input"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              placeholder="Nome completo"
            />
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="label">WhatsApp</label>
              <input
                className="input"
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                placeholder="(11) 99999-9999"
              />
            </div>
            <div>
              <label className="label">Data de nascimento</label>
              <input
                type="date"
                className="input"
                value={form.birth_date}
                onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
              />
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
