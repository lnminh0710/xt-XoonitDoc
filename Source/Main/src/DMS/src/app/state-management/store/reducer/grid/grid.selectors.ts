import { Store, createSelector } from '@ngrx/store';
import { AppState } from '@app/state-management/store/';
import { initialSubGridState } from './grid.reducer';

const initDefaultData = (state: AppState, ofModule) => {
    if (!state.grid.features[ofModule]) {
        state.grid.features[ofModule] = initialSubGridState;
    }
}

export const getGridState = (state: AppState, ofModule) => {
    initDefaultData(state, ofModule);
    return state.grid.features[ofModule];
};