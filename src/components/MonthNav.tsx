import { ChevronLeft, ChevronRight } from 'lucide-react'
import { monthName } from '../utils/helpers'

interface MonthNavProps {
  year: number
  month: number
  onPrev: () => void
  onNext: () => void
}

export function MonthNav({ year, month, onPrev, onNext }: MonthNavProps) {
  const isCurrent =
    year === new Date().getFullYear() && month === new Date().getMonth()

  return (
    <div className="flex items-center gap-1" aria-label="Переключение месяца">
      <button
        onClick={onPrev}
        className="flex size-9 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-zinc-100 hover:text-text-primary dark:text-dark-text-secondary dark:hover:bg-white/5 dark:hover:text-dark-text"
        aria-label="Предыдущий месяц"
      >
        <ChevronLeft size={18} />
      </button>
      <span className="min-w-[140px] text-center text-lg font-semibold capitalize text-text-primary dark:text-dark-text">
        {monthName(year, month)}
      </span>
      <button
        onClick={onNext}
        disabled={isCurrent}
        className="flex size-9 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-zinc-100 hover:text-text-primary disabled:opacity-30 dark:text-dark-text-secondary dark:hover:bg-white/5 dark:hover:text-dark-text"
        aria-label="Следующий месяц"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  )
}