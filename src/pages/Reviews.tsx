import { useMemo, useState } from 'react'
import { MessageCircle, Search, Star, ThumbsUp } from 'lucide-react'

interface Review {
  id: string
  author: string
  initials: string
  rating: number
  date: string // ISO-ish
  source: 'Google' | 'Instagram' | 'WhatsApp'
  comment: string
  service?: string
}

const REVIEWS: Review[] = [
  {
    id: 'r1',
    author: 'Mariana Souza',
    initials: 'MS',
    rating: 5,
    date: '2026-04-28',
    source: 'Google',
    comment:
      'Atendimento impecável! A Dra. Letícia me passou muita segurança e o resultado da limpeza de pele foi incrível. Já marquei a próxima sessão.',
    service: 'Limpeza de pele profunda',
  },
  {
    id: 'r2',
    author: 'Camila Ribeiro',
    initials: 'CR',
    rating: 5,
    date: '2026-04-22',
    source: 'Google',
    comment:
      'Clínica linda, organizada e a equipe super atenciosa. Fiz a harmonização e amei o resultado natural. Recomendo demais!',
    service: 'Harmonização facial',
  },
  {
    id: 'r3',
    author: 'Júlia Albuquerque',
    initials: 'JA',
    rating: 4,
    date: '2026-04-15',
    source: 'Instagram',
    comment:
      'Adorei o protocolo de drenagem, saí relaxada e com a pele renovada. Só achei a sala um pouco fria, mas é detalhe.',
    service: 'Drenagem linfática',
  },
  {
    id: 'r4',
    author: 'Rafaela Mendes',
    initials: 'RM',
    rating: 5,
    date: '2026-04-08',
    source: 'WhatsApp',
    comment:
      'Excelente experiência do início ao fim. Marcação rápida pelo WhatsApp e o tratamento a laser foi um sucesso. Equipe nota mil.',
    service: 'Laser CO2 fracionado',
  },
  {
    id: 'r5',
    author: 'Beatriz Lima',
    initials: 'BL',
    rating: 5,
    date: '2026-03-30',
    source: 'Google',
    comment:
      'Sou cliente há 2 anos e sempre saio super satisfeita. A clínica tem um padrão de qualidade que faz toda diferença.',
  },
  {
    id: 'r6',
    author: 'Patrícia Nogueira',
    initials: 'PN',
    rating: 4,
    date: '2026-03-25',
    source: 'Google',
    comment:
      'Resultado excelente, ambiente acolhedor. Só faria uma única melhoria na recepção em horários de pico.',
    service: 'Botox e preenchimento',
  },
]

const SOURCE_TABS: Array<'Todas' | Review['source']> = ['Todas', 'Google', 'Instagram', 'WhatsApp']

const SOURCE_STYLE: Record<Review['source'], string> = {
  Google: 'bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-200',
  Instagram: 'bg-accent-100 text-accent-700 dark:bg-accent-500/20 dark:text-accent-200',
  WhatsApp: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200',
}

const AVATAR_PALETTES = ['avatar-blue', 'avatar-pink', 'avatar-cyan', 'avatar-mint', 'avatar-lavender']

const Stars = ({ rating, size = 14 }: { rating: number; size?: number }) => {
  const rounded = Math.round(rating)
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={i < rounded ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-700'}
        />
      ))}
    </span>
  )
}

const formatDate = (iso: string) => {
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function Reviews() {
  const [filter, setFilter] = useState<(typeof SOURCE_TABS)[number]>('Todas')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return REVIEWS.filter((r) => {
      if (filter !== 'Todas' && r.source !== filter) return false
      if (!q) return true
      return (
        r.author.toLowerCase().includes(q) ||
        r.comment.toLowerCase().includes(q) ||
        (r.service ?? '').toLowerCase().includes(q)
      )
    })
  }, [filter, search])

  const avgRating = useMemo(() => {
    const sum = REVIEWS.reduce((acc, r) => acc + r.rating, 0)
    return sum / REVIEWS.length
  }, [])

  const ratingHistogram = useMemo(() => {
    const counts = [0, 0, 0, 0, 0]
    REVIEWS.forEach((r) => {
      counts[r.rating - 1] += 1
    })
    return counts
  }, [])

  const totalReviews = REVIEWS.length

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px] xl:gap-8">
      <section className="min-w-0">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4 md:mb-7">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl dark:text-slate-100">
              Avaliações
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Veja o que seus pacientes estão dizendo sobre a clínica
            </p>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="relative w-full max-w-sm">
            <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por paciente, comentário ou serviço"
              className="input pl-11"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {SOURCE_TABS.map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => setFilter(t)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                filter === t
                  ? 'bg-gradient-cta text-white shadow-chic'
                  : 'bg-white text-slate-600 shadow-card hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="card flex flex-col items-center gap-3 px-6 py-20 text-center">
            <MessageCircle size={32} className="text-slate-300" />
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Nenhuma avaliação encontrada
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tente outro filtro ou uma busca diferente.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
            {filtered.map((r, idx) => {
              const palette = AVATAR_PALETTES[idx % AVATAR_PALETTES.length]
              return (
                <article
                  key={r.id}
                  className="card flex flex-col gap-4 p-5 transition hover:-translate-y-0.5 md:p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className={`avatar ${palette} h-12 w-12`}>{r.initials}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {r.author}
                        </h3>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ${SOURCE_STYLE[r.source]}`}
                        >
                          {r.source}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <Stars rating={r.rating} size={12} />
                        <span className="text-[11px] text-slate-400">{formatDate(r.date)}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    “{r.comment}”
                  </p>
                  {r.service && (
                    <div className="mt-auto inline-flex items-center gap-1.5 self-start rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      <ThumbsUp size={11} /> {r.service}
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </section>

      <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
        <div className="card overflow-hidden">
          <div className="relative bg-gradient-to-br from-brand-500 to-accent-500 px-6 py-8 text-center text-white">
            <div className="text-5xl font-extrabold tracking-tight">{avgRating.toFixed(1)}</div>
            <div className="mt-2 flex justify-center">
              <Stars rating={avgRating} size={16} />
            </div>
            <div className="mt-2 text-xs font-medium uppercase tracking-wider text-white/80">
              {totalReviews} avaliações
            </div>
          </div>
          <div className="space-y-2.5 px-6 py-6">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = ratingHistogram[stars - 1]
              const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0
              return (
                <div key={stars} className="flex items-center gap-3">
                  <span className="flex w-6 items-center gap-0.5 text-xs font-bold text-slate-600 dark:text-slate-300">
                    {stars}
                    <Star size={10} className="fill-amber-400 text-amber-400" />
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-500 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-6 text-right text-xs font-semibold text-slate-500">
                    {count}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="card-soft p-6">
          <h4 className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Pronto para integrar
          </h4>
          <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Estas avaliações vêm de dados mock. Conecte com o Google Meu Negócio ou Instagram via
            n8n para receber reviews reais em tempo real.
          </p>
          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-brand-600 shadow-card dark:bg-slate-900">
            <Star size={10} className="fill-amber-400 text-amber-400" /> Integração futura
          </div>
        </div>
      </aside>
    </div>
  )
}
