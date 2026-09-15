import { AnimatePresence, motion } from 'framer-motion'
import { Check, Trash2, Pencil } from 'lucide-react'

export type ToastKind = 'added' | 'updated' | 'deleted' | 'info'

export interface ToastItem {
  id: string
  message: string
  kind: ToastKind
}

const toastConfig: Record<ToastKind, { icon: React.ReactNode; color: string }> = {
  added: { icon: <Check size={16} />, color: '#22A06B' },
  updated: { icon: <Pencil size={16} />, color: '#5B5CE2' },
  deleted: { icon: <Trash2 size={16} />, color: '#E35D6A' },
  info: { icon: <Check size={16} />, color: '#5B5CE2' },
}

export function ToastContainer({
  toasts,
}: {
  toasts: ToastItem[]
}) {
  return (
    <div
      className="fixed top-4 left-1/2 z-[100] flex w-full max-w-sm -translate-x-1/2 flex-col items-center gap-2 px-4"
      role="status"
      aria-live="polite"
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          const cfg = toastConfig[toast.kind]
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.96 }}
              transition={{ duration: 0.22 }}
              className="flex items-center gap-2.5 rounded-full border border-zinc-200/70 bg-white px-4 py-2.5 shadow-lg shadow-black/5 dark:border-dark-border dark:bg-dark-card"
            >
              <span
                className="flex size-6 items-center justify-center rounded-full text-white"
                style={{ backgroundColor: cfg.color }}
              >
                {cfg.icon}
              </span>
              <span className="text-sm font-medium text-text-primary dark:text-dark-text">
                {toast.message}
              </span>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}