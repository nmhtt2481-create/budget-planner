import { describe, expect, it } from 'vitest'
import type { Category, Transaction, TransactionType } from '../types'
import {
  calcChangePercent,
  calcExpenseByCategory,
  calcPeriodStats,
  dailyExpenseSeries,
} from './calculations'

function tx(partial: Partial<Transaction> & { id: string; type: TransactionType }): Transaction {
  return {
    amount: 0,
    categoryId: 'c1',
    date: new Date('2026-09-10T12:00:00'),
    createdAt: new Date('2026-09-10T12:00:00'),
    comment: undefined,
    ...partial,
  }
}

const income = (id: string, amount: number, date: Date): Transaction =>
  tx({ id, type: 'income', amount, date })
const expense = (id: string, amount: number, date: Date, categoryId = 'c1'): Transaction =>
  tx({ id, type: 'expense', amount, date, categoryId })

const cat: Category = {
  id: 'c1',
  name: 'Продукты',
  icon: '🛒',
  color: '#5B5CE2',
  type: 'expense',
}

describe('calcPeriodStats', () => {
  const start = new Date('2026-09-01')
  const end = new Date('2026-10-01')

  it('рассчитывает доходы, расходы и баланс', () => {
    const list = [
      income('1', 1000, new Date('2026-09-05')),
      expense('2', 400, new Date('2026-09-06')),
      income('3', 2000, new Date('2026-09-20')),
    ]
    const stats = calcPeriodStats(list, start, end)
    expect(stats.income).toBe(3000)
    expect(stats.expense).toBe(400)
    expect(stats.balance).toBe(2600)
    expect(stats.count).toBe(3)
    expect(stats.avgDailyExpense).toBeCloseTo(400 / 30)
  })

  it('игнорирует операции вне периода', () => {
    const list = [
      income('1', 500, new Date('2026-08-30')),
      expense('2', 900, new Date('2026-10-01')),
    ]
    const stats = calcPeriodStats(list, start, end)
    expect(stats.income).toBe(0)
    expect(stats.expense).toBe(0)
    expect(stats.count).toBe(0)
  })

  it('не делит на ноль при пустом месяце', () => {
    const stats = calcPeriodStats([], start, end)
    expect(stats.avgDailyExpense).toBe(0)
  })
})

describe('calcExpenseByCategory', () => {
  const start = new Date('2026-09-01')
  const end = new Date('2026-10-01')

  it('группирует расходы по категориям и считает процент', () => {
    const list = [
      expense('1', 300, new Date('2026-09-05'), 'c1'),
      expense('2', 700, new Date('2026-09-06'), 'c1'),
      expense('3', 2000, new Date('2026-09-07'), 'c2'),
    ]
    const cats: Category[] = [
      cat,
      { id: 'c2', name: 'Транспорт', icon: '🚗', color: '#22A06B', type: 'expense' },
      { id: 'inc', name: 'Зарплата', icon: '💼', color: '#000', type: 'income' },
    ]
    const result = calcExpenseByCategory(list, start, end, cats)
    expect(result).toHaveLength(2)
    expect(result[0].category.id).toBe('c2')
    expect(result[0].total).toBe(2000)
    expect(result[0].percent).toBeCloseTo(66.7, 1)
    expect(result[1].total).toBe(1000)
    expect(result[1].percent).toBeCloseTo(33.3, 1)
  })

  it('возвращает пустой массив без расходов', () => {
    const list = [income('1', 500, new Date('2026-09-05'))]
    expect(calcExpenseByCategory(list, start, end, [cat])).toEqual([])
  })
})

describe('dailyExpenseSeries', () => {
  it('строит ряд по дням месяца', () => {
    const list = [
      expense('1', 100, new Date('2026-09-05T10:00:00')),
      expense('2', 50, new Date('2026-09-05T18:00:00')),
      expense('3', 30, new Date('2026-09-15T12:00:00')),
    ]
    const series = dailyExpenseSeries(list, 2026, 8)
    expect(series).toHaveLength(30)
    expect(series[4]).toEqual({ day: 5, label: '5', total: 150 })
    expect(series[14]).toEqual({ day: 15, label: '15', total: 30 })
    expect(series[0].total).toBe(0)
  })
})

describe('calcChangePercent', () => {
  it('считает изменение в процентах', () => {
    expect(calcChangePercent(55000, 61200)).toBeCloseTo(-10.13, 1)
    expect(calcChangePercent(100, 80)).toBe(25)
  })

  it('возвращает null при нулевом прошлом периоде', () => {
    expect(calcChangePercent(100, 0)).toBeNull()
  })
})