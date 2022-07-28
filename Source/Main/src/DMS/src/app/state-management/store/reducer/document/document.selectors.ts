import { AppState } from '@app/state-management/store/';
import { initialSubDocumentState } from './document.reducer';

const initDefaultData = (state: AppState, ofModule) => {
    if (!state.documentState.features[ofModule]) {
        state.documentState.features[ofModule] = initialSubDocumentState;
    }
}

export const getDocumentState = (state: AppState, ofModule) => {
    initDefaultData(state, ofModule);
    return state.documentState.features[ofModule];
};
