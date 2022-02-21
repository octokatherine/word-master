import { useEffect, useState, } from 'react';
import { useNavigate } from 'react-router-dom';

import { TIMEOUT_DURATION } from '../utils/constants';
import useStore from '../utils/store';
import Loading from '../components/Loading';

const ProtectedRoute = ({ children, redirectTo,  }: any) => {
    const isLoading = useStore((state) => state.isLoading);
    const { setIsLoading } = useStore();
    const { user } = useStore();
    const navigate = useNavigate();

    useEffect(() => {
        setIsLoading(true);

        setTimeout(() => {
            setIsLoading(false);
            navigate(redirectTo);
        }, TIMEOUT_DURATION);
    // eslint-disable-next-line
    }, []);

    console.log({
        isLoading,
        user,
    });

    console.log('isLoading && !user', isLoading && !user);
    return isLoading && !user ? <Loading /> : <div>lol</div>;
};

export default ProtectedRoute;