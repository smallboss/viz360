import ActionTypes from '../constants/actionTypes';


export default function (state=[], action) {

    switch(action.type) {
        case ActionTypes.INIT_CURR_MODEL: {
            return action.payload || state;
        }

        case ActionTypes.ADD_TAG_CURR_MODEL: {
            const newTag = action.payload;
            const newDataCurrModel = state;

            if(!newDataCurrModel.tags.includes( newTag )){
                newDataCurrModel.tags.push( newTag );
            }

            return { ...newDataCurrModel };
        }

        case ActionTypes.REMOVE_TAG_CURR_MODEL: {
            const removeTag = action.payload;
            const newDataCurrModel = state;
            newDataCurrModel.tags = newDataCurrModel.tags.filter(tag => tag!=removeTag );

            return {...newDataCurrModel};
        }

        case ActionTypes.SET_CURR_MODEL_NAME: {
            const newModelName = action.payload;
            const newDataCurrModel = {...state};
            newDataCurrModel.name = newModelName;

            return newDataCurrModel;
        }

        case ActionTypes.CLEAR_CURR_MODEL: {
            return {};
        }


        default: return state;
    }
}