
import ActionTypes from '../constants/actionTypes';


export default function (state={}, action) {

    switch(action.type) {
        case ActionTypes.USER_LOGIN: {
            return action.payload;
        }

        case ActionTypes.USER_LOGOUT: {
            return null;
        }

        default: return state;
    }
}