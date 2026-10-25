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

  it('settles a dinner among three friends (RQ-04, RQ-07, RQ-08)', async () => {
    const user = userEvent.setup()
    render(<App />)
    await addPeople(user, 'Ana', 'Beto', 'Caro')
    await addExpense(user, 'Cena', '90')
    await user.selectOptions(screen.getByLabelText('Pagó'), 'Beto')
    await addExpense(user, 'Taxi', '30')
    await user.selectOptions(screen.getByLabelText('Pagó'), 'Caro')
    await user.click(screen.getByRole('checkbox', { name: 'Ana' }))
    await addExpense(user, 'Helado', '10')

    const balances = within(screen.getByRole('region', { name: 'Saldos' }))
      .getAllByRole('listitem')
      .map((li) => li.textContent)
    expect(balances).toEqual(['Ana+Bs 50,00le deben', 'Beto-Bs 15,00debe', 'Caro-Bs 35,00debe'])

    const transfers = within(screen.getByRole('region', { name: 'Cómo saldar cuentas' }))
      .getAllByRole('listitem')
      .map((li) => li.textContent)
    expect(transfers).toEqual(['Caro paga Bs 35,00 a Ana', 'Beto paga Bs 15,00 a Ana'])
  })

  it('splits Bs 10,00 among three with the extra cent to the first (RQ-04)', async () => {
    const user = userEvent.setup()
    render(<App />)
    await addPeople(user, 'Ana', 'Beto', 'Caro')
    await user.selectOptions(screen.getByLabelText('Pagó'), 'Caro')
    await addExpense(user, 'Pizza', '10')
    expect(screen.getByRole('region', { name: 'Cómo saldar cuentas' })).toHaveTextContent(
      'Ana paga Bs 3,34 a CaroBeto paga Bs 3,33 a Caro',
    )
  })

  it('says there are no pending debts when everyone is even (RQ-08)', async () => {
    const user = userEvent.setup()
    render(<App />)
    await addPeople(user, 'Ana')
    await addExpense(user, 'Pan', '5')
    expect(screen.getByText('No hay deudas pendientes.')).toBeInTheDocument()
    expect(screen.getByText('está al día')).toBeInTheDocument()
  })

  describe('Borrar todo (RQ-12)', () => {
    it('is only shown when there are participants', async () => {
      const user = userEvent.setup()
      render(<App />)
      expect(screen.queryByRole('button', { name: 'Borrar todo' })).not.toBeInTheDocument()
      await addPeople(user, 'Ana')
      expect(screen.getByRole('button', { name: 'Borrar todo' })).toBeInTheDocument()
    })

    it('empties the group after confirming, and that is saved', async () => {
      const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
      const user = userEvent.setup()
      const { unmount } = render(<App />)
      await addPeople(user, 'Ana', 'Beto')
      await addExpense(user, 'Cena', '90')
      await user.click(screen.getByRole('button', { name: 'Borrar todo' }))

      expect(confirm).toHaveBeenCalledWith('¿Borrar todos los participantes y gastos?')
      expect(participantNames()).toEqual([])
      expect(screen.getByText('Todavía no hay gastos.')).toBeInTheDocument()
      unmount()

      render(<App />)
      expect(participantNames()).toEqual([])
    })

    it('changes nothing when cancelled', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(false)
      const user = userEvent.setup()
      render(<App />)
      await addPeople(user, 'Ana')
      await user.click(screen.getByRole('button', { name: 'Borrar todo' }))
      expect(participantNames()).toEqual(['Ana'])
    })
  })
})
