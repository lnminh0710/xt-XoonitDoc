import { Store, createSelector } from '@ngrx/store';
import { AppState } from '@app/state-management/store/';
import { initialSubTabButtonState } from './tab-button.reducer';

const initDefaultData = (state: AppState, ofModule) => {
    if (!state.tabButtonState.features[ofModule]) {
        state.tabButtonState.features[ofModule] = initialSubTabButtonState;
    }
}

export const getTabButtonState = (state: AppState, ofModule) => {
    initDefaultData(state, ofModule);
    return state.tabButtonState.features[ofModule];
};