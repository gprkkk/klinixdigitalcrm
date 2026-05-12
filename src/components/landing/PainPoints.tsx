import { motion } from 'framer-motion'
import { Snowflake, MessageSquareWarning, BarChart3 } from 'lucide-react'

const pains = [
  {
    icon: Snowflake,
    title: 'Leads frios e desqualificados',
    description:
      'Você gasta horas filtrando curiosos que nunca vão comprar. As redes geram volume, mas nenhum agendamento real.',
    color: 'from-sky-400 to-blue-500',
  },
  {
    icon: MessageSquareWarning,
    title: 'Demora no WhatsApp',
    description:
      'A paciente pergunta o preço e ninguém responde a tempo. Em minutos ela já fechou em outra clínica.',
    color: 'from-fuchsia-400 to-rose-500',
  },
  {
    icon: BarChart3,
    title: 'Falta de métricas claras',
    description:
      'Sem dashboard, sem CRM, sem dados. Você decide no “achômetro” e queima dinheiro em campanha que não converte.',
    color: 'from-amber-400 to-orange-500',
  },
]

export default function PainPoints() {
  return (
    <section id="problema" className="relative isolate py-24 sm:py-32">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[-10rem] top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-rose-200/30 blur-3xl" />
        <div className="absolute right-[-6rem] top-10 h-80 w-80 rounded-full bg-cyan-200/40 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-rose-200/70 bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-rose-700 backdrop-blur-md">
            O Problema
          </span>
          <h2 className="mt-6 font-display text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
            Por que sua clínica{' '}
            <span className="text-gradient">perde dinheiro</span> todos os dias?
          </h2>
          <p className="mt-5 text-base leading-relaxed text-slate-600 sm:text-lg">
            Se você se identificar com pelo menos um destes pontos, sua agenda está furada — e
            cada dia parado custa o equivalente a 3 a 5 pacientes que escolheram a concorrência.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {pains.map((pain, idx) => {
            const Icon = pain.icon
            return (
              <motion.div
                key={pain.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.7, delay: idx * 0.12, ease: 'easeOut' }}
                whileHover={{ y: -6 }}
                className="group relative overflow-hidden rounded-3xl border border-white/60 bg-white/60 p-7 shadow-soft backdrop-blur-xl"
              >
                <div
                  aria-hidden
                  className={`pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br ${pain.color} opacity-20 blur-2xl transition group-hover:opacity-40`}
                />
                <div
                  className={`relative inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${pain.color} text-white shadow-glow`}
                >
                  <Icon size={22} />
                </div>
                <h3 className="mt-6 font-display text-xl font-semibold text-slate-900">
                  {pain.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{pain.description}</p>
                <div className="mt-6 inline-flex items-center text-xs font-semibold uppercase tracking-wider text-rose-600">
                  Custo invisível mensal
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
