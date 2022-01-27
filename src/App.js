import { letters, status, cipherKey } from './constants'
import { useEffect, useState } from 'react'
import { Routes, Route, useParams, useNavigate } from 'react-router-dom'
import Encrypt from 'ciphervgnr'

import { EndGameModal } from './components/EndGameModal'
import { ReactComponent as Info } from './data/Info.svg'
import { InfoModal } from './components/InfoModal'
import { Keyboard } from './components/Keyboard'
import { ReactComponent as Settings } from './data/Settings.svg'
import { SettingsModal } from './components/SettingsModal'
import answers from './data/answers'
import { useLocalStorage } from './hooks/useLocalStorage'
import words from './data/words'

const state = {
  playing: 'playing',
  won: 'won',
  lost: 'lost',
}

export const difficulty = {
  easy: 'easy',
  normal: 'normal',
  hard: 'hard',
}

const getRandomAnswer = () => {
  const randomIndex = Math.floor(Math.random() * answers.length)
  return answers[randomIndex].toUpperCase()
}

// Adapted from https://github.com/hannahcode/wordle/blob/f8aa91766d7e2918ab6361efb7bdc5321bd93774/src/lib/words.ts#L15-L28
// MIT Licensed
const getDailyAnswer = () => {
  // January 1, 2022 Game Epoch
  const epochMs = 1641013200000
  const now = Date.now()
  const msInDay = 86400000
  const index = Math.floor((now - epochMs) / msInDay)
  return answers[index].toUpperCase()
}

function App() {
  return (
    <Routes>
      <Route path="/">
        <Route index element={<DailyPuzzle />} />
        <Route path=":answerXor" element={<Puzzle />} />
        <Route
          path="404"
          element={
            <h1 className="flex-1 text-center text-xl xxs:text-2xl -mr-6 sm:text-4xl tracking-wide font-bold">
              Invalid URL!
            </h1>
          }
        />
      </Route>
    </Routes>
  )
}

function Puzzle() {
  const navigate = useNavigate()
  const params = useParams()

  const decipheredAnswer = Encrypt(params.answerXor, cipherKey, true).toLowerCase()
  const shareUrl = `${window.location.origin}/#/${params.answerXor}`

  useEffect(() => {
    if (!answers.includes(decipheredAnswer)) {
      navigate('/404')
    }
  })
  const initialStates = {
    answer: decipheredAnswer.toUpperCase(),
    gameState: state.playing,
    board: [
      ['', '', '', '', ''],
      ['', '', '', '', ''],
      ['', '', '', '', ''],
      ['', '', '', '', ''],
      ['', '', '', '', ''],
      ['', '', '', '', ''],
    ],
    cellStatuses: Array(6).fill(Array(5).fill(status.unguessed)),
    currentRow: 0,
    currentCol: 0,
    letterStatuses: () => {
      const letterStatuses = {}
      letters.forEach((letter) => {
        letterStatuses[letter] = status.unguessed
      })
      return letterStatuses
    },
    submittedInvalidWord: false,
  }

  const [answer, setAnswer] = useState(initialStates.answer)
  const [gameState, setGameState] = useLocalStorage('stateGameState', initialStates.gameState)
  const [board, setBoard] = useLocalStorage('stateBoard', initialStates.board)
  const [cellStatuses, setCellStatuses] = useLocalStorage(
    'stateCellStatuses',
    initialStates.cellStatuses
  )
  const [currentRow, setCurrentRow] = useLocalStorage('stateCurrentRow', initialStates.currentRow)
  const [currentCol, setCurrentCol] = useLocalStorage('stateCurrentCol', initialStates.currentCol)
  const [letterStatuses, setLetterStatuses] = useLocalStorage(
    'stateLetterStatuses',
    initialStates.letterStatuses()
  )
  const [submittedInvalidWord, setSubmittedInvalidWord] = useLocalStorage(
    'stateSubmittedInvalidWord',
    initialStates.submittedInvalidWord
  )

  const [currentStreak, setCurrentStreak] = useLocalStorage('current-streak', 0)
  const [longestStreak, setLongestStreak] = useLocalStorage('longest-streak', 0)
  const [modalIsOpen, setIsOpen] = useState(false)
  const [firstTime, setFirstTime] = useLocalStorage('first-time', true)
  const [infoModalIsOpen, setInfoModalIsOpen] = useState(firstTime)
  const [settingsModalIsOpen, setSettingsModalIsOpen] = useState(false)
  const [difficultyLevel, setDifficultyLevel] = useLocalStorage('difficulty', difficulty.normal)
  const getDifficultyLevelInstructions = () => {
    if (difficultyLevel === difficulty.easy) {
      return 'Guess any 5 letters'
    } else if (difficultyLevel === difficulty.hard) {
      return "Guess any valid word using all the hints you've been given"
    } else {
      return 'Guess any valid word'
    }
  }
  const [exactGuesses, setExactGuesses] = useLocalStorage('exact-guesses', {})

  const openModal = () => setIsOpen(true)
  const closeModal = () => setIsOpen(false)
  const handleInfoClose = () => {
    setFirstTime(false)
    setInfoModalIsOpen(false)
  }

  const [darkMode, setDarkMode] = useLocalStorage('dark-mode', false)
  const toggleDarkMode = () => setDarkMode((prev) => !prev)

  useEffect(() => {
    if (gameState !== state.playing) {
      setTimeout(() => {
        openModal()
      }, 500)
    }
  }, [gameState])

  const getCellStyles = (rowNumber, colNumber, letter) => {
    if (rowNumber === currentRow) {
      if (letter) {
        return `nm-inset-background dark:nm-inset-background-dark text-primary dark:text-primary-dark ${
          submittedInvalidWord ? 'border border-red-800' : ''
        }`
      }
      return 'nm-flat-background dark:nm-flat-background-dark text-primary dark:text-primary-dark'
    }

    switch (cellStatuses[rowNumber][colNumber]) {
      case status.green:
        return 'nm-inset-n-green text-gray-50'
      case status.yellow:
        return 'nm-inset-yellow-500 text-gray-50'
      case status.gray:
        return 'nm-inset-n-gray text-gray-50'
      default:
        return 'nm-flat-background dark:nm-flat-background-dark text-primary dark:text-primary-dark'
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

  // returns an array with a boolean of if the word is valid and an error message if it is not
  const isValidWord = (word) => {
    if (word.length < 5) return [false, `please enter a 5 letter word`]
    if (difficultyLevel === difficulty.easy) return [true]
    if (!words[word.toLowerCase()]) return [false, `${word} is not a valid word. Please try again.`]
    if (difficultyLevel === difficulty.normal) return [true]
    const guessedLetters = Object.entries(letterStatuses).filter(([letter, letterStatus]) =>
      [status.yellow, status.green].includes(letterStatus)
    )
    const yellowsUsed = guessedLetters.every(([letter, _]) => word.includes(letter))
    const greensUsed = Object.entries(exactGuesses).every(
      ([position, letter]) => word[position] === letter
    )
    if (!yellowsUsed || !greensUsed)
      return [false, `In hard mode, you must use all the hints you've been given.`]
    return [true]
  }

  const onEnterPress = () => {
    const word = board[currentRow].join('')
    const [valid] = isValidWord(word)
    if (!valid) {
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
    const fixedLetters = {}
    setCellStatuses((prev) => {
      const newCellStatuses = [...prev]
      newCellStatuses[rowNumber] = [...prev[rowNumber]]
      const wordLength = word.length
      const answerLetters = answer.split('')

      // set all to gray
      for (let i = 0; i < wordLength; i++) {
        newCellStatuses[rowNumber][i] = status.gray
      }

      // check greens
      for (let i = wordLength - 1; i >= 0; i--) {
        if (word[i] === answer[i]) {
          newCellStatuses[rowNumber][i] = status.green
          answerLetters.splice(i, 1)
          fixedLetters[i] = answer[i]
        }
      }

      // check yellows
      for (let i = 0; i < wordLength; i++) {
        if (answerLetters.includes(word[i]) && newCellStatuses[rowNumber][i] !== status.green) {
          newCellStatuses[rowNumber][i] = status.yellow
          answerLetters.splice(answerLetters.indexOf(word[i]), 1)
        }
      }

      return newCellStatuses
    })
    setExactGuesses((prev) => ({ ...prev, ...fixedLetters }))
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

    if (gameState === state.playing && lastFilledRow && isRowAllGreen(lastFilledRow)) {
      setGameState(state.won)

      var streak = currentStreak + 1
      setCurrentStreak(streak)
      setLongestStreak((prev) => (streak > prev ? streak : prev))
    } else if (gameState === state.playing && currentRow === 6) {
      setGameState(state.lost)
      setCurrentStreak(0)
    }
  }, [
    cellStatuses,
    currentRow,
    gameState,
    setGameState,
    currentStreak,
    setCurrentStreak,
    setLongestStreak,
  ])

  const updateLetterStatuses = (word) => {
    setLetterStatuses((prev) => {
      const newLetterStatuses = { ...prev }
      const wordLength = word.length
      for (let i = 0; i < wordLength; i++) {
        if (newLetterStatuses[word[i]] === status.green) continue

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

  const playAgain = () => {
    const newAnswer = getRandomAnswer()
    setAnswer(newAnswer)
    navigate('/' + Encrypt(newAnswer, cipherKey))
    setGameState(initialStates.gameState)
    setBoard(initialStates.board)
    setCellStatuses(initialStates.cellStatuses)
    setCurrentRow(initialStates.currentRow)
    setCurrentCol(initialStates.currentCol)
    setLetterStatuses(initialStates.letterStatuses())
    setSubmittedInvalidWord(initialStates.submittedInvalidWord)
    setExactGuesses({})

    closeModal()
  }

  const modalStyles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: darkMode ? 'hsl(231, 16%, 25%)' : 'hsl(231, 16%, 92%)',
      zIndex: 99,
    },
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      transform: 'translate(-50%, -50%)',
      height: 'calc(100% - 2rem)',
      width: 'calc(100% - 2rem)',
      backgroundColor: darkMode ? 'hsl(231, 16%, 25%)' : 'hsl(231, 16%, 92%)',
      boxShadow: `${
        darkMode
          ? '0.2em 0.2em calc(0.2em * 2) #252834, calc(0.2em * -1) calc(0.2em * -1) calc(0.2em * 2) #43475C'
          : '0.2em 0.2em calc(0.2em * 2) #A3A7BD, calc(0.2em * -1) calc(0.2em * -1) calc(0.2em * 2) #FFFFFF'
      }`,
      border: 'none',
      borderRadius: '1rem',
      maxWidth: '475px',
      maxHeight: '650px',
      position: 'relative',
    },
  }
  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="flex flex-col justify-between h-screen bg-background dark:bg-background-dark">
        <header className="flex items-center py-2 px-3 text-primary dark:text-primary-dark">
          <button
            type="button"
            onClick={() => setSettingsModalIsOpen(true)}
            className="p-1 rounded-full"
          >
            <Settings />
          </button>
          <h1 className="flex-1 text-center text-xl xxs:text-2xl sm:text-4xl tracking-wide font-bold font-brand">
            DACTLE
          </h1>
          <button
            type="button"
            onClick={() => setInfoModalIsOpen(true)}
            className="p-1 rounded-full"
          >
            <Info />
          </button>
        </header>
        <div className="flex items-center flex-col py-3 flex-1 justify-center relative">
          <div className="relative">
            <div className="grid grid-cols-5 grid-flow-row gap-4">
              {board.map((row, rowNumber) =>
                row.map((letter, colNumber) => (
                  <span
                    key={colNumber}
                    className={`${getCellStyles(
                      rowNumber,
                      colNumber,
                      letter
                    )} inline-flex items-center font-medium justify-center text-5xl w-[13vw] h-[13vw] xs:w-14 xs:h-14 sm:w-20 sm:h-20 rounded-full font-asl`}
                  >
                    {letter}
                  </span>
                ))
              )}
            </div>
            <div
              className={`absolute -bottom-24 left-1/2 transform -translate-x-1/2 ${
                gameState === state.playing ? 'hidden' : ''
              }`}
            >
              <div className={darkMode ? 'dark' : ''}>
                <button
                  autoFocus
                  type="button"
                  className="rounded-lg z-10 px-6 py-2 text-lg nm-flat-background dark:nm-flat-background-dark hover:nm-inset-background dark:hover:nm-inset-background-dark text-primary dark:text-primary-dark"
                  onClick={playAgain}
                >
                  Play Again
                </button>
              </div>
            </div>
          </div>
        </div>
        <InfoModal
          isOpen={infoModalIsOpen}
          handleClose={handleInfoClose}
          darkMode={darkMode}
          styles={modalStyles}
        />
        <EndGameModal
          isOpen={modalIsOpen}
          handleClose={closeModal}
          styles={modalStyles}
          darkMode={darkMode}
          gameState={gameState}
          cellStatuses={cellStatuses}
          currentRow={currentRow}
          status={status}
          state={state}
          currentStreak={currentStreak}
          longestStreak={longestStreak}
          answer={answer}
          playAgain={playAgain}
          shareUrl={shareUrl}
        />
        <SettingsModal
          isOpen={settingsModalIsOpen}
          handleClose={() => setSettingsModalIsOpen(false)}
          styles={modalStyles}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          difficultyLevel={difficultyLevel}
          setDifficultyLevel={setDifficultyLevel}
          levelInstructions={getDifficultyLevelInstructions()}
        />
        <div className={`h-auto relative ${gameState === state.playing ? '' : 'invisible'}`}>
          <Keyboard
            letterStatuses={letterStatuses}
            addLetter={addLetter}
            onEnterPress={onEnterPress}
            onDeletePress={onDeletePress}
            gameDisabled={gameState !== state.playing}
          />
        </div>
      </div>
    </div>
  )
}

function DailyPuzzle() {
  const navigate = useNavigate()
  const answer = getDailyAnswer()
  useEffect(() => {
    navigate('/' + Encrypt(answer, cipherKey))
  })
  return null
}
export default App
