import { backspace, isFunAnswer, Operator, rowCharacters } from './core'

test(`backspace deletes the result, even if it's a 0`, () => {
  const row = {
    operandA: 0,
    operator: '+' as Operator,
    operandB: 0,
    result: 0,
  }
  backspace(row)
  expect(rowCharacters(row)).toEqual(['0', '+', '0', '=', ''])
})

test(`backspace deletes operand B, even if it's a 0`, () => {
  const row = {
    operandA: 0,
    operator: '+' as Operator,
    operandB: 0,
  }
  backspace(row)
  expect(rowCharacters(row)).toEqual(['0', '+', '', '=', ''])
})

test(`backspace deletes operand A, even if it's a 0`, () => {
  const row = {
    operandA: 0,
  }
  backspace(row)
  expect(rowCharacters(row)).toEqual(['', '', '', '=', ''])
})

test('isFunAnswer is false for identity functions', () => {
  ;[
    { operandA: 4, operator: '+' as Operator, operandB: 0, result: 4 },
    { operandA: 0, operator: '+' as Operator, operandB: 4, result: 4 },
    { operandA: 4, operator: '-' as Operator, operandB: 0, result: 4 },
    { operandA: 1, operator: '*' as Operator, operandB: 2, result: 2 },
    { operandA: 2, operator: '*' as Operator, operandB: 1, result: 2 },
    { operandA: 5, operator: '/' as Operator, operandB: 1, result: 5 },
    { operandA: 5, operator: '^' as Operator, operandB: 1, result: 5 },
  ].forEach((row) => {
    expect(isFunAnswer(row)).toEqual(false)
  })
})

test('isFunAnswer is false for equations that always equal zero', () => {
  ;[
    { operandA: 0, operator: '*' as Operator, operandB: 2, result: 0 },
    { operandA: 2, operator: '*' as Operator, operandB: 0, result: 0 },
    { operandA: 0, operator: '/' as Operator, operandB: 8, result: 0 },
    { operandA: 0, operator: '^' as Operator, operandB: 8, result: 0 },
    { operandA: 0, operator: '%' as Operator, operandB: 8, result: 0 },
    { operandA: 4, operator: '%' as Operator, operandB: 1, result: 0 },
  ].forEach((row) => {
    expect(isFunAnswer(row)).toEqual(false)
  })
})

test('isFunAnswer is false for equation patterns that always equal one', () => {
  ;[
    { operandA: 5, operator: '^' as Operator, operandB: 0, result: 1 },
    { operandA: 1, operator: '^' as Operator, operandB: 3, result: 1 },
    { operandA: 4, operator: '/' as Operator, operandB: 4, result: 1 },
  ].forEach((row) => {
    expect(isFunAnswer(row)).toEqual(false)
  })
})

test('isFunAnswer is true for equations that are solvable with skill', () => {
  ;[{ operandA: 1, operator: '+' as Operator, operandB: 2, result: 3 }].forEach((row) => {
    expect(isFunAnswer(row)).toEqual(true)
  })
})

test('rowCharacters displays strings to render a row', () => {
  const row = { operandA: 1, operator: '+' as Operator, operandB: 2, result: 3 }
  expect(rowCharacters(row)).toEqual(['1', '+', '2', '=', '3'])
})
