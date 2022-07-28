import { Store, createSelector } from '@ngrx/store';
import { AppState } from '@app/state-management/store/';
import { initialSubWidgetTemplateState } from './widget-template.reducer';

const initDefaultData = (state: AppState, ofModule) => {
    if (!state.widgetTemplateSetting.features[ofModule]) {
		state.widgetTemplateSetting.features[ofModule] = initialSubWidgetTemplateState;
    }
}

export const getWidgetTemplateState = (state: AppState, ofModule) => {
    initDefaultData(state, ofModule);
	return state.widgetTemplateSetting.features[ofModule];
};