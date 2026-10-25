import { MAX_AMOUNT } from '../domain/money'
import type { Expense, Group } from '../domain/types'
import { MAX_PARTICIPANTS, isValidDescription, validateName } from '../domain/validation'

export type NewExpense = Omit<Expense, 'id'>

export type GroupAction =
  | { type: 'addParticipant'; name: string }
  | { type: 'removeParticipant'; id: string }
  | { type: 'addExpense'; expense: NewExpense }
  | { type: 'removeExpense'; id: string }
  | { type: 'clearAll' }

export function emptyGroup(): Group {
  return { participants: [], expenses: [], nextId: 1 }
}

/** A participant is in use when they paid or share any expense (RQ-02). */
export function isParticipantInUse(group: Group, id: string): boolean {
  return group.expenses.some((e) => e.paidBy === id || e.splitAmong.includes(id))
}

// The UI validates before dispatching, but the reducer still refuses anything
// that would leave the group inconsistent and returns the same state.
export function groupReducer(group: Group, action: GroupAction): Group {
  switch (action.type) {
    case 'addParticipant': {
      if (group.participants.length >= MAX_PARTICIPANTS) return group
      const result = validateName(
        action.name,
        group.participants.map((p) => p.name),
      )
      if (!result.ok) return group
      return {
        ...group,
        participants: [...group.participants, { id: `p${group.nextId}`, name: result.name }],
        nextId: group.nextId + 1,
      }
    }

    case 'removeParticipant': {
      if (isParticipantInUse(group, action.id)) return group
      return { ...group, participants: group.participants.filter((p) => p.id !== action.id) }
    }

    case 'addExpense': {
      const { description, amount, paidBy, splitAmong } = action.expense
      const ids = group.participants.map((p) => p.id)
      const validAmount = Number.isInteger(amount) && amount >= 1 && amount <= MAX_AMOUNT
      const validPeople = ids.includes(paidBy) && splitAmong.length > 0 && splitAmong.every((id) => ids.includes(id))
      if (!isValidDescription(description) || !validAmount || !validPeople) return group

      const expense: Expense = {
        id: `e${group.nextId}`,
        description: description.trim(),
        amount,
        paidBy,
        // Participant list order, without repeats (RQ-04, RQ-05).
        splitAmong: ids.filter((id) => splitAmong.includes(id)),
      }
      return { ...group, expenses: [...group.expenses, expense], nextId: group.nextId + 1 }
    }

    case 'removeExpense':
      return { ...group, expenses: group.expenses.filter((e) => e.id !== action.id) }

    case 'clearAll':
      return emptyGroup()
  }
}
