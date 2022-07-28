import { Store, createSelector } from '@ngrx/store';
import { AppState } from '@app/state-management/store/';
import { Module } from '@app/models';
import { initialSubTabSummaryState } from './tab-summary.reducer';

const initDefaultData = (state: AppState, ofModule) => {
    if (!state.tabSummary.features[ofModule]) {
        state.tabSummary.features[ofModule] = initialSubTabSummaryState;
    }
}

export const getTabSummaryState = (state: AppState, ofModule) => {
    initDefaultData(state, ofModule);
    return state.tabSummary.features[ofModule];
};