import { combineReducers } from 'redux';
// import { routerReducer } from 'react-router-redux';

// import user from  './user';
// import error from  './error';
import modelList from './modelList';
import currModel from './currModel';

export default combineReducers({
    // routing: routerReducer,
    // user,
    // error,
    modelList,
    currModel
});
