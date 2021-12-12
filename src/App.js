import { useCallback, useEffect, useState } from 'react'

const letters = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
]

const status = {
  green: 'green',
  yellow: 'yellow',
  gray: 'gray',
  unguessed: 'unguessed',
}

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

const keyboardLetters = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
]

const Keyboard = ({ letterStatuses, addLetter }) => {
  const getKeyStyle = (letter) => {
    switch (letterStatuses[letter]) {
      case status.green:
        return 'bg-green-600 text-white'
      case status.yellow:
        return 'bg-yellow-600 text-white'
      case status.gray:
        return 'bg-gray-600 text-white'
      default:
        return 'bg-gray-300'
    }
  }

  const onKeyButtonPress = (letter) => {
    letter = letter.toLowerCase()
    window.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: letter,
      })
    )
  }

  const handleKeyDown = useCallback(
    (event) => {
      const letter = event.key.toUpperCase()
      if (letters.includes(letter)) {
        addLetter(letter)
      }
    },
    [addLetter]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <div className="w-full flex flex-col items-center mb-2">
      {keyboardLetters.map((row, idx) => (
        <div className="w-full flex justify-center my-[5px]">
          <>
            {idx === 2 && (
              <button className="h-14 w-12 px-1 text-xs sm:w-10 bg-gray-300 mx-[2px] font-bold rounded">
                ENTER
              </button>
            )}
            {row.map((letter) => (
              <button
                onClick={() => onKeyButtonPress(letter)}
                key={letter}
                className={`h-14 w-8 sm:w-10 ${getKeyStyle(
                  letter
                )} mx-[2px] text-sm font-bold rounded`}
              >
                {letter}
              </button>
            ))}
            {idx === 2 && (
              <button className="h-14 w-12 flex items-center justify-center sm:w-10 bg-gray-300 mx-[2px] text-sm font-bold rounded">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z"
                  />
                </svg>
              </button>
            )}
          </>
        </div>
      ))}
    </div>
  )
}

export default App
