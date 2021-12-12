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
      {keyboardLetters.map((row) => (
        <div className="w-full flex justify-center my-[6px]">
          {row.map((letter) => (
            <button
              className={`h-14 w-7 sm:w-10 ${getKeyStyle(
                letter
              )} mx-[2px] text-sm font-bold rounded`}
            >
              {letter}
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}

export default App
