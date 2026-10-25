import { formatAmount } from '../domain/money'
import type { Expense, Participant } from '../domain/types'
import ui from './ui.module.css'

interface Props {
  participants: Participant[]
  expenses: Expense[]
  onRemove: (id: string) => void
}

/** Expenses, newest first, with the total spent (RQ-05, RQ-06). */
export function ExpenseList({ participants, expenses, onRemove }: Props) {
  const names = new Map(participants.map((p) => [p.id, p.name]))
  const total = expenses.reduce((sum, e) => sum + e.amount, 0)

  function remove(expense: Expense) {
    if (window.confirm(`¿Eliminar el gasto "${expense.description}"?`)) onRemove(expense.id)
  }

  return (
    <section className={ui.panel} aria-labelledby="expenses-heading">
      <h2 id="expenses-heading" className={ui.heading}>
        Gastos
      </h2>

      {expenses.length === 0 ? (
        <p className={ui.empty}>Todavía no hay gastos.</p>
      ) : (
        <ul className={ui.list}>
          {[...expenses].reverse().map((expense) => (
            <li key={expense.id} className={ui.item}>
              <div className={ui.expense}>
                <div className={ui.expenseTop}>
                  <span className={ui.name}>{expense.description}</span>
                  <span className={ui.amount}>{formatAmount(expense.amount)}</span>
                </div>
                <span className={ui.muted}>Pagó {names.get(expense.paidBy)}</span>
                <span className={ui.muted}>Entre: {expense.splitAmong.map((id) => names.get(id)).join(', ')}</span>
              </div>
              <button
                type="button"
                className={ui.secondary}
                aria-label={`Eliminar gasto ${expense.description}`}
                onClick={() => remove(expense)}
              >
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className={ui.total}>Total gastado: {formatAmount(total)}</p>
    </section>
  )
}
