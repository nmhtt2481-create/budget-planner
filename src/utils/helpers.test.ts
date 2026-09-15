import { describe, expect, it } from 'vitest'
import type { Category, Transaction } from '../types'
import {
  createDefaultCategories,
  formatCurrency,
  formatDayLabel,
  formatTime,
  groupTransactionsByDay,
  isInMonth,
  monthName,
} from './helpers'

function normalize(n: string): string {
  return n.replace(/\u00A0/g, ' ')
}

describe('formatCurrency', () => {
  it('форматирует сумму с пробелами и валютой', () => {
    expect(normalize(formatCurrency(124500))).toBe('124 500 ₽')
    expect(normalize(formatCurrency(0))).toBe('0 ₽')
    expect(normalize(formatCurrency(-2450))).toBe('−2 450 ₽')
  })

  it('поддерживает другие валюты', () => {
    expect(normalize(formatCurrency(1000, '$'))).toBe('1 000 $')
  })
})

describe('formatDayLabel', () => {
  it('возвращает Сегодня и Вчера', () => {
    const now = new Date()
    expect(formatDayLabel(now)).toBe('Сегодня')
    const yesterday = new Date()
    yesterday.setDate(now.getDate() - 1)
    expect(formatDayLabel(yesterday)).toBe('Вчера')
  })
})

describe('formatTime', () => {
  it('форматирует время HH:MM', () => {
    expect(formatTime(new Date('2026-09-10T14:32:00'))).toBe('14:32')
  })
})

describe('monthName', () => {
  it('возвращает название месяца с годом', () => {
    expect(monthName(2026, 8)).toContain('сент')
    expect(monthName(2026, 8)).toContain('2026')
  })
})

describe('groupTransactionsByDay', () => {
  it('группирует транзакции по дню и сортирует по убыванию даты', () => {
    const t1: Transaction = {
      id: '1',
      type: 'expense',
      amount: 10,
      categoryId: 'c',
      date: new Date('2026-09-10T12:00:00'),
      createdAt: new Date('2026-09-10T12:00:00'),
    }
    const t2: Transaction = {
      ...t1,
      id: '2',
      date: new Date('2026-09-11T09:00:00'),
    }
    const t3: Transaction = {
      ...t1,
      id: '3',
      date: new Date('2026-09-10T18:00:00'),
    }
    const groups = groupTransactionsByDay([t1, t2, t3])
    const keys = Object.keys(groups)
    expect(keys).toHaveLength(2)
    const firstDay = new Date(groups[keys[0]][0].date)
    const secondDay = new Date(groups[keys[1]][0].date)
    expect(firstDay.getDate()).toBe(11)
    expect(secondDay.getDate()).toBe(10)
    expect(groups[keys[1]]).toHaveLength(2)
  })
})

describe('isInMonth', () => {
  it('проверяет принадлежность месяцу', () => {
    expect(isInMonth({ date: new Date('2026-09-15') } as Transaction, 2026, 8)).toBe(true)
    expect(isInMonth({ date: new Date('2026-10-01') } as Transaction, 2026, 8)).toBe(false)
  })
})

describe('createDefaultCategories', () => {
  it('создаёт категории расходов и доходов', () => {
    const cats: Category[] = createDefaultCategories()
    const expense = cats.filter((c) => c.type === 'expense')
    const income = cats.filter((c) => c.type === 'income')
    expect(expense).toHaveLength(11)
    expect(income).toHaveLength(5)
    expect(cats.every((c) => c.id && c.name && c.icon && c.color)).toBe(true)
  })
})