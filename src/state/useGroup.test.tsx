import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { STORAGE_KEY, loadGroup } from './storage'
import { useGroup } from './useGroup'

describe('useGroup (RQ-10)', () => {
  it('starts from the stored group', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ participants: [{ id: 'p1', name: 'Ana' }], expenses: [], nextId: 2 }),
    )
    const { result } = renderHook(() => useGroup())
    expect(result.current.group.participants).toEqual([{ id: 'p1', name: 'Ana' }])
  })

  it('saves after every change', () => {
    const { result } = renderHook(() => useGroup())
    act(() => result.current.dispatch({ type: 'addParticipant', name: 'Ana' }))
    expect(loadGroup().participants).toEqual([{ id: 'p1', name: 'Ana' }])

    act(() =>
      result.current.dispatch({
        type: 'addExpense',
        expense: { description: 'Pan', amount: 300, paidBy: 'p1', splitAmong: ['p1'] },
      }),
    )
    expect(loadGroup().expenses).toHaveLength(1)

    act(() => result.current.dispatch({ type: 'clearAll' }))
    expect(loadGroup()).toEqual({ participants: [], expenses: [], nextId: 1 })
  })

  it('restores the group after a remount, like a page reload', () => {
    const first = renderHook(() => useGroup())
    act(() => first.result.current.dispatch({ type: 'addParticipant', name: 'Beto' }))
    first.unmount()

    const second = renderHook(() => useGroup())
    expect(second.result.current.group.participants).toEqual([{ id: 'p1', name: 'Beto' }])
  })
})
