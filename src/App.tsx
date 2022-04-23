import { letters, status } from './constants'
import { useEffect, useState } from 'react'

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

type Conflict = {
  sourceRow: number
  sourceCol: number
  position: number | null
  toolip: string
}

type LetterHint = {
  sourceRow: number
  sourceCol: number
  letter: string
  minCount: number
}

type PositionalHint = {
  sourceRow: number
  sourceCol: number
  position: number
  is: string
}

type State = {
  answer: () => string
  gameState: string
  board: string[][]
  cellStatuses: string[][]
  currentRow: number
  currentCol: number
  letterStatuses: () => { [key: string]: string }
  letterHints: LetterHint[]
  positionalHints: PositionalHint[]
  submittedInvalidWord: boolean
  currentConflicts: Conflict[]
  darkMode: boolean
}

function App() {
  const initialStates: State = {
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
    letterHints: [],
    positionalHints: [],
    submittedInvalidWord: false,
    currentConflicts: [],
    darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
  }

  const [answer, setAnswer] = useLocalStorage('stateAnswer', initialStates.answer())
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
  const [letterHints, setLetterHints] = useLocalStorage('stateLetterHints', initialStates.letterHints)
  const [positionalHints, setPositionalHints] = useLocalStorage('statePositionalHints', initialStates.positionalHints)
  const [currentConflicts, setCurrentConflicts] = useLocalStorage('stateCurrentConflicts', initialStates.currentConflicts)
  const [submittedInvalidWord, setSubmittedInvalidWord] = useLocalStorage(
    'stateSubmittedInvalidWord',
    initialStates.submittedInvalidWord
  )

  const [currentStreak, setCurrentStreak] = useLocalStorage('current-streak', 0)
  const [longestStreak, setLongestStreak] = useLocalStorage('longest-streak', 0)
  const [modalIsOpen, setIsOpen] = useState(false)
  const [firstTime, setFirstTime] = useLocalStorage('first-time', true)
  const [guessesInStreak, setGuessesInStreak] = useLocalStorage(
    'guesses-in-streak',
    firstTime ? 0 : -1
  )
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

  const openModal = () => setIsOpen(true)
  const closeModal = () => setIsOpen(false)
  const handleInfoClose = () => {
    setFirstTime(false)
    setInfoModalIsOpen(false)
  }

  const [darkMode, setDarkMode] = useLocalStorage('dark-mode', initialStates.darkMode)
  const toggleDarkMode = () => setDarkMode((prev: boolean) => !prev)

  useEffect(
    () => document.documentElement.classList[darkMode ? 'add' : 'remove']('dark'),
    [darkMode]
  )

  useEffect(() => {
    if (gameState !== state.playing) {
      setTimeout(() => {
        openModal()
      }, 500)
    }
  }, [gameState])

  const getCellStyles = (rowNumber: number, colNumber: number, letter: string) => {
    const hasConflicts = currentConflicts.filter(c => c.sourceRow === rowNumber && c.sourceCol === colNumber).length > 0

    if (rowNumber === currentRow) {
      if (letter) {
        const base = 'nm-inset-background dark:nm-inset-background-dark text-primary dark:text-primary-dark'
        if (currentConflicts.filter(c => c.position === colNumber).length > 0) {
          return `${base} border-2 border-red-800`
        } else if (submittedInvalidWord) {
          return `${base} border border-red-800`
        } else {
          return base
        }
      }
      return 'nm-flat-background dark:nm-flat-background-dark text-primary dark:text-primary-dark'
    }

    switch (cellStatuses[rowNumber][colNumber]) {
      case status.green:
        return `nm-inset-n-green text-gray-50 ${hasConflicts ? 'border-4 border-red-800' : ''}`
      case status.yellow:
        return `nm-inset-yellow-500 text-gray-50 ${hasConflicts ? 'border-4 border-red-800' : ''}`
      case status.gray:
        return `nm-inset-n-gray text-gray-50 ${hasConflicts ? 'border-4 border-red-800' : ''}`
      default:
        return 'nm-flat-background dark:nm-flat-background-dark text-primary dark:text-primary-dark'
    }
  }

  const addLetter = (letter: string) => {
    setSubmittedInvalidWord(false)
    setCurrentConflicts([])
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
  const isValidWord = (word: string): [boolean] | [boolean, string, Conflict[]] => {
    // easy
    if (word.length < 5) return [false, `please enter a 5 letter word`, []]
    if (difficultyLevel === difficulty.easy) return [true]

    // normal
    if (!words[word.toLowerCase()]) return [false, `${word} is not a valid word. Please try again.`, []]
    if (difficultyLevel === difficulty.normal) return [true]

    const conflicts: Conflict[] = []
    const wordLetters = [...word]

    // hard
    letterHints.forEach(hint => {
      if (hint.minCount > wordLetters.filter(letter => letter === hint.letter).length) {
        conflicts.push({
          sourceRow: hint.sourceRow,
          sourceCol: hint.sourceCol,
          position: null,
          toolip: `${word} has less than ${hint.minCount} ${hint.letter}'s`
        })
      }
    })

    positionalHints.forEach(hint => {
      if (hint.is !== word[hint.position]) {
        conflicts.push({
          sourceRow: hint.sourceRow,
          sourceCol: hint.sourceCol,
          position: hint.position,
          toolip: `The ${getOrdinal(hint.position + 1)} letter is supposed to be ${hint.is}`
        })
      }
    })

    if (conflicts.length > 0)
      return [false, "In hard mode, you must use all hints you've been given.", conflicts]

    return [true]
  }

  const getOrdinal = (n: number) => {
    const s = ['th', 'st', 'nd', 'rd']
    const v = n % 100
    return n + (s[(v - 20) % 10] || s[v] || s[0])
  }

  const onEnterPress = () => {
    const word = board[currentRow].join('')
    const [valid, _err, _conflicts] = isValidWord(word)
    if (!valid) {
      console.log({ valid, _err })
      setSubmittedInvalidWord(_conflicts?.length === 0)
      setCurrentConflicts(_conflicts)
      // alert(_err)
      return
    } else {
      setSubmittedInvalidWord(false)
      setCurrentConflicts([])
    }

    if (currentRow === 6) return

    updateCellStatuses(word, currentRow)
    updateLetterStatuses(word)
    setCurrentRow((prev: number) => prev + 1)
    setCurrentCol(0)

    // Only calculate guesses in streak if they've
    // started a new streak since this feature was added.
    if (guessesInStreak >= 0) {
      setGuessesInStreak((prev: number) => prev + 1)
    }
  }

  const onDeletePress = () => {
    setSubmittedInvalidWord(false)
    setCurrentConflicts([])
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

      updateHints(word, newCellStatuses[rowNumber], rowNumber)

      return newCellStatuses
    })
  }

  const isRowAllGreen = (row: string[]) => {
    return row.every((cell: string) => cell === status.green)
  }

  const avgGuessesPerGame = (): number => {
    if (currentStreak > 0) {
      return guessesInStreak / currentStreak
    } else {
      return 0
    }
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

  const updateHints = (word: string, cellStatuses: string[], currentRow: number) => {
    const newLetterHints: LetterHint[] = []
    const newPositionalHints: PositionalHint[] = []
    const wordLength = word.length

    const positiveHints: { [key: string]: number } = { }
    for (let i = 0; i < wordLength; i++) {
      const letter = word[i]
      if (cellStatuses[i] !== status.gray) {
        positiveHints[letter] = (positiveHints[letter] || 0) + 1
      }
    }

    for (let i = 0; i < wordLength; i++) {
      const letter = word[i]
      if (cellStatuses[i] === status.green) {
        newPositionalHints.push({
          sourceRow: currentRow,
          sourceCol: i,
          position: i,
          is: letter,
        })
        newLetterHints.push({
          sourceRow: currentRow,
          sourceCol: i,
          letter: letter,
          minCount: positiveHints[letter],
        })
      } else if (cellStatuses[i] === status.yellow) {
        newLetterHints.push({
          sourceRow: currentRow,
          sourceCol: i,
          letter: letter,
          minCount: positiveHints[letter],
        })
      }
    }

    setLetterHints((prev: LetterHint[]) => [...prev, ...newLetterHints])
    setPositionalHints((prev: PositionalHint[]) => [...prev, ...newPositionalHints])
  }

  const playAgain = () => {
    if (gameState === state.lost) {
      setGuessesInStreak(0)
    }

    setAnswer(initialStates.answer())
    setGameState(initialStates.gameState)
    setBoard(initialStates.board)
    setCellStatuses(initialStates.cellStatuses)
    setCurrentRow(initialStates.currentRow)
    setCurrentCol(initialStates.currentCol)
    setLetterStatuses(initialStates.letterStatuses())
    setLetterHints(initialStates.letterHints)
    setPositionalHints(initialStates.positionalHints)
    setSubmittedInvalidWord(initialStates.submittedInvalidWord)
    setCurrentConflicts(initialStates.currentConflicts)

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
    <div>
      <div className={`flex flex-col justify-between h-fill bg-background dark:bg-background-dark`}>
        <header className="flex items-center py-2 px-3 text-primary dark:text-primary-dark">
          <button
            type="button"
            onClick={() => setSettingsModalIsOpen(true)}
            className="p-1 rounded-full"
          >
            <Settings />
          </button>
          <h1 className="flex-1 text-center text-xl xxs:text-2xl sm:text-4xl tracking-wide font-bold font-righteous">
            WORD MASTER
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
                    )} inline-flex items-center font-medium justify-center text-lg w-[13vw] h-[13vw] xs:w-14 xs:h-14 sm:w-20 sm:h-20 rounded-full`}
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
          state={state}
          currentStreak={currentStreak}
          longestStreak={longestStreak}
          answer={answer}
          playAgain={playAgain}
          avgGuessesPerGame={avgGuessesPerGame()}
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

export default App
