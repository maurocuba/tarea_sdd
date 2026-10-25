import { describe, expect, it } from 'vitest'
import { splitEqually } from './split'

describe('splitEqually (RQ-04)', () => {
  it('gives the leftover cents to the first people: Bs 10,00 among 3', () => {
    expect(splitEqually(1000, ['ana', 'beto', 'caro'])).toEqual(
      new Map([
        ['ana', 334],
        ['beto', 333],
        ['caro', 333],
      ]),
    )
  })

  it('splits evenly when there is no leftover', () => {
    expect([...splitEqually(900, ['a', 'b', 'c']).values()]).toEqual([300, 300, 300])
  })

  it('hands out several leftover cents one by one in order', () => {
    expect([...splitEqually(1003, ['a', 'b', 'c', 'd']).values()]).toEqual([251, 251, 251, 250])
  })

  it('gives everything to a single person', () => {
    expect(splitEqually(1234, ['a'])).toEqual(new Map([['a', 1234]]))
  })

  it('gives a cent only to the first people when the amount is smaller than the group', () => {
    expect([...splitEqually(2, ['a', 'b', 'c']).values()]).toEqual([1, 1, 0])
  })

  it('always adds up to the exact amount', () => {
    for (let amount = 1; amount <= 500; amount += 7) {
      for (let people = 1; people <= 20; people++) {
        const ids = Array.from({ length: people }, (_, i) => `p${i}`)
        const total = [...splitEqually(amount, ids).values()].reduce((sum, part) => sum + part, 0)
        expect(total).toBe(amount)
      }
    }
  })
})
