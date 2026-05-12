import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Cake, Loader2, Pencil, Phone, Plus, Search, Trash2, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Client } from '../lib/types'
import { formatDate } from '../lib/format'
import PageHeader from '../components/PageHeader'
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

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

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
    if (!q) return clients
    return clients.filter(
      (c) =>
        c.full_name.toLowerCase().includes(q) ||
        (c.whatsapp ?? '').toLowerCase().includes(q),
    )
  }, [clients, search])

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

  return (
    <>
      <PageHeader
        title="Clientes"
        description="Gerencie sua base de clientes e suas fichas clínicas."
        actions={
          <button type="button" className="btn-primary" onClick={openCreate}>
            <Plus size={16} /> Novo cliente
          </button>
        }
      />

      <div className="mb-4 flex items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por nome ou WhatsApp"
            className="input pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{error}</div>}

      {loading ? (
        <div className="card flex items-center justify-center px-6 py-16 text-slate-500 dark:text-slate-400">
          <Loader2 size={20} className="mr-2 animate-spin" /> Carregando clientes...
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Users size={32} />}
          title="Nenhum cliente encontrado"
          description="Cadastre seus clientes para gerenciar fichas clínicas e histórico."
          action={
            <button type="button" className="btn-primary" onClick={openCreate}>
              <Plus size={16} /> Novo cliente
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c, idx) => {
            const usePink = idx % 2 === 1
            return (
              <div
                key={c.id}
                className="card flex flex-col gap-5 p-6 transition hover:-translate-y-0.5 hover:shadow-glow"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold tracking-tight ${
                      usePink
                        ? 'bg-accent-50 text-accent-700 dark:bg-accent-500/15 dark:text-accent-200'
                        : 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200'
                    }`}
                  >
                    {getInitials(c.full_name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/app/clientes/${c.id}`}
                      className="block truncate text-base font-semibold tracking-tight text-slate-900 hover:text-brand-700 dark:text-slate-100 dark:hover:text-brand-300"
                    >
                      {c.full_name}
                    </Link>
                    <div className="mt-1 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <Phone size={14} className="text-brand-500" />
                      <span className="truncate">{c.whatsapp || '—'}</span>
                    </div>
                  </div>
                  {c.birth_date && (
                    <span className="badge bg-accent-50 text-accent-700 dark:bg-accent-500/15 dark:text-accent-300">
                      <Cake size={12} className="mr-1" />
                      {formatDate(c.birth_date)}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <Link
                    to={`/app/clientes/${c.id}`}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    Ver ficha
                  </Link>
                  <button
                    type="button"
                    className="btn-secondary !px-4 !py-2 text-xs"
                    onClick={() => openEdit(c)}
                  >
                    <Pencil size={14} /> Editar
                  </button>
                  <button
                    type="button"
                    className="btn-danger !px-3 !py-2"
                    onClick={() => handleDelete(c)}
                    aria-label="Excluir cliente"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={form.id ? 'Editar cliente' : 'Novo cliente'}
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
