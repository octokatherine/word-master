import { useEffect } from "react";
import { 
    BrowserRouter,
    Routes,
    Route, 
    Navigate,
} from "react-router-dom";

// @ts-ignore
import initializeFirebase from '../utils/firebase';
import { getAuth, onAuthStateChanged } from "firebase/auth";

import Game from './Game';
import Login from './Login';
import Register from './Register';
import Lobby from './Lobby';
import Logout from './Logout';
// Do you have stairs in your route? ;)
import ProtectedRoute from '../components/ProtectedRoute';
import useStore from '../utils/store';
import AuthRedirectRoute from "../components/AuthRedirectRoute";

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
                
                useStore.setState({ user });
            } else {
                // User is signed out
                // ...
                // console.log('no user. signed out. something like that');
            }
        });
    }, []);
	
    const isLoading = useStore((state) => state.isLoading);
    const { user } = useStore();

	return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={
                    <AuthRedirectRoute authRedirectTarget={<Navigate to="/lobby" />} noAuthRedirectTarget={< Login />} />
                } />
                <Route path="/lobby" element={<Lobby />} />
                <Route path="/game" element={
                    <ProtectedRoute redirectTo='/'>
                        <Game />
                    </ProtectedRoute>
                } />
                <Route path="/register" element={<Register />} />
                <Route path="/logout" element={<Logout />} />
            </Routes>
        </BrowserRouter>
	)
}

export default App;