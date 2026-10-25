import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { Balance, Participant } from '../domain/types'
import { BalancesPanel } from './BalancesPanel'

const people: Participant[] = [
  { id: 'p1', name: 'Ana' },
  { id: 'p2', name: 'Beto' },
  { id: 'p3', name: 'Caro' },
]

const balances: Balance[] = [
  { participantId: 'p1', paid: 3000, consumed: 1000, balance: 2000 },
  { participantId: 'p2', paid: 0, consumed: 500, balance: -500 },
  { participantId: 'p3', paid: 0, consumed: 0, balance: 0 },
]

describe('BalancesPanel (RQ-07, RQ-09)', () => {
  it('shows one row per participant in list order with sign and status', () => {
    render(<BalancesPanel participants={people} balances={balances} />)
    expect(screen.getByRole('heading', { name: 'Saldos' })).toBeInTheDocument()
    const rows = screen.getAllByRole('listitem')
    expect(rows.map((row) => within(row).getByText(/^(Ana|Beto|Caro)$/).textContent)).toEqual(['Ana', 'Beto', 'Caro'])
    expect(within(rows[0]).getByText('+Bs 20,00')).toBeInTheDocument()
    expect(within(rows[0]).getByText('le deben')).toBeInTheDocument()
    expect(within(rows[1]).getByText('-Bs 5,00')).toBeInTheDocument()
    expect(within(rows[1]).getByText('debe')).toBeInTheDocument()
    expect(within(rows[2]).getByText('Bs 0,00')).toBeInTheDocument()
    expect(within(rows[2]).getByText('está al día')).toBeInTheDocument()
  })

  it('shows a text without participants', () => {
    render(<BalancesPanel participants={[]} balances={[]} />)
    expect(screen.getByText('Todavía no hay participantes.')).toBeInTheDocument()
  })
})
