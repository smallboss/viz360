import { createStore, applyMiddleware } from 'redux';
// import thunk from 'redux-thunk';
// import { browserHistory } from 'react-router'
import { composeWithDevTools } from 'redux-devtools-extension';
// import { routerMiddleware } from 'react-router-redux';

import reducers from './reducers';

const initialState = {
    // user: getLocalUser(),
    // error: '',
    modelList: [],
    currModel: [],
    activeTags: [],
};

// const routMiddleware = routerMiddleware(browserHistory);

const store = createStore(
    reducers,
    initialState,
    // composeWithDevTools(applyMiddleware(thunk, routMiddleware)));
    composeWithDevTools()
);

export default store;