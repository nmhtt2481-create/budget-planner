import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import type { ReactNode } from 'react'
import type {
  AppSettings,
  AppState,
  Budget,
  Category,
  Transaction,
  TransactionType,
} from '../types'
import { createDefaultCategories } from '../utils/helpers'

type Action =
  | { type: 'ADD_TRANSACTION'; transaction: Transaction }
  | { type: 'UPDATE_TRANSACTION'; transaction: Transaction }
  | { type: 'DELETE_TRANSACTION'; id: string }
  | { type: 'ADD_CATEGORY'; category: Category }
  | { type: 'SET_BUDGET'; categoryId: string; limit: number }
  | { type: 'REMOVE_BUDGET'; categoryId: string }
  | { type: 'SET_SETTINGS'; settings: Partial<AppSettings> }
  | { type: 'LOAD_STATE'; state: AppState }
  | { type: 'RESET'; state: AppState }

const STORAGE_KEY = 'budget-planner-state'

function createInitialState(): AppState {
  return {
    transactions: [],
    categories: createDefaultCategories(),
    budgets: [],
    settings: { currency: '₽', theme: 'light' },
  }
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [...state.transactions, action.transaction] }
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map((t) =>
          t.id === action.transaction.id ? action.transaction : t,
        ),
      }
    case 'DELETE_TRANSACTION':
      return { ...state, transactions: state.transactions.filter((t) => t.id !== action.id) }
    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.category] }
    case 'SET_BUDGET': {
      const existing = state.budgets.find((b) => b.categoryId === action.categoryId)
      if (existing) {
        return {
          ...state,
          budgets: state.budgets.map((b) =>
            b.categoryId === action.categoryId ? { ...b, limit: action.limit } : b,
          ),
        }
      }
      return { ...state, budgets: [...state.budgets, { categoryId: action.categoryId, limit: action.limit }] }
    }
    case 'REMOVE_BUDGET':
      return { ...state, budgets: state.budgets.filter((b) => b.categoryId !== action.categoryId) }
    case 'SET_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.settings } }
    case 'LOAD_STATE':
    case 'RESET':
      return action.state
    default:
      return state
  }
}

function loadFromStorage(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createInitialState()
    const parsed = JSON.parse(raw)
    return {
      ...createInitialState(),
      ...parsed,
      transactions: parsed.transactions?.map((t: Transaction) => ({
        ...t,
        date: new Date(t.date),
        createdAt: new Date(t.createdAt),
      })) ?? [],
      settings: { ...createInitialState().settings, ...parsed.settings },
    }
  } catch {
    return createInitialState()
  }
}

interface StoreContextValue {
  state: AppState
  addTransaction: (data: Omit<Transaction, 'id' | 'createdAt'>) => Transaction
  updateTransaction: (transaction: Transaction) => void
  deleteTransaction: (id: string) => void
  addCategory: (name: string, icon: string, color: string, type: TransactionType) => Category
  setBudget: (categoryId: string, limit: number) => void
  removeBudget: (categoryId: string) => void
  setSettings: (settings: Partial<AppSettings>) => void
  resetState: (state?: AppState) => void
  getCategory: (id: string) => Category | undefined
}

const StoreContext = createContext<StoreContextValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadFromStorage)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.settings.theme === 'dark')
  }, [state.settings.theme])

  const value = useMemo<StoreContextValue>(() => {
    return {
      state,
      addTransaction: (data) => {
        const transaction: Transaction = {
          ...data,
          id: crypto.randomUUID(),
          createdAt: new Date(),
        }
        dispatch({ type: 'ADD_TRANSACTION', transaction })
        return transaction
      },
      updateTransaction: (transaction) =>
        dispatch({ type: 'UPDATE_TRANSACTION', transaction }),
      deleteTransaction: (id) => dispatch({ type: 'DELETE_TRANSACTION', id }),
      addCategory: (name, icon, color, type) => {
        const category: Category = {
          id: `custom-${Date.now()}`,
          name,
          icon,
          color,
          type,
        }
        dispatch({ type: 'ADD_CATEGORY', category })
        return category
      },
      setBudget: (categoryId, limit) =>
        dispatch({ type: 'SET_BUDGET', categoryId, limit }),
      removeBudget: (categoryId) => dispatch({ type: 'REMOVE_BUDGET', categoryId }),
      setSettings: (settings) => dispatch({ type: 'SET_SETTINGS', settings }),
      resetState: (newState) =>
        dispatch({ type: 'RESET', state: newState ?? createInitialState() }),
      getCategory: (id) => state.categories.find((c) => c.id === id),
    }
  }, [state])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}

export type { Budget }