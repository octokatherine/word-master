import { ReactComponent as Close } from '../data/Close.svg'
import Modal from 'react-modal'

Modal.setAppElement('#root')

export const SettingsModal = ({ isOpen, handleClose, styles, darkMode, toggleDarkMode }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      style={styles}
      contentLabel="Game Info Modal"
    >
      <div className={`h-full ${darkMode ? 'dark' : ''}`}>
        <div
          className={`h-full flex flex-col items-center justify-center max-w-[390px] mx-auto pt-9 text-primary dark:text-primary-dark `}
        >
          <div className="flex-1 w-full">
            <button
              className="absolute top-4 right-4 rounded-full nm-flat-background dark:nm-flat-background-dark text-primary dark:text-primary-dark p-1 w-6 h-6 sm:p-2 sm:h-8 sm:w-8"
              onClick={handleClose}
            >
              <Close />
            </button>
            <div className="mt-12">
              <input className="m-2" type="checkbox" checked={darkMode} onClick={toggleDarkMode} />
              <span>Dark Mode</span>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="mb-4">
              If you're enjoying this game, you can show your support by{' '}
              <a href="https://www.buymeacoffee.com/katherinecodes" target="_blank">
                buying me a coffee
              </a>{' '}
              💛
            </div>
            <a href="https://www.buymeacoffee.com/katherinecodes">
              <img
                alt="buy me a coffee"
                src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=katherinecodes&button_colour=FFDD00&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=ffffff"
              />
            </a>
          </div>
        </div>
      </div>
    </Modal>
  )
}
