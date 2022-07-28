import { Store, createSelector } from '@ngrx/store';
import { AppState } from '@app/state-management/store/';
import { initialSubModuleSettingState } from './module-setting.reducer';

const initDefaultData = (state: AppState, ofModule) => {
    if (!state.moduleSetting.features[ofModule]) {
        state.moduleSetting.features[ofModule] = initialSubModuleSettingState;
    }
}

export const getModuleSettingState = (state: AppState, ofModule) => {
    initDefaultData(state, ofModule);
    return state.moduleSetting.features[ofModule];
};