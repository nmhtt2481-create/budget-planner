import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Moon, Sun, Trash2, Copy, Download, Upload, Plus } from 'lucide-react'
import { useStore } from '../store/useStore'
import { generateDemoTransactions } from '../utils/demoData'
import type { TransactionType } from '../types'

const CURRENCIES = ['₽', '$', '€', '£']

export function Settings() {
  const {
    state,
    setSettings,
    addCategory,
    setBudget,
    removeBudget,
    resetState,
  } = useStore()
  const [catName, setCatName] = useState('')
  const [catIcon, setCatIcon] = useState('')
  const [catType, setCatType] = useState<TransactionType>('expense')
  const [budgetDrafts, setBudgetDrafts] = useState<Record<string, string>>({})

  const dark = state.settings.theme === 'dark'

  const months = useMemo(() => {
    const now = new Date()
    return state.transactions.filter((t) => {
      const d = new Date(t.date)
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
    }).length
  }, [state.transactions])

  const expenseCategories = state.categories.filter((c) => c.type === 'expense')

  const loadDemo = () => {
    const demo = generateDemoTransactions(state.categories)
    resetState({ ...state, transactions: demo })
  }

  const clearAll = () => {
    resetState()
  }

  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'budget-backup.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const importData = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result))
        resetState({
          ...state,
          transactions: parsed.transactions ? [...parsed.transactions.map((t: any) => ({ ...t, date: new Date(t.date), createdAt: new Date(t.createdAt ?? t.date) })), ...state.transactions] : state.transactions,
        })
      } catch {
        alert('Не удалось загрузить файл')
      }
    }
    reader.readAsText(file)
  }

  const handleAddCategory = () => {
    const name = catName.trim()
    if (!name) return
    addCategory(name, catIcon || '💰', `hsl(${Math.round(Math.random() * 360)} 45% 55%)`, catType)
    setCatName('')
    setCatIcon('')
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-lg font-bold tracking-tight">Настройки</h1>

      {/* Внешний вид */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 rounded-3xl bg-card p-5 shadow-sm ring-1 ring-zinc-200/70 sm:p-6 dark:bg-dark-card dark:ring-dark-border"
      >
        <h2 className="text-base font-bold text-text-primary dark:text-dark-text">
          Внешний вид
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-text-primary dark:text-dark-text">Тёмная тема</p>
            <p className="text-xs text-text-secondary dark:text-dark-text-secondary">
              Приятнее для глаз в вечернее время
            </p>
          </div>
          <button
            onClick={() => setSettings({ theme: dark ? 'light' : 'dark' })}
            role="switch"
            aria-checked={dark}
            aria-label="Переключить тёмную тему"
            className={`relative h-7 w-12 rounded-full transition-colors ${
              dark ? 'bg-accent' : 'bg-zinc-300'
            }`}
          >
            <span
              className={`absolute top-0.5 flex size-6 items-center justify-center rounded-full bg-white text-[11px] shadow transition-all ${
                dark ? 'left-[22px]' : 'left-0.5'
              }`}
              aria-hidden="true"
            >
              {dark ? <Moon size={12} /> : <Sun size={12} />}
            </span>
          </button>
        </div>
        <div className="flex items-center justify-between border-t border-zinc-100 pt-4 dark:border-dark-border">
          <div>
            <p className="text-sm font-medium text-text-primary dark:text-dark-text">Валюта</p>
            <p className="text-xs text-text-secondary dark:text-dark-text-secondary">
              Формат отображения сумм
            </p>
          </div>
          <div className="flex gap-1.5" role="radiogroup" aria-label="Валюта">
            {CURRENCIES.map((c) => (
              <button
                key={c}
                role="radio"
                aria-checked={state.settings.currency === c}
                onClick={() => setSettings({ currency: c })}
                className={`flex size-10 items-center justify-center rounded-xl border text-sm font-bold transition-all ${
                  state.settings.currency === c
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-zinc-200 text-text-secondary hover:border-zinc-300 dark:border-dark-border dark:text-dark-text-secondary'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Данные */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex flex-col gap-4 rounded-3xl bg-card p-5 shadow-sm ring-1 ring-zinc-200/70 sm:p-6 dark:bg-dark-card dark:ring-dark-border"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-text-primary dark:text-dark-text">
              Данные
            </h2>
            <p className="text-xs text-text-secondary dark:text-dark-text-secondary">
              Хранятся локально в этом браузере · {months} операций в этом месяце
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button
            onClick={exportData}
            className="flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 py-3 text-sm font-semibold text-text-primary transition-colors hover:bg-zinc-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-white/5"
          >
            <Download size={16} /> Скачать резервную копию
          </button>
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-zinc-200 py-3 text-sm font-semibold text-text-primary transition-colors hover:bg-zinc-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-white/5">
            <Upload size={16} /> Импортировать данные
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) importData(file)
                e.target.value = ''
              }}
            />
          </label>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button
            onClick={loadDemo}
            className="flex items-center justify-center gap-2 rounded-2xl bg-accent/10 py-3 text-sm font-semibold text-accent transition-colors hover:bg-accent/15"
          >
            <Copy size={16} /> Загрузить демо-данные
          </button>
          <button
            onClick={clearAll}
            className="flex items-center justify-center gap-2 rounded-2xl border border-danger/30 py-3 text-sm font-semibold text-danger transition-colors hover:bg-danger/10"
          >
            <Trash2 size={16} /> Очистить все данные
          </button>
        </div>
        <p className="text-xs text-text-secondary dark:text-text-dark-secondary">
          Демо-данные — это пример набора операций для знакомства с приложением. Их можно удалить в любой момент.
        </p>
      </motion.section>

      {/* Категории */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col gap-4 rounded-3xl bg-card p-5 shadow-sm ring-1 ring-zinc-200/70 sm:p-6 dark:bg-dark-card dark:ring-dark-border"
      >
        <h2 className="text-base font-bold text-text-primary dark:text-dark-text">
          Бюджет по категориям
        </h2>
        <p className="text-xs text-text-secondary dark:text-dark-text-secondary">
          Установите месячный лимит для категории расходов
        </p>
        <div className="flex flex-col gap-2.5">
          {expenseCategories.map((cat) => {
            const spent = state.transactions
              .filter((t) => {
                const d = new Date(t.date)
                const now = new Date()
                return (
                  t.type === 'expense' &&
                  t.categoryId === cat.id &&
                  d.getFullYear() === now.getFullYear() &&
                  d.getMonth() === now.getMonth()
                )
              })
              .reduce((s, t) => s + t.amount, 0)
            const budget = state.budgets.find((b) => b.categoryId === cat.id)
            const draft = budgetDrafts[cat.id] ?? (budget ? String(budget.limit) : '')

            return (
              <div
                key={cat.id}
                className="flex flex-wrap items-center gap-3 rounded-2xl border border-zinc-100 px-4 py-3 dark:border-dark-border"
              >
                <span className="flex size-9 items-center justify-center rounded-xl text-lg" style={{ backgroundColor: `${cat.color}1F` }} aria-hidden="true">
                  {cat.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-text-primary dark:text-dark-text">
                    {cat.name}
                  </p>
                  <p className="text-xs text-text-secondary dark:text-dark-text-secondary">
                    Потрачено: {spent.toLocaleString('ru-RU')} {state.settings.currency}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    value={draft}
                    placeholder="Лимит"
                    aria-label={`Лимит для категории ${cat.name}`}
                    onChange={(e) => setBudgetDrafts((d) => ({ ...d, [cat.id]: e.target.value }))}
                    className="w-28 rounded-xl border border-zinc-200 bg-bg px-3 py-2 text-sm tabular-nums text-text-primary outline-none focus:border-accent dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
                  />
                  {budget ? (
                    <button
                      onClick={() => {
                        removeBudget(cat.id)
                        setBudgetDrafts((d) => ({ ...d, [cat.id]: '' }))
                      }}
                      className="flex size-9 items-center justify-center rounded-xl text-text-secondary transition-colors hover:bg-danger/10 hover:text-danger"
                      aria-label={`Удалить лимит для ${cat.name}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        const limit = Number.parseFloat(draft)
                        if (limit > 0) setBudget(cat.id, limit)
                      }}
                      disabled={!Number.parseFloat(draft)}
                      className="rounded-xl bg-accent px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent/90 disabled:opacity-40"
                    >
                      Сохранить
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </motion.section>

      {/* Свои категории */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex flex-col gap-4 rounded-3xl bg-card p-5 shadow-sm ring-1 ring-zinc-200/70 sm:p-6 dark:bg-dark-card dark:ring-dark-border"
      >
        <h2 className="text-base font-bold text-text-primary dark:text-dark-text">
          Свои категории
        </h2>
        <div className="flex flex-wrap gap-2">
          {(['expense', 'income'] as TransactionType[]).map((t) => (
            <button
              key={t}
              onClick={() => setCatType(t)}
              aria-pressed={catType === t}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                catType === t
                  ? t === 'expense'
                    ? 'bg-danger text-white'
                    : 'bg-success text-white'
                  : 'bg-zinc-100 text-text-secondary dark:bg-white/5'
              }`}
            >
              {t === 'expense' ? '− Расход' : '+ Доход'}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={catName}
            onChange={(e) => setCatName(e.target.value)}
            placeholder="Название категории"
            className="flex-1 rounded-xl border border-zinc-200 bg-bg px-4 py-3 text-sm text-text-primary outline-none focus:border-accent dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
          />
          <input
            value={catIcon}
            onChange={(e) => setCatIcon(e.target.value)}
            placeholder="Эмодзи (например 🍕)"
            className="w-full rounded-xl border border-zinc-200 bg-bg px-4 py-3 text-sm text-text-primary outline-none focus:border-accent sm:w-40 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
          />
          <button
            onClick={handleAddCategory}
            disabled={!catName.trim()}
            className="flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent/90 disabled:opacity-40"
          >
            <Plus size={16} /> Добавить
          </button>
        </div>
      </motion.section>
    </div>
  )
}