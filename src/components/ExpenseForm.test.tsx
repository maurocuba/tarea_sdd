import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Participant } from '../domain/types'
import { ExpenseForm } from './ExpenseForm'

const people: Participant[] = [
  { id: 'p1', name: 'Ana' },
  { id: 'p2', name: 'Beto' },
  { id: 'p3', name: 'Caro' },
]

function setup(participants = people) {
  const onAdd = vi.fn()
  const view = render(<ExpenseForm participants={participants} onAdd={onAdd} />)
  return { onAdd, user: userEvent.setup(), view }
}

function checkboxes() {
  const group = screen.getByRole('group', { name: 'Dividir entre' })
  return within(group).getAllByRole('checkbox') as HTMLInputElement[]
}

describe('ExpenseForm (RQ-03)', () => {
  it('asks for participants when there are none', () => {
    setup([])
    expect(screen.getByRole('heading', { name: 'Nuevo gasto' })).toBeInTheDocument()
    expect(screen.getByText('Agrega participantes para registrar gastos.')).toBeInTheDocument()
    expect(screen.queryByLabelText('Descripción')).not.toBeInTheDocument()
  })

  it('starts with the first payer and everyone checked', () => {
    setup()
    expect(screen.getByLabelText('Descripción')).toHaveValue('')
    expect(screen.getByLabelText('Monto (Bs)')).toHaveValue('')
    expect(screen.getByLabelText('Pagó')).toHaveDisplayValue('Ana')
    expect(checkboxes().map((c) => [c.labels?.[0].textContent, c.checked])).toEqual([
      ['Ana', true],
      ['Beto', true],
      ['Caro', true],
    ])
  })

  it('registers a valid expense and resets the form', async () => {
    const { onAdd, user } = setup()
    await user.type(screen.getByLabelText('Descripción'), ' Cena ')
    await user.type(screen.getByLabelText('Monto (Bs)'), '90,50')
    await user.selectOptions(screen.getByLabelText('Pagó'), 'Beto')
    await user.click(screen.getByLabelText('Caro'))
    await user.click(screen.getByRole('button', { name: 'Registrar gasto' }))

    expect(onAdd).toHaveBeenCalledWith({ description: 'Cena', amount: 9050, paidBy: 'p2', splitAmong: ['p1', 'p2'] })
    expect(screen.getByLabelText('Descripción')).toHaveValue('')
    expect(screen.getByLabelText('Monto (Bs)')).toHaveValue('')
    expect(screen.getByLabelText('Pagó')).toHaveDisplayValue('Beto')
    expect(checkboxes().every((c) => c.checked)).toBe(true)
    expect(screen.getByLabelText('Descripción')).toHaveFocus()
  })

  it('registers with Enter in a text field', async () => {
    const { onAdd, user } = setup()
    await user.type(screen.getByLabelText('Descripción'), 'Pan')
    await user.type(screen.getByLabelText('Monto (Bs)'), '12{Enter}')
    expect(onAdd).toHaveBeenCalledWith({ description: 'Pan', amount: 1200, paidBy: 'p1', splitAmong: ['p1', 'p2', 'p3'] })
  })

  it('registers nothing and shows every message when fields are invalid (RQ-03, RQ-11)', async () => {
    const { onAdd, user } = setup()
    for (const box of checkboxes()) await user.click(box)
    await user.type(screen.getByLabelText('Monto (Bs)'), '1.000,00')
    await user.click(screen.getByRole('button', { name: 'Registrar gasto' }))

    expect(onAdd).not.toHaveBeenCalled()
    const description = screen.getByLabelText('Descripción')
    const amount = screen.getByLabelText('Monto (Bs)')
    expect(description).toHaveAttribute('aria-invalid', 'true')
    expect(description).toHaveAccessibleDescription('Ingresa una descripción de hasta 60 caracteres.')
    expect(amount).toHaveAttribute('aria-invalid', 'true')
    expect(amount).toHaveAccessibleDescription('Ingresa un monto entre 0,01 y 1.000.000 con hasta 2 decimales.')
    expect(screen.getByRole('group', { name: 'Dividir entre' })).toHaveAccessibleDescription(
      'Elige al menos una persona.',
    )
    expect(amount).toHaveValue('1.000,00')
  })

  it('only flags the fields that are invalid', async () => {
    const { onAdd, user } = setup()
    await user.type(screen.getByLabelText('Descripción'), 'Cena')
    await user.type(screen.getByLabelText('Monto (Bs)'), '0{Enter}')
    expect(onAdd).not.toHaveBeenCalled()
    expect(screen.getByLabelText('Descripción')).toHaveAttribute('aria-invalid', 'false')
    expect(screen.getByLabelText('Monto (Bs)')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.queryByText('Elige al menos una persona.')).not.toBeInTheDocument()
  })

  it('clears the error messages after a valid expense', async () => {
    const { onAdd, user } = setup()
    await user.click(screen.getByRole('button', { name: 'Registrar gasto' }))
    expect(screen.getByLabelText('Descripción')).toHaveAttribute('aria-invalid', 'true')

    await user.type(screen.getByLabelText('Descripción'), 'Cena')
    await user.type(screen.getByLabelText('Monto (Bs)'), '50{Enter}')
    expect(onAdd).toHaveBeenCalledTimes(1)
    expect(screen.getByLabelText('Descripción')).toHaveAttribute('aria-invalid', 'false')
    expect(screen.getByLabelText('Monto (Bs)')).toHaveAttribute('aria-invalid', 'false')
    expect(screen.queryByText('Ingresa una descripción de hasta 60 caracteres.')).not.toBeInTheDocument()
  })

  it('checks a participant added later', async () => {
    const { user, view } = setup(people.slice(0, 2))
    await user.click(screen.getByLabelText('Beto'))
    view.rerender(<ExpenseForm participants={people} onAdd={vi.fn()} />)
    expect(checkboxes().map((c) => c.checked)).toEqual([true, false, true])
  })

  it('falls back to the first payer when the chosen one is removed', async () => {
    const { user, view } = setup()
    await user.selectOptions(screen.getByLabelText('Pagó'), 'Caro')
    view.rerender(<ExpenseForm participants={people.slice(0, 2)} onAdd={vi.fn()} />)
    expect(screen.getByLabelText('Pagó')).toHaveDisplayValue('Ana')
  })
})
