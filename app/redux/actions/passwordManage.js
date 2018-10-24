import axios from 'axios';

import ActionTypes from '../constants/actionTypes';
import { apiPrefix, serverPort, getChannel } from '../../../etc/config.json';
import { saveUserToLocal, getLocalUser } from '../../helpers/syncStore';


export const userLogin = (userLoginInfo) => dispatch => {
    axios.post(`${apiPrefix}:${serverPort}/login`, userLoginInfo )
        .then( res => {
            if(!res.data){
                dispatch({ type: ActionTypes.ERROR_USER_NOT_FOUND });
            } else {
                saveUserToLocal({ login: res.data.login, password: res.data.password });
                dispatch({ type: ActionTypes.SET_PASSWORD_LIST, payload: res.data.passwordList });
                dispatch({ type: ActionTypes.USER_LOGIN, payload: {login: res.data.login, password: res.data.password} });
                location.assign('/#/dashboard');
            }
        })
        .catch( reject => {
            dispatch({ type: ActionTypes.SET_MSG, payload: reject.message });
        });
};

export const getPasswordList = (userLoginInfo) => dispatch => {
    axios.post(`${apiPrefix}:${serverPort}/login`, userLoginInfo )
        .then( res => {
            if(!res.data){
                dispatch({ type: ActionTypes.ERROR_USER_NOT_FOUND });
                saveUserToLocal(null);
                window.location.assign('/');
            } else {
                dispatch({ type: ActionTypes.SET_PASSWORD_LIST, payload: res.data.passwordList });
                dispatch({ type: ActionTypes.USER_LOGIN, payload: {login: res.data.login, password: res.data.password} });
            }
        })
        .catch( reject => {
            dispatch({ type: ActionTypes.SET_MSG, payload: reject.message });
        });
};

export const removePasswordItem = (user, passwordIndex) => dispatch => {
    axios.post(`${apiPrefix}:${serverPort}/removepassword`, { login: user.login, passwordIndex })
        .then( res => {
            if(!res.data){
                dispatch({ type: ActionTypes.ERROR_USER_NOT_FOUND });
                window.location.assign('/#/dashboard');
            } else {
                dispatch({ type: ActionTypes.REMOVE_PASSWORD, payload: passwordIndex });
                dispatch({ type: ActionTypes.SET_MSG, payload: 'Record successfully deleted' });
            }
        })
        .catch( reject => {
            dispatch({ type: ActionTypes.SET_MSG, payload: reject.message });
        });
};



export const editPasswordItem = (user, passwordIndex, passwordItem) => dispatch => {
    axios.post(`${apiPrefix}:${serverPort}/editpassword`, { login: user.login, passwordIndex, passwordItem } )
        .then( res => {
            if(res.data.errMessage){
                dispatch({ type: ActionTypes.SET_MSG, payload: res.data.errMessage });
            } else {
                dispatch({ type: ActionTypes.EDIT_PASSWORD, payload: {passwordIndex, passwordItem} });
                dispatch({ type: ActionTypes.SET_MSG, payload: 'Record successfully changed' });
            }
        })
        .catch( reject => {
            dispatch({ type: ActionTypes.SET_MSG, payload: reject.message });
        });
};


export const userRegistration = (userRegistrationInfo) => dispatch => {
    axios.post(`${apiPrefix}:${serverPort}/registration`, userRegistrationInfo )
        .then( res => {
            if(res.data.errMessage){
                dispatch({ type: ActionTypes.SET_MSG, payload: res.data.errMessage });
            } else {
                saveUserToLocal({ login: res.data.login, password: res.data.password });
                dispatch({ type: ActionTypes.USER_LOGIN, payload: res.data });
                window.location.assign('/#/dashboard');
            }
        })
        .catch( reject => {
            dispatch({ type: ActionTypes.SET_MSG, payload: reject.message });
        });
};


export const addPassword = (addPasswordData) => dispatch => {
    axios.post(`${apiPrefix}:${serverPort}/addpassword`, addPasswordData )
        .then( res => {
            if(res.data.errMessage){
                dispatch({ type: ActionTypes.SET_MSG, payload: res.data.errMessage });
            } else {
                dispatch({ type: ActionTypes.ADD_PASSWORD, payload: addPasswordData.passwordItem });
                dispatch({ type: ActionTypes.SET_MSG, payload: 'Password successfully added' });
            }
        })
        .catch( reject => {
            dispatch({ type: ActionTypes.SET_MSG, payload: reject.message });
        });
};


export const userLogout = () => dispatch => {
    dispatch({ type: ActionTypes.USER_LOGOUT });
    dispatch({ type: ActionTypes.CLEAR_PASSWORD_LIST });
    window.location.assign('/#/');
    saveUserToLocal(null);
};


export const clearError = () => dispatch => {
    dispatch({ type: ActionTypes.CLEAR_MSG })
};

