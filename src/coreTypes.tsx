export interface Row {
  operandA?: number
  operator?: string
  operandB?: number
  result?: number
}
export type Equation = Required<Row>
export type Answer = Required<Row>

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
