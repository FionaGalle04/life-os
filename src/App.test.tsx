import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

describe('LIFE-OS fitness tracker', () => {
  it('shows the dashboard and can navigate to fitness', async () => {
    const user = userEvent.setup()
    render(<App />)
    expect(screen.getByText(/Schön, dass du da bist/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Fitness/ }))
    expect(screen.getByRole('heading', { name: /Dein Training/i })).toBeInTheDocument()
  })

  it('lets the user start a gym session and add a set', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /Training starten/i }))
    expect(screen.getByRole('heading', { name: /Deine Zeit für dich/i })).toBeInTheDocument()
    const before = screen.getAllByRole('button', { name: /Satz hinzufügen/i }).length
    await user.click(screen.getAllByRole('button', { name: /Satz hinzufügen/i })[0])
    expect(screen.getAllByRole('button', { name: /Satz hinzufügen/i })).toHaveLength(before)
    expect(screen.getAllByLabelText(/Gewicht/).length).toBeGreaterThan(0)
  })
})
