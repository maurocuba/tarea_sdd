import { describe, expect, it } from 'vitest'
import { MESSAGES, validateExpense, validateName } from './validation'

describe('validateName (RQ-01)', () => {
  it('accepts a name and trims it', () => {
    expect(validateName('  Ana  ', [])).toEqual({ ok: true, name: 'Ana' })
  })

  it('rejects an empty name', () => {
    expect(validateName('   ', [])).toEqual({ ok: false, error: 'Ingresa un nombre.' })
  })

  it('accepts 30 characters and rejects 31', () => {
    expect(validateName('a'.repeat(30), [])).toEqual({ ok: true, name: 'a'.repeat(30) })
    expect(validateName('a'.repeat(31), [])).toEqual({ ok: false, error: 'El nombre puede tener hasta 30 caracteres.' })
  })

  it('rejects a repeated name ignoring case and outer spaces', () => {
    expect(validateName(' ana ', ['Ana', 'Beto'])).toEqual({
      ok: false,
      error: 'Ya existe un participante con ese nombre.',
    })
  })
})

describe('validateExpense (RQ-03)', () => {
  const valid = { description: ' Cena ', amount: '90,50', splitAmong: ['p1'] }

  it('accepts a valid expense and trims the description', () => {
    expect(validateExpense(valid)).toEqual({ ok: true, description: 'Cena', amount: 9050 })
  })

  it('accepts 60 characters of description and rejects 61 or none', () => {
    expect(validateExpense({ ...valid, description: 'x'.repeat(60) }).ok).toBe(true)
    expect(validateExpense({ ...valid, description: 'x'.repeat(61) })).toEqual({
      ok: false,
      errors: { description: 'Ingresa una descripción de hasta 60 caracteres.' },
    })
    expect(validateExpense({ ...valid, description: '  ' })).toEqual({
      ok: false,
      errors: { description: MESSAGES.description },
    })
  })

  it('rejects an invalid amount', () => {
    expect(validateExpense({ ...valid, amount: '0' })).toEqual({
      ok: false,
      errors: { amount: 'Ingresa un monto entre 0,01 y 1.000.000 con hasta 2 decimales.' },
    })
  })

  it('requires at least one person to split with', () => {
    expect(validateExpense({ ...valid, splitAmong: [] })).toEqual({
      ok: false,
      errors: { splitAmong: 'Elige al menos una persona.' },
    })
  })

  it('reports every invalid field at once', () => {
    expect(validateExpense({ description: '', amount: 'abc', splitAmong: [] })).toEqual({
      ok: false,
      errors: { description: MESSAGES.description, amount: MESSAGES.amount, splitAmong: MESSAGES.splitAmong },
    })
  })
})
