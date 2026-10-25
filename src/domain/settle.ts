import type { Balance, Transfer } from './types'

/**
 * Greedy settlement (RQ-08): while someone has a non-zero balance, the largest
 * debtor pays the largest creditor the smaller of both amounts. Each step
 * zeroes at least one of them, so k people with a balance need at most k - 1
 * transfers. Ties go to whoever comes first in the list.
 */
export function suggestTransfers(balances: Balance[]): Transfer[] {
  const remaining = balances.map((b) => ({ id: b.participantId, balance: b.balance }))
  const transfers: Transfer[] = []

  for (;;) {
    let debtor: (typeof remaining)[number] | undefined
    let creditor: (typeof remaining)[number] | undefined
    for (const person of remaining) {
      if (person.balance < 0 && (!debtor || person.balance < debtor.balance)) debtor = person
      if (person.balance > 0 && (!creditor || person.balance > creditor.balance)) creditor = person
    }
    if (!debtor || !creditor) return transfers

    const amount = Math.min(-debtor.balance, creditor.balance)
    transfers.push({ from: debtor.id, to: creditor.id, amount })
    debtor.balance += amount
    creditor.balance -= amount
  }
}
