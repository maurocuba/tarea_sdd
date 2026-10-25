export interface Participant {
  id: string
  name: string
}

export interface Expense {
  id: string
  description: string
  /** Integer cents. */
  amount: number
  /** Participant id. */
  paidBy: string
  /** Participant ids, in participant list order. */
  splitAmong: string[]
}

export interface Group {
  participants: Participant[]
  expenses: Expense[]
  /** Counter used to build the next participant or expense id. */
  nextId: number
}

export interface Balance {
  participantId: string
  paid: number
  consumed: number
  /** paid - consumed: positive is owed money, negative owes money. */
  balance: number
}

export interface Transfer {
  from: string
  to: string
  amount: number
}
