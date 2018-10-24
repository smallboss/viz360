import ActionTypes from '../constants/actionTypes';


export default function (state=[], action) {

    switch(action.type) {
        case ActionTypes.INIT_CURR_MODEL: {

            return action.payload || state;
        }

        case ActionTypes.CLEAR_CURR_MODEL: {

            return {};
        }
        //
        // case ActionTypes.ADD_PASSWORD: {
        //     return [action.payload].concat(state);
        // }
        //
        // case ActionTypes.REMOVE_PASSWORD: {
        //     let newPasswordList = state.concat();
        //     newPasswordList.splice(action.payload, 1);
        //
        //     return newPasswordList;
        // }
        //
        // case ActionTypes.EDIT_PASSWORD: {
        //     const { passwordIndex, passwordItem } = action.payload;
        //     let newPasswordList = state.concat();
        //     newPasswordList[passwordIndex] = passwordItem;
        //
        //     return newPasswordList;
        // }
        //
        // case ActionTypes.CLEAR_PASSWORD_LIST: {
        //     return [];
        // }

        default: return state;
    }
}