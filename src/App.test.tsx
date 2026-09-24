import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('shows the installed genai-prices version', () => {
    render(<App />)
    expect(screen.getByRole('contentinfo')).toHaveTextContent(
      `@pydantic/genai-prices v${__GENAI_PRICES_VERSION__}`,
    )
    expect(__GENAI_PRICES_VERSION__).toMatch(/^\d+\.\d+\.\d+/)
  })

  it('shows the matched model and its prices', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByLabelText(/provider/i), 'openai')
    await user.type(screen.getByLabelText(/model/i), 'gpt-4o-2024-08-06')
    await user.click(screen.getByRole('button', { name: /look up/i }))

    expect(screen.getByText('Supported')).toBeInTheDocument()
    expect(screen.getByText('gpt-4o', { selector: 'code' })).toBeInTheDocument()
    expect(screen.getByRole('rowheader', { name: 'Input' })).toBeInTheDocument()
  })

  it('explains when a model is not found', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByLabelText(/provider/i), 'openai')
    await user.type(screen.getByLabelText(/model/i), 'nope')
    await user.click(screen.getByRole('button', { name: /look up/i }))

    expect(screen.getByText('Not supported')).toBeInTheDocument()
    expect(screen.getByText(/none of its models match/)).toBeInTheDocument()
  })
})
