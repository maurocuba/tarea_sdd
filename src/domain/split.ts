/**
 * Splits an amount in cents equally (RQ-04). Each person gets floor(amount / n)
 * and the leftover cents go one by one to the first people, in the given order.
 */
export function splitEqually(amount: number, participantIds: string[]): Map<string, number> {
  const n = participantIds.length
  const base = Math.floor(amount / n)
  const leftover = amount % n
  return new Map(participantIds.map((id, index) => [id, base + (index < leftover ? 1 : 0)]))
}
