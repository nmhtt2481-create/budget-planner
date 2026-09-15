export type TransactionType = 'income' | 'expense'

export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  categoryId: string
  date: Date
  comment?: string
  createdAt: Date
}

export interface Category {
  id: string
  name: string
  icon: string
  color: string
  type: TransactionType
  system?: boolean
}

export interface Budget {
  categoryId: string
  limit: number
}

export interface AppSettings {
  currency: string
  theme: 'light' | 'dark'
}

export interface AppState {
  transactions: Transaction[]
  categories: Category[]
  budgets: Budget[]
  settings: AppSettings
}