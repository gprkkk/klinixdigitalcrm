import { motion } from 'framer-motion'
import { Sparkles, Mail, Phone, Instagram, Linkedin, ArrowRight } from 'lucide-react'

export default function Footer() {
  return (
    <footer id="contato" className="relative isolate overflow-hidden py-20">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-96 w-[40rem] -translate-x-1/2 rounded-full bg-brand-200/40 blur-3xl" />
        <div className="absolute -right-10 bottom-0 h-80 w-80 rounded-full bg-cyan-200/40 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/70 p-10 shadow-soft backdrop-blur-xl sm:p-14"
        >
          <div className="grid items-center gap-10 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-brand-200/70 bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-700 backdrop-blur-md">
                Próximo passo
              </span>
              <h3 className="mt-5 font-display text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">
                Pronta para transformar sua clínica em uma{' '}
                <span className="text-gradient">máquina previsível</span>?
              </h3>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600">
                Agende uma conversa de 30 minutos com um consultor da Klinix. Vamos diagnosticar
                seus gargalos e mostrar exatamente como o ecossistema SwaS se aplica à sua
                operação.
              </p>
            </div>

            <div className="flex flex-col items-stretch gap-3">
              <motion.a
                href="https://wa.me/5500000000000"
                target="_blank"
                rel="noreferrer"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-cta px-7 py-4 text-base font-semibold text-white shadow-glow"
              >
                Falar com Consultor
                <ArrowRight
                  size={18}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </motion.a>
              <a
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-7 py-4 text-base font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Já sou cliente · Entrar no CRM
              </a>
            </div>
          </div>
        </motion.div>

        <div className="mt-16 grid gap-10 border-t border-slate-200/70 pt-12 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <a href="#topo" className="flex items-center gap-2.5">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-cta text-white shadow-glow">
                <Sparkles size={18} />
              </div>
              <div className="flex items-baseline">
                <span className="font-display text-xl font-bold tracking-tight text-slate-900">
                  Klinix
                </span>
                <span className="font-display text-xl font-bold tracking-tight text-gradient">
                  .digital
                </span>
              </div>
            </a>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-600">
              SwaS — Software with a Service de aceleração de vendas, desenhado especificamente
              para clínicas de estética que querem escalar com previsibilidade.
            </p>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Contato
            </div>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li>
                <a
                  href="mailto:contato@klinix.digital"
                  className="inline-flex items-center gap-2 transition hover:text-slate-900"
                >
                  <Mail size={14} /> contato@klinix.digital
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/5500000000000"
                  className="inline-flex items-center gap-2 transition hover:text-slate-900"
                >
                  <Phone size={14} /> WhatsApp do consultor
                </a>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Redes
            </div>
            <ul className="mt-4 flex items-center gap-3">
              {[
                { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
                { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
              ].map((social) => {
                const Icon = social.icon
                return (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={social.label}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                    >
                      <Icon size={16} />
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-slate-200/70 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Klinix.digital · Todos os direitos reservados.</p>
          <p>Feito com obsessão por design, dados e clínicas que crescem.</p>
        </div>
      </div>
    </footer>
  )
}
