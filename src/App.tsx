import { letters, status, cipherKey } from './constants'
import { useEffect, useState } from 'react'
import { Routes, Route, useParams, useNavigate, useLocation, Navigate } from 'react-router-dom'
import Encrypt from 'ciphervgnr'

import { EndGameModal } from './components/EndGameModal'
import { InfoModal } from './components/InfoModal'
import { Keyboard } from './components/Keyboard'
import { SettingsModal } from './components/SettingsModal'
import answers from './data/answers'
import { useLocalStorage } from './hooks/useLocalStorage'
import { ReactComponent as Info } from './data/Info.svg'
import { ReactComponent as Settings } from './data/Settings.svg'
const words = require('./data/words').default as { [key: string]: boolean }

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
const MS_IN_DAY = 86400000

const getDailyAnswer = () => {
  const epochMs = new Date('January 1, 2022 00:00:00').valueOf()
  const now = Date.now()
  const index = Math.floor((now - epochMs) / MS_IN_DAY) % answers.length
  return answers[index].toUpperCase()
}

// Time after which game states are expired in localStorage
const GAME_STATE_TTL = MS_IN_DAY

const maybeEvictStaleGameStates = () => {
  const lastFinishedAtData = window.localStorage.getItem('lastFinishedAt')
  const lastFinishedAt = lastFinishedAtData ? JSON.parse(lastFinishedAtData) : null
  if (lastFinishedAt && Date.now() - lastFinishedAt > GAME_STATE_TTL) {
    for (var key in window.localStorage) {
      // Keys that are prefixed with g: are game state keys
      if (key.substring(0, 2) === 'g:') {
        window.localStorage.removeItem(key)
      }
    }
    window.localStorage.removeItem('lastFinishedAt')
  }
}

function App() {
  // Clear old game states so that played words can be reused
  maybeEvictStaleGameStates()
  return (
    <Routes>
      <Route path="/">
        <Route index element={<DailyPuzzle />} />
        <Route
          path=":gameCode"
          element={
            <Puzzle>
              <Board />
            </Puzzle>
          }
        />
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

type State = {
  gameState: string
  board: string[][]
  cellStatuses: string[][]
  currentRow: number
  currentCol: number
  letterStatuses: () => { [key: string]: string }
  submittedInvalidWord: boolean
}

function Puzzle({ children }: { children: JSX.Element }) {
  const params = useParams()
  const location = useLocation()
  const decipheredAnswer = Encrypt(params.gameCode!, cipherKey, true).toLowerCase()

  if (!answers.includes(decipheredAnswer)) {
    return <Navigate to="/404" state={{ from: location }} replace />
  }
  return children
}

const INITIAL_STATE: State = {
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
    const letterStatuses: { [key: string]: string } = {}
    letters.forEach((letter) => {
      letterStatuses[letter] = status.unguessed
    })
    return letterStatuses
  },
  submittedInvalidWord: false,
}

function Board() {
  const params = useParams()
  const navigate = useNavigate()

  const gameCode = params.gameCode!
  const decipheredAnswer = Encrypt(gameCode, cipherKey, true).toLowerCase()
  const shareUrl = `${window.location.origin}/#/${gameCode}`

  const [answer, setAnswer] = useState(decipheredAnswer.toUpperCase())
  const [gameState, setGameState] = useLocalStorage(
    `g:${gameCode}:stateGameState`,
    INITIAL_STATE.gameState
  )
  const [board, setBoard] = useLocalStorage(`g:${gameCode}:stateBoard`, INITIAL_STATE.board)
  const [cellStatuses, setCellStatuses] = useLocalStorage(
    `g:${gameCode}:stateCellStatuses`,
    INITIAL_STATE.cellStatuses
  )
  const [currentRow, setCurrentRow] = useLocalStorage(
    `g:${gameCode}:stateCurrentRow`,
    INITIAL_STATE.currentRow
  )
  const [currentCol, setCurrentCol] = useLocalStorage(
    `g:${gameCode}:stateCurrentCol`,
    INITIAL_STATE.currentCol
  )
  const [letterStatuses, setLetterStatuses] = useLocalStorage(
    `g:${gameCode}:stateLetterStatuses`,
    INITIAL_STATE.letterStatuses()
  )
  const [submittedInvalidWord, setSubmittedInvalidWord] = useLocalStorage(
    `g:${gameCode}:stateSubmittedInvalidWord`,
    INITIAL_STATE.submittedInvalidWord
  )

  const [currentStreak, setCurrentStreak] = useLocalStorage('current-streak', 0)
  const [longestStreak, setLongestStreak] = useLocalStorage('longest-streak', 0)
  const [modalIsOpen, setIsOpen] = useState(false)
  const [firstTime, setFirstTime] = useLocalStorage('first-time', true)
  const [infoModalIsOpen, setInfoModalIsOpen] = useState(firstTime)
  const [settingsModalIsOpen, setSettingsModalIsOpen] = useState(false)
  const [difficultyLevel, setDifficultyLevel] = useLocalStorage('difficulty', difficulty.normal)
  const [lastFinishedAt, setLastFinishedAt] = useLocalStorage('lastFinishedAt', null)
  const getDifficultyLevelInstructions = () => {
    if (difficultyLevel === difficulty.easy) {
      return 'Guess any 5 letters'
    } else if (difficultyLevel === difficulty.hard) {
      return "Guess any valid word using all the hints you've been given"
    } else {
      return 'Guess any valid word'
    }
  }
  const eg: { [key: number]: string } = {}
  const [exactGuesses, setExactGuesses] = useLocalStorage(`g:${gameCode}:exact-guesses`, eg)

  const openModal = () => setIsOpen(true)
  const closeModal = () => setIsOpen(false)
  const handleInfoClose = () => {
    setFirstTime(false)
    setInfoModalIsOpen(false)
  }

  const [darkMode, setDarkMode] = useLocalStorage('dark-mode', false)
  const toggleDarkMode = () => setDarkMode((prev: boolean) => !prev)

  useEffect(() => {
    if (gameState !== state.playing) {
      setTimeout(() => {
        openModal()
      }, 500)
    }
  }, [gameState])

  const getCellStyles = (rowNumber: number, colNumber: number, letter: string) => {
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

  const addLetter = (letter: string) => {
    setSubmittedInvalidWord(false)
    setBoard((prev: string[][]) => {
      if (currentCol > 4) {
        return prev
      }
      const newBoard = [...prev]
      newBoard[currentRow][currentCol] = letter
      return newBoard
    })
    if (currentCol < 5) {
      setCurrentCol((prev: number) => prev + 1)
    }
  }

  // returns an array with a boolean of if the word is valid and an error message if it is not
  const isValidWord = (word: string): [boolean] | [boolean, string] => {
    if (word.length < 5) return [false, `please enter a 5 letter word`]
    if (difficultyLevel === difficulty.easy) return [true]
    if (!words[word.toLowerCase()]) return [false, `${word} is not a valid word. Please try again.`]
    if (difficultyLevel === difficulty.normal) return [true]
    const guessedLetters = Object.entries(letterStatuses).filter(([letter, letterStatus]) =>
      [status.yellow, status.green].includes(letterStatus)
    )
    const yellowsUsed = guessedLetters.every(([letter, _]) => word.includes(letter))
    const greensUsed = Object.entries(exactGuesses).every(
      ([position, letter]) => word[parseInt(position)] === letter
    )
    if (!yellowsUsed || !greensUsed)
      return [false, `In hard mode, you must use all the hints you've been given.`]
    return [true]
  }

  const onEnterPress = () => {
    const word = board[currentRow].join('')
    const [valid, _err] = isValidWord(word)
    if (!valid) {
      console.log({ valid, _err })
      setSubmittedInvalidWord(true)
      // alert(_err)
      return
    }

    if (currentRow === 6) return

    updateCellStatuses(word, currentRow)
    updateLetterStatuses(word)
    setCurrentRow((prev: number) => prev + 1)
    setCurrentCol(0)
  }

  const onDeletePress = () => {
    setSubmittedInvalidWord(false)
    if (currentCol === 0) return

    setBoard((prev: any) => {
      const newBoard = [...prev]
      newBoard[currentRow][currentCol - 1] = ''
      return newBoard
    })

    setCurrentCol((prev: number) => prev - 1)
  }

  const updateCellStatuses = (word: string, rowNumber: number) => {
    const fixedLetters: { [key: number]: string } = {}
    setCellStatuses((prev: any) => {
      const newCellStatuses = [...prev]
      newCellStatuses[rowNumber] = [...prev[rowNumber]]
      const wordLength = word.length
      const answerLetters: string[] = answer.split('')

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
    setExactGuesses((prev: { [key: number]: string }) => ({ ...prev, ...fixedLetters }))
  }

  const isRowAllGreen = (row: string[]) => {
    return row.every((cell: string) => cell === status.green)
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
      setLongestStreak((prev: number) => (streak > prev ? streak : prev))
      setLastFinishedAt(Date.now())
    } else if (gameState === state.playing && currentRow === 6) {
      setGameState(state.lost)
      setCurrentStreak(0)
      setLastFinishedAt(Date.now())
    }
  }, [
    cellStatuses,
    currentRow,
    gameState,
    setGameState,
    currentStreak,
    setCurrentStreak,
    setLongestStreak,
    setLastFinishedAt,
  ])

  const updateLetterStatuses = (word: string) => {
    setLetterStatuses((prev: { [key: string]: string }) => {
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
    setGameState(INITIAL_STATE.gameState)
    setBoard(INITIAL_STATE.board)
    setCellStatuses(INITIAL_STATE.cellStatuses)
    setCurrentRow(INITIAL_STATE.currentRow)
    setCurrentCol(INITIAL_STATE.currentCol)
    setLetterStatuses(INITIAL_STATE.letterStatuses())
    setSubmittedInvalidWord(INITIAL_STATE.submittedInvalidWord)
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
              {board.map((row: string[], rowNumber: number) =>
                row.map((letter: string, colNumber: number) => (
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
        <div className={`h-auto relative g:${gameState === state.playing ? '' : 'invisible'}`}>
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
