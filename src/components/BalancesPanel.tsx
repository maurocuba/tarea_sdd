import { formatSigned } from '../domain/money'
import type { Balance, Participant } from '../domain/types'
import ui from './ui.module.css'

interface Props {
  participants: Participant[]
  balances: Balance[]
}

function status(balance: number): string {
  if (balance > 0) return 'le deben'
  if (balance < 0) return 'debe'
  return 'está al día'
}

/** Balance of each participant, in list order (RQ-07, RQ-09). */
export function BalancesPanel({ participants, balances }: Props) {
  const names = new Map(participants.map((p) => [p.id, p.name]))

  return (
    <section className={ui.panel} aria-labelledby="balances-heading">
      <h2 id="balances-heading" className={ui.heading}>
        Saldos
      </h2>

      {balances.length === 0 ? (
        <p className={ui.empty}>Todavía no hay participantes.</p>
      ) : (
        <ul className={ui.list}>
          {balances.map(({ participantId, balance }) => (
            <li key={participantId} className={ui.item}>
              <span className={ui.name}>{names.get(participantId)}</span>
              <span className={ui.balance} data-sign={Math.sign(balance)}>
                <span className={ui.amount}>{formatSigned(balance)}</span>
                <span className={ui.muted}>{status(balance)}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
