import { Action, ActionReducer } from '@ngrx/store';
import cloneDeep from 'lodash-es/cloneDeep';
import { ModuleSettingActions } from '@app/state-management/store/actions/module-setting';
import { ModuleSettingModel } from '@app/models/module-setting.model';
import { CustomAction } from '@app/state-management/store/actions/base';
import * as baseReducer from '@app/state-management/store/reducer/reducer.base';
import { LocalStorageKey } from '@app/app.constants';

export interface SubModuleSettingState {
    moduleSetting: ModuleSettingModel[];
    originModuleSetting: ModuleSettingModel[];
    toolbarSetting: any;
    widgetListenKey: string;
    modulePrimaryKey: string;
    isHiddenParkedItem: boolean;
    moduleDisplayNameKey: string;
    moduleDisplayNameFormat: string;
}

export const initialSubModuleSettingState: SubModuleSettingState = {
    moduleSetting: [],
    originModuleSetting: [],
    toolbarSetting: null,
    widgetListenKey: null,
    modulePrimaryKey: null,
    isHiddenParkedItem: false,
    moduleDisplayNameKey: null,
    moduleDisplayNameFormat: null
};

export interface ModuleSettingState {
    features: { [id: string]: SubModuleSettingState }
}

const initialState: ModuleSettingState = {
    features: {}
};

export function moduleSettingStateReducer(state = initialState, action: CustomAction): ModuleSettingState {
    switch (action.type) {
        case ModuleSettingActions.LOAD_MODULE_SETTING_SUCCESS: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                moduleSetting: action.payload,
                widgetListenKey: getModuleSettingKey(action.payload, 'WidgetListenKey'),
                modulePrimaryKey: getModuleSettingKey(action.payload, 'ModulePrimaryKey', true),
                moduleDisplayNameKey: getModuleSettingKey(action.payload, 'DisplayNameKey', true),
                moduleDisplayNameFormat: getModuleSettingKey(action.payload, 'DisplayNameFormat'),
                isHiddenParkedItem: getModuleSettingKey(action.payload, 'IsHiddenParkedItem') == 1 ? true : false
            });
            return Object.assign({}, state);
        }

        case ModuleSettingActions.CLEAR_MODULE_SETTING: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                moduleSetting: [],
                originModuleSetting: [],
                widgetListenKey: null,
                isHiddenParkedItem: false
            });
            return Object.assign({}, state);
        }

        case ModuleSettingActions.LOAD_MODULE_SETTING_FOR_NEW: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                moduleSetting: action.payload
            });
            return Object.assign({}, state);
        }

        case ModuleSettingActions.STORE_ORIGIN_MODULE_SETTING: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                originModuleSetting: feature.moduleSetting.length ? cloneDeep(feature.moduleSetting) : feature.originModuleSetting
            });
            return Object.assign({}, state);
        }

        case ModuleSettingActions.LOAD_ORIGIN_MODULE_SETTING: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                moduleSetting: feature.originModuleSetting.length ? cloneDeep(feature.originModuleSetting) : feature.moduleSetting
            });
            return Object.assign({}, state);
        }

        case ModuleSettingActions.SELECT_TOOLBAR_SETTING: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                toolbarSetting: action.payload
            });
            return Object.assign({}, state);
        }

        default: {
            return state;
        }
    }
}

export function persistModuleSettingStateReducer(_reducer: ActionReducer<ModuleSettingState>) {
    return (state: ModuleSettingState | undefined, action: Action) => {
        const nextState = _reducer(state, action);
        switch (action.type) {
            case ModuleSettingActions.LOAD_MODULE_SETTING_SUCCESS:
                if (location.pathname != "/search") {
                    //TODO: enhance, only save the necessary state
                    localStorage.setItem(LocalStorageKey.LocalStorageGSModuleSettingKey, JSON.stringify(nextState));
                }
                break;
        }
        return nextState;
    };
}

export function updateModuleSettingStateReducer(_reducer: ActionReducer<ModuleSettingState>) {
    return (state: ModuleSettingState | undefined, action: Action) => {
        if (action.type === ModuleSettingActions.UPDATE_GLOBAL_SEARCH_STATE_FROM_LOCAL_STORAGE) {
            return (<any>action).payload;
        }
        return _reducer(state, action);
    };
}

export function moduleSettingReducer(state = initialState, action: CustomAction): ModuleSettingState {
    return updateModuleSettingStateReducer(persistModuleSettingStateReducer(moduleSettingStateReducer))(state, action);
};

function getModuleSettingKey(moduleSetting: ModuleSettingModel[], keyName: string, camelCaseFormat?: boolean) {
    if (moduleSetting && moduleSetting.length) {
        let jsonSettings = tryParseJson(moduleSetting[0].jsonSettings);
        if (jsonSettings && jsonSettings[keyName]) {
            return camelCaseFormat ? lowercaseFirstLetter(jsonSettings[keyName]) : jsonSettings[keyName];
        }
    }
    return null;
}

function tryParseJson(jsonString: any): any {
    try {
        return JSON.parse(jsonString);
    } catch (ex) {
        return {};
    }
}

function lowercaseFirstLetter(string: string) {
    let stringArray = string.split(',');
    for (let i = 0; i < stringArray.length; i++) {
        stringArray[i] = stringArray[i].charAt(0).toLowerCase() + stringArray[i].slice(1);
    }

    return stringArray.join(',');
}
