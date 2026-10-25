import { describe, expect, it } from 'vitest'
import { computeBalances } from './balances'
import { suggestTransfers } from './settle'
import type { Balance, Expense, Participant, Transfer } from './types'

function balances(values: Record<string, number>): Balance[] {
  return Object.entries(values).map(([participantId, balance]) => ({
    participantId,
    paid: 0,
    consumed: 0,
    balance,
  }))
}

function applyTransfers(start: Balance[], transfers: Transfer[]): Map<string, number> {
  const result = new Map(start.map((b) => [b.participantId, b.balance]))
  for (const t of transfers) {
    result.set(t.from, result.get(t.from)! + t.amount)
    result.set(t.to, result.get(t.to)! - t.amount)
  }
  return result
}

// Small deterministic generator so the property test is repeatable.
function random(seed: number) {
  let state = seed
  return (max: number) => {
    state = (state * 1103515245 + 12345) % 2147483648
    return state % max
  }
}

describe('suggestTransfers (RQ-08)', () => {
  it('suggests nothing when everyone is settled', () => {
    expect(suggestTransfers(balances({ ana: 0, beto: 0 }))).toEqual([])
    expect(suggestTransfers([])).toEqual([])
  })

  it('suggests one transfer for a single debt', () => {
    expect(suggestTransfers(balances({ ana: 500, beto: -500 }))).toEqual([{ from: 'beto', to: 'ana', amount: 500 }])
  })

  it('has every debtor pay the only creditor', () => {
    expect(suggestTransfers(balances({ ana: 666, beto: -333, caro: -333 }))).toEqual([
      { from: 'beto', to: 'ana', amount: 333 },
      { from: 'caro', to: 'ana', amount: 333 },
    ])
  })

  it('pairs the largest debtor with the largest creditor first', () => {
    expect(suggestTransfers(balances({ ana: 5000, beto: -1500, caro: -3500 }))).toEqual([
      { from: 'caro', to: 'ana', amount: 3500 },
      { from: 'beto', to: 'ana', amount: 1500 },
    ])
  })

  it('splits a large debt across creditors', () => {
    expect(suggestTransfers(balances({ ana: 300, beto: 700, caro: -1000 }))).toEqual([
      { from: 'caro', to: 'beto', amount: 700 },
      { from: 'caro', to: 'ana', amount: 300 },
    ])
  })

  it('breaks ties by participant list order', () => {
    expect(suggestTransfers(balances({ ana: -200, beto: 200, caro: -200, dani: 200 }))).toEqual([
      { from: 'ana', to: 'beto', amount: 200 },
      { from: 'caro', to: 'dani', amount: 200 },
    ])
  })

  it('settles everyone with at most k - 1 transfers for any generated group', () => {
    const next = random(42)
    for (let round = 0; round < 300; round++) {
      const people: Participant[] = Array.from({ length: 1 + next(20) }, (_, i) => ({ id: `p${i}`, name: `P${i}` }))
      const expenses: Expense[] = Array.from({ length: next(15) }, (_, i) => {
        const splitAmong = people.filter(() => next(2) === 1).map((p) => p.id)
        return {
          id: `e${i}`,
          description: `gasto ${i}`,
          amount: 1 + next(100000),
          paidBy: people[next(people.length)].id,
          splitAmong: splitAmong.length > 0 ? splitAmong : [people[0].id],
        }
      })
      const start = computeBalances(people, expenses)
      const transfers = suggestTransfers(start)
      const withBalance = start.filter((b) => b.balance !== 0).length

      expect([...applyTransfers(start, transfers).values()].every((v) => v === 0)).toBe(true)
      expect(transfers.length).toBeLessThanOrEqual(Math.max(0, withBalance - 1))
      expect(transfers.every((t) => t.amount > 0 && t.from !== t.to)).toBe(true)
    }
  })
})
