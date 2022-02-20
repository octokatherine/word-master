import ReactDOM from 'react-dom'
import { 
    BrowserRouter,
    Routes,
    Route, 
} from "react-router-dom";

// @ts-ignore
import initializeFirebase from './utils/firebase';
import './index.css';
import Game from './Game';
import Login from './views/Login';
import Register from './views/Register';

initializeFirebase();

ReactDOM.render(
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/game" element={<Game />} />
            <Route path="/register" element={<Register />} />
        </Routes>
    </BrowserRouter>
, document.getElementById('root'))
