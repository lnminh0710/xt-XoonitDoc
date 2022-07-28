import { Action } from '@ngrx/store';
import { WidgetTemplateSettingModel } from '@app/models';
import { LayoutSettingActions } from '@app/state-management/store/actions/layout-setting/index';
import { CustomAction } from '@app/state-management/store/actions/base';
import * as baseReducer from '@app/state-management/store/reducer/reducer.base';

export interface SubLayoutSettingState {
    enableLayoutSetting: boolean;
}

export const initialSubLayoutSettingState: SubLayoutSettingState = {
    enableLayoutSetting: undefined
};

export interface LayoutSettingState {
    features: { [id: string]: SubLayoutSettingState }
}

const initialState: LayoutSettingState = {
    features: {}
};

export function layoutSettingReducer(state = initialState, action: CustomAction): LayoutSettingState {

    switch (action.type) {

        case LayoutSettingActions.UPDATE_EDIT_MODE_STATUS: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                enableLayoutSetting: action.payload
            });
            return Object.assign({}, state);
        }

        default: {
            return state;
        }
    }
}
