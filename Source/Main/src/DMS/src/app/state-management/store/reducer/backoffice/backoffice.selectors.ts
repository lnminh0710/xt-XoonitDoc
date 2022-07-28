import { Store, createSelector } from '@ngrx/store';
import { AppState } from '@app/state-management/store/';
import { initialSubBackofficeState } from './backoffice.reducer';

const initDefaultData = (state: AppState, ofModule) => {
    if (!state.backofficeState.features[ofModule]) {
        state.backofficeState.features[ofModule] = initialSubBackofficeState;
    }
}

export const getBackofficeState = (state: AppState, ofModule) => {
    initDefaultData(state, ofModule);
    return state.backofficeState.features[ofModule];
};