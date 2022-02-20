import { 
    BrowserRouter,
    Routes,
    Route, 
} from "react-router-dom";

// @ts-ignore
import initializeFirebase from '../utils/firebase';
import useStore from '../utils/store';
import { getAuth, onAuthStateChanged } from "firebase/auth";

import Game from './Game';
import Login from './Login';
import Register from './Register';
import ProtectedRoute from '../components/ProtectedRoute';

type Props = {};

const { app, db } = initializeFirebase();

const auth = getAuth();

const App = ({}: Props) => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log('sensing a user', { user });
            // User is signed in, see docs for a list of available properties
            // https://firebase.google.com/docs/reference/js/firebase.User
            const uid = user.uid;
            
            useStore.setState({ user });
            
            // Not using 'navigate' because this is outside the BrowserRouter component
            window.history.pushState({}, '/game');
          } else {
            // User is signed out
            // ...
            console.log('no user. signed out. something like that');
          }
    });
	
	return (
		<BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                {/* <Route path="/game" element={
                    <ProtectedRoute user={useStore.getState().user} redirectTo={'/'}>
                        <Game />
                    </ProtectedRoute>
                } /> */}
                <Route path="/game" element={<Game />} />
                <Route path="/register" element={<Register />} />
            </Routes>
        </BrowserRouter>
	)
}

export default App;