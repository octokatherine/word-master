import { useEffect, useState, } from 'react';
import { useNavigate } from 'react-router-dom';

import { TIMEOUT_DURATION } from '../utils/constants';
import useStore from '../utils/store';
import Loading from './Loading';

const AuthRedirectRoute = ({ authRedirectTarget, noAuthRedirectTarget }: any) => {
    const isLoading = useStore((state) => state.isLoading);
    const { setIsLoading } = useStore();
    const { user } = useStore();

    const [isTimedOut, setIsTimedOut] = useState(false);
 
    useEffect(() => {
        setTimeout(() => {
            setIsLoading(false);

            if (!useStore.getState().user) {
                console.log('timed out auth redirect');
                setIsTimedOut(true);
                console.log('hm')
            }

        }, TIMEOUT_DURATION);
    // eslint-disable-next-line
    }, []);

    useEffect(() => {
        if (user) setIsLoading(false);
    }, [user, setIsLoading]);

    console.log({
        isLoading,
        user,
        isTimedOut
    })

    if (isLoading) return <Loading />;

    if (user) return authRedirectTarget;

    if (!user && isTimedOut) return noAuthRedirectTarget;

    // TODO: A little silly, but it prevents the "no elements returned" error
    return <div></div>
};

export default AuthRedirectRoute;