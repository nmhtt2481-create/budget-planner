import { describe, expect, it } from 'vitest'
import { generateDemoTransactions } from './demoData'
import { createDefaultCategories } from './helpers'

describe('generateDemoTransactions', () => {
  it('создаёт демо-транзакции с валидными полями', () => {
    const categories = createDefaultCategories()
    const txs = generateDemoTransactions(categories)
    expect(txs.length).toBeGreaterThan(10)
    for (const t of txs) {
      expect(t.id).toBeTruthy()
      expect(t.amount).toBeGreaterThan(0)
      expect(categories.some((c) => c.id === t.categoryId)).toBe(true)
      expect(t.date).toBeInstanceOf(Date)
      expect(['income', 'expense']).toContain(t.type)
    }
  })

  it('операции не позже сегодняшнего дня и не слишком старые', () => {
    const categories = createDefaultCategories()
    const txs = generateDemoTransactions(categories)
    const now = new Date()
    for (const t of txs) {
      expect(t.date.getTime()).toBeLessThanOrEqual(now.getTime() + 60000)
      expect(now.getTime() - t.date.getTime()).toBeLessThanOrEqual(40 * 24 * 60 * 60 * 1000)
    }
  })
})