import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowDownRight, ArrowUpRight, TrendingDown, TrendingUp } from 'lucide-react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useStore } from '../store/useStore'
import { DonutChart } from '../components/DonutChart'
import { EmptyState } from '../components/EmptyState'
import {
  calcChangePercent,
  calcExpenseByCategory,
  calcPeriodStats,
  dailyExpenseSeries,
} from '../utils/calculations'
import { formatCurrency, formatNumber } from '../utils/helpers'

type Period = 'week' | 'month' | 'year'

export function Analytics() {
  const { state } = useStore()
  const [period, setPeriod] = useState<Period>('month')

  const now = useMemo(() => new Date(), [])
  const stats = useMemo(() => {
    let start: Date
    let end: Date
    if (period === 'week') {
      const day = now.getDay()
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((day + 6) % 7), 0, 0, 0, 0)
      end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000)
    } else if (period === 'year') {
      start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0)
      end = new Date(now.getFullYear() + 1, 0, 1, 0, 0, 0, 0)
    } else {
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
      end = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0)
    }
    return { start, end, s: calcPeriodStats(state.transactions, start, end) }
  }, [state.transactions, period, now])

  const { start, end, s } = stats

  const prevStats = useMemo(() => {
    if (period === 'week') {
      const prevStart = new Date(start.getTime() - 7 * 24 * 60 * 60 * 1000)
      const prevEnd = new Date(start.getTime())
      return calcPeriodStats(state.transactions, prevStart, prevEnd)
    }
    if (period === 'year') {
      const prevStart = new Date(start.getFullYear() - 1, 0, 1)
      const prevEnd = new Date(start.getFullYear(), 0, 1)
      return calcPeriodStats(state.transactions, prevStart, prevEnd)
    }
    const prevStart = new Date(start.getFullYear(), start.getMonth() - 1, 1)
    const prevEnd = new Date(start.getFullYear(), start.getMonth(), 1)
    return calcPeriodStats(state.transactions, prevStart, prevEnd)
  }, [state.transactions, period, start])

  const byCategory = useMemo(
    () => calcExpenseByCategory(state.transactions, start, end, state.categories),
    [state.transactions, start, end, state.categories],
  )

  const chartData = useMemo(() => {
    if (period === 'month') {
      return dailyExpenseSeries(state.transactions, now.getFullYear(), now.getMonth())
    }
    if (period === 'week') {
      const days: Array<{ label: string; total: number }> = []
      for (let i = 0; i < 7; i++) {
        const dayStart = new Date(start.getTime() + i * 24 * 60 * 60 * 1000)
        const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)
        const total = state.transactions
          .filter((t) => {
            const d = new Date(t.date)
            return d >= dayStart && d < dayEnd && t.type === 'expense'
          })
          .reduce((sum, t) => sum + t.amount, 0)
        days.push({
          label: dayStart.toLocaleDateString('ru-RU', { weekday: 'short' }),
          total,
        })
      }
      return days
    }
    const months: Array<{ label: string; total: number }> = []
    for (let m = 0; m < 12; m++) {
      const monthStart = new Date(now.getFullYear(), m, 1)
      const monthEnd = new Date(now.getFullYear(), m + 1, 1)
      const total = state.transactions
        .filter((t) => {
          const d = new Date(t.date)
          return d >= monthStart && d < monthEnd && t.type === 'expense'
        })
        .reduce((sum, t) => sum + t.amount, 0)
      months.push({ label: new Date(now.getFullYear(), m, 1).toLocaleDateString('ru-RU', { month: 'short' }), total })
    }
    return months
  }, [period, state.transactions, start, now])

  const changePct = calcChangePercent(s.expense, prevStats.expense)
  const top = byCategory[0] ?? null
  const totalExpense = byCategory.reduce((sum, c) => sum + c.total, 0)

  const periodLabel = period === 'week' ? 'за неделю' : period === 'year' ? 'за год' : 'за месяц'

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-bold tracking-tight">Куда уходят деньги</h1>
        <div className="flex gap-1 rounded-full bg-card p-1 ring-1 ring-zinc-200/70 dark:bg-dark-card dark:ring-dark-border">
          {(['week', 'month', 'year'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              aria-pressed={period === p}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                period === p
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary dark:text-dark-text-secondary'
              }`}
            >
              {p === 'week' ? 'Неделя' : p === 'month' ? 'Месяц' : 'Год'}
            </button>
          ))}
        </div>
      </div>

      {/* Обзор */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 gap-3 sm:grid-cols-4"
      >
        <OverviewCard
          label="Расходы"
          value={formatCurrency(s.expense, state.settings.currency)}
          tone="danger"
        />
        <OverviewCard
          label="Доходы"
          value={formatCurrency(s.income, state.settings.currency)}
          tone="success"
        />
        <OverviewCard
          label="Средний расход в день"
          value={formatCurrency(Math.round(s.avgDailyExpense), state.settings.currency)}
        />
        <OverviewCard
          label="Операций"
          value={String(s.count)}
        />
      </motion.section>

      {/* График */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-3xl bg-card p-5 shadow-sm ring-1 ring-zinc-200/70 sm:p-6 dark:bg-dark-card dark:ring-dark-border"
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-bold text-text-primary dark:text-dark-text">
            Расходы {periodLabel}
          </h2>
          {changePct !== null && prevStats.expense > 0 && (
            <span
              className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                changePct <= 0
                  ? 'bg-success/10 text-success'
                  : 'bg-danger/10 text-danger'
              }`}
            >
              {changePct <= 0 ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
              {changePct <= 0 ? '−' : '+'}{Math.abs(changePct)}% к прошлому периоду
            </span>
          )}
        </div>
        {s.expense === 0 ? (
          <div className="flex h-48 items-center justify-center text-sm text-text-secondary dark:text-dark-text-secondary">
            Нет данных за выбранный период
          </div>
        ) : (
          <div className="h-52 w-full sm:h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="analyticsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B7CF6" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#8B7CF6" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,140,0.12)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: '#9aa0ad' }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
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
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#8B7CF6"
                  strokeWidth={2.5}
                  fill="url(#analyticsGradient)"
                  animationDuration={700}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </motion.section>

      {/* Структура + топ */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl bg-card p-5 shadow-sm ring-1 ring-zinc-200/70 sm:p-6 dark:bg-dark-card dark:ring-dark-border"
        >
          <h2 className="mb-1 text-base font-bold text-text-primary dark:text-dark-text">
            На что потрачено
          </h2>
          <p className="mb-5 text-xs text-text-secondary dark:text-dark-text-secondary">
            Распределение по категориям {periodLabel}
          </p>
          {byCategory.length === 0 ? (
            <EmptyState
              icon="🍃"
              title="Нет расходов"
              description="Добавьте первую операцию расхода, чтобы увидеть структуру."
            />
          ) : (
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
              <DonutChart
                data={byCategory.map((c) => ({ color: c.category.color, value: c.total }))}
                size={180}
                centerLabel={formatNumber(totalExpense)}
                centerSub="₽"
              />
              <ul className="flex w-full min-w-0 flex-1 flex-col gap-2">
                {byCategory.map((item) => (
                  <li
                    key={item.category.id}
                    className="flex items-center gap-2.5 rounded-xl px-1 py-1 text-sm transition-colors hover:bg-zinc-50 dark:hover:bg-white/5"
                  >
                    <span
                      className="flex size-7 shrink-0 items-center justify-center rounded-lg text-sm"
                      style={{ backgroundColor: `${item.category.color}1A` }}
                      aria-hidden="true"
                    >
                      {item.category.icon}
                    </span>
                    <div className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-1">
                      <span className="truncate text-sm font-medium text-text-primary dark:text-dark-text">
                        {item.category.name}
                      </span>
                      <span className="text-xs font-semibold tabular-nums text-text-secondary dark:text-dark-text-secondary">
                        {formatCurrency(item.total, state.settings.currency)}
                      </span>
                    </div>
                    <motion.div
                      className="h-1.5 w-12 overflow-hidden rounded-full bg-zinc-100 sm:w-16 dark:bg-white/10"
                      role="presentation"
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(4, item.percent * 1.6)}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: item.category.color }}
                      />
                    </motion.div>
                    <span className="w-11 shrink-0 text-right text-xs font-semibold tabular-nums text-text-primary dark:text-dark-text">
                      {String(item.percent).replace('.', ',')}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.section>

        <div className="flex flex-col gap-6">
          {/* Топ категория */}
          {top && (
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-3xl bg-card p-5 shadow-sm ring-1 ring-zinc-200/70 sm:p-6 dark:bg-dark-card dark:ring-dark-border"
            >
              <h2 className="mb-3 text-base font-bold text-text-primary dark:text-dark-text">
                Больше всего потрачено
              </h2>
              <div className="flex items-center gap-4">
                <span
                  className="flex size-14 items-center justify-center rounded-2xl text-2xl"
                  style={{ backgroundColor: `${top.category.color}1F` }}
                  aria-hidden="true"
                >
                  {top.category.icon}
                </span>
                <div>
                  <h3 className="text-lg font-bold text-text-primary dark:text-dark-text">
                    {top.category.name}
                  </h3>
                  <p className="text-xl font-extrabold tabular-nums text-danger">
                    {formatCurrency(top.total, state.settings.currency)}
                  </p>
                  <p className="mt-0.5 text-xs text-text-secondary dark:text-dark-text-secondary">
                    Это {String(top.percent).replace('.', ',')}% всех расходов {periodLabel}
                  </p>
                </div>
              </div>
            </motion.section>
          )}

          {/* Сравнение */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-3xl bg-card p-5 shadow-sm ring-1 ring-zinc-200/70 sm:p-6 dark:bg-dark-card dark:ring-dark-border"
          >
            <h2 className="mb-3 text-base font-bold text-text-primary dark:text-dark-text">
              Сравнение с прошлым периодом
            </h2>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-text-secondary dark:text-dark-text-secondary">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-danger/10 text-danger">
                    <ArrowDownRight size={16} />
                  </span>
                  Этот период
                </div>
                <span className="text-sm font-bold tabular-nums text-text-primary dark:text-dark-text">
                  {formatCurrency(s.expense, state.settings.currency)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-text-secondary dark:text-dark-text-secondary">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-zinc-100 dark:bg-white/10">
                    <ArrowUpRight size={16} className="text-text-secondary" />
                  </span>
                  Прошлый период
                </div>
                <span className="text-sm font-bold tabular-nums text-text-primary dark:text-dark-text">
                  {formatCurrency(prevStats.expense, state.settings.currency)}
                </span>
              </div>
              {changePct !== null && prevStats.expense > 0 && s.expense > 0 && (
                <div
                  className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold ${
                    changePct <= 0
                      ? 'bg-success/10 text-success'
                      : 'bg-danger/10 text-danger'
                  }`}
                >
                  {changePct <= 0 ? <TrendingDown size={16} /> : <TrendingUp size={16} />}
                  На {Math.abs(changePct).toLocaleString('ru-RU')}% {changePct <= 0 ? 'меньше' : 'больше'}
                </div>
              )}
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  )
}

function OverviewCard({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone?: 'danger' | 'success'
}) {
  return (
    <div className="rounded-3xl bg-card p-4 shadow-sm ring-1 ring-zinc-200/70 dark:bg-dark-card dark:ring-dark-border">
      <p className="truncate text-xs text-text-secondary dark:text-dark-text-secondary">
        {label}
      </p>
      <p
        className={`mt-1 truncate text-lg font-extrabold tabular-nums ${
          tone === 'danger'
            ? 'text-danger'
            : tone === 'success'
              ? 'text-success'
              : 'text-text-primary dark:text-dark-text'
        }`}
      >
        {value}
      </p>
    </div>
  )
}