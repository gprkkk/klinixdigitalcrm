import { FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarClock,
  CalendarDays,
  ClipboardList,
  Loader2,
  MessageCircle,
  Save,
  User as UserIcon,
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
import PageHeader from '../components/PageHeader'

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
      <div className="card flex items-center justify-center px-6 py-16 text-slate-500 dark:text-slate-400">
        <Loader2 size={20} className="mr-2 animate-spin" /> Carregando cliente...
      </div>
    )
  }

  if (!client) {
    return (
      <div>
        <button type="button" className="btn-secondary mb-4" onClick={() => navigate('/clientes')}>
          <ArrowLeft size={16} /> Voltar
        </button>
        <div className="card p-6 text-slate-500 dark:text-slate-400">Cliente não encontrado.</div>
      </div>
    )
  }

  return (
    <>
      <PageHeader
        title={client.full_name}
        description="Perfil do cliente, ficha clínica e histórico de atendimentos."
        actions={
          <Link to="/clientes" className="btn-secondary">
            <ArrowLeft size={16} /> Voltar
          </Link>
        }
      />

      <div className="card mb-5 grid grid-cols-1 gap-4 p-5 md:grid-cols-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
            <UserIcon size={20} />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Nome</div>
            <div className="font-medium text-slate-900 dark:text-slate-100">{client.full_name}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
            <MessageCircle size={18} />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">WhatsApp</div>
            <div className="font-medium text-slate-900 dark:text-slate-100">{client.whatsapp || '—'}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
            <CalendarDays size={18} />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Nascimento</div>
            <div className="font-medium text-slate-900 dark:text-slate-100">
              {client.birth_date ? formatDate(client.birth_date) : '—'}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
        <button
          type="button"
          onClick={() => setTab('anamnesis')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
            tab === 'anamnesis'
              ? 'bg-brand-600 text-white dark:bg-brand-600'
              : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
        >
          <ClipboardList size={16} /> Ficha Clínica
        </button>
        <button
          type="button"
          onClick={() => setTab('history')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
            tab === 'history'
              ? 'bg-brand-600 text-white dark:bg-brand-600'
              : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
        >
          <CalendarClock size={16} /> Histórico
        </button>
      </div>

      {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{error}</div>}
      {success && (
        <div className="mb-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">{success}</div>
      )}

      {tab === 'anamnesis' && (
        <form onSubmit={handleSubmit} className="card space-y-5 p-5">
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
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Salvar ficha
            </button>
          </div>
        </form>
      )}

      {tab === 'history' && (
        <div className="card p-5">
          {history.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
              Este cliente ainda não possui atendimentos registrados.
            </div>
          ) : (
            <ol className="relative space-y-4 border-l-2 border-slate-100 pl-5 dark:border-slate-800">
              {history.map((a) => (
                <li key={a.id} className="relative">
                  <span className="absolute -left-[27px] mt-1.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-brand-500 dark:border-slate-900" />
                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {a.services?.name ?? 'Serviço removido'}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {formatDateTimeFromParts(a.appointment_date, a.start_time)} · {a.professionals?.name ?? '—'}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`badge ${APPOINTMENT_STATUS_STYLE[a.status]}`}>
                          {APPOINTMENT_STATUS_LABEL[a.status]}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {formatCurrency(a.price_charged)}
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </>
  )
}
