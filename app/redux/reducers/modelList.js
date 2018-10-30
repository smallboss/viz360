import ActionTypes from '../constants/actionTypes';

export default function (state=[], action) {

    switch(action.type) {
        case ActionTypes.INIT_MODEL_LIST: {
            return action.payload || state;
        }

        case ActionTypes.DELETE_MODEL: {
            const modelId = action.payload;

            const newState = state.filter( el => el._id != modelId );

            return [...newState];
        }

        default: return state;
    }
}