import styles from './App.module.css'
import { BalancesPanel } from './components/BalancesPanel'
import { ExpenseForm } from './components/ExpenseForm'
import { ExpenseList } from './components/ExpenseList'
import { ParticipantsPanel } from './components/ParticipantsPanel'
import { SettlementPanel } from './components/SettlementPanel'
import { computeBalances } from './domain/balances'
import { suggestTransfers } from './domain/settle'
import { isParticipantInUse } from './state/groupReducer'
import { useGroup } from './state/useGroup'

export default function App() {
  const { group, dispatch } = useGroup()
  const balances = computeBalances(group.participants, group.expenses)
  const transfers = suggestTransfers(balances)

  function clearAll() {
    if (window.confirm('¿Borrar todos los participantes y gastos?')) dispatch({ type: 'clearAll' })
  }

  return (
    <main className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}>Cuentas Claras</h1>
        {group.participants.length > 0 && (
          <button type="button" className={styles.clear} onClick={clearAll}>
            Borrar todo
          </button>
        )}
      </header>

      <div className={styles.columns}>
        <div className={styles.column}>
          <ParticipantsPanel
            participants={group.participants}
            isInUse={(id) => isParticipantInUse(group, id)}
            onAdd={(name) => dispatch({ type: 'addParticipant', name })}
            onRemove={(id) => dispatch({ type: 'removeParticipant', id })}
          />
          <ExpenseForm
            participants={group.participants}
            onAdd={(expense) => dispatch({ type: 'addExpense', expense })}
          />
        </div>
        <div className={styles.column}>
          <ExpenseList
            participants={group.participants}
            expenses={group.expenses}
            onRemove={(id) => dispatch({ type: 'removeExpense', id })}
          />
          <BalancesPanel participants={group.participants} balances={balances} />
          <SettlementPanel participants={group.participants} transfers={transfers} />
        </div>
      </div>
    </main>
  )
}
