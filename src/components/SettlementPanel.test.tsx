import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { Participant } from '../domain/types'
import { SettlementPanel } from './SettlementPanel'

const people: Participant[] = [
  { id: 'p1', name: 'Ana' },
  { id: 'p2', name: 'Beto' },
  { id: 'p3', name: 'Caro' },
]

describe('SettlementPanel (RQ-08)', () => {
  it('lists each transfer as "<deudor> paga <monto> a <acreedor>"', () => {
    render(
      <SettlementPanel
        participants={people}
        transfers={[
          { from: 'p3', to: 'p1', amount: 3500 },
          { from: 'p2', to: 'p1', amount: 123450 },
        ]}
      />,
    )
    expect(screen.getByRole('heading', { name: 'Cómo saldar cuentas' })).toBeInTheDocument()
    expect(screen.getAllByRole('listitem').map((li) => li.textContent)).toEqual([
      'Caro paga Bs 35,00 a Ana',
      'Beto paga Bs 1.234,50 a Ana',
    ])
  })

  it('says there are no pending debts when there are no transfers', () => {
    render(<SettlementPanel participants={people} transfers={[]} />)
    expect(screen.getByText('No hay deudas pendientes.')).toBeInTheDocument()
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument()
  })
})
