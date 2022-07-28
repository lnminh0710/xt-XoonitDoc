import { Action } from '@ngrx/store';
import { ProcessDataActions } from '@app/state-management/store/actions/process-data';
import { CustomAction } from '@app/state-management/store/actions/base';
import * as baseReducer from '@app/state-management/store/reducer/reducer.base';
import { SearchResultItemModel } from '@app/models';

export interface SubProcessDataState {
    viewMode: any;
    isViewMode: boolean;
    formValid: boolean;
    formDirty: boolean;
    requestSave: any;
    saveMainTabResult: any;
    saveOtherTabResult: any;
    saveOnlyMainTabResult: any;
    saveOnlyOtherTabResult: any;
    formEditMode: boolean;
    formCloneMode: boolean;
    formEditData: any;
    selectedEntity: any;
    selectedSearchResult: SearchResultItemModel;
    disableTabHeaderFormData: any;
}

export const initialSubProcessDataState: SubProcessDataState = {
    viewMode: null,
    isViewMode: true,
    formValid: false,
    formDirty: false,
    requestSave: null,
    saveMainTabResult: null,
    saveOtherTabResult: null,
    saveOnlyMainTabResult: null,
    saveOnlyOtherTabResult: null,
    formEditMode: false,
    formCloneMode: false,
    formEditData: null,
    selectedEntity: null,
    selectedSearchResult: null,
    disableTabHeaderFormData: null,
};

export interface ProcessDataState {
    features: { [id: string]: SubProcessDataState };
}

const initialState: ProcessDataState = {
    features: {},
};

export function processDataReducer(state = initialState, action: CustomAction): ProcessDataState {
    function setDataForReducer(data: any): any {
        let feature = baseReducer.getFeature(action, state);
        state = baseReducer.updateStateData(action, feature, state, data);
        return Object.assign({}, state);
    }

    switch (action.type) {
        case ProcessDataActions.VIEW_MODE: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                viewMode: {},
                isViewMode: true,
            });
            return Object.assign({}, state);
        }

        case ProcessDataActions.EDIT_MODE: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                isViewMode: false,
            });
            return Object.assign({}, state);
        }

        case ProcessDataActions.FORM_VALID: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                formValid: action.payload,
            });
            return Object.assign({}, state);
        }

        case ProcessDataActions.FORM_DIRTY: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                formDirty: action.payload,
            });
            return Object.assign({}, state);
        }

        case ProcessDataActions.SAVE_MAIN_TAB_RESULT: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                saveMainTabResult: action.payload,
            });
            return Object.assign({}, state);
        }

        case ProcessDataActions.SAVE_OTHER_TAB_RESULT: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                saveOtherTabResult: action.payload,
            });
            return Object.assign({}, state);
        }

        case ProcessDataActions.SAVE_ONLY_MAIN_TAB_RESULT: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                saveOnlyMainTabResult: action.payload,
            });
            return Object.assign({}, state);
        }

        case ProcessDataActions.SAVE_ONLY_OTHER_TAB_RESULT: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                saveOnlyOtherTabResult: action.payload,
            });
            return Object.assign({}, state);
        }

        case ProcessDataActions.TURN_ON_FORM_EDIT_MODE: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                formEditMode: true,
                formEditData: action.payload,
            });
            return Object.assign({}, state);
        }

        case ProcessDataActions.TURN_OFF_FORM_EDIT_MODE: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                formEditMode: false,
                formEditData: null,
            });
            return Object.assign({}, state);
        }

        case ProcessDataActions.TURN_ON_FORM_CLONE_MODE: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                formCloneMode: true,
                formEditData: action.payload,
            });
            return Object.assign({}, state);
        }

        case ProcessDataActions.TURN_OFF_FORM_CLONE_MODE: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                formCloneMode: false,
                formEditData: null,
            });
            return Object.assign({}, state);
        }

        case ProcessDataActions.CLEAR_SAVE_RESULT: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                saveMainTabResult: null,
                saveOtherTabResult: null,
                saveOnlyMainTabResult: null,
                saveOnlyOtherTabResult: null,
            });
            return Object.assign({}, state);
        }

        case ProcessDataActions.SET_SELECTED_ENTITY: {
            let feature = baseReducer.getFeature(action, state);

            let selectedEntity = action.payload.entity;
            if (selectedEntity) {
                if (action.payload.isParkedItem) {
                    selectedEntity = formatParkedItemEntity(selectedEntity, action.payload.modulePrimaryKey);
                } else if (!selectedEntity.hasOwnProperty('id')) {
                    selectedEntity['id'] = selectedEntity[action.payload.modulePrimaryKey];
                }
            }
            state = baseReducer.updateStateData(action, feature, state, {
                selectedEntity: selectedEntity,
            });
            return Object.assign({}, state);
        }

        case ProcessDataActions.SELECT_SEARCH_RESULT: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                selectedSearchResult: action.payload,
            });
            return Object.assign({}, state);
        }

        case ProcessDataActions.CLEAR_SEARCH_RESULT: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                selectedSearchResult: null,
            });
            return Object.assign({}, state);
        }

        case ProcessDataActions.SET_DISABLE_TAB_HEADER: {
            return setDataForReducer({
                disableTabHeaderFormData: action.payload,
            });
        }

        default: {
            return state;
        }
    }
}

function formatParkedItemEntity(entity, modulePrimaryKey) {
    let result: any = {};
    Object.keys(entity).forEach((key) => {
        if (typeof entity[key] === 'object' && entity[key]) {
            result[key] = entity[key]['value'];
        } else {
            result[key] = entity[key];
        }
    });

    if (!result.hasOwnProperty('id')) {
        result['id'] = result[modulePrimaryKey];
    }

    result['selectedParkedItem'] = entity;

    return result;
}
