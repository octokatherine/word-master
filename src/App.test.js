import { render, screen } from '@testing-library/react'
import App from './App'

test('renders the WORD MASTER title', () => {
  render(<App />)
  const title = screen.getByText(/WORD MASTER/i)
  expect(title).toBeInTheDocument()
})
