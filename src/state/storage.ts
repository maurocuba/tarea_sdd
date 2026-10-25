import { MAX_AMOUNT } from '../domain/money'
import type { Expense, Group, Participant } from '../domain/types'
import { MAX_PARTICIPANTS, isValidDescription, validateName } from '../domain/validation'
import { emptyGroup } from './groupReducer'

export const STORAGE_KEY = 'cuentas-claras.v1'

const ID_PATTERN = /^[pe](\d+)$/

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

// Rebuilds a Group from parsed JSON, or returns null if anything is off
// (RQ-10): shape, types, ranges, unique names and ids, and references.
function parseGroup(data: unknown): Group | null {
  if (!isRecord(data) || !Array.isArray(data.participants) || !Array.isArray(data.expenses)) return null
  const { nextId } = data
  if (typeof nextId !== 'number' || !Number.isInteger(nextId) || nextId < 1) return null
  if (data.participants.length > MAX_PARTICIPANTS) return null

  const seenIds = new Set<string>()
  const claimId = (id: unknown): id is string => {
    if (typeof id !== 'string' || seenIds.has(id)) return false
    const match = ID_PATTERN.exec(id)
    if (!match || Number(match[1]) >= nextId) return false
    seenIds.add(id)
    return true
  }

  const participants: Participant[] = []
  for (const item of data.participants) {
    if (!isRecord(item) || !claimId(item.id) || typeof item.name !== 'string') return null
    const result = validateName(
      item.name,
      participants.map((p) => p.name),
    )
    if (!result.ok || result.name !== item.name) return null
    participants.push({ id: item.id, name: item.name })
  }

  const participantIds = new Set(participants.map((p) => p.id))
  const expenses: Expense[] = []
  for (const item of data.expenses) {
    if (!isRecord(item) || !claimId(item.id)) return null
    const { description, amount, paidBy, splitAmong } = item
    if (typeof description !== 'string' || !isValidDescription(description) || description !== description.trim()) {
      return null
    }
    if (typeof amount !== 'number' || !Number.isInteger(amount) || amount < 1 || amount > MAX_AMOUNT) return null
    if (typeof paidBy !== 'string' || !participantIds.has(paidBy)) return null
    if (!isStringArray(splitAmong) || splitAmong.length === 0 || new Set(splitAmong).size !== splitAmong.length) {
      return null
    }
    if (!splitAmong.every((id) => participantIds.has(id))) return null
    expenses.push({ id: item.id, description, amount, paidBy, splitAmong: [...splitAmong] })
  }

  return { participants, expenses, nextId }
}

/** Stored group, or the empty group when there is none or it is invalid. */
export function loadGroup(): Group {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) return emptyGroup()
    return parseGroup(JSON.parse(raw)) ?? emptyGroup()
  } catch {
    return emptyGroup()
  }
}

/** Saves the group; a storage that cannot be written is ignored (RQ-10). */
export function saveGroup(group: Group): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(group))
  } catch {
    // Keep working without persistence.
  }
}
