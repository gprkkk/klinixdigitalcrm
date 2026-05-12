import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Clock as ClockIcon, Pencil, Plus, Sparkles, Trash2, Loader2, Search, Tag } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Category, Service } from '../lib/types'
import { formatCurrency } from '../lib/format'
import PageHeader from '../components/PageHeader'
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

export default function Services() {
  const [services, setServices] = useState<Service[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<ServiceFormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const loadData = async () => {
    setLoading(true)
    setError(null)
    const [{ data: cats, error: catErr }, { data: svcs, error: svcErr }] = await Promise.all([
      supabase.from('categories').select('*').order('name', { ascending: true }),
      supabase
        .from('services')
        .select('*, categories(*)')
        .order('name', { ascending: true }),
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
    if (!q) return services
    return services.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.categories?.name?.toLowerCase().includes(q),
    )
  }, [services, search])

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
      <PageHeader
        title="Serviços"
        description="Cadastre e gerencie os serviços oferecidos pela clínica."
        actions={
          <button type="button" className="btn-primary" onClick={openCreate}>
            <Plus size={16} /> Novo serviço
          </button>
        }
      />

      <div className="mb-4 flex items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por nome ou categoria"
            className="input pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{error}</div>}

      {loading ? (
        <div className="card flex items-center justify-center px-6 py-16 text-slate-500 dark:text-slate-400">
          <Loader2 size={20} className="mr-2 animate-spin" /> Carregando serviços...
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Sparkles size={32} />}
          title="Nenhum serviço cadastrado"
          description="Comece cadastrando seu primeiro serviço para que possa ser usado nos agendamentos."
          action={
            <button type="button" className="btn-primary" onClick={openCreate}>
              <Plus size={16} /> Novo serviço
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((svc, idx) => {
            const usePink = idx % 2 === 1
            return (
              <div
                key={svc.id}
                className="card flex flex-col gap-5 p-6 transition hover:-translate-y-0.5 hover:shadow-glow-pink"
              >
                <div className="flex items-start gap-4">
                  <div className={usePink ? 'icon-pill icon-pill-pink' : 'icon-pill icon-pill-blue'}>
                    <Sparkles size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                      {svc.name}
                    </div>
                    {svc.categories?.name && (
                      <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-accent-50 px-2.5 py-0.5 text-xs font-semibold text-accent-700 dark:bg-accent-500/15 dark:text-accent-300">
                        <Tag size={11} />
                        {svc.categories.name}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-800/60">
                    <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      <ClockIcon size={11} /> Duração
                    </div>
                    <div className="mt-1 text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
                      {svc.duration_minutes} min
                    </div>
                  </div>
                  <div className="rounded-2xl bg-gradient-soft px-4 py-3 dark:bg-slate-800/60">
                    <div className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Preço
                    </div>
                    <div className="mt-1 text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
                      {formatCurrency(svc.price)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <button
                    type="button"
                    className="btn-secondary !px-4 !py-2 text-xs"
                    onClick={() => openEdit(svc)}
                    aria-label="Editar"
                  >
                    <Pencil size={14} /> Editar
                  </button>
                  <button
                    type="button"
                    className="btn-danger !px-3 !py-2"
                    onClick={() => handleDelete(svc)}
                    aria-label="Excluir"
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
        title={form.id ? 'Editar serviço' : 'Novo serviço'}
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
