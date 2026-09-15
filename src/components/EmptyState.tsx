import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface EmptyStateProps {
  icon: string
  title: string
  description: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-zinc-300/70 px-6 py-10 text-center dark:border-dark-border"
    >
      <span className="text-4xl" aria-hidden="true">
        {icon}
      </span>
      <h3 className="mt-1 text-base font-semibold text-text-primary dark:text-dark-text">
        {title}
      </h3>
      <p className="max-w-xs text-sm text-text-secondary dark:text-dark-text-secondary">
        {description}
      </p>
      {action && <div className="mt-3">{action}</div>}
    </motion.div>
  )
}