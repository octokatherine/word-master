import { useState, Fragment} from 'react'
import { Link } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { renderServerErrors } from '../utils/misc';
import ReactModal from 'react-modal';
import useStore from '../utils/store';

type Props = {
//   letterStatuses: { [key: string]: string }
//   gameDisabled: boolean
//   onDeletePress: () => void
//   onEnterPress: () => void
//   addLetter: any
}

const modalStyle = { 
    overlay: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center', 
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
    },
    // content: {
    //     width: '750px',
    //     height: '750px',
    //     position: 'relative',
    //     backgroundColor: '#3C2A34',
    //     border: '0',
    //     borderRadius: '15%',
    //     padding: '3rem',
    //     inset: '0',
    // },  
};

const Lobby = ({}: Props) => {
    const { user } = useStore();
    const [isOpenMatch, setIsOpenMatch] = useState(false);
    const [isSpecificPlayer, setSpecificPlayer] = useState(false);

	return (
        <Fragment>
            <div className="max-w-6xl flex flex-col gap-y-3 h-full md:gap-x-6 md:flex-row mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div className="flex gap-y-2 flex-col p-4 rounded-lg border border-gray-200 shadow-md bg-[#3C2A34] h-max md:basis-4/12">
                    <div className="">
                        <h3 className="text-2xl font-bold tracking-tight text-[#F1F1F9]">Welcome back,</h3>
                        {/* TODO: If email is super long, it'll stretch the page */}
                        <h2 className="text-3xl font-bold tracking-tight text-[#15B097]">{user?.email}</h2>
                    </div>

                    <div className="flex flex-col justify-conter font-normal text-gray-700 dark:text-gray-400">
                        <div className="flex flex-row gap-x-6 md:flex-col">
                            <div>
                                <h3 className="text-base font-bold text-[#F1F1F9] dark:text-gray-400">Matches Played</h3>
                                <span className="text-[#F1F1F9]">489</span>
                            </div>

                            <div>
                                <h3 className="text-base font-bold text-[#F1F1F9] dark:text-gray-400">Wins</h3>
                                <span className="text-[#F1F1F9]">69</span>
                            </div>

                            <div>
                                <h3 className="text-base font-bold text-[#F1F1F9] dark:text-gray-400">Losses</h3>
                                <span className="text-[#F1F1F9]">420</span>
                            </div>
                        </div>
                    </div>

                    <button className="bg-[#15B097] hover:bg-green-700 text-[#F1F1F9] font-bold py-2 px-4 rounded w-full">
                        Start a New Match
                    </button>
                </div>

                {/* TODO: This basis-[46rem] business is a kludge fix to ensure the layout looks right on moble */}
                <div className="flex flex-col items-center justify-center overflow-scroll p-6 basis-[46rem] md:basis-8/12 bg-[#3C2A34] rounded-lg border border-gray-200 shadow-md">
                    <div className="mx-auto max-w-lg">
                        <h2 className="mb-2 text-2xl font-bold tracking-tight text-[#F1F1F9] dark:text-white">You have no currently active matches.</h2>
                        <button className="bg-[#15B097] hover:bg-green-700 text-[#F1F1F9] font-bold py-2 px-4 rounded w-full">
                            Start a New Match
                        </button>
                    </div>
                </div>
            </div>

            {/* @ts-ignore */}
            <ReactModal isOpen={true} style={modalStyle} className="flex border-2 border-white rounded-[5rem]">
                <div className="flex justify-center flex-col text-xs mx-auto gap-y-4 p-6 md:text-base md:gap-y-8 md:p-12 md:max-w-sm">
                    <h2 className="text-xl text-center font-bold tracking-tight text-[#F1F1F9] md:text-2xl">Start a New Match</h2>    

                    <p>blah blah blah basic rules/instructions. </p>
 
                    <button className={'bg-[#15B097] hover:bg-green-700 text-[#F1F1F9] font-bold py-2 px-4 rounded w-full'}>Invite Specific Player</button>
                    <button className={'bg-[#15B097] hover:bg-green-700 text-[#F1F1F9] font-bold py-2 px-4 rounded w-full'}>Create Open Match</button>

                    {isSpecificPlayer && 
                        <div className="flex justify-center flex-col">
                            <div className="flex justify-center flex-col">
                                <span>Your Word</span>
                                <input type="text" className="text-black"></input>
                            </div>

                            <div className="flex justify-center flex-col md:flex-row">
                                <input type="radio" className="text-black pd-2" /> Enter user email
                                <input type="text" className="text-black pd-2" placeholder="User's email"></input>
                            </div>
                        </div>
                    }

                    {isOpenMatch && <div>lmao</div>}
                    
                    {/* <div className="flex justify-center flex-col">
                        <span>Your Word</span>
                        <input type="text" className="text-black"></input>
                    </div>

                    <div className="flex justify-center flex-col">
                        <div className="flex justify-center flex-col md:flex-row">
                            <input type="radio" className="text-black pd-2" /> Challenge a User
                            <input type="text" className="text-black pd-2" placeholder="User's email"></input>
                        </div>
                        <div className="flex justify-center flex-col">
                            <span>Send match URL</span>
                            <span>Play with the first registered user who opens the link!</span>
                            <input type="text" className="text-black"></input>
                        </div>
                    </div>

                    <button>Create Match</button> */}
                </div>
            </ReactModal>
        </Fragment>
	)
}

export default Lobby;
