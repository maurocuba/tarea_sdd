// All amounts are integer cents (CLAUDE.md: never do money math with floats).

/** Largest amount allowed for a single expense: Bs 1.000.000,00. */
export const MAX_AMOUNT = 100_000_000

// Digits, then an optional "." or "," followed by one or two digits.
const AMOUNT_PATTERN = /^(\d+)(?:[.,](\d{1,2}))?$/

/** Reads a typed amount (RQ-03). Returns cents, or null when it is not valid. */
export function parseAmount(text: string): number | null {
  const match = AMOUNT_PATTERN.exec(text.trim())
  if (!match) return null
  const [, whole, fraction = ''] = match
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, '0'))
  if (cents < 1 || cents > MAX_AMOUNT) return null
  return cents
}

/** "Bs 1.234,50" (RQ-09). Negative amounts get a leading "-". */
export function formatAmount(cents: number): string {
  const sign = cents < 0 ? '-' : ''
  const abs = Math.abs(cents)
  const whole = Math.floor(abs / 100)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  const fraction = (abs % 100).toString().padStart(2, '0')
  return `${sign}Bs ${whole},${fraction}`
}

/** Balance format (RQ-09): "+Bs 20,00", "-Bs 5,00" or "Bs 0,00". */
export function formatSigned(cents: number): string {
  return cents > 0 ? `+${formatAmount(cents)}` : formatAmount(cents)
}
