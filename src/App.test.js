import { render, screen } from '@testing-library/react'
import Game from './Game'

test('renders the Wordles with Friendles title', () => {
  render(<App />)
  const title = screen.getByText(/Wordles with Friendles/i)
  expect(title).toBeInTheDocument()
})
