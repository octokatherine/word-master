import { numbers, operators, status } from './constants'
import { useEffect, useState } from 'react'

import { EndGameModal } from './components/EndGameModal'
import { InfoModal } from './components/InfoModal'
import { Keyboard } from './components/Keyboard'
import { SettingsModal } from './components/SettingsModal'
import { useLocalStorage } from './hooks/useLocalStorage'
import { ReactComponent as Info } from './data/Info.svg'
import { ReactComponent as Settings } from './data/Settings.svg'

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

function getRandomAnswer(): Answer {
  // TODO make this actually random
  return {
    operandA: 2,
    operator: '+',
    operandB: 5,
    result: 7,
  }
}

interface Row {
  operandA?: number
  operator?: string
  operandB?: number
  result?: number
}
type Equation = Required<Row>
type Answer = Required<Row>

type CellStatus = string
type State = {
  answer: () => Answer
  gameState: string
  board: Row[]
  cellStatuses: CellStatus[][]
  currentRow: number
  currentCol: number
  charStatuses: () => { [key: string]: string }
  submittedInvalidWord: boolean
}

function rowCharacter(row: Row, col: number): string {
  switch (col) {
    case 0:
      return row.operandA ? row.operandA.toString() : ''
    case 1:
      return row.operator || ''
    case 2:
      return row.operandB ? row.operandB.toString() : ''
    case 3:
      return '='
    case 4:
      return row.result ? row.result.toString() : ''
  }

  throw new Error('Something bad happened')
}

function rowCharacters(row: Row): string[] {
  return [0, 1, 2, 3, 4].map((col) => {
    return rowCharacter(row, col)
  })
}

function isCellCorrect(row: Row, i: number, answer: Answer): boolean {
  return rowCharacter(row, i) === rowCharacter(answer, i)
}

function hasNumber(row: Row, num?: number): boolean {
  return row.operandA === num || row.operandB === num || row.result === num
}

function validEquation(row: Row): boolean {
  const equation = row as Required<Row>
  if (equation.operator === '+') {
    return equation.operandA + equation.operandB === equation.result
  } else if (equation.operator === '-') {
    return equation.operandA - equation.operandB === equation.result
  } else if (equation.operator === '*') {
    return equation.operandA * equation.operandB === equation.result
  } else if (equation.operator === '/') {
    return equation.operandA / equation.operandB === equation.result
  } else {
    throw new Error('Invalid operator ' + equation.operator)
  }
}

function calculateCharStatuses(
  prev: { [key: string]: string },
  equation: Equation,
  answer: Answer
): { [key: string]: string } {
  const result = prev
  if (equation.operandA === answer.operandA) {
    result[answer.operandA] = status.green
  } else if (hasNumber(answer, equation.operandA)) {
    result[equation.operandA] = status.yellow
  } else {
    result[equation.operandA] = status.gray
  }

  if (equation.operator === answer.operator) {
    result[equation.operator] = status.green
  } else {
    result[equation.operator] = status.gray
  }

  if (equation.operandB === answer.operandB) {
    result[equation.operandB] = status.green
  } else if (hasNumber(answer, equation.operandB)) {
    result[equation.operandB] = status.yellow
  } else {
    result[equation.operandB] = status.gray
  }

  if (equation.result === answer.result) {
    result[equation.result] = status.green
  } else if (hasNumber(answer, equation.result)) {
    result[equation.result] = status.yellow
  } else {
    result[equation.result] = status.gray
  }

  return result
}

function backspace(row: Row, currentCol: number) {
  switch (currentCol) {
    case 2:
      row.operandA = undefined
      break
    case 3:
      row.operator = undefined
      break
    case 4:
      row.operandB = undefined
      break
    case 5:
      row.result = undefined
      break
  }
}

function addCharacter(row: Row, currentCol: number, character: string) {
  switch (currentCol) {
    case 0:
      row.operandA = parseInt(character)
      break
    case 1:
      row.operator = character
      break
    case 2:
      row.operandB = parseInt(character)
      break
    case 3:
      break
    case 4:
      row.result = parseInt(character)
      break
  }
}

function App() {
  const initialStates: State = {
    answer: () => getRandomAnswer(),
    gameState: state.playing,
    board: [{}, {}, {}, {}, {}, {}],
    cellStatuses: Array(6).fill(Array(5).fill(status.unguessed)),
    currentRow: 0,
    currentCol: 0,
    charStatuses: (): { [key: string]: string } => {
      const statuses: { [key: string]: string } = {}
      numbers.forEach((char) => {
        statuses[char] = status.unguessed
      })
      operators.forEach((char) => {
        statuses[char] = status.unguessed
      })
      return statuses
    },
    submittedInvalidWord: false,
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
  const [charStatuses, setCharStatuses] = useLocalStorage(
    'stateCharStatuses',
    initialStates.charStatuses()
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
  const eg: { [key: number]: string } = {}
  const [exactGuesses, setExactGuesses] = useLocalStorage('exact-guesses', eg)

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

  const addLetter = (character: string) => {
    setSubmittedInvalidWord(false)
    setBoard((prev: Row[]) => {
      if (currentCol > 4) {
        return prev
      }
      const newBoard = [...prev]
      const row = newBoard[currentRow]
      addCharacter(row, currentCol, character)
      return newBoard
    })
    if (currentCol < 5) {
      // Equals sign is fixed - skip over it
      const delta = currentCol === 2 ? 2 : 1
      setCurrentCol((prev: number) => prev + delta)
    }
  }

  // returns an array with a boolean of if the word is valid and an error message if it is not
  const isValidRow = (row: Row): [boolean] | [boolean, string] => {
    // if (word.length < 5) return [false, `please enter a 5 letter word`]
    if (difficultyLevel === difficulty.easy) return [true]
    if (!validEquation(row))
      return [false, `${rowCharacters(row)} is not a valid equation. Please try again.`]
    if (difficultyLevel === difficulty.normal) return [true]
    const guessedLetters = Object.entries(charStatuses).filter(([letter, charStatus]) =>
      [status.yellow, status.green].includes(charStatus)
    )
    // const yellowsUsed = guessedLetters.every(([letter, _]) => word.includes(letter))
    // const greensUsed = Object.entries(exactGuesses).every(
    //   ([position, letter]) => word[parseInt(position)] === letter
    // )
    // if (!yellowsUsed || !greensUsed)
    //   return [false, `In hard mode, you must use all the hints you've been given.`]
    return [true]
  }

  const onEnterPress = () => {
    const row = board[currentRow]
    const [valid, _err] = isValidRow(row)
    if (!valid) {
      console.log({ valid, _err })
      setSubmittedInvalidWord(true)
      // alert(_err)
      return
    }

    if (currentRow === 6) return

    updateCellStatuses(row, currentRow)
    updateCharStatuses(row)
    setCurrentRow((prev: number) => prev + 1)
    setCurrentCol(0)
  }

  const onDeletePress = () => {
    setSubmittedInvalidWord(false)
    if (currentCol === 0) return

    setBoard((prev: Row[]) => {
      const newBoard = [...prev]
      backspace(newBoard[currentRow], currentCol)
      return newBoard
    })

    setCurrentCol((prev: number) => {
      // Equals sign is fixed - skip over it
      const delta = currentCol === 2 ? 2 : 1
      return prev - delta
    })
  }

  const updateCellStatuses = (row: Row, rowNumber: number) => {
    const fixedLetters: { [key: number]: string } = {}
    setCellStatuses((prev: string[][]) => {
      const newCellStatuses = [...prev]
      newCellStatuses[rowNumber] = [...prev[rowNumber]]
      const rowLength = rowCharacters(row).length
      const answerChars: string[] = rowCharacters(answer)

      // set all to gray
      for (let i = 0; i < rowLength; i++) {
        newCellStatuses[rowNumber][i] = status.gray
      }

      // check greens
      for (let i = rowLength - 1; i >= 0; i--) {
        if (isCellCorrect(row, i, answer)) {
          newCellStatuses[rowNumber][i] = status.green
          answerChars.splice(i, 1)
          fixedLetters[i] = rowCharacter(answer, i)
        }
      }

      // check yellows
      for (let i = 0; i < rowLength; i++) {
        if (
          answerChars.includes(rowCharacter(row, i)) &&
          newCellStatuses[rowNumber][i] !== status.green
        ) {
          newCellStatuses[rowNumber][i] = status.yellow
          answerChars.splice(answerChars.indexOf(rowCharacter(row, i)), 1)
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

  const updateCharStatuses = (row: Row) => {
    setCharStatuses((prev: { [key: string]: string }) => {
      const equation = row as Equation
      return calculateCharStatuses(prev, equation, answer)
    })
  }

  const playAgain = () => {
    setAnswer(initialStates.answer())
    setGameState(initialStates.gameState)
    setBoard(initialStates.board)
    setCellStatuses(initialStates.cellStatuses)
    setCurrentRow(initialStates.currentRow)
    setCurrentCol(initialStates.currentCol)
    setCharStatuses(initialStates.charStatuses())
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

  const nextCharIsAnOperator = currentCol === 1

  return (
    <div className={darkMode ? 'dark' : ''}>
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
            NERDLE
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
                rowCharacters(row).map((value: string, colNumber: number) => (
                  <span
                    key={colNumber}
                    className={`${getCellStyles(
                      rowNumber,
                      colNumber,
                      value
                    )} inline-flex items-center font-medium justify-center text-lg w-[13vw] h-[13vw] xs:w-14 xs:h-14 sm:w-20 sm:h-20 rounded-full`}
                  >
                    {value}
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
            charStatuses={charStatuses}
            addLetter={addLetter}
            onEnterPress={onEnterPress}
            onDeletePress={onDeletePress}
            gameDisabled={gameState !== state.playing}
            nextCharIsAnOperator={nextCharIsAnOperator}
          />
        </div>
      </div>
    </div>
  )
}

export default App
