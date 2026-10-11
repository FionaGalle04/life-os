import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

describe('LIFE-OS fitness tracker', () => {
  beforeEach(() => localStorage.clear())
  it('shows the dashboard and navigates to fitness', async () => {
    const user = userEvent.setup()
    render(<App />)
    expect(screen.getByRole('heading', { name: /Schön, dass du da bist/i })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Fitness' }))
    expect(screen.getByRole('heading', { name: /Dein Training/i })).toBeInTheDocument()
  })

  it('lets the user start a session and add a set', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Fitness' }))
    await user.click(screen.getByRole('button', { name: /Training starten/i }))
    expect(screen.getByRole('heading', { name: /Deine Zeit für dich/i })).toBeInTheDocument()
    const firstAddSet = screen.getAllByRole('button', { name: /Satz hinzufügen/i })[0]
    await user.click(firstAddSet)
    expect(screen.getAllByLabelText(/Gewicht/).length).toBeGreaterThan(0)
    expect(screen.getAllByLabelText(/Gewicht/)).toHaveLength(4)
  })
})
