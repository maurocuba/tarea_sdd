import { formatAmount } from '../domain/money'
import type { Participant, Transfer } from '../domain/types'
import ui from './ui.module.css'

interface Props {
  participants: Participant[]
  transfers: Transfer[]
}

/** Suggested transfers to settle the group (RQ-08). */
export function SettlementPanel({ participants, transfers }: Props) {
  const names = new Map(participants.map((p) => [p.id, p.name]))

  return (
    <section className={ui.panel} aria-labelledby="settlement-heading">
      <h2 id="settlement-heading" className={ui.heading}>
        Cómo saldar cuentas
      </h2>

      {transfers.length === 0 ? (
        <p className={ui.empty}>No hay deudas pendientes.</p>
      ) : (
        <ol className={ui.list}>
          {transfers.map((t) => (
            <li key={`${t.from}-${t.to}`} className={ui.item}>
              <span>
                <span className={ui.name}>{names.get(t.from)}</span> paga{' '}
                <span className={ui.amount}>{formatAmount(t.amount)}</span> a{' '}
                <span className={ui.name}>{names.get(t.to)}</span>
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
