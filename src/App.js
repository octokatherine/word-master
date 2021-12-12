import { useState } from 'react'
import { letters, status } from './constants'
import { Keyboard } from './Keyboard'
import answers from './data/answers'

const getRandomAnswer = () => {
  const randomIndex = Math.floor(Math.random() * answers.length)
  return answers[randomIndex].toUpperCase()
}

function App() {
  const [answer, setAnswer] = useState(() => getRandomAnswer())
  console.log('answer :>> ', answer)
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

  const onEnterPress = () => {
    if (currentRow === 6) return

    const word = board[currentRow].join('')
    if (word.length < 5) return

    updateCellStatuses(word, currentRow)
    updateLetterStatuses(word)
    setCurrentRow((prev) => prev + 1)
    setCurrentCol(0)
  }

  const updateCellStatuses = (word, rowNumber) => {
    setCellStatuses((prev) => {
      let ans = answer
      let wor = word
      const newCellStatuses = [...prev]
      newCellStatuses[rowNumber] = [...prev[rowNumber]]
      const wordLength = wor.length

      // check greens
      for (let i = 0; i < wordLength; i++) {
        if (wor[i] === ans[i]) {
          newCellStatuses[rowNumber][i] = status.green
          ans = ans.substr(0, i) + '.' + ans.substr(i + 1)
          wor = wor.substr(0, i) + '.' + wor.substr(i + 1)
        }
      }

      // check yellows
      for (let i = 0; i < wordLength; i++) {
        if (wor[i] === '.') continue

        if (ans.includes(wor[i])) {
          newCellStatuses[rowNumber][i] = status.yellow
        }
      }

      // set rest to gray
      for (let i = 0; i < wordLength; i++) {
        if (newCellStatuses[rowNumber][i] === status.unguessed) {
          newCellStatuses[rowNumber][i] = status.gray
        }
      }

      return newCellStatuses
    })
  }

  const updateLetterStatuses = (word) => {
    setLetterStatuses((prev) => {
      const newLetterStatuses = { ...prev }
      const wordLength = word.length
      for (let i = 0; i < wordLength; i++) {
        if (word[i] === answer[i]) {
          newLetterStatuses[word[i]] = status.green
        } else if (answer.includes(word[i])) {
          newLetterStatuses[word[i]] = status.yellow
        } else {
          newLetterStatuses[word[i]] = status.gray
        }
      }
      return newLetterStatuses
    })
  }

  return (
    <div className="flex flex-col justify-between h-screen">
      <h1 className="text-center font-extrabold text-2xl my-2">WORD MASTER</h1>
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
      <Keyboard letterStatuses={letterStatuses} addLetter={addLetter} onEnterPress={onEnterPress} />
    </div>
  )
}

export default App
