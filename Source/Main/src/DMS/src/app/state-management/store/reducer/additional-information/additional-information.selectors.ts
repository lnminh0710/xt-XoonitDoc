import { Store, createSelector } from '@ngrx/store';
import { AppState } from '@app/state-management/store/';
import { initialSubAdditionalInformationState } from './additional-information.reducer';

const initDefaultData = (state: AppState, ofModule) => {
    if (!state.additionalInformation.features[ofModule]) {
        state.additionalInformation.features[ofModule] = initialSubAdditionalInformationState;
    }
}

export const getAdditionalInformationState = (state: AppState, ofModule) => {
    initDefaultData(state, ofModule);
    return state.additionalInformation.features[ofModule];
};