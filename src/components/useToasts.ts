import { useSyncExternalStore } from 'react'
import type { ToastItem, ToastKind } from './Toast'

interface ToastStore {
  toasts: ToastItem[]
  showToast: (message: string, kind?: ToastKind) => void
}

let toasts: ToastItem[] = []
const listeners = new Set<() => void>()
const timers = new Map<string, ReturnType<typeof setTimeout>>()

const store: ToastStore = {
  toasts: [],
  showToast: (message, kind = 'info') => {
    const id = crypto.randomUUID()
    toasts = [...toasts, { id, message, kind }]
    listeners.forEach((l) => l())
    const timer = setTimeout(() => {
      toasts = toasts.filter((t) => t.id !== id)
      listeners.forEach((l) => l())
      timers.delete(id)
    }, 2600)
    timers.set(id, timer)
  },
}

export function useToasts(): ToastStore {
  useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => toasts,
  )
  return store
}

export type { ToastItem, ToastKind }