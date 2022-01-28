import { rowCharacters } from './coreTypes'

test('rowCharacters displays strings to render a row', () => {
  const row = { operandA: 1, operator: '+', operandB: 2, result: 3 }
  expect(rowCharacters(row)).toEqual(['1', '+', '2', '=', '3'])
})
