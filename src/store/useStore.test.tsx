import { beforeEach, describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { StoreProvider, useStore } from './useStore'

const STORAGE_KEY = 'budget-planner-state'

const wrapper = ({ children }: { children: ReactNode }) => (
  <StoreProvider>{children}</StoreProvider>
)

beforeEach(() => {
  localStorage.clear()
  document.documentElement.classList.remove('dark')
})

describe('useStore', () => {
  it('начинает с пустого состояния и дефолтными категориями', () => {
    const { result } = renderHook(() => useStore(), { wrapper })
    expect(result.current.state.transactions).toHaveLength(0)
    expect(result.current.state.categories.length).toBeGreaterThan(0)
    expect(result.current.state.settings.theme).toBe('light')
  })

  it('добавляет транзакцию', () => {
    const { result } = renderHook(() => useStore(), { wrapper })
    const catId = result.current.state.categories[0].id

    act(() => {
      result.current.addTransaction({
        type: 'expense',
        amount: 2500,
        categoryId: catId,
        date: new Date(),
      })
    })

    expect(result.current.state.transactions).toHaveLength(1)
    expect(result.current.state.transactions[0].amount).toBe(2500)
    expect(result.current.state.transactions[0].type).toBe('expense')
  })

  it('обновляет транзакцию', () => {
    const { result } = renderHook(() => useStore(), { wrapper })
    const catId = result.current.state.categories[0].id

    let createdId = ''
    act(() => {
      const t = result.current.addTransaction({
        type: 'expense',
        amount: 2500,
        categoryId: catId,
        date: new Date(),
      })
      createdId = t.id
    })

    act(() => {
      const t = result.current.state.transactions[0]
      result.current.updateTransaction({ ...t, amount: 3000 })
    })

    const updated = result.current.state.transactions.find((t) => t.id === createdId)
    expect(updated?.amount).toBe(3000)
  })

  it('удаляет транзакцию', () => {
    const { result } = renderHook(() => useStore(), { wrapper })
    const catId = result.current.state.categories[0].id

    act(() => {
      result.current.addTransaction({
        type: 'expense',
        amount: 100,
        categoryId: catId,
        date: new Date(),
      })
    })

    expect(result.current.state.transactions).toHaveLength(1)
    act(() => {
      result.current.deleteTransaction(result.current.state.transactions[0].id)
    })
    expect(result.current.state.transactions).toHaveLength(0)
  })

  it('добавляет пользовательскую категорию', () => {
    const { result } = renderHook(() => useStore(), { wrapper })
    act(() => {
      result.current.addCategory('Своя', '🎯', '#ff0000', 'expense')
    })
    const custom = result.current.state.categories.find((c) => c.name === 'Своя')
    expect(custom).toBeDefined()
    expect(custom?.type).toBe('expense')
    expect(custom?.system).toBeFalsy()
  })

  it('устанавливает и удаляет лимит бюджета', () => {
    const { result } = renderHook(() => useStore(), { wrapper })
    const catId = result.current.state.categories[0].id

    act(() => {
      result.current.setBudget(catId, 20000)
    })
    expect(result.current.state.budgets.find((b) => b.categoryId === catId)?.limit).toBe(20000)

    act(() => {
      result.current.setBudget(catId, 25000)
    })
    expect(result.current.state.budgets.find((b) => b.categoryId === catId)?.limit).toBe(25000)

    act(() => {
      result.current.removeBudget(catId)
    })
    expect(result.current.state.budgets).toHaveLength(0)
  })

  it('переключает тему и сохраняет её в DOM', () => {
    const { result } = renderHook(() => useStore(), { wrapper })
    act(() => {
      result.current.setSettings({ theme: 'dark' })
    })
    expect(result.current.state.settings.theme).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('сохраняет состояние в localStorage', () => {
    const { result } = renderHook(() => useStore(), { wrapper })
    const catId = result.current.state.categories[0].id

    act(() => {
      result.current.addTransaction({
        type: 'income',
        amount: 85000,
        categoryId: catId,
        date: new Date(),
      })
    })

    const raw = localStorage.getItem(STORAGE_KEY)
    expect(raw).toBeTruthy()
    const parsed = JSON.parse(raw!)
    expect(parsed.transactions).toHaveLength(1)
    expect(parsed.transactions[0].amount).toBe(85000)
  })
})