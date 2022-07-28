import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import {
    ModuleSettingModel,
    Module
} from '@app/models';
import { CustomAction } from '@app/state-management/store/actions/base';

@Injectable()
export class ModuleSettingActions {
    static LOAD_MODULE_SETTING = '[ModuleSetting] Load Module Setting';
    loadModuleSetting(module: Module, objectParam?: string, idSettingsModule?: string, objectNr?: string, moduleType?: string): CustomAction {
        return {
            type: ModuleSettingActions.LOAD_MODULE_SETTING,
            module: module,
            payload: {
                objectParam,
                idSettingsModule,
                objectNr,
                moduleType
            }
        };
    }

    static LOAD_MODULE_SETTING_SUCCESS = '[ModuleSetting] Load Module Setting Success';
    loadModuleSettingSuccess(moduleSetting: ModuleSettingModel[], module: Module): CustomAction {
        return {
            type: ModuleSettingActions.LOAD_MODULE_SETTING_SUCCESS,
            module: module,
            payload: moduleSetting
        };
    }

    static CLEAR_MODULE_SETTING = '[ModuleSetting] Clear Module Setting';
    clearModuleSetting(module: Module): CustomAction {
        return {
            type: ModuleSettingActions.CLEAR_MODULE_SETTING,
            module: module,
        };
    }

    static LOAD_MODULE_SETTING_FOR_NEW = '[ModuleSetting] Load Module Setting For New';
    loadModuleSettingForNew(newModuleSetting, module: Module): CustomAction {
        return {
            type: ModuleSettingActions.LOAD_MODULE_SETTING_FOR_NEW,
            module: module,
            payload: newModuleSetting
        };
    }

    static STORE_ORIGIN_MODULE_SETTING = '[ModuleSetting] Store Origin Module Setting';
    storeOriginModuleSetting(module: Module): CustomAction {
        return {
            type: ModuleSettingActions.STORE_ORIGIN_MODULE_SETTING,
            module: module,
        };
    }

    static LOAD_ORIGIN_MODULE_SETTING = '[ModuleSetting] Load Origin Module Setting';
    loadOriginModuleSetting(module: Module): CustomAction {
        return {
            type: ModuleSettingActions.LOAD_ORIGIN_MODULE_SETTING,
            module: module,
        };
    }

    static SELECT_TOOLBAR_SETTING = '[ModuleSetting] Select Toolbar Setting';
    selectToolbarSetting(toolbarSetting: any, module: Module): CustomAction {
        return {
            type: ModuleSettingActions.SELECT_TOOLBAR_SETTING,
            module: module,
            payload: toolbarSetting
        };
    }

    static UPDATE_GLOBAL_SEARCH_STATE_FROM_LOCAL_STORAGE = '[ModuleSetting] Update global search state from local storage';
    restoreAllState(data): CustomAction {
        return {
            type: ModuleSettingActions.UPDATE_GLOBAL_SEARCH_STATE_FROM_LOCAL_STORAGE,
            payload: data
        }
    }
}
