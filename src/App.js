import { useEffect, useState, useRef } from 'react'
import { letters, status } from './constants'
import { Keyboard } from './Keyboard'
import answers from './data/answers'
import words from './data/words'
import Modal from 'react-modal'
import Success from './data/Success.png'
import Fail from './data/Cross.png'
import { useLocalStorage } from './hooks/useLocalStorage'

Modal.setAppElement('#root')

const state = {
  playing: 'playing',
  won: 'won',
  lost: 'lost',
}

const getRandomAnswer = () => {
  const randomIndex = Math.floor(Math.random() * answers.length)
  return answers[randomIndex].toUpperCase()
}

function App() {
  const initialStates = {
    answer: () => getRandomAnswer(),
    gameState: state.playing,
    board: [
      ['', '', '', '', ''],
      ['', '', '', '', ''],
      ['', '', '', '', ''],
      ['', '', '', '', ''],
      ['', '', '', '', ''],
      ['', '', '', '', ''],
    ],
    cellStatuses: () => Array(6).fill(Array(5).fill(status.unguessed)),
    currentRow: 0,
    currentCol: 0,
    letterStatuses: () => {
      const letterStatuses = {}
      letters.forEach((letter) => {
        letterStatuses[letter] = status.unguessed
      })
      return letterStatuses
    },
  }
  const [answer, setAnswer] = useState(initialStates.answer)
  const [gameState, setGameState] = useState(initialStates.gameState)
  const [board, setBoard] = useState(initialStates.board)
  const [cellStatuses, setCellStatuses] = useState(initialStates.cellStatuses)
  const [currentRow, setCurrentRow] = useState(initialStates.currentRow)
  const [currentCol, setCurrentCol] = useState(initialStates.currentCol)
  const [letterStatuses, setLetterStatuses] = useState(initialStates.letterStatuses)
  const [submittedInvalidWord, setSubmittedInvalidWord] = useState(false)
  const [modalIsOpen, setIsOpen] = useState(false)
  const [currentStreak, setCurrentStreak] = useLocalStorage('current-streak', 0)
  const [longestStreak, setLongestStreak] = useLocalStorage('longest-streak', 0)
  const streakUpdated = useRef(false)

  const openModal = () => setIsOpen(true)
  const closeModal = () => setIsOpen(false)

  useEffect(() => {
    if (gameState !== state.playing) {
      setTimeout(() => {
        openModal()
      }, 500)
    }
  }, [gameState])

  useEffect(() => {
    if (!streakUpdated.current) {
      if (gameState === state.won) {
        if (currentStreak >= longestStreak) {
          setLongestStreak((prev) => prev + 1)
        }
        setCurrentStreak((prev) => prev + 1)
        streakUpdated.current = true
      } else if (gameState === state.lost) {
        setCurrentStreak(0)
        streakUpdated.current = true
      }
    }
  }, [gameState, currentStreak, longestStreak, setLongestStreak, setCurrentStreak])

  const getCellStyles = (rowNumber, colNumber, letter) => {
    if (rowNumber === currentRow) {
      if (letter) {
        return `nm-inset-background text-primary ${
          submittedInvalidWord ? 'border border-red-800' : ''
        }`
      }
      return 'nm-flat-background text-primary'
    }

    switch (cellStatuses[rowNumber][colNumber]) {
      case status.green:
        return 'nm-inset-n-green text-gray-50'
      case status.yellow:
        return 'nm-inset-yellow-500 text-gray-50'
      case status.gray:
        return 'nm-inset-n-gray text-gray-50'
      default:
        return 'nm-flat-background text-primary'
    }
  }

  const addLetter = (letter) => {
    setSubmittedInvalidWord(false)
    setBoard((prev) => {
      if (currentCol > 4) {
        return prev
      }
      const newBoard = [...prev]
      newBoard[currentRow][currentCol] = letter
      return newBoard
    })
    if (currentCol < 5) {
      setCurrentCol((prev) => prev + 1)
    }
  }

  const isValidWord = (word) => {
    if (word.length < 5) return false
    return words[word.toLowerCase()]
  }

  const onEnterPress = () => {
    const word = board[currentRow].join('')
    if (!isValidWord(word)) {
      setSubmittedInvalidWord(true)
      return
    }

    if (currentRow === 6) return

    updateCellStatuses(word, currentRow)
    updateLetterStatuses(word)
    setCurrentRow((prev) => prev + 1)
    setCurrentCol(0)
  }

  const onDeletePress = () => {
    setSubmittedInvalidWord(false)
    if (currentCol === 0) return

    setBoard((prev) => {
      const newBoard = [...prev]
      newBoard[currentRow][currentCol - 1] = ''
      return newBoard
    })

    setCurrentCol((prev) => prev - 1)
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

  const isRowAllGreen = (row) => {
    return row.every((cell) => cell === status.green)
  }

  // every time cellStatuses updates, check if the game is won or lost
  useEffect(() => {
    const cellStatusesCopy = [...cellStatuses]
    const reversedStatuses = cellStatusesCopy.reverse()
    const lastFilledRow = reversedStatuses.find((r) => {
      return r[0] !== status.unguessed
    })

    if (lastFilledRow && isRowAllGreen(lastFilledRow)) {
      setGameState(state.won)
    } else if (currentRow === 6) {
      setGameState(state.lost)
    }
  }, [cellStatuses, currentRow])

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

  const PlayAgainButton = () => {
    return (
      <button
        type="button"
        className="rounded-lg px-6 py-2 mt-8 text-lg nm-flat-background hover:nm-inset-background"
        onClick={() => {
          setAnswer(initialStates.answer)
          setGameState(initialStates.gameState)
          setBoard(initialStates.board)
          setCellStatuses(initialStates.cellStatuses)
          setCurrentRow(initialStates.currentRow)
          setCurrentCol(initialStates.currentCol)
          setLetterStatuses(initialStates.letterStatuses)
          closeModal()
          streakUpdated.current = false
        }}
      >
        Play Again
      </button>
    )
  }

  return (
    <div className="flex flex-col justify-between h-fill bg-background">
      <h1 className="text-center text-primary text-xl xxs:text-2xl sm:text-4xl pt-2 tracking-wide font-bold">
        WORD MASTER
      </h1>
      <div className="flex items-center flex-col py-3">
        <div className="grid grid-cols-5 grid-flow-row gap-4">
          {board.map((row, rowNumber) =>
            row.map((letter, colNumber) => (
              <span
                key={colNumber}
                className={`${getCellStyles(
                  rowNumber,
                  colNumber,
                  letter
                )} inline-flex items-center justify-center text-lg w-[14vw] h-[14vw] xs:w-14 xs:h-14 sm:w-20 sm:h-20 rounded-full`}
              >
                {letter}
              </span>
            ))
          )}
        </div>
      </div>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Game End Modal"
      >
        <div className="h-full flex flex-col items-center justify-center max-w-[300px] mx-auto">
          {gameState === state.won && (
            <>
              <img src={Success} alt="success" height="auto" width="auto" />
              <h1 className="text-primary text-3xl">Congrats!</h1>
              <p className="mt-6">
                Current streak: <strong>{currentStreak}</strong> {currentStreak > 4 && '🔥'}
              </p>
              <p>
                Longest streak: <strong>{longestStreak}</strong>
              </p>
            </>
          )}
          {gameState === state.lost && (
            <>
              <img src={Fail} alt="success" height="auto" width="80%" />
              <div className="text-primary text-4xl text-center">
                <p>Oops!</p>
                <p className="mt-3 text-2xl">
                  The word was <strong>{answer}</strong>
                </p>
              </div>
            </>
          )}
          <PlayAgainButton />
        </div>
      </Modal>
      <Keyboard
        letterStatuses={letterStatuses}
        addLetter={addLetter}
        onEnterPress={onEnterPress}
        onDeletePress={onDeletePress}
        gameDisabled={gameState !== state.playing}
      />
    </div>
  )
}

const customStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'hsl(231, 16%, 92%)',
  },
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    transform: 'translate(-50%, -50%)',
    height: 'calc(100% - 2rem)',
    width: 'calc(100% - 2rem)',
    backgroundColor: 'hsl(231, 16%, 92%)',
    boxShadow:
      '0.2em 0.2em calc(0.2em * 2) #A3A7BD, calc(0.2em * -1) calc(0.2em * -1) calc(0.2em * 2) #FFFFFF',
    border: 'none',
    borderRadius: '1rem',
    maxWidth: '475px',
    maxHeight: '650px',
  },
}

export default App
