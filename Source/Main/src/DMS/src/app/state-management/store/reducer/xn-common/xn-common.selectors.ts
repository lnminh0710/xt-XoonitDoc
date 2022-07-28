import { Store, createSelector } from '@ngrx/store';
import { AppState } from '@app/state-management/store/';
import { initialSubCommonState } from './xn-common.reducer';

const initDefaultData = (state: AppState, ofModule) => {
    if (!state.xnCommonState.features[ofModule]) {
        state.xnCommonState.features[ofModule] = initialSubCommonState;
    }
}

export const getCommonState = (state: AppState, ofModule) => {
    initDefaultData(state, ofModule);
    return state.xnCommonState.features[ofModule];
};