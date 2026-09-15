import { motion } from 'framer-motion'
import type { Category, Transaction } from '../types'
import { formatCurrency, formatTime } from '../utils/helpers'

interface TransactionCardProps {
  transaction: Transaction
  category: Category | undefined
  onSelect: (tx: Transaction) => void
  compact?: boolean
}

export function TransactionCard({
  transaction,
  category,
  onSelect,
  compact = false,
}: TransactionCardProps) {
  const isIncome = transaction.type === 'income'
  const color = category?.color ?? '#737781'
  const icon = category?.icon ?? '💳'
  const name = category?.name ?? 'Другое'

  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      onClick={() => onSelect(transaction)}
      className="flex w-full items-center gap-3 rounded-2xl px-2 py-2.5 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-white/5"
      aria-label={`${name}, ${isIncome ? 'доход' : 'расход'} ${formatCurrency(transaction.amount)}`}
    >
      <span
        className="flex size-11 shrink-0 items-center justify-center rounded-xl text-xl"
        style={{ backgroundColor: `${color}1A` }}
        aria-hidden="true"
      >
        {icon}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-sm font-medium text-text-primary dark:text-dark-text">
          {name}
        </span>
        <span className="flex items-center gap-2 text-xs text-text-secondary dark:text-dark-text-secondary">
          <span>
            {new Date(transaction.date).toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'short',
            })}
          </span>
          {!compact && (
            <>
              <span aria-hidden="true">·</span>
              <span>{formatTime(transaction.date)}</span>
            </>
          )}
          {transaction.comment && (
            <>
              <span aria-hidden="true">·</span>
              <span className="max-w-[180px] truncate">{transaction.comment}</span>
            </>
          )}
        </span>
      </span>
      <span
        className={`shrink-0 text-sm font-semibold tabular-nums ${
          isIncome
            ? 'text-success dark:text-success'
            : 'text-danger dark:text-danger'
        }`}
      >
        {isIncome ? '+' : '−'} {formatCurrency(transaction.amount).replace(/^[−+]\s?/, '')}
      </span>
    </motion.button>
  )
}