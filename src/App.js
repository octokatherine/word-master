import { useState } from 'react'
import { letters, status } from './constants'
import { Keyboard } from './Keyboard'

function App() {
  const [answer, setAnswer] = useState('THORN')
  const [board, setBoard] = useState([
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
  ])
  const [cellStatuses, setCellStatuses] = useState(() =>
    Array(6).fill(Array(5).fill(status.unguessed))
  )
  const [currentRow, setCurrentRow] = useState(0)
  const [currentCol, setCurrentCol] = useState(0)
  const [letterStatuses, setLetterStatuses] = useState(() => {
    const letterStatuses = {}
    letters.forEach((letter) => {
      letterStatuses[letter] = status.unguessed
    })
    return letterStatuses
  })

  const getCellStyles = (rowNumber, colNumber, letter) => {
    if (rowNumber === currentRow) {
      if (letter) return 'border-gray-500'
      return
    }

    switch (cellStatuses[rowNumber][colNumber]) {
      case status.green:
        return 'bg-green-600 text-white'
      case status.yellow:
        return 'bg-yellow-500 text-white'
      case status.gray:
        return 'bg-gray-600 text-white'
      default:
        return
    }
  }

  const addLetter = (letter) => {
    setBoard((prev) => {
      if (currentCol > 4) {
        return prev
      }
      const newBoard = [...prev]
      newBoard[currentRow][currentCol] = letter
      return newBoard
    })
    setCurrentCol((prev) => prev + 1)
  }

  return (
    <div className="flex flex-col justify-between h-screen">
      <h1 className="text-center font-medium text-2xl my-2">WORD MASTER</h1>
      <div className="flex items-center flex-col">
        <div className="grid grid-cols-5 grid-flow-row gap-1">
          {board.map((row, rowNumber) =>
            row.map((letter, colNumber) => (
              <span
                key={colNumber}
                className={`${getCellStyles(
                  rowNumber,
                  colNumber,
                  letter
                )} inline-flex items-center justify-center font-bold text-3xl w-16 h-16 sm:w-20 sm:h-20 border-2 border-gray-300`}
              >
                {letter}
              </span>
            ))
          )}
        </div>
      </div>
      <Keyboard letterStatuses={letterStatuses} addLetter={addLetter} />
    </div>
  )
}

export default App
