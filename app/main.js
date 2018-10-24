import React from 'react';
import ReactDOM from 'react-dom';
// import { Router } from 'react-router';
import { AppContainer } from 'react-hot-loader';
// import 'three';
// import * as TGALoader from 'three/examples/js/loaders/TGALoader';

import Root from './config/Root';

// window.THREE = THREE;


const render = (Component) => {
    ReactDOM.render(
        <AppContainer>
            <Component />
        </AppContainer>,
        document.getElementById('root'),
    );
};

document.addEventListener('DOMContentLoaded', () => render(Root));

if (module.hot) {
    module.hot.accept('./components/App', () => {
        const newApp = require('./components/App').default;
        render(newApp);
    });
}
