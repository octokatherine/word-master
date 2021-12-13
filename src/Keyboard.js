import { keyboardLetters, status, letters } from './constants'
import { useEffect, useCallback } from 'react'

const Keyboard = ({ letterStatuses, addLetter, onEnterPress, onDeletePress }) => {
  const getKeyStyle = (letter) => {
    switch (letterStatuses[letter]) {
      case status.green:
        return 'bg-green-600 text-white'
      case status.yellow:
        return 'bg-yellow-600 text-white'
      case status.gray:
        return 'bg-gray-600 text-white'
      default:
        return 'bg-gray-300'
    }
  }

  const onKeyButtonPress = (letter) => {
    letter = letter.toLowerCase()
    window.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: letter,
      })
    )
  }

  const handleKeyDown = useCallback(
    (event) => {
      const letter = event.key.toUpperCase()

      if (letters.includes(letter)) {
        addLetter(letter)
      } else if (letter === 'ENTER') {
        onEnterPress()
      } else if (letter === 'BACKSPACE') {
        onDeletePress()
      }
    },
    [addLetter, onEnterPress, onDeletePress]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <div className="w-full flex flex-col items-center mb-2">
      {keyboardLetters.map((row, idx) => (
        <div className="w-full flex justify-center my-[5px]">
          <>
            {idx === 2 && (
              <button
                onClick={onEnterPress}
                className="h-14 w-12 px-1 text-xs bg-gray-300 mx-[2px] font-bold rounded"
              >
                ENTER
              </button>
            )}
            {row.map((letter) => (
              <button
                onClick={() => onKeyButtonPress(letter)}
                key={letter}
                className={`h-14 w-8 sm:w-10 ${getKeyStyle(
                  letter
                )} mx-[2px] text-sm font-bold rounded`}
              >
                {letter}
              </button>
            ))}
            {idx === 2 && (
              <button
                onClick={onDeletePress}
                className="h-14 w-12 flex items-center justify-center bg-gray-300 mx-[2px] text-sm font-bold rounded"
              >
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

export { Keyboard }
