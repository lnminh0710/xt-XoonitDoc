import { Store, createSelector } from '@ngrx/store';
import { AppState } from '@app/state-management/store/';
import { initialSubWidgetDetailState } from './widget-content-detail.reducer';

const initDefaultData = (state: AppState, ofModule) => {
    if (!state.widgetContentDetail.features[ofModule]) {
        state.widgetContentDetail.features[ofModule] = initialSubWidgetDetailState;
    }
}

export const getWidgetContentDetailState = (state: AppState, ofModule) => {
    initDefaultData(state, ofModule);
    return state.widgetContentDetail.features[ofModule];
};