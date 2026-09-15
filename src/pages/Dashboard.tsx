import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingDown, Plus, ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { useStore } from '../store/useStore'
import { MonthNav } from '../components/MonthNav'
import { TransactionCard } from '../components/TransactionCard'
import { EmptyState } from '../components/EmptyState'
import { TransactionForm } from '../components/TransactionForm'
import { AnimatedNumber } from '../components/AnimatedNumber'
import { DonutChart } from '../components/DonutChart'
import type { Transaction, TransactionType } from '../types'
import {
  calcExpenseByCategory,
  calcPeriodStats,
  dailyExpenseSeries,
} from '../utils/calculations'
import {
  formatCurrency,
  formatNumber,
  groupTransactionsByDay,
  formatDayLabel,
  getMonthRange,
  isInMonth,
} from '../utils/helpers'

const now = new Date()
const CURRENT_YEAR = now.getFullYear()
const CURRENT_MONTH = now.getMonth()

export function Dashboard({ onOpenOperation }: { onOpenOperation: (id: string) => void }) {
  const { state, getCategory } = useStore()
  const [year, setYear] = useState(CURRENT_YEAR)
  const [month, setMonth] = useState(CURRENT_MONTH)
  const [formOpen, setFormOpen] = useState(false)
  const [initialType, setInitialType] = useState<TransactionType>('expense')

  const { start, end } = useMemo(() => getMonthRange(year, month), [year, month])
  const monthTx = useMemo(
    () => state.transactions.filter((t) => isInMonth(t, year, month)),
    [state.transactions, year, month],
  )
  const stats = useMemo(() => calcPeriodStats(state.transactions, start, end), [state.transactions, start, end])
  const prevStats = useMemo(() => {
    const prevStart = new Date(year, month - 1, 1)
    const prevEnd = new Date(year, month, 1)
    return calcPeriodStats(state.transactions, prevStart, prevEnd)
  }, [state.transactions, year, month])

  const chartData = useMemo(() => dailyExpenseSeries(state.transactions, year, month), [state.transactions, year, month])
  const byCategory = useMemo(
    () => calcExpenseByCategory(state.transactions, start, end, state.categories),
    [state.transactions, start, end, state.categories],
  )
  const groups = useMemo(() => groupTransactionsByDay(monthTx), [monthTx])

  const hasData = state.transactions.length > 0
  const hasMonthData = monthTx.length > 0

  const changePct =
    prevStats.expense > 0 && stats.expense > 0
      ? Math.round(((stats.expense - prevStats.expense) / prevStats.expense) * 1000) / 10
      : null

  const maxDay = Math.max(...chartData.map((d) => d.total), 1)
  const topCategory = byCategory[0] ?? null

  const goToMonth = (delta: number) => {
    const d = new Date(year, month + delta, 1)
    setYear(d.getFullYear())
    setMonth(d.getMonth())
  }

  const openForm = (type: TransactionType) => {
    setInitialType(type)
    setFormOpen(true)
  }

  const handleSaved = (tx: Transaction) => {
    onOpenOperation(tx.id)
  }

  const mainBalance = stats.balance

  const donutData = byCategory.slice(0, 8)

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="hidden text-lg font-bold tracking-tight lg:block">
          Личный кабинет
        </h1>
        <div className="flex items-center gap-2 lg:ml-auto">
          <MonthNav
            year={year}
            month={month}
            onPrev={() => goToMonth(-1)}
            onNext={() => goToMonth(1)}
          />
        </div>
      </header>

      {!hasData ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center gap-4 rounded-3xl border border-zinc-200/60 px-6 py-16 text-center dark:border-dark-border"
        >
          <span className="text-4xl" aria-hidden="true">📊</span>
          <h2 className="text-xl font-bold text-text-primary dark:text-dark-text">
            Давайте начнём
          </h2>
          <p className="max-w-sm text-sm text-text-secondary dark:text-dark-text-secondary">
            Добавьте первый доход или расход — и здесь появится ваша финансовая
            картина.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => openForm('expense')}
              className="flex items-center gap-2 rounded-2xl bg-danger px-5 py-3 text-sm font-bold text-white transition-all hover:scale-105 hover:bg-danger/90"
            >
              <ArrowDownRight size={18} /> Добавить расход
            </button>
            <button
              onClick={() => openForm('income')}
              className="flex items-center gap-2 rounded-2xl bg-success px-5 py-3 text-sm font-bold text-white transition-all hover:scale-105 hover:bg-success/90"
            >
              <ArrowUpRight size={18} /> Добавить доход
            </button>
          </div>
        </motion.div>
      ) : (
        <>
          {/* Баланс */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-accent via-accent to-accent-light p-6 text-white shadow-xl shadow-accent/20 sm:p-8"
          >
            <div className="flex flex-wrap gap-6">
              <div className="flex-1 min-w-[220px]">
                <p className="text-sm font-medium text-white/80">Баланс за месяц</p>
                <p className="mt-1 text-3xl font-extrabold tabular-nums tracking-tight sm:text-4xl">
                  <AnimatedNumber value={mainBalance} format={(v) => formatCurrency(Math.round(v), state.settings.currency)} />
                </p>
                <div className="mt-4 flex flex-wrap gap-6">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-white/70">
                      <ArrowUpRight size={12} /> Доходы
                    </div>
                    <p className="mt-0.5 text-base font-bold tabular-nums sm:text-lg">
                      <AnimatedNumber value={stats.income} format={(v) => formatCurrency(Math.round(v), state.settings.currency)} />
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-white/70">
                      <ArrowDownRight size={12} /> Расходы
                    </div>
                    <p className="mt-0.5 text-base font-bold tabular-nums sm:text-lg">
                      <AnimatedNumber value={stats.expense} format={(v) => formatCurrency(Math.round(v), state.settings.currency)} />
                    </p>
                  </div>
                </div>
              </div>
              {changePct !== null && (
                <div className="flex items-start">
                  <span
                    className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold backdrop-blur-sm ${
                      changePct <= 0 ? 'bg-white/20 text-white' : 'bg-white/15 text-white'
                    }`}
                  >
                    <TrendingDown size={14} />
                    {changePct <= 0 ? '−' : '+'}
                    {Math.abs(changePct)}% к прошлому месяцу
                  </span>
                </div>
              )}
            </div>
            <div className="pointer-events-none absolute -right-10 -top-16 size-48 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
          </motion.section>

          {/* Быстрые действия */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="flex gap-3"
          >
            <button
              onClick={() => openForm('expense')}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-card py-3.5 text-sm font-bold text-danger shadow-sm ring-1 ring-zinc-200/70 transition-all hover:-translate-y-0.5 hover:shadow-md hover:ring-danger/30 dark:bg-dark-card dark:ring-dark-border"
            >
              <Plus size={16} /> Добавить расход
            </button>
            <button
              onClick={() => openForm('income')}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-card py-3.5 text-sm font-bold text-success shadow-sm ring-1 ring-zinc-200/70 transition-all hover:-translate-y-0.5 hover:shadow-md hover:ring-success/30 dark:bg-dark-card dark:ring-dark-border"
            >
              <Plus size={16} /> Добавить доход
            </button>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
            {/* График расходов */}
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="rounded-3xl bg-card p-5 shadow-sm ring-1 ring-zinc-200/70 sm:p-6 xl:col-span-3 dark:bg-dark-card dark:ring-dark-border"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-bold text-text-primary dark:text-dark-text">
                  Расходы за месяц
                </h2>
                <span className="text-xs font-medium text-text-secondary dark:text-dark-text-secondary">
                  <AnimatedNumber value={stats.expense} format={(v) => formatCurrency(Math.round(v), state.settings.currency)} />
                </span>
              </div>
              {stats.expense === 0 ? (
                <div className="flex h-48 items-center justify-center text-sm text-text-secondary dark:text-dark-text-secondary">
                  Нет расходов за этот месяц
                </div>
              ) : (
                <div className="h-48 w-full sm:h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#5B5CE2" stopOpacity={0.32} />
                          <stop offset="100%" stopColor="#5B5CE2" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,140,0.12)" vertical={false} />
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 10, fill: '#9aa0ad' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => (maxDay < 10 ? v : Number(v) % 5 === 0 || Number(v) === 1 ? v : '')}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: '#9aa0ad' }}
                        axisLine={false}
                        tickLine={false}
                        width={40}
                        tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: 16,
                          border: '1px solid rgba(128,128,140,0.2)',
                          fontSize: 12,
                          padding: '8px 12px',
                        }}
                        formatter={(value) =>
                          [formatCurrency(Number(value ?? 0), state.settings.currency), 'Расходы'] as [string, string]
                        }
                        labelFormatter={(label) => `${label} число`}
                      />
                      <Area
                        type="monotone"
                        dataKey="total"
                        stroke="#5B5CE2"
                        strokeWidth={2.5}
                        fill="url(#expenseGradient)"
                        animationDuration={800}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </motion.section>

            {/* Donut расходов */}
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
              className="rounded-3xl bg-card p-5 shadow-sm ring-1 ring-zinc-200/70 sm:p-6 xl:col-span-2 dark:bg-dark-card dark:ring-dark-border"
            >
              <h2 className="mb-1 text-base font-bold text-text-primary dark:text-dark-text">
                На что потрачено
              </h2>
              <p className="mb-4 text-xs text-text-secondary dark:text-dark-text-secondary">
                Структура расходов за месяц
              </p>
              {donutData.length === 0 ? (
                <div className="flex h-40 items-center justify-center text-sm text-text-secondary dark:text-dark-text-secondary">
                  Пока нет данных
                </div>
              ) : (
                <div className="flex items-center gap-5">
                  <DonutChart
                    data={donutData.map((d) => ({ color: d.category.color, value: d.total }))}
                    size={150}
                    centerLabel={formatNumber(donutData.reduce((s, d) => s + d.total, 0))}
                    centerSub="₽"
                  />
                  <ul className="flex min-w-0 flex-1 flex-col gap-1.5">
                    {donutData.slice(0, 6).map((item) => (
                      <li key={item.category.id} className="flex items-center gap-2 text-sm">
                        <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.category.color }} aria-hidden="true" />
                        <span className="truncate text-xs text-text-secondary dark:text-dark-text-secondary">{item.category.name}</span>
                        <span className="ml-auto text-xs font-semibold tabular-nums text-text-primary dark:text-dark-text">
                          {item.percent}%
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.section>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            {/* Top категория */}
            {topCategory && (
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="rounded-3xl bg-card p-5 shadow-sm ring-1 ring-zinc-200/70 dark:bg-dark-card dark:ring-dark-border"
              >
                <h2 className="mb-3 text-base font-bold text-text-primary dark:text-dark-text">
                  Больше всего потрачено
                </h2>
                <div className="flex items-center gap-4">
                  <span
                    className="flex size-14 items-center justify-center rounded-2xl text-2xl"
                    style={{ backgroundColor: `${topCategory.category.color}1F` }}
                    aria-hidden="true"
                  >
                    {topCategory.category.icon}
                  </span>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-lg font-bold text-text-primary dark:text-dark-text">
                        {topCategory.category.name}
                      </h3>
                    </div>
                    <p className="text-xl font-extrabold tabular-nums text-danger">
                      {formatCurrency(topCategory.total, state.settings.currency)}
                    </p>
                    <p className="mt-0.5 text-xs text-text-secondary dark:text-dark-text-secondary">
                      Это {String(topCategory.percent).replace('.', ',')}% всех расходов за месяц
                    </p>
                  </div>
                </div>
              </motion.section>
            )}

            {/* Бюджет */}
            {state.budgets.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.25 }}
                className="rounded-3xl bg-card p-5 shadow-sm ring-1 ring-zinc-200/70 dark:bg-dark-card dark:ring-dark-border"
              >
                <h2 className="mb-3 text-base font-bold text-text-primary dark:text-dark-text">
                  Бюджет по категориям
                </h2>
                <div className="flex flex-col gap-4">
                  {state.budgets.slice(0, 3).map((budget) => {
                    const cat = state.categories.find((c) => c.id === budget.categoryId)
                    if (!cat) return null
                    const spent = monthTx
                      .filter((t) => t.type === 'expense' && t.categoryId === budget.categoryId)
                      .reduce((s, t) => s + t.amount, 0)
                    const pct = Math.min(100, Math.round((spent / budget.limit) * 100))
                    const warn = pct >= 85
                    return (
                      <div key={budget.categoryId}>
                        <div className="mb-1.5 flex items-center justify-between text-sm">
                          <span className="flex items-center gap-1.5 font-medium text-text-primary dark:text-dark-text">
                            <span aria-hidden="true">{cat.icon}</span> {cat.name}
                          </span>
                          <span className="text-xs tabular-nums text-text-secondary dark:text-dark-text-secondary">
                            {formatCurrency(spent, state.settings.currency)} / {formatCurrency(budget.limit, state.settings.currency)}
                          </span>
                        </div>
                        <div className="h-2.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-white/10" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`Бюджет: ${cat.name}`}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.7, ease: 'easeOut' }}
                            className={`h-full rounded-full ${warn ? 'bg-warning' : 'bg-accent'}`}
                          />
                        </div>
                        {warn ? (
                          <p className="mt-1 text-xs font-medium text-warning">
                            Осталось {Math.max(0, Math.round((1 - spent / budget.limit) * 100))}% бюджета
                          </p>
                        ) : (
                          <p className="mt-1 text-xs text-text-secondary dark:text-dark-text-secondary">
                            Осталось {formatCurrency(budget.limit - spent, state.settings.currency)}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </motion.section>
            )}
          </div>

          {/* Последние операции */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-bold text-text-primary dark:text-dark-text">
                Последние операции
              </h2>
              <button
                onClick={onOpenOperation ? () => onOpenOperation(':all') : undefined}
                className="text-sm font-medium text-accent hover:text-accent-light"
              >
                Все операции
              </button>
            </div>
            {hasMonthData ? (
              <div className="flex flex-col gap-4 rounded-3xl bg-card p-3 shadow-sm ring-1 ring-zinc-200/70 sm:p-4 dark:bg-dark-card dark:ring-dark-border">
                {Object.entries(groups).slice(0, 4).map(([dayKey, txs]) => (
                  <div key={dayKey}>
                    <h3 className="mb-1 px-2 text-xs font-semibold uppercase tracking-wide text-text-secondary dark:text-dark-text-secondary">
                      {formatDayLabel(txs[0].date)}
                    </h3>
                    <div className="flex flex-col">
                      {txs.slice(0, 6).map((tx) => (
                        <TransactionCard
                          key={tx.id}
                          transaction={tx}
                          category={getCategory(tx.categoryId)}
                          onSelect={(t) => onOpenOperation(t.id)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon="🧾"
                title="Нет операций за месяц"
                description="Добавьте операцию, чтобы видеть её здесь."
                action={
                  <button
                    onClick={() => openForm('expense')}
                    className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent/90"
                  >
                    Добавить операцию
                  </button>
                }
              />
            )}
          </section>

          {/* Средние показатели */}
          {hasMonthData && (
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-3 gap-3"
            >
              <MiniStat
                label="Операций"
                value={String(stats.count)}
              />
              <MiniStat
                label="Средний расход в день"
                value={formatCurrency(Math.round(stats.avgDailyExpense), state.settings.currency)}
              />
              <MiniStat
                label="Общий баланс"
                value={formatCurrency(
                  state.transactions.reduce((s, t) => s + (t.type === 'income' ? t.amount : -t.amount), 0),
                  state.settings.currency,
                )}
                positive={state.transactions.reduce((s, t) => s + (t.type === 'income' ? t.amount : -t.amount), 0) >= 0}
              />
            </motion.section>
          )}
        </>
      )}

      <TransactionForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        initialType={initialType}
        onSaved={handleSaved}
        onDeleted={() => {}}
      />
    </div>
  )
}

function MiniStat({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div className="rounded-3xl bg-card p-4 shadow-sm ring-1 ring-zinc-200/70 dark:bg-dark-card dark:ring-dark-border">
      <p className="text-xs text-text-secondary dark:text-dark-text-secondary">{label}</p>
      <p className={`mt-1 truncate text-sm font-bold tabular-nums sm:text-base ${positive === false ? 'text-danger' : positive === true ? 'text-success' : 'text-text-primary dark:text-dark-text'}`}>
        {value}
      </p>
    </div>
  )
}