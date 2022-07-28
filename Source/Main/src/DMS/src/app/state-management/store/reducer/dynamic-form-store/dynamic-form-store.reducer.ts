import { Action } from '@ngrx/store';
import {
    DynamicFormStoreActionNames,
    DynamicFormStoreFailedAction,
    DynamicFormStoreSuccessAction,
} from '../../actions/dynamic-form-store';

export interface DynamicFormStoreState {}
const initialState: DynamicFormStoreState = {};

export function dynamicFormStoreReducer(state: DynamicFormStoreState = initialState, action: Action): DynamicFormStoreState {
    switch (action.type) {
        case DynamicFormStoreActionNames.SUCCESS:
            return actionSuccessReducer(state, action as DynamicFormStoreSuccessAction);

        case DynamicFormStoreActionNames.FAILED:
            return actionFailedReducer(state, action as DynamicFormStoreFailedAction);

        default:
            return state;
    }
}

function actionSuccessReducer(state: DynamicFormStoreState, action: DynamicFormStoreSuccessAction) {
    switch (action.subType) {
        default:
            return state;
    }
}

function actionFailedReducer(state: DynamicFormStoreState, action: DynamicFormStoreFailedAction) {
    switch (action.subType) {
        default:
            return state;
    }
}
