
import ActionTypes from '../constants/actionTypes';


export default function (state={}, action) {

    switch(action.type) {
        case ActionTypes.ADD_ACTIVE_TAG: {
            return [ ...state, action.type];
        }

        case ActionTypes.DEL_ACTIVE_TAG: {
            return [ ...state.filter( tag => tag != action.type ) ];
        }

        case ActionTypes.TOGGLE_ACTIVE_TAG: {
            const toggleTag = action.payload;
            const newState = (state.includes(toggleTag))
                                ? state.filter( tag => tag != toggleTag )
                                : [ ...state, toggleTag ];

            return newState;
        }

        case ActionTypes.CLEAR_ACTIVE_TAGS: {
            return [];
        }

        default: return state;
    }
}