import { AppGlobalState } from './app-global.state';
import { CustomAction } from '../../actions';
import {
    AppGlobalSuccessAction,
    AppGlobalFailedAction,
    SaveStructureTreeSettingsGlobalAction,
    AppGlobalActionNames,
} from '../../actions/app-global/app-global.actions';

const initialState: AppGlobalState = {
    structureTreeSettings: {
        activeFoldersOnly: false,
        isCollapsedTree: false,
        nodesState: [],
    },
};

export function appGlobalStateReducer(state = initialState, action: CustomAction) {
    switch (action.type) {
        case AppGlobalActionNames.APP_GLOBAL_SUCCESS:
            return actionSuccessReducer(state, action as AppGlobalSuccessAction);

        case AppGlobalActionNames.APP_GLOBAL_FAILED:
            return actionFailedReducer(state, action as AppGlobalFailedAction);

        case AppGlobalActionNames.APP_SAVE_STRUCTURE_TREE_SETTINGS:
            const settings = (action as SaveStructureTreeSettingsGlobalAction).payload;
            state.structureTreeSettings = Object.assign({}, settings);
            state = { ...state };
            break;

        default:
            state = state;
    }

    return state;
}

function actionSuccessReducer(state: AppGlobalState, action: AppGlobalSuccessAction) {
    switch (action.subType) {
        default:
            return state;
    }
}

function actionFailedReducer(state: AppGlobalState, action: AppGlobalFailedAction) {
    switch (action.type) {
        default:
            return state;
    }
}
