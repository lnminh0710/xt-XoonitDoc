import { Store, createSelector } from '@ngrx/store';
import { AppState } from '@app/state-management/store/';
import { initialSubParkedItemState } from './parked-item.reducer';

const initDefaultData = (state: AppState, ofModule) => {
    if (!state.parkedItems.features[ofModule]) {
        state.parkedItems.features[ofModule] = initialSubParkedItemState;
    }
}

export const getParkedItemState = (state: AppState, ofModule) => {
    initDefaultData(state, ofModule);
    return state.parkedItems.features[ofModule];
};