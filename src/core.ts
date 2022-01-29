declare global {
  interface Window {
    plausible: (s: string) => void
  }
}
export interface Row {
  operandA?: number
  operator?: Operator
  operandB?: number
  result?: number
}
export type Equation = Required<Row>
export type Answer = Required<Row>
export enum PlayState {
  Playing = 'playing',
  Won = 'won',
  Lost = 'lost',
}
export enum Difficulty {
  Easy = 'easy',
  Normal = 'normal',
  Hard = 'hard',
}
export type Operator = '+' | '-' | '*' | '/' | '^' | '%'
export const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
const easyOperators: Operator[] = ['+', '-', '*', '/']
const normalOperators: Operator[] = ['^']
const hardOperators: Operator[] = ['%']
export const allOperators = easyOperators.concat(normalOperators, hardOperators)

export enum CellStatus {
  Green = 'green',
  Yellow = 'yellow',
  Gray = 'gray',
  Unguessed = 'unguessed',
}
export function validOperators(difficulty: Difficulty): Operator[] {
  switch (difficulty) {
    case Difficulty.Easy:
      return easyOperators
    case Difficulty.Normal:
      return easyOperators.concat(normalOperators)
    case Difficulty.Hard:
      return allOperators
  }
}

export function backspace(row: Row) {
  if (row.result != null) {
    row.result = undefined
  } else if (row.operandB != null) {
    row.operandB = undefined
  } else if (row.operator) {
    row.operator = undefined
  } else if (row.operandA != null) {
    row.operandA = undefined
  }
}

export function rowCharacter(row: Row, col: number): string {
  switch (col) {
    case 0:
      return row.operandA?.toString() || ''
    case 1:
      return row.operator || ''
    case 2:
      return row.operandB?.toString() || ''
    case 3:
      return '='
    case 4:
      return row.result?.toString() || ''
  }

  throw new Error('Something bad happened')
}

export function rowCharacters(row: Row): string[] {
  return [0, 1, 2, 3, 4].map((col) => {
    return rowCharacter(row, col)
  })
}

export function getRandomAnswer(difficulty: Difficulty): Answer {
  const operator = getRandomOperator(difficulty)

  while (true) {
    const operandA = getRandomDigit()
    const operandB = getRandomDigit()
    const potentialAnswer: Answer = {
      operandA,
      operator: operator,
      operandB,
      result: getResult(operandA, operator, operandB),
    }
    if (validEquation(potentialAnswer) && isFunAnswer(potentialAnswer)) {
      return potentialAnswer
    }
  }
}

const getRandomDigit = (): number => {
  return Math.floor(Math.random() * 10)
}

const getRandomOperator = (difficulty: Difficulty): Operator => {
  const ops = validOperators(difficulty)
  const randomOperatorIndex = Math.floor(Math.random() * ops.length)
  return ops[randomOperatorIndex]
}

function getResult(operandA: number, operator: Operator, operandB: number): number {
  switch (operator) {
    case '+':
      return operandA + operandB
    case '-':
      return operandA - operandB
    case '*':
      return operandA * operandB
    case '/':
      return operandA / operandB
    case '^':
      return Math.pow(operandA, operandB)
    case '%':
      return operandA % operandB
  }
}

export function validEquation(row: Row): boolean {
  if (row.operandA !== undefined && row.operator !== undefined && row.operandB !== undefined) {
    const correctResult = getResult(row.operandA, row.operator, row.operandB)
    return Number.isInteger(correctResult) && correctResult < 10 && correctResult === row.result
  } else {
    return false
  }
}

export function isFunAnswer(row: Answer): boolean {
  switch (row.operator) {
    case '+':
      return row.operandA !== 0 && row.operandB !== 0
    case '-':
      return row.operandB !== 0
    case '*':
      return row.operandA > 1 && row.operandB > 1
    case '/':
      if (row.operandA === row.operandB) {
        return false
      }
      return row.operandA !== 0 && row.operandB !== 1
    case '^':
      return row.operandA > 1 && row.operandB > 1
    case '%':
      return row.operandA !== 0 && row.operandB !== 1
  }
}
