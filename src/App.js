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
      <div>
        <h1 className="text-center font-medium text-2xl my-2">Word Master</h1>
        <div className="flex items-center flex-col">
          <div>
            {board.map((row) => (
              <div className="mb-0">
                {row.map((cell) => (
                  <span className="inline-block w-14 h-14 mx-[2px] border-2 border-gray-300">
                    {cell}
                  </span>
                ))}
              </div>
            ))}
          </div>
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
  return (
    <div className="w-full flex flex-col items-center mb-2">
      {keyboardLetters.map((row) => (
        <div className="my-1">
          {row.map((letter) => (
            <span className="inline-flex items-center w-8 h-12 justify-center bg-slate-300 mx-[2px] text-sm font-bold rounded-sm">
              {letter}
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}

export default App
