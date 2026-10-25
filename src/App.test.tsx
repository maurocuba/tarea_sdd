import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'

function participantNames() {
  const section = screen.getByRole('region', { name: 'Participantes' })
  return within(section)
    .queryAllByRole('listitem')
    .map((li) => li.querySelector('span span')?.textContent)
}

async function addPeople(user: ReturnType<typeof userEvent.setup>, ...names: string[]) {
  for (const name of names) await user.type(screen.getByLabelText('Nombre'), `${name}{Enter}`)
}

async function addExpense(user: ReturnType<typeof userEvent.setup>, description: string, amount: string) {
  await user.type(screen.getByLabelText('Descripción'), description)
  await user.type(screen.getByLabelText('Monto (Bs)'), `${amount}{Enter}`)
}

afterEach(() => {
  vi.restoreAllMocks()
})

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

  it('registers expenses and lists them newest first (RQ-03, RQ-05)', async () => {
    const user = userEvent.setup()
    render(<App />)
    await addPeople(user, 'Ana', 'Beto')
    await addExpense(user, 'Cena', '90')
    await addExpense(user, 'Taxi', '10,5')

    const list = screen.getByRole('region', { name: 'Gastos' })
    expect(
      within(list)
        .getAllByRole('listitem')
        .map((li) => li.querySelector('span')?.textContent),
    ).toEqual(['Taxi', 'Cena'])
    expect(within(list).getByText('Total gastado: Bs 100,50')).toBeInTheDocument()
  })

  it('blocks removing a participant with expenses until the expense is removed (RQ-02, RQ-06)', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const user = userEvent.setup()
    render(<App />)
    await addPeople(user, 'Ana', 'Beto')
    await addExpense(user, 'Cena', '90')
    expect(screen.getByRole('button', { name: 'Eliminar Ana' })).toBeDisabled()
    expect(screen.getAllByText('Tiene gastos registrados')).toHaveLength(2)

    await user.click(screen.getByRole('button', { name: 'Eliminar gasto Cena' }))
    expect(screen.getByText('Todavía no hay gastos.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Eliminar Ana' })).toBeEnabled()
  })

  it('shows a new participant checked in the expense form (RQ-03)', async () => {
    const user = userEvent.setup()
    render(<App />)
    await addPeople(user, 'Ana')
    await user.click(screen.getByRole('checkbox', { name: 'Ana' }))
    await addPeople(user, 'Beto')
    expect(screen.getByRole('checkbox', { name: 'Ana' })).not.toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Beto' })).toBeChecked()
  })
})
