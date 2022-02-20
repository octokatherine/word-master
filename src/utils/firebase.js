import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore/lite';

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
const db = getFirestore(app);

export {
    app,
    db,
}