import type { Category, Transaction } from '../types'

export interface PeriodStats {
  income: number
  expense: number
  balance: number
  count: number
  avgDailyExpense: number
}

export function calcPeriodStats(
  transactions: Transaction[],
  start: Date,
  end: Date,
): PeriodStats {
  const inRange = transactions.filter((t) => {
    const d = new Date(t.date)
    return d >= start && d < end
  })
  const income = inRange.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expense = inRange.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const days = Math.max(
    1,
    Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
  )
  return {
    income,
    expense,
    balance: income - expense,
    count: inRange.length,
    avgDailyExpense: expense / days,
  }
}

export interface CategorySpend {
  category: Category
  total: number
  percent: number
}

export function calcExpenseByCategory(
  transactions: Transaction[],
  start: Date,
  end: Date,
  categories: Category[],
): CategorySpend[] {
  const inRange = transactions.filter((t) => {
    const d = new Date(t.date)
    return d >= start && d < end && t.type === 'expense'
  })
  const total = inRange.reduce((s, t) => s + t.amount, 0)
  if (total === 0) return []

  const map: Record<string, number> = {}
  for (const t of inRange) {
    map[t.categoryId] = (map[t.categoryId] ?? 0) + t.amount
  }

  const result: CategorySpend[] = Object.entries(map)
    .map(([categoryId, amount]) => {
      const category = categories.find((c) => c.id === categoryId)
      return {
        category: category ?? { id: categoryId, name: 'Другое', icon: '💳', color: '#737781', type: 'expense' as const },
        total: amount,
        percent: Math.round((amount / total) * 1000) / 10,
      }
    })
    .sort((a, b) => b.total - a.total)

  return result
}

export function dailyExpenseSeries(
  transactions: Transaction[],
  year: number,
  month: number,
): Array<{ day: number; label: string; total: number }> {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const result: Array<{ day: number; label: string; total: number }> = []
  for (let day = 1; day <= daysInMonth; day++) {
    const dayStart = new Date(year, month, day, 0, 0, 0, 0)
    const dayEnd = new Date(year, month, day + 1, 0, 0, 0, 0)
    const total = transactions
      .filter((t) => {
        const d = new Date(t.date)
        return d >= dayStart && d < dayEnd && t.type === 'expense'
      })
      .reduce((s, t) => s + t.amount, 0)
    result.push({ day, label: `${day}`, total })
  }
  return result
}

export function calcChangePercent(current: number, previous: number): number | null {
  if (previous === 0) return null
  return Math.round(((current - previous) / previous) * 1000) / 10
}

export function calcAllTimeBalance(transactions: Transaction[]): number {
  return transactions.reduce((s, t) => s + (t.type === 'income' ? t.amount : -t.amount), 0)
}