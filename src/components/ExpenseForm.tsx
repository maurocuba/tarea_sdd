import { useRef, useState, type FormEvent } from 'react'
import type { Participant } from '../domain/types'
import { validateExpense, type ExpenseErrors } from '../domain/validation'
import type { NewExpense } from '../state/groupReducer'
import ui from './ui.module.css'

interface Props {
  participants: Participant[]
  onAdd: (expense: NewExpense) => void
}

/** Form to register an expense (RQ-03). */
export function ExpenseForm({ participants, onAdd }: Props) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [paidBy, setPaidBy] = useState<string | null>(null)
  // Unchecked ids instead of checked ones, so new participants start checked.
  const [excluded, setExcluded] = useState<ReadonlySet<string>>(new Set())
  const [errors, setErrors] = useState<ExpenseErrors>({})
  const descriptionRef = useRef<HTMLInputElement>(null)

  if (participants.length === 0) {
    return (
      <section className={ui.panel} aria-labelledby="expense-form-heading">
        <h2 id="expense-form-heading" className={ui.heading}>
          Nuevo gasto
        </h2>
        <p className={ui.empty}>Agrega participantes para registrar gastos.</p>
      </section>
    )
  }

  const payer = participants.some((p) => p.id === paidBy) ? paidBy! : participants[0].id
  const splitAmong = participants.filter((p) => !excluded.has(p.id)).map((p) => p.id)

  function toggle(id: string) {
    const next = new Set(excluded)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setExcluded(next)
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const result = validateExpense({ description, amount, splitAmong })
    if (!result.ok) {
      setErrors(result.errors)
      return
    }
    onAdd({ description: result.description, amount: result.amount, paidBy: payer, splitAmong })
    setDescription('')
    setAmount('')
    setExcluded(new Set())
    setErrors({})
    descriptionRef.current?.focus()
  }

  return (
    <section className={ui.panel} aria-labelledby="expense-form-heading">
      <h2 id="expense-form-heading" className={ui.heading}>
        Nuevo gasto
      </h2>

      <form className={ui.form} onSubmit={handleSubmit} noValidate>
        <div className={ui.field}>
          <label className={ui.label} htmlFor="expense-description">
            Descripción
          </label>
          <input
            ref={descriptionRef}
            id="expense-description"
            className={ui.input}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            autoComplete="off"
            aria-invalid={errors.description !== undefined}
            aria-describedby={errors.description ? 'expense-description-error' : undefined}
          />
          {errors.description && (
            <p id="expense-description-error" className={ui.error}>
              {errors.description}
            </p>
          )}
        </div>

        <div className={ui.row}>
          <div className={ui.field}>
            <label className={ui.label} htmlFor="expense-amount">
              Monto (Bs)
            </label>
            <input
              id="expense-amount"
              className={ui.input}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              inputMode="decimal"
              autoComplete="off"
              aria-invalid={errors.amount !== undefined}
              aria-describedby={errors.amount ? 'expense-amount-error' : undefined}
            />
            {errors.amount && (
              <p id="expense-amount-error" className={ui.error}>
                {errors.amount}
              </p>
            )}
          </div>

          <div className={ui.field}>
            <label className={ui.label} htmlFor="expense-paid-by">
              Pagó
            </label>
            <select
              id="expense-paid-by"
              className={ui.input}
              value={payer}
              onChange={(event) => setPaidBy(event.target.value)}
            >
              {participants.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <fieldset
          className={ui.fieldset}
          aria-describedby={errors.splitAmong ? 'expense-split-error' : undefined}
        >
          <legend className={ui.label}>Dividir entre</legend>
          <div className={ui.checks}>
            {participants.map((p) => (
              <label key={p.id} className={ui.check}>
                <input type="checkbox" checked={!excluded.has(p.id)} onChange={() => toggle(p.id)} />
                {p.name}
              </label>
            ))}
          </div>
          {errors.splitAmong && (
            <p id="expense-split-error" className={ui.error}>
              {errors.splitAmong}
            </p>
          )}
        </fieldset>

        <div>
          <button type="submit" className={ui.button}>
            Registrar gasto
          </button>
        </div>
      </form>
    </section>
  )
}
