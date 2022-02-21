import ReactModal from 'react-modal';
import React, { useEffect, useState, } from 'react';
import { useNavigate } from 'react-router-dom';

import useStore from '../utils/store';

const Modal = ({}: any) => {
    // const isLoading = useStore((state) => state.isLoading);
    // const { setIsLoading } = useStore();
    // const { user } = useStore();
    // const navigate = useNavigate();

    // useEffect(() => {
    //     setTimeout(() => {
    //         setIsLoading(false);

    //         if (!useStore.getState().user) {
    //             // console.log('redirect is triggering');
    //             navigate(redirectTo);
    //         } else {
    //             // console.log('there was a user, and a miracle!', useStore.getState().user);
    //         }

    //     }, TIMEOUT_DURATION);
    // // eslint-disable-next-line
    // }, []);

    // useEffect(() => {
    //     if (user) setIsLoading(false);
    // }, [user, setIsLoading]);

    // return isLoading && !user ? <Loading /> : children;
    return (
        <ReactModal isOpen={false}>
            piss
        </ReactModal>
    );
};

export default Modal;