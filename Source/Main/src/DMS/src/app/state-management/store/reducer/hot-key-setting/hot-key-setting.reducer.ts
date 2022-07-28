import { Action } from '@ngrx/store';
import { HotKeySetting } from '@app/models/hot-key/hot-key-setting.model';
import { CustomAction } from '@app/state-management/store/actions/base';
import { HotKeySettingActions } from '@app/state-management/store/actions/hot-key-setting';

export interface HotKeySettingState {
    hotKeySetting: HotKeySetting;
}

const initialState: HotKeySettingState = {
    hotKeySetting: {} 
};

export function hotKeySettingReducer(state = initialState, action: CustomAction): HotKeySettingState {
    switch (action.type) {

        case HotKeySettingActions.LOAD_HOT_KEY_SETTING_SUCCESS: {            
            return Object.assign({}, state, { hotKeySetting: action.payload });
        }

        case HotKeySettingActions.ADD_HOT_KEY_SETTING: {
            let hotKeySetting = Object.assign({}, state.hotKeySetting);
            const controlKey = action.payload.controlKey;
            const hotKey = action.payload.hotKey;
            hotKeySetting[controlKey] = hotKey;
            return Object.assign({}, state, { hotKeySetting: hotKeySetting });
        }
        default: {
            return state;
        }
    }
};
