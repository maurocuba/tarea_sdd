import { describe, expect, it } from 'vitest'
import { computeBalances } from './balances'
import type { Expense, Participant } from './types'

const people: Participant[] = [
  { id: 'ana', name: 'Ana' },
  { id: 'beto', name: 'Beto' },
  { id: 'caro', name: 'Caro' },
]

function expense(id: string, amount: number, paidBy: string, splitAmong: string[]): Expense {
  return { id, description: id, amount, paidBy, splitAmong }
}

describe('computeBalances (RQ-07)', () => {
  it('returns a zero balance for everyone when there are no expenses', () => {
    expect(computeBalances(people, [])).toEqual([
      { participantId: 'ana', paid: 0, consumed: 0, balance: 0 },
      { participantId: 'beto', paid: 0, consumed: 0, balance: 0 },
      { participantId: 'caro', paid: 0, consumed: 0, balance: 0 },
    ])
  })

  it('credits the payer and charges each share (RQ-04)', () => {
    const balances = computeBalances(people, [expense('cena', 1000, 'ana', ['ana', 'beto', 'caro'])])
    expect(balances).toEqual([
      { participantId: 'ana', paid: 1000, consumed: 334, balance: 666 },
      { participantId: 'beto', paid: 0, consumed: 333, balance: -333 },
      { participantId: 'caro', paid: 0, consumed: 333, balance: -333 },
    ])
  })

  it('handles a payer who is not among the people the expense is split with', () => {
    const balances = computeBalances(people, [expense('regalo', 600, 'caro', ['ana', 'beto'])])
    expect(balances.map((b) => b.balance)).toEqual([-300, -300, 600])
  })

  it('adds up several expenses', () => {
    const balances = computeBalances(people, [
      expense('cena', 9000, 'ana', ['ana', 'beto', 'caro']),
      expense('taxi', 3000, 'beto', ['ana', 'beto', 'caro']),
      expense('helado', 1000, 'caro', ['beto', 'caro']),
    ])
    expect(balances).toEqual([
      { participantId: 'ana', paid: 9000, consumed: 4000, balance: 5000 },
      { participantId: 'beto', paid: 3000, consumed: 4500, balance: -1500 },
      { participantId: 'caro', paid: 1000, consumed: 4500, balance: -3500 },
    ])
  })

  it('keeps the order of the participant list', () => {
    const reversed = [...people].reverse()
    expect(computeBalances(reversed, []).map((b) => b.participantId)).toEqual(['caro', 'beto', 'ana'])
  })

  it('always adds up to zero', () => {
    const expenses = [
      expense('a', 1001, 'ana', ['ana', 'beto', 'caro']),
      expense('b', 77, 'beto', ['caro', 'ana']),
      expense('c', 12345, 'caro', ['beto']),
      expense('d', 1, 'ana', ['ana', 'beto', 'caro']),
    ]
    const total = computeBalances(people, expenses).reduce((sum, b) => sum + b.balance, 0)
    expect(total).toBe(0)
  })
})
