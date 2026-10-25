import { parseAmount } from './money'

export const MAX_NAME_LENGTH = 30
export const MAX_PARTICIPANTS = 20
export const MAX_DESCRIPTION_LENGTH = 60

// Visible texts, word for word from the spec (RQ-01, RQ-03).
export const MESSAGES = {
  emptyName: 'Ingresa un nombre.',
  longName: 'El nombre puede tener hasta 30 caracteres.',
  repeatedName: 'Ya existe un participante con ese nombre.',
  description: 'Ingresa una descripción de hasta 60 caracteres.',
  amount: 'Ingresa un monto entre 0,01 y 1.000.000 con hasta 2 decimales.',
  splitAmong: 'Elige al menos una persona.',
} as const

export type NameResult = { ok: true; name: string } | { ok: false; error: string }

/** Checks a new participant name against the existing ones (RQ-01). */
export function validateName(raw: string, existingNames: string[]): NameResult {
  const name = raw.trim()
  if (name.length === 0) return { ok: false, error: MESSAGES.emptyName }
  if (name.length > MAX_NAME_LENGTH) return { ok: false, error: MESSAGES.longName }
  const key = name.toLowerCase()
  if (existingNames.some((existing) => existing.toLowerCase() === key)) {
    return { ok: false, error: MESSAGES.repeatedName }
  }
  return { ok: true, name }
}

export function isValidDescription(description: string): boolean {
  const length = description.trim().length
  return length >= 1 && length <= MAX_DESCRIPTION_LENGTH
}

export interface ExpenseDraft {
  description: string
  amount: string
  splitAmong: string[]
}

export type ExpenseErrors = Partial<Record<'description' | 'amount' | 'splitAmong', string>>

export type ExpenseResult = { ok: true; description: string; amount: number } | { ok: false; errors: ExpenseErrors }

/** Checks every field of the expense form at once (RQ-03, all or nothing). */
export function validateExpense(draft: ExpenseDraft): ExpenseResult {
  const errors: ExpenseErrors = {}
  const amount = parseAmount(draft.amount)
  if (!isValidDescription(draft.description)) errors.description = MESSAGES.description
  if (amount === null) errors.amount = MESSAGES.amount
  if (draft.splitAmong.length === 0) errors.splitAmong = MESSAGES.splitAmong

  if (amount === null || Object.keys(errors).length > 0) return { ok: false, errors }
  return { ok: true, description: draft.description.trim(), amount }
}
