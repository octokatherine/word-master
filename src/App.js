import { useState } from 'react'

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
  const [board, setBoard] = useState([
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
  ])
  const [letterStatuses, setLetterStatuses] = useState(() => {
    const letterStatuses = {}
    letters.forEach((letter) => {
      letterStatuses[letter] = status.unguessed
    })
    return letterStatuses
  })

  return (
    <div className="flex flex-col justify-between h-screen">
      <h1 className="text-center font-medium text-2xl my-2">Word Master</h1>
      <div className="flex items-center flex-col">
        <div className="grid grid-rows-6 grid-flow-col gap-1">
          {board.map((row) =>
            row.map((cell) => (
              <span className="inline-block w-16 h-16 sm:w-20 sm:h-20 border-2 border-gray-300">
                {cell}
              </span>
            ))
          )}
        </div>
      </div>
      <Keyboard letterStatuses={letterStatuses} />
    </div>
  )
}

const keyboardLetters = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
]

const Keyboard = ({ letterStatuses }) => {
  const getKeyStyle = (letter) => {
    switch (letterStatuses[letter]) {
      case status.green:
        return 'bg-green-500 text-white'
      case status.yellow:
        return 'bg-yellow-600 text-white'
      case status.gray:
        return 'bg-gray-700 text-white'
      default:
        return 'bg-gray-300'
    }
  }

  return (
    <div className="w-full flex flex-col items-center mb-2">
      {keyboardLetters.map((row, idx) => (
        <div className="w-full flex justify-center my-[6px]">
          <>
            {idx === 2 && (
              <button className="h-14 w-12 px-1 text-xs sm:w-10 bg-gray-300 mx-[2px] font-bold rounded">
                ENTER
              </button>
            )}
            {row.map((letter) => (
              <button
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
