import { operators } from './constants'

export interface Row {
  operandA?: number
  operator?: string
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
export function validOperators(difficulty: Difficulty): string[] {
  switch (difficulty) {
    case Difficulty.Easy:
      return operators.slice(0, 4)
    case Difficulty.Normal:
      return operators.slice(0, 5)
    case Difficulty.Hard:
      return operators.slice(0, 6)
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
  while (true) {
    const potentialAnswer: Answer = {
      operandA: getRandomDigit(),
      operator: getRandomOperator(difficulty),
      operandB: getRandomDigit(),
      result: getRandomDigit(),
    }
    if (validEquation(potentialAnswer) && isFunAnswer(potentialAnswer)) {
      return potentialAnswer
    }
  }
}

const getRandomDigit = (): number => {
  return Math.floor(Math.random() * 10)
}

const getRandomOperator = (difficulty: Difficulty): string => {
  const ops = validOperators(difficulty)
  const randomOperatorIndex = Math.floor(Math.random() * ops.length)
  return ops[randomOperatorIndex]
}

export function validEquation(row: Row): boolean {
  const equation = row as Required<Row>
  if (equation.operator === '+') {
    return equation.operandA + equation.operandB === equation.result
  } else if (equation.operator === '-') {
    return equation.operandA - equation.operandB === equation.result
  } else if (equation.operator === '*') {
    return equation.operandA * equation.operandB === equation.result
  } else if (equation.operator === '/') {
    return equation.operandA / equation.operandB === equation.result
  } else if (equation.operator === '^') {
    return Math.pow(equation.operandA, equation.operandB) === equation.result
  } else if (equation.operator === '%') {
    return equation.operandA % equation.operandB === equation.result
  } else {
    throw new Error('Invalid operator ' + equation.operator)
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
  return true
}