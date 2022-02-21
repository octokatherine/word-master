import { 
    BrowserRouter,
    Routes,
    Route, 
} from "react-router-dom";

// @ts-ignore
import initializeFirebase from '../utils/firebase';
import { getAuth, onAuthStateChanged } from "firebase/auth";

import Game from './Game';
import Login from './Login';
import Register from './Register';
import Loading from '../components/Loading';
import useStore from '../utils/store';
// Do you have stairs in your route? ;)
import ProtectedRoute from '../components/ProtectedRoute';
import { useEffect } from "react";

const { app, db } = initializeFirebase();

const auth = getAuth();

type Props = {};

const App = ({}: Props) => {
    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                console.log('sensing a user', { user });
                // User is signed in, see docs for a list of available properties
                // https://firebase.google.com/docs/reference/js/firebase.User
                const uid = user.uid;
                
                useStore.setState({ user, isLoading: false });
            } else {
                // User is signed out
                // ...
                console.log('no user. signed out. something like that');
                useStore.setState({ user, isLoading: false });
            }
        });
    }, []);
	
    const isLoading = useStore((state) => state.isLoading);
    const { setIsLoading } = useStore();
    const { user } = useStore();
    
    console.log('please', { isLoading});
	return (
		isLoading ? 
            <Loading /> : 
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/game" element={
                        <ProtectedRoute redirectTo='/'>
                            {/* <Game /> */}
                        </ProtectedRoute>
                    } />
                    <Route path="/register" element={<Register />} />
                </Routes>
            </BrowserRouter>
	)
}

export default App;