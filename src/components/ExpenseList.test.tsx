import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Expense, Participant } from '../domain/types'
import { ExpenseList } from './ExpenseList'

const people: Participant[] = [
  { id: 'p1', name: 'Ana' },
  { id: 'p2', name: 'Beto' },
  { id: 'p3', name: 'Caro' },
]

const expenses: Expense[] = [
  { id: 'e4', description: 'Cena', amount: 9050, paidBy: 'p1', splitAmong: ['p1', 'p2', 'p3'] },
  { id: 'e5', description: 'Taxi', amount: 123450, paidBy: 'p3', splitAmong: ['p2', 'p3'] },
]

function setup(list = expenses) {
  const onRemove = vi.fn()
  render(<ExpenseList participants={people} expenses={list} onRemove={onRemove} />)
  return { onRemove, user: userEvent.setup() }
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('ExpenseList (RQ-05)', () => {
  it('shows the newest expense first with payer and split', () => {
    setup()
    expect(screen.getByRole('heading', { name: 'Gastos' })).toBeInTheDocument()
    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(2)
    expect(within(items[0]).getByText('Taxi')).toBeInTheDocument()
    expect(within(items[0]).getByText('Bs 1.234,50')).toBeInTheDocument()
    expect(within(items[0]).getByText('Pagó Caro')).toBeInTheDocument()
    expect(within(items[0]).getByText('Entre: Beto, Caro')).toBeInTheDocument()
    expect(within(items[1]).getByText('Cena')).toBeInTheDocument()
    expect(within(items[1]).getByText('Entre: Ana, Beto, Caro')).toBeInTheDocument()
  })

  it('shows the total spent', () => {
    setup()
    expect(screen.getByText('Total gastado: Bs 1.325,00')).toBeInTheDocument()
  })

  it('shows a text and a zero total without expenses', () => {
    setup([])
    expect(screen.getByText('Todavía no hay gastos.')).toBeInTheDocument()
    expect(screen.getByText('Total gastado: Bs 0,00')).toBeInTheDocument()
  })
})

describe('removing an expense (RQ-06)', () => {
  it('asks for confirmation and removes it when accepted', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
    const { onRemove, user } = setup()
    await user.click(screen.getByRole('button', { name: 'Eliminar gasto Cena' }))
    expect(confirm).toHaveBeenCalledWith('¿Eliminar el gasto "Cena"?')
    expect(onRemove).toHaveBeenCalledWith('e4')
  })

  it('keeps it when cancelled', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    const { onRemove, user } = setup()
    await user.click(screen.getByRole('button', { name: 'Eliminar gasto Taxi' }))
    expect(onRemove).not.toHaveBeenCalled()
  })
})
