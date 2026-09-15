import type { Category, Transaction, TransactionType } from '../types'

export const EXPENSE_ICONS = ['🍔', '🛒', '🚗', '🏠', '💊', '🎬', '🛍️', '📱', '📚', '✈️', '💳', '💰', '🎁']
export const INCOME_ICONS = ['💼', '💰', '📈', '🎁', '💵', '🏦', '💸']

export const CARD_COLORS = [
  '#5B5CE2',
  '#8B7CF6',
  '#22A06B',
  '#E6A23C',
  '#E35D6A',
  '#0FA3B1',
  '#B5651D',
  '#6D28D9',
  '#C026D3',
  '#0E7490',
  '#16A34A',
  '#DB2777',
  '#F59E0B',
  '#4F46E5',
]

const DEFAULT_EXPENSE_CATEGORIES: Array<[string, string]> = [
  ['Еда', '🍔'],
  ['Продукты', '🛒'],
  ['Транспорт', '🚗'],
  ['Дом', '🏠'],
  ['Здоровье', '💊'],
  ['Развлечения', '🎬'],
  ['Покупки', '🛍️'],
  ['Подписки', '📱'],
  ['Образование', '📚'],
  ['Путешествия', '✈️'],
  ['Другое', '💳'],
]

const DEFAULT_INCOME_CATEGORIES: Array<[string, string]> = [
  ['Зарплата', '💼'],
  ['Фриланс', '💰'],
  ['Инвестиции', '📈'],
  ['Подарки', '🎁'],
  ['Другое', '💵'],
]

export function createDefaultCategories(): Category[] {
  const expense = DEFAULT_EXPENSE_CATEGORIES.map(([name, icon], i) => ({
    id: `sys-exp-${i}`,
    name,
    icon,
    color: CARD_COLORS[i % CARD_COLORS.length],
    type: 'expense' as TransactionType,
    system: true,
  }))
  const income = DEFAULT_INCOME_CATEGORIES.map(([name, icon], i) => ({
    id: `sys-inc-${i}`,
    name,
    icon,
    color: CARD_COLORS[i % CARD_COLORS.length],
    type: 'income' as TransactionType,
    system: true,
  }))
  return [...expense, ...income]
}

export function groupTransactionsByDay(transactions: Transaction[]) {
  const groups: Record<string, Transaction[]> = {}
  const sorted = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )
  for (const t of sorted) {
    const key = new Date(t.date).toDateString()
    if (!groups[key]) groups[key] = []
    groups[key].push(t)
  }
  return groups
}

export function formatDayLabel(date: Date): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  if (d.getTime() === today.getTime()) return 'Сегодня'
  if (d.getTime() === yesterday.getTime()) return 'Вчера'
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
}

export function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

export function formatCurrency(amount: number, currency = '₽'): string {
  const sign = amount < 0 ? '−' : ''
  const abs = Math.abs(amount)
  return `${sign}${abs.toLocaleString('ru-RU')} ${currency}`
}

export function formatNumber(amount: number): string {
  return amount.toLocaleString('ru-RU')
}

export function getMonthRange(year: number, month: number): { start: Date; end: Date } {
  const start = new Date(year, month, 1, 0, 0, 0, 0)
  const end = new Date(year, month + 1, 1, 0, 0, 0, 0)
  return { start, end }
}

export function getMonthKey(year: number, month: number): string {
  return `${year}-${month}`
}

export function isInMonth(t: Transaction, year: number, month: number): boolean {
  const d = new Date(t.date)
  return d.getFullYear() === year && d.getMonth() === month
}

export function isInRange(t: Transaction, start: Date, end: Date): boolean {
  const d = new Date(t.date)
  return d >= start && d < end
}

export function monthName(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })
}