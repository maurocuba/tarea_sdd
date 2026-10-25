import { splitEqually } from './split'
import type { Balance, Expense, Participant } from './types'

/** Paid, consumed and balance of each participant, in list order (RQ-07). */
export function computeBalances(participants: Participant[], expenses: Expense[]): Balance[] {
  const paid = new Map<string, number>()
  const consumed = new Map<string, number>()

  for (const expense of expenses) {
    paid.set(expense.paidBy, (paid.get(expense.paidBy) ?? 0) + expense.amount)
    for (const [id, share] of splitEqually(expense.amount, expense.splitAmong)) {
      consumed.set(id, (consumed.get(id) ?? 0) + share)
    }
  }

  return participants.map(({ id }) => {
    const p = paid.get(id) ?? 0
    const c = consumed.get(id) ?? 0
    return { participantId: id, paid: p, consumed: c, balance: p - c }
  })
}
