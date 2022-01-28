import { ReactNode, useEffect, useState } from 'react'
import { ReactComponent as Close } from '../data/Close.svg'
import Modal from 'react-modal'
import Success from '../data/Success.png'
import Fail from '../data/Cross.png'
import { status } from '../constants'

Modal.setAppElement('#root')

interface ModalButtonProps extends React.ComponentPropsWithoutRef<'button'> {
  children: ReactNode
}

const ModalButton = ({ children, ...props }: ModalButtonProps) => (
  <button
    className="rounded-lg px-6 py-2 mt-8 text-lg nm-flat-background dark:nm-flat-background-dark hover:nm-inset-background dark:hover:nm-inset-background-dark text-primary dark:text-primary-dark"
    {...props}
  >
    {children}
  </button>
)

type Props = {
  isOpen: boolean
  handleClose: () => void
  styles: any
  darkMode: boolean
  gameState: string
  cellStatuses: string[][]
  currentRow: number
  state: any
  currentStreak: any
  longestStreak: any
  answer: any
  playAgain: any
  shareUrl: string
}

export const EndGameModal = ({
  isOpen,
  handleClose,
  styles,
  darkMode,
  gameState,
  cellStatuses,
  currentRow,
  state,
  currentStreak,
  longestStreak,
  answer,
  playAgain,
  shareUrl,
}: Props) => {
  const PlayAgainButton = () => {
    return (
      <div className={darkMode ? 'dark' : ''}>
        <ModalButton autoFocus type="button" onClick={playAgain}>
          Play Again
        </ModalButton>
      </div>
    )
  }
  const ShareButton = () => {
    const [buttonPressed, setButtonPressed] = useState(false)
    useEffect(() => {
      if (buttonPressed !== false) {
        setTimeout(() => setButtonPressed(false), 3000)
      }
    }, [buttonPressed])
    return (
      <div className={darkMode ? 'dark' : ''}>
        <ModalButton
          onClick={() => {
            setButtonPressed(true)
            navigator.clipboard.writeText(
              `${shareUrl} ${gameState === state.won ? currentRow : 'X'}/6\n\n` +
                cellStatuses
                  .map((row) => {
                    if (row.every((item) => item !== status.unguessed)) {
                      return (
                        row
                          .map((state) => {
                            switch (state) {
                              case status.gray:
                                return '⬜'
                              case status.green:
                                return '🟩'
                              case status.yellow:
                                return '🟨'
                              default:
                                return '  '
                            }
                          })
                          .join('') + '\n'
                      )
                    } else {
                      return ''
                    }
                  })
                  .join('')
            )
          }}
        >
          {buttonPressed ? 'Copied!' : 'Share'}
        </ModalButton>
      </div>
    )
  }
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      style={styles}
      contentLabel="Game End Modal"
    >
      <div className={darkMode ? 'dark' : ''}>
        <div className="h-full flex flex-col items-center justify-center max-w-[300px] mx-auto text-primary dark:text-primary-dark">
          <button
            className="absolute top-4 right-4 rounded-full nm-flat-background dark:nm-flat-background-dark text-primary dark:text-primary-dark p-1 w-6 h-6 sm:p-2 sm:h-8 sm:w-8 hover:nm-inset-background dark:hover:nm-inset-background-dark"
            onClick={handleClose}
          >
            <Close />
          </button>
          {gameState === state.won && (
            <>
              <img src={Success} alt="success" height="auto" width="auto" />
              <h1 className=" text-3xl">Congrats!</h1>
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
              <div className="text-primary dark:text-primary-dark text-4xl text-center">
                <p>Oops!</p>
                <p className="mt-3 text-2xl">
                  The word was <strong>{answer}</strong>
                </p>
                <p className="mt-6 text-base">
                  Current streak: <strong>{currentStreak}</strong> {currentStreak > 4 && '🔥'}
                </p>
                <p className="text-base">
                  Longest streak: <strong>{longestStreak}</strong>
                </p>
              </div>
            </>
          )}
          <PlayAgainButton />
          <ShareButton />
        </div>
      </div>
    </Modal>
  )
}
