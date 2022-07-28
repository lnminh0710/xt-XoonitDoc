import { Store, createSelector } from '@ngrx/store';
import { AppState } from '@app/state-management/store/';
import { initialSubProcessDataState } from './process-data.reducer';

const initDefaultData = (state: AppState, ofModule) => {
    if (!state.processDataState.features[ofModule]) {
        state.processDataState.features[ofModule] = initialSubProcessDataState;
    }
}

export const getProcessDataState = (state: AppState, ofModule) => {
    initDefaultData(state, ofModule);
    return state.processDataState.features[ofModule];
};