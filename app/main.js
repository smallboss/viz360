import React from 'react';
import ReactDOM from 'react-dom';
// import { AppContainer } from 'react-hot-loader';
import App from './components/App';
// import * as THREE from 'three-full';

import Root from './config/Root';


const render = (Component) => {

    ReactDOM.render(
        <App/>,
        document.getElementById('root'),
    );
};

document.addEventListener('DOMContentLoaded', ()=>render(Root));

// if (module.hot) {
//     module.hot.accept('./components/App', () => {
//         const newApp = require('./components/App').default;
//         render(newApp);
//     });
// }
