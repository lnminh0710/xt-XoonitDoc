import { Store, createSelector } from '@ngrx/store';
import { AppState } from '@app/state-management/store/';
import { initialSubReturnRefundState } from './return-refund.reducer';

const initDefaultData = (state: AppState, ofModule) => {
    if (!state.returnRefundState.features[ofModule]) {
        state.returnRefundState.features[ofModule] = initialSubReturnRefundState;
    }
}

export const getReturnRefundState = (state: AppState, ofModule) => {
    initDefaultData(state, ofModule);
    return state.returnRefundState.features[ofModule];
};