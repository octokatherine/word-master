import { useEffect, useState, } from 'react';
import { useNavigate } from 'react-router-dom';

import { TIMEOUT_DURATION } from '../utils/constants';
import useStore from '../utils/store';
import Loading from '../components/Loading';

const ProtectedRoute = ({ children, redirectTo, }: any) => {
    const isLoading = useStore((state) => state.isLoading);
    const { setIsLoading } = useStore();
    const { user } = useStore();
    const navigate = useNavigate();

    useEffect(() => {
        setTimeout(() => {
            setIsLoading(false);

            if (!useStore.getState().user) {
                // console.log('redirect is triggering');
                navigate(redirectTo);
            } else {
                // console.log('there was a user, and a miracle!', useStore.getState().user);
            }

        }, TIMEOUT_DURATION);
    // eslint-disable-next-line
    }, []);

    useEffect(() => {
        if (user) setIsLoading(false);
    }, [user, setIsLoading]);

    return isLoading && !user ? <Loading /> : children;
};

export default ProtectedRoute;