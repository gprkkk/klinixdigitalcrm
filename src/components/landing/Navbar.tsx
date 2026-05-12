import { motion } from 'framer-motion'
import { Sparkles, ArrowRight } from 'lucide-react'

const links = [
  { href: '#problema', label: 'O Problema' },
  { href: '#solucao', label: 'Solução' },
  { href: '#autoridade', label: 'Autoridade' },
]

export default function Navbar() {
  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="fixed inset-x-0 top-4 z-50 flex justify-center px-4"
    >
      <nav
        className="flex w-full max-w-6xl items-center justify-between gap-4 rounded-2xl border border-white/40 bg-white/60 px-4 py-3 shadow-soft backdrop-blur-xl sm:px-6"
        aria-label="Principal"
      >
        <a href="#topo" className="flex items-center gap-2.5">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-cta text-white shadow-glow">
            <Sparkles size={18} />
            <span className="absolute -inset-1 -z-10 rounded-2xl bg-gradient-cta opacity-30 blur-md" />
          </div>
          <div className="flex items-baseline">
            <span className="font-display text-lg font-bold tracking-tight text-slate-900">
              Klinix
            </span>
            <span className="font-display text-lg font-bold tracking-tight text-gradient">
              .digital
            </span>
          </div>
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <motion.a
          href="#contato"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-cta px-4 py-2.5 text-sm font-semibold text-white shadow-glow"
        >
          <span className="relative z-10">Falar com Consultor</span>
          <ArrowRight
            size={16}
            className="relative z-10 transition-transform group-hover:translate-x-0.5"
          />
          <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
        </motion.a>
      </nav>
    </motion.header>
  )
}
