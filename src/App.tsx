import { useCallback, useState } from 'react'
import { Plus } from 'lucide-react'
import { StoreProvider } from './store/useStore'
import { Layout, type Page } from './components/Layout'
import { ToastContainer } from './components/Toast'
import { useToasts } from './components/useToasts'
import { TransactionForm } from './components/TransactionForm'
import { Dashboard } from './pages/Dashboard'
import { Operations } from './pages/Operations'
import { Analytics } from './pages/Analytics'
import { Settings } from './pages/Settings'
import type { Transaction, TransactionType } from './types'

function AppShell() {
  const [page, setPage] = useState<Page>('dashboard')
  const [formOpen, setFormOpen] = useState(false)
  const [initialType, setInitialType] = useState<TransactionType>('expense')
  const [openOperationId, setOpenOperationId] = useState<string | null>(null)
  const { showToast } = useToasts()

  const navigate = useCallback((p: Page) => {
    setPage(p)
    setOpenOperationId(null)
  }, [])

  const openForm = () => {
    setInitialType('expense')
    setFormOpen(true)
  }

  const handleSaved = useCallback(
    (tx: Transaction) => {
      showToast(
        tx.type === 'income' ? 'Доход добавлен' : 'Расход добавлен',
        'added',
      )
    },
    [showToast],
  )

  const handleEditFromDashboard = useCallback((id: string) => {
    if (id === ':all') {
      setPage('operations')
      return
    }
    setPage('operations')
    setOpenOperationId(id)
  }, [])

  return (
    <Layout page={page} onNavigate={navigate}>
      {page === 'dashboard' && <Dashboard onOpenOperation={handleEditFromDashboard} />}
      {page === 'operations' && <Operations activeId={openOperationId} />}
      {page === 'analytics' && <Analytics />}
      {page === 'settings' && <Settings />}

      {/* FAB — только на мобильных */}
      <button
        onClick={openForm}
        className="fixed bottom-20 right-4 z-30 flex size-14 items-center justify-center rounded-2xl bg-accent text-white shadow-xl shadow-accent/30 transition-all hover:scale-105 active:scale-95 lg:hidden"
        aria-label="Добавить операцию"
      >
        <Plus size={26} />
      </button>

      <TransactionForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        initialType={initialType}
        onSaved={handleSaved}
        onDeleted={() => showToast('Операция удалена', 'deleted')}
      />
    </Layout>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <AppShell />
      <ToastBridge />
    </StoreProvider>
  )
}

function ToastBridge() {
  const { toasts } = useToasts()
  return <ToastContainer toasts={toasts} />
}