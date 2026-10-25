import { describe, expect, it } from 'vitest'
import { MAX_AMOUNT, formatAmount, formatSigned, parseAmount } from './money'

describe('parseAmount (RQ-03)', () => {
  it.each([
    ['12', 1200],
    ['12.5', 1250],
    ['12,50', 1250],
    [' 0,01 ', 1],
    ['0.10', 10],
    ['1000000', 100000000],
    ['1000000,00', 100000000],
    ['007', 700],
  ])('reads %j as %i cents', (text, cents) => {
    expect(parseAmount(text)).toBe(cents)
  })

  it.each(['', '   ', '0', '0,00', '0,001', '1.000,00', '1,000.00', '-5', '+5', 'abc', '12,', ',5', '1000000,01', '1e3', '12 50'])(
    'rejects %j',
    (text) => {
      expect(parseAmount(text)).toBeNull()
    },
  )

  it('keeps cents exact without floating point errors', () => {
    expect(parseAmount('0.29')).toBe(29)
    expect(parseAmount('1.15')).toBe(115)
    expect(parseAmount('4.35')).toBe(435)
  })

  it('caps the amount at Bs 1.000.000', () => {
    expect(MAX_AMOUNT).toBe(100000000)
  })
})

describe('formatAmount (RQ-09)', () => {
  it.each([
    [0, 'Bs 0,00'],
    [5, 'Bs 0,05'],
    [1250, 'Bs 12,50'],
    [99999, 'Bs 999,99'],
    [123450, 'Bs 1.234,50'],
    [100000000, 'Bs 1.000.000,00'],
  ])('formats %i cents as %j', (cents, text) => {
    expect(formatAmount(cents)).toBe(text)
  })

  it('formats negative amounts with a leading minus', () => {
    expect(formatAmount(-500)).toBe('-Bs 5,00')
  })
})

describe('formatSigned (RQ-09)', () => {
  it.each([
    [2000, '+Bs 20,00'],
    [-500, '-Bs 5,00'],
    [0, 'Bs 0,00'],
    [-123450, '-Bs 1.234,50'],
  ])('formats %i cents as %j', (cents, text) => {
    expect(formatSigned(cents)).toBe(text)
  })
})
