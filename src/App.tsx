import styles from './App.module.css'
import { ParticipantsPanel } from './components/ParticipantsPanel'
import { isParticipantInUse } from './state/groupReducer'
import { useGroup } from './state/useGroup'

export default function App() {
  const { group, dispatch } = useGroup()

  return (
    <main className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}>Cuentas Claras</h1>
      </header>

      <div className={styles.columns}>
        <div className={styles.column}>
          <ParticipantsPanel
            participants={group.participants}
            isInUse={(id) => isParticipantInUse(group, id)}
            onAdd={(name) => dispatch({ type: 'addParticipant', name })}
            onRemove={(id) => dispatch({ type: 'removeParticipant', id })}
          />
        </div>
        <div className={styles.column} />
      </div>
    </main>
  )
}
