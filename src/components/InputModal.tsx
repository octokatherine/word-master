import { useState } from 'react';
import Modal from 'react-modal'
import { ReactComponent as Github } from '../data/Github.svg'
import { ReactComponent as Close } from '../data/Close.svg'

if (process.env.NODE_ENV !== 'test') Modal.setAppElement('#root')

type Props = {
  isOpen: boolean
  handleClose: () => void
  darkMode: boolean
  styles: any
  setAnswer: any
  answers: string[]
  setInputModalIsOpen: any
}

export const InputModal = ({ isOpen, handleClose, darkMode, styles, answers, setAnswer, setInputModalIsOpen }: Props) => {
  const [userWordle, setUserWordle] = useState('');
  const [isValidWordle, setIsValidWordle] = useState(false);
  const [errorMessages, setErrorMessages] = useState([]);

  const validateWordle = (userWordle: string) => {
    let errorMessages: string[] = [];
  
    if (userWordle.length !== 5) {
      errorMessages.push('Wordle must be exactly 5 letters.');
    }
  
    if (!answers.includes(userWordle.toLowerCase())) {
      errorMessages.push('Wordle must be a valid word.');
    }
  
    //  @ts-ignore
    setErrorMessages(errorMessages);
  
    if (!errorMessages.length) {
      setIsValidWordle(true);
    } else {
      setIsValidWordle(false);
    }
  }
  
  const handleWordleEntry = (enteredWordle: any) => {
    setUserWordle(enteredWordle);

    validateWordle(enteredWordle);
  };
  
  const handleWordleSubmission = () => {
    if (isValidWordle) {
      setAnswer(userWordle.toUpperCase());
      setInputModalIsOpen(false);
    }
  }
  
  const renderErrorMessages = (errorMessages: string[]) => {
    return errorMessages.map((errorMessage) => {
      return <li className="mb-2 text-red-600">{errorMessage}</li>
    });
  }

  return (
    <Modal isOpen={isOpen} onRequestClose={handleClose} style={styles} contentLabel="Game Info Modal">
      <div className={`h-full ${darkMode ? 'dark' : ''}`}>
        <button
          className="absolute top-4 right-4 rounded-full nm-flat-background dark:nm-flat-background-dark text-primary dark:text-primary-dark p-1 w-6 h-6 sm:p-2 sm:h-8 sm:w-8 hover:nm-inset-background dark:hover:nm-inset-background-dark"
          onClick={handleClose}
        >
          <Close />
        </button>
        <div className="h-full flex flex-col items-center justify-center max-w-[390px] mx-auto pt-9 text-primary dark:text-primary-dark">
          <div className="flex-1 w-full sm:text-base text-sm">
            <h1 className="text-center sm:text-3xl text-2xl mb-4">Input a Word(le)!</h1>
            <div className="flex flex-col gap-y-3">
              <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="text" placeholder="Must be a real, 5 letter, word." onChange={e => handleWordleEntry(e.target.value)} value={userWordle}/>

              <button className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${!isValidWordle ? 'rounded opacity-50 cursor-not-allowed' : ''}`} onClick={() => { handleWordleSubmission() }}>
                Submit Wordle
              </button>

              <ul>
                {renderErrorMessages(errorMessages)}
              </ul>
            </div>
            <div className="mt-5">
              After each guess, each letter will turn green, yellow, or gray.
            </div>
            <div className="mb-3 mt-5 flex items-center">
              <span className="nm-inset-n-green text-gray-50 inline-flex items-center justify-center text-3x w-10 h-10 rounded-full">
                W
              </span>
              <span className="mx-2">=</span>
              <span>Correct letter, correct spot</span>
            </div>
            <div className="mb-3">
              <span className="nm-inset-yellow-500 text-gray-50 inline-flex items-center justify-center text-3x w-10 h-10 rounded-full">
                W
              </span>
              <span className="mx-2">=</span>
              <span>Correct letter, wrong spot</span>
            </div>
            <span className="nm-inset-n-gray text-gray-50 inline-flex items-center justify-center text-3x w-10 h-10 rounded-full">
              W
            </span>
            <span className="mx-2">=</span>
            <span>Wrong letter</span>
          </div>
          <div className="flex justify-center sm:text-base text-sm">
            <span>This project is open source on</span>
            <a
              className="ml-[6px] rounded-full h-5 w-5 sm:h-6 sm:w-6"
              href="https://github.com/octokatherine/word-master"
              target="_blank"
              rel="noreferrer"
            >
              <Github />
            </a>
          </div>
        </div>
      </div>
    </Modal>
    )
};
