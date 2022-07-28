import { Store, createSelector } from '@ngrx/store';
import { AppState } from '@app/state-management/store/';
import { initialSubLayoutSettingState } from './layout-setting.reducer';

const initDefaultData = (state: AppState, ofModule) => {
    if (!state.layoutSetting.features[ofModule]) {
        state.layoutSetting.features[ofModule] = initialSubLayoutSettingState;
    }
}

export const getLayoutSettingState = (state: AppState, ofModule) => {
    initDefaultData(state, ofModule);
    return state.layoutSetting.features[ofModule];
};
