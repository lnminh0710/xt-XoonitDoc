import { Injectable } from '@angular/core';
import { Module, ParkedItemModel, TabSummaryModel, AdditionalInfromationTabModel, UserToken } from '@app/models';
import { CustomAction } from '@app/state-management/store/actions/base';
import { AuthenType } from '@app/app.constants';

@Injectable()
export class ModuleActions {
    static LOAD_MAIN_MODULES = '[Module] Load Main Modules';
    loadMainModules(): CustomAction {
        return {
            type: ModuleActions.LOAD_MAIN_MODULES,
        };
    }

    static LOAD_MAIN_MODULES_SUCCESS = '[Module] Load Main Modules Success';
    loadMainModulesSuccess(modules: Module[]): CustomAction {
        return {
            type: ModuleActions.LOAD_MAIN_MODULES_SUCCESS,
            payload: modules,
        };
    }

    static ACTIVE_MODULE = '[Module] Active Module';
    activeModule(module: Module): CustomAction {
        return {
            type: ModuleActions.ACTIVE_MODULE,
            payload: module,
        };
    }

    static ACTIVE_SUB_MODULE = '[Module] Active Sub Module';
    activeSubModule(module: Module): CustomAction {
        return {
            type: ModuleActions.ACTIVE_SUB_MODULE,
            payload: module,
        };
    }

    static GET_SUB_MODULE_SUCCESS = '[Module] Get Sub Module Success';
    getSubModuleSuccess(modules: Module[]): CustomAction {
        return {
            type: ModuleActions.GET_SUB_MODULE_SUCCESS,
            payload: modules,
        };
    }

    static CLEAR_SUB_MODULES = '[Module] Clear Sub Modules';
    clearSubModules(): CustomAction {
        return {
            type: ModuleActions.CLEAR_SUB_MODULES,
        };
    }

    static CLEAR_ACTIVE_MODULE = '[Module] Clear Active Module';
    clearActiveModule(): CustomAction {
        return {
            type: ModuleActions.CLEAR_ACTIVE_MODULE,
        };
    }

    static CLEAR_ACTIVE_SUB_MODULE = '[Module] Clear Active Sub Module';
    clearActiveSubModule(): CustomAction {
        return {
            type: ModuleActions.CLEAR_ACTIVE_SUB_MODULE,
        };
    }

    static ADD_WORKING_MODULE = '[Module] Add Working Module';
    addWorkingModule(
        workingModule: Module,
        subModules: Module[],
        parkedItems: ParkedItemModel[],
        fieldConfig: Array<any>,
        loadFromSetting?: boolean,
    ): CustomAction {
        return {
            type: ModuleActions.ADD_WORKING_MODULE,
            payload: {
                workingModule,
                subModules,
                parkedItems,
                fieldConfig,
                loadFromSetting: loadFromSetting || false,
            },
        };
    }

    static REMOVE_WORKING_MODULE = '[Module] Remove Working Module';
    removeWorkingModule(workingModule: Module): CustomAction {
        return {
            type: ModuleActions.REMOVE_WORKING_MODULE,
            payload: {
                workingModule,
            },
        };
    }

    static RESET_SELECTING_WORKING_MODULE_PARKED_ITEM = '[Module] Reset Selecting Working Module Parked Item';
    resetSelectingWorkingModuleParkedItem(workingModule: Module): CustomAction {
        return {
            type: ModuleActions.RESET_SELECTING_WORKING_MODULE_PARKED_ITEM,
            payload: workingModule,
        };
    }

    static MOVE_SELECTED_PARKED_ITEM_TO_TOP = '[Module] Move Selected Parked Item To Top';
    moveSelectedParkedItemToTop(workingModule: Module, selectedParkedItem: ParkedItemModel): CustomAction {
        return {
            type: ModuleActions.MOVE_SELECTED_PARKED_ITEM_TO_TOP,
            payload: {
                workingModule,
                selectedParkedItem,
            },
        };
    }

    static STORE_MODULE_STATES = '[Module] Store Module States';
    storeModuleStates(
        currentModule: Module,
        selectedParkedItem: ParkedItemModel,
        selectedTab: TabSummaryModel,
        selectedAiTab: AdditionalInfromationTabModel,
    ): CustomAction {
        return {
            type: ModuleActions.STORE_MODULE_STATES,
            payload: {
                currentModule,
                selectedParkedItem,
                selectedTab,
                selectedAiTab,
            },
        };
    }

    static CLEAR_MODULE_STATE = '[Module] Clear Module State';
    clearModuleState(currentModule: Module): CustomAction {
        return {
            type: ModuleActions.CLEAR_MODULE_STATE,
            payload: currentModule,
        };
    }

    static REQUEST_CREATE_NEW_MODULE_ITEM = '[Module] Request Create New Module Item';
    requestCreateNewModuleItem(currentModule: Module): CustomAction {
        return {
            type: ModuleActions.REQUEST_CREATE_NEW_MODULE_ITEM,
            payload: currentModule,
        };
    }

    static REFRESH_GLOBAL_SEARCH = '[Module] Refresh global search';
    refreshGlobalSearch(): CustomAction {
        return {
            type: ModuleActions.REFRESH_GLOBAL_SEARCH,
        };
    }

    static SEARCH_KEYWORD_MODULE = '[Module] Search Keyword Module';
    searchKeywordModule(module: Module): CustomAction {
        return {
            type: ModuleActions.SEARCH_KEYWORD_MODULE,
            payload: module,
        };
    }

    static SET_USING_MODULE = '[Module] Set Using Module';
    setUsingModule(usingModule: Module): CustomAction {
        return {
            type: ModuleActions.SET_USING_MODULE,
            payload: usingModule,
        };
    }

    static CLEAR_USING_MODULE = '[Module] Clear Using Module';
    clearUsingModule(): CustomAction {
        return {
            type: ModuleActions.CLEAR_USING_MODULE,
        };
    }

    static REQUEST_CHANGE_MODULE = '[Module] Request Change Module';
    requestChangeModule(module: Module): CustomAction {
        return {
            type: ModuleActions.REQUEST_CHANGE_MODULE,
            payload: module,
        };
    }

    static CLEAR_REQUEST_CHANGE_MODULE = '[Module] Clear Request Change Module';
    clearRequestChangeModule(): CustomAction {
        return {
            type: ModuleActions.CLEAR_REQUEST_CHANGE_MODULE,
        };
    }

    static REQUEST_CHANGE_SUB_MODULE = '[Module] Request Change Sub Module';
    requestChangeSubModule(requestedModuleId: number, requestedSubModuleId: number): CustomAction {
        return {
            type: ModuleActions.REQUEST_CHANGE_SUB_MODULE,
            payload: {
                requestedModuleId,
                requestedSubModuleId,
            },
        };
    }

    static CLEAR_REQUEST_CHANGE_SUB_MODULE = '[Module] Clear Request Change Sub Module';
    clearRequestChangeSubModule(): CustomAction {
        return {
            type: ModuleActions.CLEAR_REQUEST_CHANGE_SUB_MODULE,
        };
    }

    static TOGGLE_IS_WORKING_MODULES_DRAGGING = '[Module] Toggle Is Working Modules Dragging';
    toggleIsWorkingModulesDragging(isDragging: boolean): CustomAction {
        return {
            type: ModuleActions.TOGGLE_IS_WORKING_MODULES_DRAGGING,
            payload: isDragging,
        };
    }

    static REMOVE_ALL_PARKED_ITEMS_OF_WORKING_MODULE = '[Module] Remove All Parked Items Of Working Module';
    removeAllParkedItemsOfWorkingModule(module: Module): CustomAction {
        return {
            type: ModuleActions.REMOVE_ALL_PARKED_ITEMS_OF_WORKING_MODULE,
            payload: module,
        };
    }

    static REMOVE_PARKED_ITEM_OF_WORKING_MODULE = '[Module] Remove Parked Item Of Working Module';
    removeParkedItemOfWorkingModule(module: Module, parkedItem: ParkedItemModel): CustomAction {
        return {
            type: ModuleActions.REMOVE_PARKED_ITEM_OF_WORKING_MODULE,
            payload: {
                module,
                parkedItem,
            },
        };
    }

    static ADD_DIRTY_MODULE = '[Module] Add Dirty Module';
    addDirtyModule(module: Module): CustomAction {
        return {
            type: ModuleActions.ADD_DIRTY_MODULE,
            payload: {
                module,
            },
        };
    }

    static REMOVE_DIRTY_MODULE = '[Module] Remove Dirty Module';
    removeDirtyModule(module: Module): CustomAction {
        return {
            type: ModuleActions.REMOVE_DIRTY_MODULE,
            payload: {
                module,
            },
        };
    }

    static UPDATE_MODULE_STATE_FROM_LOCAL_STORAGE = '[Module] Update module state from local storage';
    updateModuleStateFromLocalStorage(data: any): CustomAction {
        return {
            type: ModuleActions.UPDATE_MODULE_STATE_FROM_LOCAL_STORAGE,
            payload: data,
        };
    }

    static REQUEST_TRIGGER_CLICK_NEW_FROM_MODULE = '[Module] Request trigger click from new module';
    requestTriggerClickNewFromModule(data: any): CustomAction {
        return {
            type: ModuleActions.REQUEST_TRIGGER_CLICK_NEW_FROM_MODULE,
            payload: data,
        };
    }

    static LOGIN_SUCCESS = '[Module] Login Success';
    loginSuccess(): CustomAction {
        return {
            type: ModuleActions.LOGIN_SUCCESS,
        };
    }

    static REQUEST_CHANGE_ACTIVE_MODULE_NAME = '[Module] Request To Change Active Module Name';
    requestToChangeActiveModuleName(payload: { activeModule: Module; moduleName: string }) {
        return {
            type: ModuleActions.REQUEST_CHANGE_ACTIVE_MODULE_NAME,
            payload: payload,
        };
    }

    static SEND_TOKEN_UPDATE_PASSWORD = '[Module] Send Token Update Password';
    sendTokenUpdatePasswordAction(userToken: UserToken): CustomAction {
        return {
            type: ModuleActions.SEND_TOKEN_UPDATE_PASSWORD,
            payload: userToken,
        };
    }

    static SEND_TYPE_ACTION_AUTHEN_SUCCESS = '[Module] Send Type Action Authen Success';
    sendTypeAuthenActionSuccess(typeActionAuthen: AuthenType): CustomAction {
        return {
            type: ModuleActions.SEND_TYPE_ACTION_AUTHEN_SUCCESS,
            payload: typeActionAuthen,
        };
    }
    static GET_COMPANY = '[Module] Get Company from Contact';
    getCompany(company: string): CustomAction {
        return {
            type: ModuleActions.GET_COMPANY,
            payload: company,
        };
    }
}
