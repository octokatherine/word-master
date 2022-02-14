// import React from 'react'
import ReactDOM from 'react-dom'
import { 
    BrowserRouter,
    Routes,
    Route, 
} from "react-router-dom";
import { initializeApp } from 'firebase/app';

import './index.css';
import Game from './Game';
import Login from './views/Login';
import Register from './views/Register';

const firebaseConfig = {
    apiKey: "AIzaSyA3waUAJOpVscK8WnLcXwZbdtVPa3In4ug",
    authDomain: "wordle-with-friends-6cb40.firebaseapp.com",
    projectId: "wordle-with-friends-6cb40",
    storageBucket: "wordle-with-friends-6cb40.appspot.com",
    messagingSenderId: "233401216366",
    appId: "1:233401216366:web:656d3e228ba2944b10257f",
    measurementId: "G-Z4JH3TXSQF"
  };
  
// Initialize Firebase
const app = initializeApp(firebaseConfig);

const checkAuthStatus = () => {

};

ReactDOM.render(
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/game" element={<Game />} render={checkAuthStatus}/>
            <Route path="/register" element={<Register />} render={checkAuthStatus} />
        </Routes>
    </BrowserRouter>
, document.getElementById('root'))
