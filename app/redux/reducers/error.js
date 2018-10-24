import ActionTypes from '../constants/actionTypes';


export default function (state=[], action) {

    switch (action.type) {
        case ActionTypes.CLEAR_MSG:
            return '';

        case ActionTypes.ERROR_USER_NOT_FOUND:
            return 'User not found!';

        case ActionTypes.SET_MSG:
            return action.payload;

        default:
            return state;
    }
}