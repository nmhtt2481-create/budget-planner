import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Home, ListTodo, PieChart, Settings as SettingsIcon } from 'lucide-react'
import { useStore } from '../store/useStore'
import { Logo } from './Logo'

export type Page = 'dashboard' | 'operations' | 'analytics' | 'settings'

const NAV_ITEMS: Array<{ id: Page; label: string; icon: ReactNode }> = [
  { id: 'dashboard', label: 'Главная', icon: <Home size={20} /> },
  { id: 'operations', label: 'Операции', icon: <ListTodo size={20} /> },
  { id: 'analytics', label: 'Аналитика', icon: <PieChart size={20} /> },
  { id: 'settings', label: 'Настройки', icon: <SettingsIcon size={20} /> },
]

export function Layout({
  page,
  onNavigate,
  children,
}: {
  page: Page
  onNavigate: (page: Page) => void
  children: ReactNode
}) {
  const { state } = useStore()
  const dark = state.settings.theme === 'dark'

  return (
    <div className="min-h-dvh bg-bg text-text-primary dark:bg-dark-bg dark:text-dark-text">
      <div className="mx-auto flex max-w-[1280px]">
        <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-zinc-200/70 px-4 py-6 lg:flex dark:border-dark-border">
          <button
            onClick={() => onNavigate('dashboard')}
            className="mb-8 flex items-center gap-2.5 px-2"
            aria-label="На главную"
          >
            <Logo />
            <span className="text-base font-bold tracking-tight">Планировщик бюджета</span>
          </button>

          <nav className="flex flex-col gap-1" aria-label="Основная навигация">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                aria-current={page === item.id ? 'page' : undefined}
                className={`relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                  page === item.id
                    ? 'bg-accent text-white'
                    : 'text-text-secondary hover:bg-zinc-100 hover:text-text-primary dark:text-dark-text-secondary dark:hover:bg-white/5 dark:hover:text-dark-text'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto flex items-center gap-3 rounded-2xl border border-zinc-200/70 px-3 py-3 dark:border-dark-border">
            <span
              className="flex size-9 items-center justify-center rounded-full bg-accent/15 text-sm font-bold text-accent"
              aria-hidden="true"
            >
              <Logo size={18} />
            </span>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-medium">Локальные данные</span>
              <span className="text-xs text-text-secondary dark:text-dark-text-secondary">
                {dark ? 'Тёмная тема' : 'Светлая тема'}
              </span>
            </div>
          </div>
        </aside>

        <main className="min-h-dvh w-full min-w-0 pb-20 lg:pb-8">
          <motion.div
            key={page}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="mx-auto w-full max-w-4xl px-4 pt-5 sm:px-6 lg:px-8"
          >
            {children}
          </motion.div>
        </main>
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200/70 bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg lg:hidden dark:border-dark-border dark:bg-dark-card/95"
        aria-label="Мобильная навигация"
      >
        <div className="mx-auto flex max-w-md items-stretch justify-around">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              aria-current={page === item.id ? 'page' : undefined}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                page === item.id
                  ? 'text-accent'
                  : 'text-text-secondary dark:text-dark-text-secondary'
              }`}
            >
              <span className={page === item.id ? 'scale-105 transition-transform' : ''}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}