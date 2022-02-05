import { useEffect, useState } from 'react'

import {
  Answer,
  backspace,
  CellStatus,
  Difficulty,
  Equation,
  getRandomAnswer,
  allOperators,
  numbers,
  PlayState,
  Row,
  rowCharacters,
  validEquation,
  validOperators,
  rowToString,
  columns,
  Column,
  rowCount,
  nextCharIsAnOperator,
  addCharacter,
  newCellStatuses,
} from './core'
import { EndGameModal } from './components/EndGameModal'
import { InfoModal } from './components/InfoModal'
import { Keyboard } from './components/Keyboard'
import { SettingsModal } from './components/SettingsModal'
import { useLocalStorage } from './hooks/useLocalStorage'
import { ReactComponent as Info } from './data/Info.svg'
import { ReactComponent as Settings } from './data/Settings.svg'

type State = {
  answer: (d: Difficulty) => Answer
  gameState: PlayState
  board: Row[]
  cellStatuses: CellStatus[][]
  currentRowNum: number
  currentCol: Column
  charStatuses: () => { [key: string]: CellStatus }
  submittedInvalidWord: boolean
}

function calculateCharStatuses(
  prev: { [key: string]: string },
  equation: Equation,
  answer: Answer
): { [key: string]: string } {
  const newLetterStatuses = { ...prev }
  const rowChars = rowCharacters(equation)
  const answerChars = rowCharacters(answer)
  const rowLength = rowChars.length
  for (let i = 0; i < rowLength; i++) {
    if (newLetterStatuses[rowChars[i]] === CellStatus.Green) continue

    if (rowChars[i] === answerChars[i]) {
      newLetterStatuses[rowChars[i]] = CellStatus.Green
    } else if (answerChars.includes(rowChars[i])) {
      newLetterStatuses[rowChars[i]] = CellStatus.Yellow
    } else {
      newLetterStatuses[rowChars[i]] = CellStatus.Gray
    }
  }
  return newLetterStatuses
}

function App() {
  const initialStates: State = {
    answer: (d: Difficulty) => getRandomAnswer(d),
    gameState: PlayState.Playing,
    board: Array.from({ length: rowCount }, () => ({})),
    cellStatuses: Array(rowCount).fill(Array(columns.length).fill(CellStatus.Unguessed)),
    currentRowNum: 0,
    currentCol: 0,
    charStatuses: () => {
      const statuses: { [key: string]: CellStatus } = {}
      numbers.forEach((char) => {
        statuses[char] = CellStatus.Unguessed
      })
      allOperators.forEach((char) => {
        statuses[char] = CellStatus.Unguessed
      })
      return statuses
    },
    submittedInvalidWord: false,
  }

  const [gameState, setGameState] = useLocalStorage('stateGameState', initialStates.gameState)
  const [board, setBoard] = useLocalStorage('stateBoard', initialStates.board)
  const [cellStatuses, setCellStatuses] = useLocalStorage(
    'stateCellStatuses',
    initialStates.cellStatuses
  )
  const [currentRowNum, setCurrentRow] = useLocalStorage(
    'stateCurrentRow',
    initialStates.currentRowNum
  )
  const [charStatuses, setCharStatuses] = useLocalStorage(
    'stateCharStatuses',
    initialStates.charStatuses()
  )
  const [submittedInvalidWord, setSubmittedInvalidWord] = useLocalStorage(
    'stateSubmittedInvalidWord',
    initialStates.submittedInvalidWord
  )

  const [currentStreak, setCurrentStreak] = useLocalStorage('current-streak', 0)
  const [guessesInStreak, setGuessesInStreak] = useLocalStorage('guesses-in-streak', -1)
  const [longestStreak, setLongestStreak] = useLocalStorage('longest-streak', 0)
  const [modalIsOpen, setIsOpen] = useState(false)
  const [firstTime, setFirstTime] = useLocalStorage('first-time', true)
  const [infoModalIsOpen, setInfoModalIsOpen] = useState(firstTime)
  const [settingsModalIsOpen, setSettingsModalIsOpen] = useState(false)
  const [difficultyLevel, persistDifficultyLevel] = useLocalStorage('difficulty', Difficulty.Normal)
  const [answer, setAnswer] = useLocalStorage('stateAnswer', initialStates.answer(difficultyLevel))
  const setDifficultyLevel = (d: Difficulty) => {
    persistDifficultyLevel(d)
    newGame(d)
  }
  const getDifficultyLevelInstructions = () => {
    if (difficultyLevel === Difficulty.Easy) {
      return `
      Equation doesn't have to be correct
      (e.g. 2 + 2 = 5)
      Only uses +, -, *, / operators
      `
    } else if (difficultyLevel === Difficulty.Hard) {
      return `
      Adds the remainder operator %
      (e.g. 5 % 2 = 1)
      `
    } else {
      return `
      Equation must be correct, and adds the exponent operator ^
      (e.g. 2^3 = 8)
      `
    }
  }

  const openModal = () => setIsOpen(true)
  const closeModal = () => setIsOpen(false)
  const handleInfoClose = () => {
    setFirstTime(false)
    setInfoModalIsOpen(false)
  }

  const [darkMode, setDarkMode] = useLocalStorage('dark-mode', false)
  const toggleDarkMode = () => setDarkMode((prev: boolean) => !prev)

  useEffect(() => {
    if (gameState !== PlayState.Playing) {
      setTimeout(() => {
        openModal()
      }, 500)
    }
  }, [gameState])

  useEffect(() => {
    switch (gameState) {
      case PlayState.Playing:
        window.plausible('hurdle-new-game')
        break
      case PlayState.Lost:
        window.plausible('hurdle-lost', { props: { answer: rowToString(answer) } })
        break
      case PlayState.Won:
        window.plausible('hurdle-won', { props: { answer: rowToString(answer) } })
        break
    }
  }, [answer, gameState])

  function getCellStatus(row: number, col: number) {
    return cellStatuses[row][col] ?? CellStatus.Unguessed
  }

  const getCellStyles = (rowNumber: number, colNumber: number, letter: string): string => {
    if (rowNumber === currentRowNum) {
      if (letter) {
        return `nm-inset-background dark:nm-inset-background-dark text-primary dark:text-primary-dark ${
          submittedInvalidWord ? 'border border-red-800' : ''
        }`
      }
      return 'nm-flat-background dark:nm-flat-background-dark text-primary dark:text-primary-dark'
    }

    switch (getCellStatus(rowNumber, colNumber)) {
      case CellStatus.Green:
        return 'nm-inset-n-green text-gray-50'
      case CellStatus.Yellow:
        return 'nm-inset-yellow-500 text-gray-50'
      case CellStatus.Gray:
        return 'nm-inset-n-gray text-gray-50'
      case CellStatus.Unguessed:
        return 'nm-flat-background dark:nm-flat-background-dark text-primary dark:text-primary-dark'
    }
  }

  const addLetter = (character: string) => {
    setSubmittedInvalidWord(false)
    setBoard((prev: Row[]) => {
      const newBoard = [...prev]
      const row = newBoard[currentRowNum]
      addCharacter(row, character)
      return newBoard
    })
  }

  // returns an array with a boolean of if the row is valid and an error message if it is not
  const isValidRow = (row: Row): [boolean] | [boolean, string] => {
    if (difficultyLevel === Difficulty.Easy) return [true]
    if (!validEquation(row))
      return [false, `${rowCharacters(row)} is not a valid equation. Please try again.`]

    return [true]
  }

  const onEnterPress = () => {
    const row = board[currentRowNum]
    const [valid, _err] = isValidRow(row)
    if (!valid) {
      console.log({ valid, _err })
      setSubmittedInvalidWord(true)
      // alert(_err)
      return
    }

    if (currentRow === 6) return

    updateCellStatuses(row, currentRowNum)
    updateCharStatuses(row)
    setCurrentRow((prev: number) => prev + 1)

    // Only calculate guesses in streak if they've
    // started a new streak since this feature was added.
    if (guessesInStreak >= 0) {
      setGuessesInStreak(guessesInStreak + 1)
    }
  }

  const onDeletePress = () => {
    setSubmittedInvalidWord(false)

    setBoard((prev: Row[]) => {
      const newBoard = [...prev]
      backspace(newBoard[currentRowNum])
      return newBoard
    })
  }

  const updateCellStatuses = (row: Row, rowNumber: number) => {
    setCellStatuses((prev: string[][]) => {
      return newCellStatuses(prev, rowNumber, row, answer)
    })
  }

  const isRowAllGreen = (row: string[]) => {
    return row.every((cell: string) => cell === CellStatus.Green)
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
      return r[0] !== CellStatus.Unguessed
    })

    if (gameState === PlayState.Playing && lastFilledRow && isRowAllGreen(lastFilledRow)) {
      setGameState(PlayState.Won)

      var streak = currentStreak + 1
      setCurrentStreak(streak)
      setLongestStreak((prev: number) => (streak > prev ? streak : prev))
    } else if (gameState === PlayState.Playing && currentRowNum === 6) {
      setGameState(PlayState.Lost)
      setCurrentStreak(0)
      setGuessesInStreak(0)
    }
  }, [
    cellStatuses,
    currentRowNum,
    gameState,
    setGameState,
    currentStreak,
    setCurrentStreak,
    setLongestStreak,
    setGuessesInStreak,
  ])

  const updateCharStatuses = (row: Row) => {
    setCharStatuses((prev: { [key: string]: string }) => {
      const equation = row as Equation
      return calculateCharStatuses(prev, equation, answer)
    })
  }

  const newGame = (difficulty: Difficulty) => {
    setAnswer(initialStates.answer(difficulty))
    setGameState(initialStates.gameState)
    setBoard(initialStates.board)
    setCellStatuses(initialStates.cellStatuses)
    setCurrentRow(initialStates.currentRowNum)
    setCharStatuses(initialStates.charStatuses())
    setSubmittedInvalidWord(initialStates.submittedInvalidWord)
  }
  const playAgain = () => {
    newGame(difficultyLevel)
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

  const currentRow = board[currentRowNum]

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
            🏃🏾‍♀️= HURDLE =🏃‍♂
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
            <div
              className={`grid ${
                columns.length === 6 ? 'grid-cols-6' : 'grid-cols-5'
              } grid-flow-row gap-2`}
            >
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
                gameState === PlayState.Playing ? 'hidden' : ''
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
        <div className={`h-auto relative ${gameState === PlayState.Playing ? '' : 'invisible'}`}>
          <Keyboard
            charStatuses={charStatuses}
            addLetter={addLetter}
            onEnterPress={onEnterPress}
            onDeletePress={onDeletePress}
            gameDisabled={gameState !== PlayState.Playing}
            nextCharIsAnOperator={nextCharIsAnOperator(currentRow)}
            validOperators={validOperators(difficultyLevel)}
          />
        </div>
      </div>
    </div>
  )
}

export default App
