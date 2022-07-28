import { AppState } from '@app/state-management/store/';
import { initialSubOrderProcessingState } from './order-processing.reducer';

const initDefaultData = (state: AppState, ofModule) => {
    if (!state.orderProcessingState.features[ofModule]) {
        state.orderProcessingState.features[ofModule] = initialSubOrderProcessingState;
    }
}

export const getOrderProcessingState = (state: AppState, ofModule) => {
    initDefaultData(state, ofModule);
    return state.orderProcessingState.features[ofModule];
};
