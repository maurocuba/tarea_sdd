import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Participant } from '../domain/types'
import { ParticipantsPanel } from './ParticipantsPanel'

const ana: Participant = { id: 'p1', name: 'Ana' }
const beto: Participant = { id: 'p2', name: 'Beto' }

function setup({ participants = [ana, beto], inUse = [] as string[] } = {}) {
  const onAdd = vi.fn()
  const onRemove = vi.fn()
  render(
    <ParticipantsPanel
      participants={participants}
      isInUse={(id) => inUse.includes(id)}
      onAdd={onAdd}
      onRemove={onRemove}
    />,
  )
  return { onAdd, onRemove, user: userEvent.setup() }
}

describe('ParticipantsPanel', () => {
  it('lists participants in order under the "Participantes" heading', () => {
    setup()
    expect(screen.getByRole('heading', { name: 'Participantes' })).toBeInTheDocument()
    expect(screen.getAllByRole('listitem').map((li) => li.textContent)).toEqual([
      expect.stringContaining('Ana'),
      expect.stringContaining('Beto'),
    ])
  })

  it('shows a text when there are no participants (RQ-01)', () => {
    setup({ participants: [] })
    expect(screen.getByText('Todavía no hay participantes.')).toBeInTheDocument()
  })

  it('adds a trimmed name with the button, clears the field and keeps the focus (RQ-01)', async () => {
    const { onAdd, user } = setup()
    const field = screen.getByLabelText('Nombre')
    await user.type(field, '  Caro  ')
    await user.click(screen.getByRole('button', { name: 'Agregar' }))
    expect(onAdd).toHaveBeenCalledWith('Caro')
    expect(field).toHaveValue('')
    expect(field).toHaveFocus()
  })

  it('adds a name with Enter (RQ-01)', async () => {
    const { onAdd, user } = setup()
    await user.type(screen.getByLabelText('Nombre'), 'Caro{Enter}')
    expect(onAdd).toHaveBeenCalledWith('Caro')
  })

  it.each([
    ['', 'Ingresa un nombre.'],
    ['x'.repeat(31), 'El nombre puede tener hasta 30 caracteres.'],
    ['ana', 'Ya existe un participante con ese nombre.'],
  ])('rejects %j with its message tied to the field (RQ-01, RQ-11)', async (name, message) => {
    const { onAdd, user } = setup()
    const field = screen.getByLabelText('Nombre')
    if (name) await user.type(field, name)
    await user.click(screen.getByRole('button', { name: 'Agregar' }))
    expect(onAdd).not.toHaveBeenCalled()
    expect(field).toHaveAttribute('aria-invalid', 'true')
    expect(field).toHaveAccessibleDescription(message)
  })

  it('clears the error after a valid name', async () => {
    const { user } = setup()
    const field = screen.getByLabelText('Nombre')
    await user.click(screen.getByRole('button', { name: 'Agregar' }))
    await user.type(field, 'Caro{Enter}')
    expect(field).toHaveAttribute('aria-invalid', 'false')
    expect(screen.queryByText('Ingresa un nombre.')).not.toBeInTheDocument()
  })

  it('disables adding at 20 participants with a text (RQ-01)', () => {
    const many = Array.from({ length: 20 }, (_, i) => ({ id: `p${i}`, name: `P${i}` }))
    setup({ participants: many })
    expect(screen.getByLabelText('Nombre')).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Agregar' })).toBeDisabled()
    expect(screen.getByText('Máximo 20 participantes.')).toBeInTheDocument()
  })

  it('removes a participant without expenses at once (RQ-02)', async () => {
    const { onRemove, user } = setup()
    await user.click(screen.getByRole('button', { name: 'Eliminar Beto' }))
    expect(onRemove).toHaveBeenCalledWith('p2')
  })

  it('cannot remove a participant with expenses (RQ-02)', () => {
    setup({ inUse: ['p1'] })
    expect(screen.getByRole('button', { name: 'Eliminar Ana' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Eliminar Beto' })).toBeEnabled()
    expect(screen.getAllByText('Tiene gastos registrados')).toHaveLength(1)
  })
})
