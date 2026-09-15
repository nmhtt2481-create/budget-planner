import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import type { Transaction, TransactionType } from '../types'
import { useStore } from '../store/useStore'

interface TransactionFormProps {
  isOpen: boolean
  onClose: () => void
  onSaved: (tx: Transaction) => void
  onDeleted: (id: string) => void
  editing?: Transaction | null
  initialType?: TransactionType
}

const INPUT_BASE =
  'w-full rounded-2xl border border-zinc-200 bg-bg px-4 py-3 text-sm text-text-primary outline-none transition-all placeholder:text-text-secondary/60 focus:border-accent focus:ring-2 focus:ring-accent/20 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text'

function todayISO(): string {
  const d = new Date()
  const off = d.getTimezoneOffset()
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10)
}

export function TransactionForm({
  isOpen,
  onClose,
  onSaved,
  onDeleted,
  editing = null,
  initialType = 'expense',
}: TransactionFormProps) {
  const { state, addTransaction, updateTransaction, addCategory, getCategory } = useStore()
  const isEditing = !!editing

  const [type, setType] = useState<TransactionType>(initialType)
  const [amountStr, setAmountStr] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [dateISO, setDateISO] = useState(todayISO())
  const [comment, setComment] = useState('')
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [newCatIcon, setNewCatIcon] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState('')

  const categories = useMemo(
    () => state.categories.filter((c) => c.type === type),
    [state.categories, type],
  )

  useEffect(() => {
    if (isOpen) {
      if (editing) {
        setType(editing.type)
        setAmountStr(String(editing.amount))
        setCategoryId(editing.categoryId)
        setComment(editing.comment ?? '')
        const d = new Date(editing.date)
        const off = d.getTimezoneOffset()
        setDateISO(new Date(d.getTime() - off * 60000).toISOString().slice(0, 10))
        setConfirmDelete(false)
      } else {
        setType(initialType)
        setAmountStr('')
        setCategoryId(categories[0]?.id ?? '')
        setDateISO(todayISO())
        setComment('')
        setConfirmDelete(false)
      }
      setShowNewCategory(false)
      setNewCatName('')
      setNewCatIcon('')
      setError('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, editing, initialType])

  useEffect(() => {
    if (isOpen && !editing && type) {
      setCategoryId((prev) => {
        if (prev && categories.some((c) => c.id === prev)) return prev
        return categories[0]?.id ?? ''
      })
    }
  }, [type, categories, isOpen, editing])

  const handleAmountChange = (value: string) => {
    const cleaned = value.replace(/[^\d.,]/g, '').replace(',', '.')
    setAmountStr(cleaned)
  }

  const handleSave = () => {
    const amount = Number.parseFloat(amountStr)
    if (!amount || amount <= 0) {
      setError('Введите сумму больше нуля')
      return
    }
    if (!categoryId) {
      setError('Выберите категорию')
      return
    }
    const date = new Date(`${dateISO}T12:00:00`)
    if (Number.isNaN(date.getTime())) {
      setError('Выберите дату')
      return
    }

    if (isEditing && editing) {
      const updated: Transaction = {
        ...editing,
        type,
        amount,
        categoryId,
        date,
        comment: comment.trim() || undefined,
      }
      updateTransaction(updated)
      onSaved(updated)
    } else {
      const created = addTransaction({ type, amount, categoryId, date, comment: comment.trim() || undefined })
      onSaved(created)
    }
    onClose()
  }

  const handleAddCategory = () => {
    const name = newCatName.trim()
    if (!name) return
    const color = `hsl(${Math.round(Math.random() * 360)} 45% 55%)`
    const cat = addCategory(name, newCatIcon || '💰', color, type)
    setCategoryId(cat.id)
    setShowNewCategory(false)
    setNewCatName('')
  }

  const handleDelete = () => {
    if (!editing) return
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    onDeleted(editing.id)
    onClose()
  }

  const availableIcons = type === 'expense'
    ? ['🍔', '🛒', '🚗', '🏠', '💊', '🎬', '🛍️', '📱', '📚', '✈️', '💳', '🎁', '🧾', '⚽']
    : ['💼', '💰', '📈', '🎁', '💵', '🏦', '💸', '🏠']

  const editingCategory = editing ? getCategory(editing.categoryId) : undefined

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !confirmDelete && onClose()}
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={isEditing ? 'Редактировать операцию' : 'Новая операция'}
            initial={{ opacity: 0, y: 40, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 32, scale: 0.99 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex max-h-[94dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-card shadow-2xl sm:max-w-lg sm:rounded-3xl dark:bg-dark-card"
          >
            <div className="flex items-center justify-between px-6 pb-2 pt-5">
              <h2 className="text-lg font-semibold text-text-primary dark:text-dark-text">
                {isEditing ? 'Редактировать' : 'Новая операция'}
              </h2>
              {isEditing && editingCategory && (
                <span className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                  style={{ backgroundColor: `${editingCategory.color}1A`, color: editingCategory.color }}
                >
                  {editingCategory.icon} {editingCategory.name}
                </span>
              )}
            </div>

            {confirmDelete ? (
              <div className="flex flex-col gap-4 px-6 py-8 text-center">
                <span className="text-3xl" aria-hidden="true">🗑️</span>
                <div>
                  <h3 className="mb-1 text-base font-semibold text-text-primary dark:text-dark-text">
                    Удалить эту операцию?
                  </h3>
                  <p className="text-sm text-text-secondary dark:text-dark-text-secondary">
                    Действие нельзя будет отменить.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="flex-1 rounded-2xl border border-zinc-200 py-3 text-sm font-medium text-text-primary transition-colors hover:bg-zinc-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-white/5"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 rounded-2xl bg-danger py-3 text-sm font-semibold text-white transition-colors hover:bg-danger/90"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 py-4">
                  <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Тип операции">
                    <button
                      type="button"
                      role="radio"
                      aria-checked={type === 'expense'}
                      onClick={() => setType('expense')}
                      className={`rounded-2xl border-2 py-2.5 text-sm font-semibold transition-all ${
                        type === 'expense'
                          ? 'border-danger/60 bg-danger/10 text-danger'
                          : 'border-zinc-200 text-text-secondary hover:border-zinc-300 dark:border-dark-border dark:text-dark-text-secondary'
                      }`}
                    >
                      − Расход
                    </button>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={type === 'income'}
                      onClick={() => setType('income')}
                      className={`rounded-2xl border-2 py-2.5 text-sm font-semibold transition-all ${
                        type === 'income'
                          ? 'border-success/60 bg-success/10 text-success'
                          : 'border-zinc-200 text-text-secondary hover:border-zinc-300 dark:border-dark-border dark:text-dark-text-secondary'
                      }`}
                    >
                      + Доход
                    </button>
                  </div>

                  <div>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-2xl text-text-secondary dark:text-dark-text-secondary">
                        ₽
                      </span>
                      <input
                        inputMode="decimal"
                        autoFocus
                        placeholder="0"
                        value={amountStr}
                        onChange={(e) => handleAmountChange(e.target.value)}
                        className="w-full rounded-2xl border border-transparent bg-bg py-4 pl-13 pr-4 text-center text-4xl font-bold tabular-nums text-text-primary outline-none transition-all placeholder:text-text-secondary/40 focus:border-accent focus:ring-2 focus:ring-accent/20 dark:bg-dark-bg dark:text-dark-text"
                        style={{ paddingLeft: '3.25rem' }}
                        aria-label="Сумма операции"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-text-secondary dark:text-dark-text-secondary">
                      Категория
                    </label>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setCategoryId(cat.id)}
                          aria-pressed={categoryId === cat.id}
                          className={`flex flex-col items-center gap-1.5 rounded-2xl border-2 px-2 py-3 transition-all ${
                            categoryId === cat.id
                              ? 'border-accent bg-accent/5'
                              : 'border-zinc-100 bg-bg hover:border-zinc-300 dark:border-dark-border dark:bg-dark-bg'
                          }`}
                        >
                          <span className="text-xl" aria-hidden="true">{cat.icon}</span>
                          <span className="max-w-full truncate text-[11px] font-medium text-text-primary dark:text-dark-text">
                            {cat.name}
                          </span>
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setShowNewCategory((v) => !v)}
                        className={`flex flex-col items-center gap-1.5 rounded-2xl border-2 border-dashed px-2 py-3 transition-all ${
                          showNewCategory
                            ? 'border-accent bg-accent/5'
                            : 'border-zinc-300 text-text-secondary hover:border-accent hover:text-accent dark:border-dark-border dark:text-dark-text-secondary'
                        }`}
                      >
                        <span className="text-xl">＋</span>
                        <span className="text-[11px] font-medium">Своя</span>
                      </button>
                    </div>

                    <AnimatePresence>
                      {showNewCategory && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-3 flex flex-col gap-2.5 rounded-2xl border border-zinc-200 bg-bg p-3 dark:border-dark-border dark:bg-dark-bg">
                            <input
                              value={newCatName}
                              onChange={(e) => setNewCatName(e.target.value)}
                              placeholder="Название категории"
                              className={INPUT_BASE}
                            />
                            <div className="flex flex-wrap gap-1.5">
                              {availableIcons.map((icon) => (
                                <button
                                  key={icon}
                                  type="button"
                                  onClick={() => setNewCatIcon(icon)}
                                  aria-pressed={newCatIcon === icon}
                                  className={`flex size-9 items-center justify-center rounded-xl text-lg transition-all ${
                                    newCatIcon === icon
                                      ? 'bg-accent/15 ring-2 ring-accent'
                                      : 'bg-card hover:bg-zinc-50 dark:bg-dark-card dark:hover:bg-white/5'
                                  }`}
                                >
                                  {icon}
                                </button>
                              ))}
                            </div>
                            <button
                              type="button"
                              onClick={handleAddCategory}
                              disabled={!newCatName.trim()}
                              className="rounded-xl bg-accent py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent/90 disabled:opacity-40"
                            >
                              Добавить категорию
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-text-secondary dark:text-dark-text-secondary">
                      Дата
                    </label>
                    <input
                      type="date"
                      value={dateISO}
                      onChange={(e) => setDateISO(e.target.value)}
                      className={INPUT_BASE}
                      aria-label="Дата операции"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-text-secondary dark:text-dark-text-secondary">
                      Комментарий <span className="normal-case text-text-secondary/50">(необязательно)</span>
                    </label>
                    <input
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Например: «Продукты на неделю»"
                      className={INPUT_BASE}
                      aria-label="Комментарий"
                    />
                  </div>

                  {error && (
                    <p className="text-sm font-medium text-danger" role="alert">
                      {error}
                    </p>
                  )}
                </div>

                <div className="flex gap-3 border-t border-zinc-100 px-6 py-4 dark:border-dark-border">
                  {isEditing && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="flex size-12 items-center justify-center rounded-2xl border border-danger/30 text-danger transition-colors hover:bg-danger/10"
                      aria-label="Удалить операцию"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleSave}
                    className={`flex-1 rounded-2xl py-3.5 text-sm font-bold text-white transition-all hover:scale-[1.01] active:scale-[0.99] ${
                      type === 'expense'
                        ? 'bg-danger hover:bg-danger/90'
                        : 'bg-success hover:bg-success/90'
                    }`}
                  >
                    {isEditing ? 'Сохранить' : 'Сохранить'}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}