import { motion } from 'framer-motion'
import { Globe2, Target, Bot, MonitorSmartphone, ArrowUpRight } from 'lucide-react'

const pillars = [
  {
    icon: Globe2,
    emoji: '🌐',
    badge: 'Pilar 01',
    title: 'Sites de Alta Conversão',
    description:
      'Landing pages focadas em estética, para transformar visitantes em pacientes — design premium, performance e copy estratégica.',
    gradient: 'from-blue-500 via-blue-600 to-cyan-500',
    accent: 'bg-blue-500/10 text-blue-700 border-blue-200',
  },
  {
    icon: Target,
    emoji: '🎯',
    badge: 'Pilar 02',
    title: 'Tráfego Pago Cirúrgico',
    description:
      'Anúncios no Instagram e Google buscando clientes de alto padrão na sua região, com criativos e segmentação testados na prática.',
    gradient: 'from-fuchsia-500 via-violet-500 to-indigo-500',
    accent: 'bg-violet-500/10 text-violet-700 border-violet-200',
  },
  {
    icon: Bot,
    emoji: '🤖',
    badge: 'Pilar 03',
    title: 'Agentes de IA',
    description:
      'Atendimento 24/7. Nossa IA responde, qualifica o lead e agenda a consulta diretamente no sistema — sem você levantar um dedo.',
    gradient: 'from-cyan-500 via-teal-500 to-emerald-500',
    accent: 'bg-cyan-500/10 text-cyan-700 border-cyan-200',
  },
  {
    icon: MonitorSmartphone,
    emoji: '💻',
    badge: 'Pilar 04',
    title: 'CRM Klinix (Exclusivo)',
    description:
      'Software próprio de gestão de agenda, prontuários e faturamento. Diga adeus ao papel — tudo num só lugar, na nuvem.',
    gradient: 'from-amber-500 via-orange-500 to-rose-500',
    accent: 'bg-amber-500/10 text-amber-700 border-amber-200',
  },
]

export default function Pillars() {
  return (
    <section id="solucao" className="relative isolate py-24 sm:py-32">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-brand-200/40 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-cyan-200/40 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-200/70 bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-700 backdrop-blur-md">
            A Solução · SwaS
          </span>
          <h2 className="mt-6 font-display text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
            Os <span className="text-gradient">4 Pilares</span> que transformam clínicas em
            máquinas de vendas
          </h2>
          <p className="mt-5 text-base leading-relaxed text-slate-600 sm:text-lg">
            Não somos uma agência. Somos um ecossistema integrado de software e serviço, pensado
            do zero para o mercado de estética.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon
            return (
              <motion.article
                key={pillar.title}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.7, delay: idx * 0.1, ease: 'easeOut' }}
                whileHover={{ scale: 1.02, y: -4 }}
                className="group relative overflow-hidden rounded-3xl border border-white/60 bg-white/70 p-8 shadow-soft backdrop-blur-xl transition"
              >
                <div
                  aria-hidden
                  className={`pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br ${pillar.gradient} opacity-10 blur-3xl transition-opacity duration-500 group-hover:opacity-30`}
                />
                <div
                  aria-hidden
                  className={`pointer-events-none absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent`}
                />

                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <motion.div
                        whileHover={{ rotate: 8 }}
                        transition={{ type: 'spring', stiffness: 240, damping: 14 }}
                        className={`relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${pillar.gradient} text-white shadow-glow`}
                      >
                        <Icon size={26} />
                        <span
                          aria-hidden
                          className={`absolute -inset-1 -z-10 rounded-3xl bg-gradient-to-br ${pillar.gradient} opacity-40 blur-lg transition-opacity duration-500 group-hover:opacity-80`}
                        />
                      </motion.div>
                    </div>
                    <div>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border ${pillar.accent} px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider`}
                      >
                        <span aria-hidden>{pillar.emoji}</span> {pillar.badge}
                      </span>
                      <h3 className="mt-2 font-display text-2xl font-semibold leading-tight text-slate-900">
                        {pillar.title}
                      </h3>
                    </div>
                  </div>

                  <ArrowUpRight
                    size={22}
                    className="shrink-0 text-slate-300 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-600"
                  />
                </div>

                <p className="mt-5 text-sm leading-relaxed text-slate-600 sm:text-base">
                  {pillar.description}
                </p>
              </motion.article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
