import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StoreProvider } from './store/useStore'
import { Dashboard } from './pages/Dashboard'
import { Analytics } from './pages/Analytics'
import { Settings } from './pages/Settings'

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <StoreProvider>{children}</StoreProvider>
)

beforeEach(() => {
  localStorage.clear()
})

describe('App pages render for empty state', () => {
  it('Dashboard показывает приветствие и кнопки первого запуска', () => {
    render(<Dashboard onOpenOperation={() => {}} />, { wrapper })
    expect(screen.getByText('Давайте начнём')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Добавить расход/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Добавить доход/ })).toBeInTheDocument()
  })

  it('Analytics рендерится с пустыми состояниями', () => {
    render(<Analytics />, { wrapper })
    expect(screen.getByText('Нет данных за выбранный период')).toBeInTheDocument()
    const periodeButtons = screen.getAllByRole('button')
    expect(periodeButtons.some((b) => b.textContent === 'Неделя')).toBe(true)
    expect(periodeButtons.some((b) => b.textContent === 'Месяц')).toBe(true)
    expect(periodeButtons.some((b) => b.textContent === 'Год')).toBe(true)
  })

  it('Settings показывает переключатели темы и валюты', () => {
    render(<Settings />, { wrapper })
    expect(screen.getByText('Тёмная тема')).toBeInTheDocument()
    expect(screen.getByText('Валюта')).toBeInTheDocument()
    expect(screen.getByRole('switch')).toBeInTheDocument()
  })
})