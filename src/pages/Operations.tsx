import { useEffect, useMemo, useState } from 'react'
import { TransactionForm } from '../components/TransactionForm'
import { TransactionCard } from '../components/TransactionCard'
import { EmptyState } from '../components/EmptyState'
import { useStore } from '../store/useStore'
import { useToasts } from '../components/useToasts'
import type { Transaction } from '../types'
import {
  formatDayLabel,
  groupTransactionsByDay,
  isInMonth,
} from '../utils/helpers'

type TypeFilter = 'all' | 'income' | 'expense'
type PeriodFilter = 'current' | 'prev' | 'all'

export function Operations({ activeId }: { activeId: string | null }) {
  const { state, getCategory, deleteTransaction } = useStore()
  const { showToast } = useToasts()
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('current')
  const [editing, setEditing] = useState<Transaction | null>(null)

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()

  useEffect(() => {
    if (activeId) {
      const tx = state.transactions.find((t) => t.id === activeId)
      if (tx) setEditing(tx)
      else setEditing(null)
    } else {
      setEditing(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId])

  const filtered = useMemo(() => {
    let list = state.transactions
    if (typeFilter !== 'all') list = list.filter((t) => t.type === typeFilter)
    if (categoryFilter !== 'all')
      list = list.filter((t) => t.categoryId === categoryFilter)
    if (periodFilter === 'current')
      list = list.filter((t) => isInMonth(t, currentYear, currentMonth))
    if (periodFilter === 'prev') {
      const prev = new Date(currentYear, currentMonth - 1, 1)
      list = list.filter((t) => isInMonth(t, prev.getFullYear(), prev.getMonth()))
    }
    return list
  }, [state.transactions, typeFilter, categoryFilter, periodFilter, currentYear, currentMonth])

  const groups = useMemo(() => groupTransactionsByDay(filtered), [filtered])

  const expenseCategories = state.categories.filter((c) => c.type === 'expense')
  const incomeCategories = state.categories.filter((c) => c.type === 'income')

  const filterButtons: Array<{ id: TypeFilter; label: string }> = [
    { id: 'all', label: 'Все' },
    { id: 'income', label: 'Доходы' },
    { id: 'expense', label: 'Расходы' },
  ]

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-lg font-bold tracking-tight">Операции</h1>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Фильтр по типу">
          {filterButtons.map((b) => (
            <button
              key={b.id}
              role="tab"
              aria-selected={typeFilter === b.id}
              onClick={() => setTypeFilter(b.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                typeFilter === b.id
                  ? 'bg-accent text-white shadow-sm'
                  : 'bg-card text-text-secondary ring-1 ring-zinc-200/70 hover:text-text-primary dark:bg-dark-card dark:text-dark-text-secondary dark:ring-dark-border'
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value as PeriodFilter)}
            className="rounded-xl border border-zinc-200 bg-card px-3 py-2 text-sm text-text-primary outline-none focus:border-accent dark:border-dark-border dark:bg-dark-card dark:text-dark-text"
            aria-label="Период"
          >
            <option value="current">Этот месяц</option>
            <option value="prev">Прошлый месяц</option>
            <option value="all">Всё время</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="max-w-[200px] rounded-xl border border-zinc-200 bg-card px-3 py-2 text-sm text-text-primary outline-none focus:border-accent dark:border-dark-border dark:bg-dark-card dark:text-dark-text"
            aria-label="Категория"
          >
            <option value="all">Все категории</option>
            <optgroup label="Расходы">
              {expenseCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="Доходы">
              {incomeCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.name}
                </option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="Ничего не найдено"
          description="Попробуйте изменить фильтры или добавьте новую операцию."
        />
      ) : (
        <div className="flex flex-col gap-5">
          {Object.entries(groups).map(([dayKey, txs]) => {
            const dayTotal = txs.reduce(
              (s, t) => s + (t.type === 'income' ? t.amount : -t.amount),
              0,
            )
            return (
              <section key={dayKey}>
                <div className="mb-2 flex items-baseline justify-between px-2">
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-text-secondary dark:text-dark-text-secondary capitalize">
                    {formatDayLabel(txs[0].date)}
                  </h2>
                  <span
                    className={`text-xs font-semibold tabular-nums ${
                      dayTotal >= 0 ? 'text-success' : 'text-danger'
                    }`}
                  >
                    {dayTotal >= 0 ? '+' : '−'} {Math.abs(dayTotal).toLocaleString('ru-RU')} ₽
                  </span>
                </div>
                <div className="flex flex-col rounded-3xl bg-card p-2 shadow-sm ring-1 ring-zinc-200/70 dark:bg-dark-card dark:ring-dark-border">
                  {txs.map((tx) => (
                    <TransactionCard
                      key={tx.id}
                      transaction={tx}
                      category={getCategory(tx.categoryId)}
                      onSelect={(t) => setEditing(t)}
                    />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}

      <TransactionForm
        isOpen={!!editing}
        onClose={() => {
          setEditing(null)
        }}
        editing={editing}
        onSaved={() => {
          showToast('Операция изменена', 'updated')
        }}
        onDeleted={(id) => {
          deleteTransaction(id)
          showToast('Операция удалена', 'deleted')
          setEditing(null)
        }}
      />
    </div>
  )
}