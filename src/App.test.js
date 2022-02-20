import { render, screen } from '@testing-library/react'
import Game from './Game'

test('renders the Wordle with Friends title', () => {
  render(<App />)
  const title = screen.getByText(/Wordle with Friends/i)
  expect(title).toBeInTheDocument()
})
