import ActionTypes from '../constants/actionTypes';


export default function (state=[], action) {

    switch(action.type) {
        case ActionTypes.INIT_MODEL_LIST: {
            console.log('INIT_MODEL_LIST');

            return action.payload || state;
        }

        case ActionTypes.DELETE_MODEL: {
            const modelId = action.payload;

            const newState = state.filter( el => el._id != modelId );

            return [...newState];
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