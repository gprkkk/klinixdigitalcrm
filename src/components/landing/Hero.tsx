import { motion, type Variants } from 'framer-motion'
import { ArrowRight, Bot, Calendar, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react'

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
}

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
}

const stats = [
  { value: '+180%', label: 'Agenda lotada em 90 dias' },
  { value: '24/7', label: 'IA atendendo sem parar' },
  { value: '< 60s', label: 'Resposta média no WhatsApp' },
]

export default function Hero() {
  return (
    <section
      id="topo"
      className="relative isolate overflow-hidden pb-20 pt-36 sm:pt-44 lg:pb-32"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-32 top-10 h-[28rem] w-[28rem] rounded-full bg-brand-400/40 blur-3xl animate-blob-slow" />
        <div className="absolute right-[-10rem] top-32 h-[32rem] w-[32rem] rounded-full bg-cyan-300/40 blur-3xl animate-blob-slow [animation-delay:-6s]" />
        <div className="absolute left-1/2 top-72 h-96 w-96 -translate-x-1/2 rounded-full bg-violet-300/30 blur-3xl animate-blob-slow [animation-delay:-12s]" />
        <div
          className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.05)_1px,transparent_1px)] bg-[size:48px_48px]"
          style={{
            maskImage:
              'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(0,0,0,0.7), transparent 75%)',
            WebkitMaskImage:
              'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(0,0,0,0.7), transparent 75%)',
          }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="mx-auto flex max-w-4xl flex-col items-center text-center"
        >
          <motion.span
            variants={item}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-200/70 bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-700 backdrop-blur-md shadow-soft"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-600" />
            </span>
            SwaS — Software with a Service para Estética
          </motion.span>

          <motion.h1
            variants={item}
            className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-slate-900 sm:text-5xl md:text-6xl lg:text-7xl"
          >
            Transforme sua{' '}
            <span className="relative inline-block">
              <span className="text-gradient">Clínica de Estética</span>
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1.2, duration: 0.9, ease: 'easeOut' }}
                className="absolute -bottom-1.5 left-0 right-0 h-1.5 origin-left rounded-full bg-gradient-cta opacity-80"
              />
            </span>{' '}
            em uma <span className="text-gradient">Máquina de Vendas</span>.
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-7 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg"
          >
            O ecossistema que atrai pacientes, atende no piloto automático com IA e faz a gestão
            no nosso <span className="font-semibold text-slate-800">CRM exclusivo</span>.
          </motion.p>

          <motion.div
            variants={item}
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
          >
            <motion.a
              href="#contato"
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
              whileHover={{ scale: 1.07 }}
              whileTap={{ scale: 0.97 }}
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-2xl bg-gradient-cta px-8 py-4 text-base font-semibold text-white shadow-glow"
            >
              <span className="relative z-10">Quero Lotar Minha Agenda</span>
              <ArrowRight
                size={18}
                className="relative z-10 transition-transform group-hover:translate-x-1"
              />
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </motion.a>

            <a
              href="#solucao"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/70 px-7 py-4 text-base font-semibold text-slate-700 backdrop-blur-md transition hover:border-slate-300 hover:bg-white"
            >
              Ver como funciona
            </a>
          </motion.div>

          <motion.div
            variants={item}
            className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-slate-500"
          >
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-500" />
              Garantia de resultado
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Sparkles size={14} className="text-brand-500" />
              Setup em 7 dias
            </span>
            <span className="inline-flex items-center gap-1.5">
              <TrendingUp size={14} className="text-cyan-500" />
              Sem fidelidade
            </span>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.9, ease: 'easeOut' }}
          className="relative mx-auto mt-20 max-w-5xl"
        >
          <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/60 p-2 shadow-soft backdrop-blur-xl">
            <div className="relative overflow-hidden rounded-2xl border border-slate-200/60 bg-gradient-to-br from-white via-slate-50 to-brand-50/40 p-8 sm:p-10">
              <div className="grid gap-6 sm:grid-cols-3">
                {stats.map((stat, idx) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1 + idx * 0.12, duration: 0.6 }}
                    className="relative"
                  >
                    <div className="text-3xl font-bold tracking-tight text-gradient sm:text-4xl">
                      {stat.value}
                    </div>
                    <div className="mt-1 text-sm text-slate-600">{stat.label}</div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8 grid gap-4 border-t border-slate-200/70 pt-6 sm:grid-cols-3">
                {[
                  { icon: Bot, label: 'IA agendou consulta' },
                  { icon: Calendar, label: 'Nova consulta confirmada' },
                  { icon: Sparkles, label: 'Pacote premium vendido' },
                ].map((row, idx) => {
                  const Icon = row.icon
                  return (
                    <motion.div
                      key={row.label}
                      animate={{ y: [0, -4, 0] }}
                      transition={{
                        duration: 3.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: idx * 0.4,
                      }}
                      className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/80 px-4 py-3 shadow-sm"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-cta text-white shadow-glow">
                        <Icon size={16} />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-900">{row.label}</div>
                        <div className="text-[10px] uppercase tracking-wider text-slate-400">
                          agora mesmo
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </div>

          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-10 -bottom-10 h-20 rounded-full bg-brand-500/20 blur-3xl"
          />
        </motion.div>
      </div>
    </section>
  )
}
