import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Group } from '../domain/types'
import { emptyGroup } from './groupReducer'
import { STORAGE_KEY, loadGroup, saveGroup } from './storage'

const group: Group = {
  participants: [
    { id: 'p1', name: 'Ana' },
    { id: 'p2', name: 'Beto' },
  ],
  expenses: [{ id: 'e3', description: 'Cena', amount: 9050, paidBy: 'p1', splitAmong: ['p1', 'p2'] }],
  nextId: 4,
}

function stored(value: unknown) {
  localStorage.setItem(STORAGE_KEY, typeof value === 'string' ? value : JSON.stringify(value))
}

// jsdom's Storage keeps its methods on the prototype; the in-memory fallback
// from setupTests keeps them on its own class. Spy where the method lives.
function storageTarget(): Storage {
  return localStorage instanceof Storage ? Storage.prototype : localStorage
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('storage (RQ-10)', () => {
  it('saves and loads a group as it was', () => {
    saveGroup(group)
    expect(loadGroup()).toEqual(group)
  })

  it('uses the key cuentas-claras.v1', () => {
    expect(STORAGE_KEY).toBe('cuentas-claras.v1')
  })

  it('starts empty when nothing is stored', () => {
    expect(loadGroup()).toEqual(emptyGroup())
  })

  it.each([
    ['broken JSON', '{"participants": ['],
    ['not an object', [1, 2]],
    ['null', null],
    ['missing expenses', { participants: [], nextId: 1 }],
    ['a participant without a name', { ...group, participants: [{ id: 'p1' }] }],
    ['an empty name', { ...group, participants: [{ id: 'p1', name: ' ' }, { id: 'p2', name: 'Beto' }] }],
    ['repeated names', { ...group, participants: [{ id: 'p1', name: 'Ana' }, { id: 'p2', name: 'ana' }] }],
    ['repeated ids', { ...group, participants: [{ id: 'p1', name: 'Ana' }, { id: 'p1', name: 'Beto' }] }],
    ['too many participants', { ...group, expenses: [], participants: Array.from({ length: 21 }, (_, i) => ({ id: `p${i}`, name: `P${i}` })) }],
    ['an amount in decimals', { ...group, expenses: [{ ...group.expenses[0], amount: 90.5 }] }],
    ['an amount out of range', { ...group, expenses: [{ ...group.expenses[0], amount: 100000001 }] }],
    ['an empty description', { ...group, expenses: [{ ...group.expenses[0], description: '' }] }],
    ['an unknown payer', { ...group, expenses: [{ ...group.expenses[0], paidBy: 'p9' }] }],
    ['an unknown person in the split', { ...group, expenses: [{ ...group.expenses[0], splitAmong: ['p1', 'p9'] }] }],
    ['an empty split', { ...group, expenses: [{ ...group.expenses[0], splitAmong: [] }] }],
    ['a bad nextId', { ...group, nextId: 'x' }],
    ['a nextId that would reuse ids', { ...group, nextId: 2 }],
  ])('starts empty with %s', (_, value) => {
    stored(value)
    expect(loadGroup()).toEqual(emptyGroup())
  })

  it('starts empty when the storage cannot be read', () => {
    vi.spyOn(storageTarget(), 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    expect(loadGroup()).toEqual(emptyGroup())
  })

  it('does not throw when the storage cannot be written', () => {
    vi.spyOn(storageTarget(), 'setItem').mockImplementation(() => {
      throw new Error('full')
    })
    expect(() => saveGroup(group)).not.toThrow()
  })
})
