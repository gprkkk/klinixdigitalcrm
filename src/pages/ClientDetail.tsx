import { FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarClock,
  CalendarDays,
  ClipboardList,
  Loader2,
  MessageCircle,
  Phone,
  Save,
  Sparkles,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import {
  APPOINTMENT_STATUS_LABEL,
  APPOINTMENT_STATUS_STYLE,
  Appointment,
  Client,
  ClientAnamnesis,
} from '../lib/types'
import { formatCurrency, formatDate, formatDateTimeFromParts } from '../lib/format'

type Tab = 'anamnesis' | 'history'

interface AnamnesisFormState {
  skin_type: string
  allergies: string
  medications: string
}

const emptyAnamnesis: AnamnesisFormState = {
  skin_type: '',
  allergies: '',
  medications: '',
}

const skinTypes = [
  { value: '', label: 'Selecione' },
  { value: 'NORMAL', label: 'Normal' },
  { value: 'OILY', label: 'Oleosa' },
  { value: 'DRY', label: 'Seca' },
  { value: 'COMBINATION', label: 'Mista' },
  { value: 'SENSITIVE', label: 'Sensível' },
]

const getInitials = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('') || '?'

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('anamnesis')

  const [client, setClient] = useState<Client | null>(null)
  const [anamnesisExists, setAnamnesisExists] = useState(false)
  const [form, setForm] = useState<AnamnesisFormState>(emptyAnamnesis)
  const [history, setHistory] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const loadData = async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    setSuccess(null)
    const [clientRes, anamRes, apptRes] = await Promise.all([
      supabase.from('clients').select('*').eq('id', id).single(),
      supabase.from('client_anamnesis').select('*').eq('client_id', id).maybeSingle(),
      supabase
        .from('appointments')
        .select('*, services(*, categories(*)), professionals(*)')
        .eq('client_id', id)
        .order('appointment_date', { ascending: false })
        .order('start_time', { ascending: false }),
    ])

    if (clientRes.error) {
      setError(clientRes.error.message)
    } else {
      setClient(clientRes.data as Client)
    }

    if (anamRes.error && anamRes.error.code !== 'PGRST116') {
      setError(anamRes.error.message)
    }
    const anam = anamRes.data as ClientAnamnesis | null
    if (anam) {
      setAnamnesisExists(true)
      setForm({
        skin_type: anam.skin_type ?? '',
        allergies: anam.allergies ?? '',
        medications: anam.medications ?? '',
      })
    } else {
      setAnamnesisExists(false)
      setForm(emptyAnamnesis)
    }

    if (apptRes.error) {
      setError(apptRes.error.message)
    } else {
      setHistory((apptRes.data as Appointment[] | null) ?? [])
    }

    setLoading(false)
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!id) return
    setError(null)
    setSuccess(null)
    setSaving(true)
    try {
      const payload = {
        client_id: id,
        skin_type: form.skin_type || null,
        allergies: form.allergies.trim() || null,
        medications: form.medications.trim() || null,
      }
      if (anamnesisExists) {
        const { error: err } = await supabase
          .from('client_anamnesis')
          .update(payload)
          .eq('client_id', id)
        if (err) throw err
      } else {
        const { error: err } = await supabase.from('client_anamnesis').insert(payload)
        if (err) throw err
        setAnamnesisExists(true)
      }
      setSuccess('Ficha clínica salva com sucesso.')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar.'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="card flex items-center justify-center px-6 py-20 text-slate-500 dark:text-slate-400">
        <Loader2 size={20} className="mr-2 animate-spin" /> Carregando paciente...
      </div>
    )
  }

  if (!client) {
    return (
      <div>
        <button
          type="button"
          className="btn-secondary mb-4"
          onClick={() => navigate('/app/clientes')}
        >
          <ArrowLeft size={16} /> Voltar
        </button>
        <div className="card p-6 text-slate-500 dark:text-slate-400">
          Paciente não encontrado.
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 md:mb-7">
        <div className="flex min-w-0 items-center gap-3 md:gap-4">
          <Link to="/app/clientes" className="icon-btn shrink-0">
            <ArrowLeft size={16} />
          </Link>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold tracking-tight text-slate-900 md:text-3xl dark:text-slate-100">
              {client.full_name}
            </h1>
            <p className="mt-1 text-xs text-slate-500 md:text-sm dark:text-slate-400">
              Ficha clínica e histórico de atendimentos
            </p>
          </div>
        </div>
      </div>

      <div className="card mb-6 overflow-hidden">
        <div className="relative bg-gradient-to-r from-brand-500 to-accent-500 px-5 py-6 text-white md:px-7 md:py-7">
          <div className="flex flex-wrap items-center gap-4 md:gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15 text-lg font-bold backdrop-blur md:h-16 md:w-16 md:text-xl">
              {getInitials(client.full_name)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-lg font-bold tracking-tight md:text-xl">{client.full_name}</div>
              <div className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-white/70 md:text-xs">
                ID #{client.id.slice(0, 6).toUpperCase()}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/25"
                aria-label="Ligar"
              >
                <Phone size={15} />
              </button>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/25"
                aria-label="Conversar"
              >
                <MessageCircle size={15} />
              </button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 px-5 py-5 md:grid-cols-3 md:gap-6 md:px-7 md:py-6">
          <div className="flex items-center gap-3">
            <div className="icon-btn-blue h-11 w-11">
              <Phone size={15} />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                WhatsApp
              </div>
              <div className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
                {client.whatsapp || '—'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="icon-btn-pink h-11 w-11">
              <CalendarDays size={15} />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Nascimento
              </div>
              <div className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
                {client.birth_date ? formatDate(client.birth_date) : '—'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-cyan-100 text-cyan-600 dark:bg-cyan-500/15 dark:text-cyan-200">
              <Sparkles size={15} />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Atendimentos
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {history.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 flex w-full items-center gap-1 rounded-full bg-white p-1 shadow-card md:inline-flex md:w-auto dark:bg-slate-900">
        <button
          type="button"
          onClick={() => setTab('anamnesis')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold transition md:flex-none md:px-5 md:text-sm ${
            tab === 'anamnesis'
              ? 'bg-gradient-cta text-white shadow-chic'
              : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
        >
          <ClipboardList size={14} /> Ficha clínica
        </button>
        <button
          type="button"
          onClick={() => setTab('history')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold transition md:flex-none md:px-5 md:text-sm ${
            tab === 'history'
              ? 'bg-gradient-pink text-white shadow-chic'
              : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
        >
          <CalendarClock size={14} /> Histórico
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
          {success}
        </div>
      )}

      {tab === 'anamnesis' && (
        <form onSubmit={handleSubmit} className="card space-y-5 p-5 md:p-7">
          <div>
            <label className="label">Tipo de pele</label>
            <select
              className="input md:max-w-sm"
              value={form.skin_type}
              onChange={(e) => setForm({ ...form, skin_type: e.target.value })}
            >
              {skinTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Alergias</label>
            <textarea
              rows={3}
              className="input"
              value={form.allergies}
              onChange={(e) => setForm({ ...form, allergies: e.target.value })}
              placeholder="Liste alergias conhecidas..."
            />
          </div>

          <div>
            <label className="label">Medicamentos em uso</label>
            <textarea
              rows={3}
              className="input"
              value={form.medications}
              onChange={(e) => setForm({ ...form, medications: e.target.value })}
              placeholder="Medicamentos contínuos ou em uso recente..."
            />
          </div>

          <div className="flex justify-end">
            <button type="submit" className="btn-primary w-full justify-center md:w-auto" disabled={saving}>
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Salvar ficha
            </button>
          </div>
        </form>
      )}

      {tab === 'history' && (
        <div className="card p-5 md:p-7">
          {history.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 py-12 text-center text-sm text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
              Este paciente ainda não possui atendimentos registrados.
            </div>
          ) : (
            <ol className="space-y-3">
              {history.map((a, idx) => {
                const pink = idx % 2 === 1
                return (
                  <li
                    key={a.id}
                    className={`flex flex-wrap items-center gap-4 rounded-2xl p-4 ${
                      pink ? 'bg-accent-50/50 dark:bg-accent-500/10' : 'bg-brand-50/50 dark:bg-brand-500/10'
                    }`}
                  >
                    <div
                      className={`avatar ${pink ? 'avatar-pink' : 'avatar-blue'} h-11 w-11`}
                    >
                      <CalendarClock size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {a.services?.name ?? 'Serviço removido'}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {formatDateTimeFromParts(a.appointment_date, a.start_time)} ·{' '}
                        {a.professionals?.name ?? '—'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${APPOINTMENT_STATUS_STYLE[a.status]}`}
                      >
                        {APPOINTMENT_STATUS_LABEL[a.status]}
                      </span>
                      <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {formatCurrency(a.price_charged)}
                      </span>
                    </div>
                  </li>
                )
              })}
            </ol>
          )}
        </div>
      )}
    </>
  )
}
