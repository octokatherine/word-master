import { render, screen } from '@testing-library/react'
import Game from './Game'

test('renders the WORD MASTER title', () => {
  render(<App />)
  const title = screen.getByText(/WORD MASTER/i)
  expect(title).toBeInTheDocument()
})
