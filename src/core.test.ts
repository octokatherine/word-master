import {
  Answer,
  backspace,
  CellStatus,
  columns,
  Difficulty,
  isFunAnswer,
  newCellStatuses,
  Operator,
  Row,
  rowCharacters,
  rowCount,
  validEquation,
  validOperators,
} from './core'

test(`backspace deletes the result, even if it's a 0`, () => {
  const row = {
    operandA: 0,
    operator: '+' as Operator,
    operandB: 0,
    result: 0,
  }
  backspace(row)
  expect(rowCharacters(row)).toEqual(['0', '+', '0', '=', '', ''])
})

test(`backspace deletes operand B, even if it's a 0`, () => {
  const row = {
    operandA: 0,
    operator: '+' as Operator,
    operandB: 0,
  }
  backspace(row)
  expect(rowCharacters(row)).toEqual(['0', '+', '', '=', '', ''])
})

test(`backspace deletes operand A, even if it's a 0`, () => {
  const row = {
    operandA: 0,
  }
  backspace(row)
  expect(rowCharacters(row)).toEqual(['', '', '', '=', '', ''])
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

test('newCellStatuses adds gray statuses when number is already correctly guessed', () => {
  const answer: Answer = {
    operandA: 9,
    operator: '*' as Operator,
    operandB: 4,
    result: 36,
  }
  const prev = Array(rowCount).fill(Array(columns.length).fill(CellStatus.Unguessed))
  const row: Row = {
    operandA: 6,
    operator: '*' as Operator,
    operandB: 6,
    result: 36,
  }
  const rowNumber = 0

  const expected = [...prev]
  expected[0][0] = CellStatus.Gray
  expected[0][1] = CellStatus.Green
  expected[0][2] = CellStatus.Gray
  expected[0][3] = CellStatus.Green
  expected[0][4] = CellStatus.Green
  expected[0][5] = CellStatus.Green

  expect(newCellStatuses(prev, rowNumber, row, answer)).toEqual(expected)
})

test('newCellStatuses adds yellow statuses when number is not correctly guessed in this row', () => {
  const answer: Answer = {
    operandA: 9,
    operator: '*' as Operator,
    operandB: 4,
    result: 36,
  }
  const prev = Array(rowCount).fill(Array(columns.length).fill(CellStatus.Unguessed))
  const row: Row = {
    operandA: 6,
    operator: '*' as Operator,
    operandB: 4,
    result: 24,
  }
  const rowNumber = 0

  const expected = [...prev]
  expected[0][0] = CellStatus.Yellow
  expected[0][1] = CellStatus.Green
  expected[0][2] = CellStatus.Green
  expected[0][3] = CellStatus.Green
  expected[0][4] = CellStatus.Gray
  expected[0][5] = CellStatus.Gray

  expect(newCellStatuses(prev, rowNumber, row, answer)).toEqual(expected)
})

test('newCellStatuses adds yellow statuses when number is correctly guessed in this row but there is another column that also has this number', () => {
  const answer: Answer = {
    operandA: 5,
    operator: '*' as Operator,
    operandB: 7,
    result: 35,
  }
  const prev = Array(rowCount).fill(Array(columns.length).fill(CellStatus.Unguessed))
  const row: Row = {
    operandA: 7,
    operator: '*' as Operator,
    operandB: 5,
    result: 35,
  }
  const rowNumber = 0

  const expected = [...prev]
  expected[0][0] = CellStatus.Yellow
  expected[0][1] = CellStatus.Green
  expected[0][2] = CellStatus.Yellow
  expected[0][3] = CellStatus.Green
  expected[0][4] = CellStatus.Green
  expected[0][5] = CellStatus.Green

  expect(newCellStatuses(prev, rowNumber, row, answer)).toEqual(expected)
})

test('rowCharacters displays strings to render a row', () => {
  const row = { operandA: 1, operator: '+' as Operator, operandB: 2, result: 3 }
  expect(rowCharacters(row)).toEqual(['1', '+', '2', '=', '', '3'])
})

test('validEquation is false if result greater than 99', () => {
  const row = { operandA: 5, operator: '^' as Operator, operandB: 3, result: 125 }
  expect(validEquation(row)).toEqual(false)
})

test('validEquation is true if result less than 10 and is correct', () => {
  const row = { operandA: 2, operator: '+' as Operator, operandB: 7, result: 9 }
  expect(validEquation(row)).toEqual(true)
})

test('validEquation is false if result is not an integer', () => {
  const row = { operandA: 2, operator: '+' as Operator, operandB: 5.5, result: 7.5 }
  expect(validEquation(row)).toEqual(false)
})

test('validEquation is false if result is less than 0', () => {
  const row = { operandA: 0, operator: '-' as Operator, operandB: 3, result: -3 }
  expect(validEquation(row)).toEqual(false)
})

test('validOperators does not include exponent or modulus for easy', () => {
  expect(validOperators(Difficulty.Easy)).toEqual(['+', '-', '*', '/'])
})

test('validOperators does not include modulus for normal', () => {
  expect(validOperators(Difficulty.Normal)).toEqual(['+', '-', '*', '/', '^'])
})

test('validOperators includes all operators for hard', () => {
  expect(validOperators(Difficulty.Hard)).toEqual(['+', '-', '*', '/', '^', '%'])
})
