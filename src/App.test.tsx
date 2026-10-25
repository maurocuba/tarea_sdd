import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'

function participantNames() {
  const section = screen.getByRole('region', { name: 'Participantes' })
  return within(section)
    .queryAllByRole('listitem')
    .map((li) => li.querySelector('span span')?.textContent)
}

describe('App', () => {
  it('shows the app title', () => {
    render(<App />)
    expect(screen.getByRole('heading', { level: 1, name: 'Cuentas Claras' })).toBeInTheDocument()
  })

  it('adds and removes participants (RQ-01, RQ-02)', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByLabelText('Nombre'), 'Ana{Enter}Beto{Enter}')
    expect(participantNames()).toEqual(['Ana', 'Beto'])

    await user.click(screen.getByRole('button', { name: 'Eliminar Ana' }))
    expect(participantNames()).toEqual(['Beto'])
  })

  it('keeps participants after a reload (RQ-10)', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<App />)
    await user.type(screen.getByLabelText('Nombre'), 'Ana{Enter}')
    unmount()

    render(<App />)
    expect(participantNames()).toEqual(['Ana'])
  })
})
