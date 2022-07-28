import { AppState } from '@app/state-management/store/';
import { initialSubImageOCRState } from './image-ocr.reducer';

const initDefaultData = (state: AppState, ofModule) => {
    if (!state.imageOCR.features[ofModule]) {
        state.imageOCR.features[ofModule] = initialSubImageOCRState;
    }
};

export const getImageOcrState = (state: AppState, ofModule) => {
    initDefaultData(state, ofModule);
    return state.imageOCR.features[ofModule];
};
