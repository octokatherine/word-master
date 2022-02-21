import ReactDOM from 'react-dom'

import './index.css';

import App from './views/App';

// TODO: This is just for the production build, so we hide our Glorious App
window.location.replace('https://zombo.com/');

ReactDOM.render(
    <App />
, document.getElementById('root'))
