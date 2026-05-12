import { FormEvent, useEffect, useMemo, useState } from 'react'
import {
  Clock as ClockIcon,
  Loader2,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Category, Service } from '../lib/types'
import { formatCurrency } from '../lib/format'
import Modal from '../components/Modal'
import EmptyState from '../components/EmptyState'

interface ServiceFormState {
  id?: string
  name: string
  category_id: string
  newCategoryName: string
  duration_minutes: string
  price: string
}

const emptyForm: ServiceFormState = {
  name: '',
  category_id: '',
  newCategoryName: '',
  duration_minutes: '60',
  price: '0',
}

const CARD_GRADIENTS = [
  'from-brand-400 to-cyan-400',
  'from-accent-400 to-pink-300',
  'from-violet-400 to-brand-400',
  'from-emerald-300 to-cyan-300',
  'from-amber-300 to-accent-400',
] as const

export default function Services() {
  const [services, setServices] = useState<Service[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<ServiceFormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const loadData = async () => {
    setLoading(true)
    setError(null)
    const [{ data: cats, error: catErr }, { data: svcs, error: svcErr }] = await Promise.all([
      supabase.from('categories').select('*').order('name', { ascending: true }),
      supabase.from('services').select('*, categories(*)').order('name', { ascending: true }),
    ])
    if (catErr) setError(catErr.message)
    if (svcErr) setError(svcErr.message)
    setCategories((cats as Category[] | null) ?? [])
    setServices((svcs as Service[] | null) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return services.filter((s) => {
      if (categoryFilter !== 'all' && s.category_id !== categoryFilter) return false
      if (!q) return true
      return (
        s.name.toLowerCase().includes(q) ||
        (s.categories?.name ?? '').toLowerCase().includes(q)
      )
    })
  }, [services, search, categoryFilter])

  const openCreate = () => {
    setForm(emptyForm)
    setFormError(null)
    setModalOpen(true)
  }

  const openEdit = (svc: Service) => {
    setForm({
      id: svc.id,
      name: svc.name,
      category_id: svc.category_id ?? '',
      newCategoryName: '',
      duration_minutes: String(svc.duration_minutes ?? ''),
      price: String(svc.price ?? ''),
    })
    setFormError(null)
    setModalOpen(true)
  }

  const handleDelete = async (svc: Service) => {
    if (!confirm(`Excluir o serviço "${svc.name}"?`)) return
    const { error: err } = await supabase.from('services').delete().eq('id', svc.id)
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
      let categoryId: string | null = form.category_id || null

      if (form.category_id === '__new__') {
        const newName = form.newCategoryName.trim()
        if (!newName) {
          setFormError('Informe o nome da nova categoria.')
          setSaving(false)
          return
        }
        const { data: created, error: catErr } = await supabase
          .from('categories')
          .insert({ name: newName })
          .select('*')
          .single()
        if (catErr) throw catErr
        categoryId = (created as Category).id
      }

      const payload = {
        name: form.name.trim(),
        category_id: categoryId,
        duration_minutes: Number(form.duration_minutes) || 0,
        price: Number(form.price) || 0,
      }

      if (form.id) {
        const { error: err } = await supabase.from('services').update(payload).eq('id', form.id)
        if (err) throw err
      } else {
        const { error: err } = await supabase.from('services').insert(payload)
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
      <div className="mb-6 flex flex-col gap-4 md:mb-7 md:flex-row md:flex-wrap md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl dark:text-slate-100">
            Tratamentos
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Catálogo de procedimentos com duração, preço e categoria
          </p>
        </div>
        <button
          type="button"
          className="btn-primary w-full justify-center md:w-auto"
          onClick={openCreate}
        >
          <Plus size={16} /> Novo tratamento
        </button>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar tratamento"
            className="input pl-11"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCategoryFilter('all')}
          className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
            categoryFilter === 'all'
              ? 'bg-gradient-cta text-white shadow-chic'
              : 'bg-white text-slate-600 shadow-card hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          Todos
        </button>
        {categories.map((c) => (
          <button
            type="button"
            key={c.id}
            onClick={() => setCategoryFilter(c.id)}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              categoryFilter === c.id
                ? 'bg-gradient-cta text-white shadow-chic'
                : 'bg-white text-slate-600 shadow-card hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {c.name}
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
          <Loader2 size={20} className="mr-2 animate-spin" /> Carregando tratamentos...
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Sparkles size={32} />}
          title="Nenhum tratamento cadastrado"
          description="Comece cadastrando seu primeiro serviço para que possa ser usado nos agendamentos."
          action={
            <button type="button" className="btn-primary" onClick={openCreate}>
              <Plus size={16} /> Novo tratamento
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 xl:grid-cols-3">
          {filtered.map((svc, idx) => {
            const gradient = CARD_GRADIENTS[idx % CARD_GRADIENTS.length]
            return (
              <div
                key={svc.id}
                className="card flex flex-col gap-5 overflow-hidden p-0 transition hover:-translate-y-0.5"
              >
                <div
                  className={`relative flex h-36 items-center justify-center bg-gradient-to-br ${gradient}`}
                >
                  <Sparkles size={42} className="text-white/80" />
                  {svc.categories?.name && (
                    <span className="absolute right-4 top-4 inline-flex items-center rounded-full bg-white/85 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-700 backdrop-blur">
                      {svc.categories.name}
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-4 px-6 pb-6">
                  <div>
                    <h3 className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
                      {svc.name}
                    </h3>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <ClockIcon size={11} />
                      {svc.duration_minutes} min de duração
                    </div>
                  </div>
                  <div className="mt-auto flex items-end justify-between gap-2">
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        A partir de
                      </div>
                      <div className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                        {formatCurrency(svc.price)}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="icon-btn"
                        aria-label="Editar"
                        onClick={() => openEdit(svc)}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        className="icon-btn-danger"
                        aria-label="Excluir"
                        onClick={() => handleDelete(svc)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
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
        title={form.id ? 'Editar tratamento' : 'Novo tratamento'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Nome</label>
            <input
              required
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ex.: Limpeza de pele"
            />
          </div>

          <div>
            <label className="label">Categoria</label>
            <select
              className="input"
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
            >
              <option value="">Sem categoria</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
              <option value="__new__">+ Criar nova categoria</option>
            </select>
            {form.category_id === '__new__' && (
              <input
                className="input mt-2"
                placeholder="Nome da nova categoria"
                value={form.newCategoryName}
                onChange={(e) => setForm({ ...form, newCategoryName: e.target.value })}
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Duração (min)</label>
              <input
                type="number"
                min="1"
                step="1"
                required
                className="input"
                value={form.duration_minutes}
                onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Preço (R$)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                className="input"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
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
