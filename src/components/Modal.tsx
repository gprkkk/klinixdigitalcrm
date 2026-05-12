import { ReactNode, useEffect } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeMap: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-4xl',
}

export default function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 backdrop-blur-sm sm:items-center sm:px-4 sm:py-6 dark:bg-slate-950/70"
      onClick={onClose}
    >
      <div
        className={`card flex w-full ${sizeMap[size]} max-h-[92vh] flex-col overflow-hidden rounded-b-none sm:rounded-[2rem]`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 md:px-7 md:py-5">
          <h2 className="text-base font-bold tracking-tight text-slate-900 md:text-lg dark:text-slate-100">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="icon-btn h-9 w-9"
            aria-label="Fechar"
          >
            <X size={16} />
          </button>
        </div>
        <div className="overflow-y-auto px-5 pb-6 md:px-7 md:pb-7">{children}</div>
      </div>
    </div>
  )
}
