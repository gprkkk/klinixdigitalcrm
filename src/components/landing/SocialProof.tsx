import { motion } from 'framer-motion'
import { ShieldCheck, Cpu, Stethoscope, ArrowRight, Star } from 'lucide-react'

const highlights = [
  {
    icon: Cpu,
    title: 'Engenharia de Software',
    description:
      'Nosso CRM é desenvolvido por engenheiros, não montado em ferramenta no-code. Performance, segurança e estabilidade reais.',
  },
  {
    icon: Stethoscope,
    title: 'Foco em Estética',
    description:
      'Cada fluxo, copy e dashboard foi pensado para o dia a dia de uma clínica — não é template genérico de SaaS.',
  },
  {
    icon: ShieldCheck,
    title: 'Resultado garantido',
    description:
      'Se em 90 dias sua agenda não melhorar, devolvemos seu investimento. Operação acompanhada por time sênior.',
  },
]

export default function SocialProof() {
  return (
    <section id="autoridade" className="relative isolate overflow-hidden py-24 sm:py-32">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-950 via-slate-900 to-brand-900"
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-96 w-[40rem] -translate-x-1/2 rounded-full bg-brand-500/30 blur-3xl" />
        <div className="absolute -left-20 bottom-0 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute -right-20 top-1/3 h-96 w-96 rounded-full bg-violet-500/20 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(to_right,rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.5)_1px,transparent_1px)] bg-[size:64px_64px]"
          style={{
            maskImage:
              'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(0,0,0,1), transparent 75%)',
            WebkitMaskImage:
              'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(0,0,0,1), transparent 75%)',
          }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-cyan-200 backdrop-blur-md">
            Autoridade
          </span>
          <h2 className="mt-6 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
            Pare de contratar{' '}
            <span className="text-gradient-light">agências genéricas</span>.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-slate-300 sm:text-lg">
            Nós unimos <span className="font-semibold text-white">Marketing Avançado</span> com{' '}
            <span className="font-semibold text-white">Engenharia de Software</span> focada em
            Estética. Um time, um processo, um sistema — sem terceirização, sem retrabalho.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {highlights.map((highlight, idx) => {
            const Icon = highlight.icon
            return (
              <motion.div
                key={highlight.title}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.7, delay: idx * 0.12, ease: 'easeOut' }}
                whileHover={{ y: -6 }}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br from-cyan-400/40 to-brand-500/40 opacity-30 blur-2xl transition group-hover:opacity-60"
                />
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-cta text-white shadow-glow">
                  <Icon size={22} />
                </div>
                <h3 className="mt-6 font-display text-xl font-semibold text-white">
                  {highlight.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  {highlight.description}
                </p>
              </motion.div>
            )
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
          className="relative mt-16 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl sm:p-10"
        >
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-1 text-amber-300">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" stroke="none" />
                ))}
              </div>
              <p className="mt-4 font-display text-xl font-semibold leading-snug text-white sm:text-2xl">
                “Em 60 dias com a Klinix, deixamos de perder leads no WhatsApp e dobramos os
                fechamentos de pacote premium. A IA virou nossa recepcionista A+.”
              </p>
              <div className="mt-4 text-sm text-slate-300">
                Dra. Camila Reis — Clínica de Estética Avançada
              </div>
            </div>

            <motion.a
              href="#contato"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="group inline-flex shrink-0 items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-semibold text-slate-900 shadow-glow"
            >
              Quero esse resultado
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
