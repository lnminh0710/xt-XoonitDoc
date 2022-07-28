import { Store, createSelector } from '@ngrx/store';
import { AppState } from '@app/state-management/store/';
import { initialSubLayoutInfoState } from './layout-info.reducer';

const initDefaultData = (state: AppState, ofModule) => {
    if (!state.layoutInfo.features[ofModule]) {
        state.layoutInfo.features[ofModule] = initialSubLayoutInfoState;
    }
}

export const getLayoutInfoState = (state: AppState, ofModule) => {
    initDefaultData(state, ofModule);
    return state.layoutInfo.features[ofModule];
};