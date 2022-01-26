import { RadioGroup, Switch } from '@headlessui/react'

import { ReactComponent as Close } from '../data/Close.svg'
import Modal from 'react-modal'
import { difficulty } from '../App'

Modal.setAppElement('#root')

export const SettingsModal = ({
  isOpen,
  handleClose,
  styles,
  darkMode,
  toggleDarkMode,
  difficultyLevel,
  setDifficultyLevel,
  levelInstructions,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      style={styles}
      contentLabel="Settings Modal"
    >
      <div className={`h-full ${darkMode ? 'dark' : ''}`}>
        <div
          className={`h-full flex flex-col items-center justify-center max-w-[390px] mx-auto pt-9 text-primary dark:text-primary-dark `}
        >
          <h1 className="text-center mb-4 sm:text-3xl text-2xl">Settings</h1>
          <div className="flex-1 w-full border-b border-slate-400 mb-4">
            <button
              className="absolute top-4 right-4 rounded-full nm-flat-background dark:nm-flat-background-dark text-primary dark:text-primary-dark p-1 w-6 h-6 sm:p-2 sm:h-8 sm:w-8 hover:nm-inset-background dark:hover:nm-inset-background-dark"
              onClick={handleClose}
            >
              <Close />
            </button>

            <Switch.Group as="div" className="flex items-center">
              <Switch
                checked={darkMode}
                onChange={toggleDarkMode}
                className={`${
                  darkMode
                    ? 'nm-inset-yellow-500 border-background-dark'
                    : 'nm-inset-background border-transparent'
                } relative inline-flex flex-shrink-0 h-8 w-14 p-1 border-2 rounded-full cursor-pointer transition ease-in-out duration-200`}
              >
                <span
                  aria-hidden="true"
                  className={`${
                    darkMode ? 'translate-x-[1.55rem]' : 'translate-x-0'
                  } absolute pointer-events-none inline-block top-1/2 -translate-y-1/2 h-5 w-5 shadow rounded-full bg-white transform ring-0 transition ease-in-out duration-200`}
                />
              </Switch>
              <Switch.Label as="span" className="ml-3 cursor-pointer">
                Dark Mode
              </Switch.Label>
            </Switch.Group>

            <RadioGroup value={difficultyLevel} onChange={setDifficultyLevel} className="mt-6">
              <RadioGroup.Label className="w-full text-center">Difficulty Level</RadioGroup.Label>
              <div className="grid grid-cols-3 gap-2 rounded-full mt-2 p-1 nm-inset-background dark:nm-inset-background-dark">
                {Object.keys(difficulty).map((option) => (
                  <RadioGroup.Option
                    key={option}
                    value={option}
                    className={({ checked }) =>
                      `text-primary dark:text-primary-dark ${
                        checked
                          ? 'bg-white dark:text-primary'
                          : 'hover:nm-inset-background-sm dark:hover:nm-inset-background-dark-sm'
                      }
                        rounded-full py-2 px-3 flex items-center justify-center text-sm font-bold uppercase sm:flex-1 cursor-pointer`
                    }
                  >
                    <RadioGroup.Label as="p">{option}</RadioGroup.Label>
                  </RadioGroup.Option>
                ))}
              </div>
            </RadioGroup>
            <p className="text-center w-10/12 mx-auto font-medium">{levelInstructions}</p>
          </div>
          <div className="flex flex-col items-center text-sm">
            <div className="mb-4">
              Buy the{' '}
              <a
                className="underline"
                href="https://ko-fi.com/s/afbfa7ae55"
                target="_blank"
                rel="noreferrer"
              >
                ASL Font
              </a>
              👌
            </div>
            <div className="mb-4">
              Forked from{' '}
              <a
                href="https://octokatherine.github.io/word-master/"
                className="underline"
                target="_blank"
                rel="noreferrer"
              >
                Word Master
              </a>
              , which was inspired by{' '}
              <a
                href="https://www.powerlanguage.co.uk/wordle/"
                className="underline"
                target="_blank"
                rel="noreferrer"
              >
                Wordle
              </a>
              💛
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}
