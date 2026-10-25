import { useRef, useState, type FormEvent } from 'react'
import type { Participant } from '../domain/types'
import { MAX_PARTICIPANTS, validateName } from '../domain/validation'
import ui from './ui.module.css'

interface Props {
  participants: Participant[]
  isInUse: (id: string) => boolean
  onAdd: (name: string) => void
  onRemove: (id: string) => void
}

/** Add and remove participants (RQ-01, RQ-02). */
export function ParticipantsPanel({ participants, isInUse, onAdd, onRemove }: Props) {
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const full = participants.length >= MAX_PARTICIPANTS

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const result = validateName(
      name,
      participants.map((p) => p.name),
    )
    if (!result.ok) {
      setError(result.error)
      return
    }
    onAdd(result.name)
    setName('')
    setError(null)
    inputRef.current?.focus()
  }

  const describedBy = error ? 'participant-name-error' : full ? 'participant-name-full' : undefined

  return (
    <section className={ui.panel} aria-labelledby="participants-heading">
      <h2 id="participants-heading" className={ui.heading}>
        Participantes
      </h2>

      <form className={ui.form} onSubmit={handleSubmit} noValidate>
        <div className={ui.row}>
          <div className={ui.field}>
            <label className={ui.label} htmlFor="participant-name">
              Nombre
            </label>
            <input
              ref={inputRef}
              id="participant-name"
              className={ui.input}
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={full}
              autoComplete="off"
              aria-invalid={error !== null}
              aria-describedby={describedBy}
            />
            {error && (
              <p id="participant-name-error" className={ui.error}>
                {error}
              </p>
            )}
            {full && (
              <p id="participant-name-full" className={ui.hint}>
                Máximo 20 participantes.
              </p>
            )}
          </div>
          <button type="submit" className={`${ui.button} ${ui.rowButton}`} disabled={full}>
            Agregar
          </button>
        </div>
      </form>

      {participants.length === 0 ? (
        <p className={ui.empty}>Todavía no hay participantes.</p>
      ) : (
        <ul className={`${ui.list} ${ui.spaced}`}>
          {participants.map((participant) => {
            const inUse = isInUse(participant.id)
            return (
              <li key={participant.id} className={ui.item}>
                <span>
                  <span className={ui.name}>{participant.name}</span>
                  {inUse && <span className={ui.tag}>Tiene gastos registrados</span>}
                </span>
                <button
                  type="button"
                  className={ui.secondary}
                  aria-label={`Eliminar ${participant.name}`}
                  disabled={inUse}
                  onClick={() => onRemove(participant.id)}
                >
                  Eliminar
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
