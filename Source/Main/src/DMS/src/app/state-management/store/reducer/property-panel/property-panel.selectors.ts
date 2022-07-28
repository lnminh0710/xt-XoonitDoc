import { Store, createSelector } from '@ngrx/store';
import { AppState } from '@app/state-management/store/';
import { initialSubPropertyPanelState } from './property-panel.reducer';

const initDefaultData = (state: AppState, ofModule) => {
    if (!state.propertyPanelState.features[ofModule]) {
        state.propertyPanelState.features[ofModule] = initialSubPropertyPanelState;
    }
}

export const getPropertyPanelState = (state: AppState, ofModule) => {
    initDefaultData(state, ofModule);
    return state.propertyPanelState.features[ofModule];
};