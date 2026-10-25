import { describe, expect, it } from 'vitest'
import type { Group } from '../domain/types'
import { MAX_PARTICIPANTS } from '../domain/validation'
import { emptyGroup, groupReducer, isParticipantInUse, type GroupAction } from './groupReducer'

function run(...actions: GroupAction[]): Group {
  return actions.reduce(groupReducer, emptyGroup())
}

const add = (name: string): GroupAction => ({ type: 'addParticipant', name })

describe('groupReducer', () => {
  it('starts with no participants and no expenses', () => {
    expect(emptyGroup()).toEqual({ participants: [], expenses: [], nextId: 1 })
  })

  describe('addParticipant (RQ-01)', () => {
    it('adds trimmed names at the end of the list with fresh ids', () => {
      expect(run(add(' Ana '), add('Beto')).participants).toEqual([
        { id: 'p1', name: 'Ana' },
        { id: 'p2', name: 'Beto' },
      ])
    })

    it('ignores invalid or repeated names', () => {
      const group = run(add('Ana'), add('ANA'), add(''), add('x'.repeat(31)))
      expect(group.participants.map((p) => p.name)).toEqual(['Ana'])
    })

    it('stops at the maximum number of participants', () => {
      const names = Array.from({ length: MAX_PARTICIPANTS + 1 }, (_, i) => add(`P${i}`))
      expect(MAX_PARTICIPANTS).toBe(20)
      expect(run(...names).participants).toHaveLength(MAX_PARTICIPANTS)
    })
  })

  describe('addExpense (RQ-03)', () => {
    const base = run(add('Ana'), add('Beto'), add('Caro'))

    it('adds the expense with splitAmong in participant list order', () => {
      const group = groupReducer(base, {
        type: 'addExpense',
        expense: { description: ' Cena ', amount: 1000, paidBy: 'p2', splitAmong: ['p3', 'p1', 'p3'] },
      })
      expect(group.expenses).toEqual([
        { id: 'e4', description: 'Cena', amount: 1000, paidBy: 'p2', splitAmong: ['p1', 'p3'] },
      ])
    })

    it('ignores expenses that break the model', () => {
      const bad = [
        { description: 'Cena', amount: 1000, paidBy: 'nadie', splitAmong: ['p1'] },
        { description: 'Cena', amount: 1000, paidBy: 'p1', splitAmong: [] },
        { description: 'Cena', amount: 1000, paidBy: 'p1', splitAmong: ['nadie'] },
        { description: 'Cena', amount: 0, paidBy: 'p1', splitAmong: ['p1'] },
        { description: 'Cena', amount: 100000001, paidBy: 'p1', splitAmong: ['p1'] },
        { description: 'Cena', amount: 10.5, paidBy: 'p1', splitAmong: ['p1'] },
        { description: ' ', amount: 1000, paidBy: 'p1', splitAmong: ['p1'] },
        { description: 'x'.repeat(61), amount: 1000, paidBy: 'p1', splitAmong: ['p1'] },
      ]
      for (const expense of bad) {
        expect(groupReducer(base, { type: 'addExpense', expense })).toBe(base)
      }
    })
  })

  describe('removeParticipant (RQ-02)', () => {
    it('removes a participant without expenses', () => {
      const group = run(add('Ana'), add('Beto'), { type: 'removeParticipant', id: 'p1' })
      expect(group.participants).toEqual([{ id: 'p2', name: 'Beto' }])
    })

    it('keeps a participant who paid or shares an expense', () => {
      const group = run(add('Ana'), add('Beto'), add('Caro'), {
        type: 'addExpense',
        expense: { description: 'Taxi', amount: 500, paidBy: 'p1', splitAmong: ['p2'] },
      })
      expect(isParticipantInUse(group, 'p1')).toBe(true)
      expect(isParticipantInUse(group, 'p2')).toBe(true)
      expect(isParticipantInUse(group, 'p3')).toBe(false)
      expect(groupReducer(group, { type: 'removeParticipant', id: 'p1' })).toBe(group)
      expect(groupReducer(group, { type: 'removeParticipant', id: 'p2' })).toBe(group)
      expect(groupReducer(group, { type: 'removeParticipant', id: 'p3' }).participants).toHaveLength(2)
    })
  })

  describe('removeExpense (RQ-06)', () => {
    it('removes only that expense', () => {
      const expense = { description: 'Taxi', amount: 500, paidBy: 'p1', splitAmong: ['p1'] }
      const group = run(
        add('Ana'),
        { type: 'addExpense', expense },
        { type: 'addExpense', expense: { ...expense, description: 'Pan' } },
        { type: 'removeExpense', id: 'e2' },
      )
      expect(group.expenses.map((e) => e.description)).toEqual(['Pan'])
      expect(isParticipantInUse(group, 'p1')).toBe(true)
    })
  })

  describe('clearAll (RQ-12)', () => {
    it('goes back to the initial state', () => {
      const group = run(
        add('Ana'),
        { type: 'addExpense', expense: { description: 'Taxi', amount: 500, paidBy: 'p1', splitAmong: ['p1'] } },
        { type: 'clearAll' },
      )
      expect(group).toEqual(emptyGroup())
    })
  })
})
