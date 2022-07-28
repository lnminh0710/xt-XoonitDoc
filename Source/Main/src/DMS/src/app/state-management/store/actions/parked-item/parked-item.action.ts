import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import {
    ParkedItemModel,
    Module
} from '@app/models';
import { CustomAction } from '@app/state-management/store/actions/base';

@Injectable()
export class ParkedItemActions {
    static LOAD_PARKED_ITEMS = '[ParkedItem] Load Parked Items';
    loadParkedItems(currentModule: Module, ODETab?: any): CustomAction {
        return {
            type: ParkedItemActions.LOAD_PARKED_ITEMS,
            payload: {
                currentModule,
                ODETab
            }
        };
    }

    static LOAD_PARKED_ITEMS_SUCCESS = '[ParkedItem] Load Parked Items Success';
    loadParkedItemsSuccess(parkedItemResult: any): CustomAction {
        return {
            type: ParkedItemActions.LOAD_PARKED_ITEMS_SUCCESS,
            module: parkedItemResult.module,
            payload: parkedItemResult
        };
    }

    static RESET = '[ParkedItem] Reset';
    reset(module: Module): CustomAction {
        return {
            type: ParkedItemActions.RESET,
            module: module,
        };
    }

    static SELECT_PARKED_ITEM = '[ParkedItem] Select Parked Item';
    selectParkedItem(parkedItem: ParkedItemModel, module: Module): CustomAction {
        return {
            type: ParkedItemActions.SELECT_PARKED_ITEM,
            module: module,
            payload: { parkedItem }
        }
    }

    static UNSELECT_PARKED_ITEM = '[ParkedItem] Unselect Parked Item';
    unselectParkedItem(module: Module): CustomAction {
        return {
            type: ParkedItemActions.UNSELECT_PARKED_ITEM,
            module: module,
        }
    }

    static REMOVE_PARKED_ITEM = '[ParkedItem] Remove Parked Item';
    removeParkedItem(parkedItem: ParkedItemModel, module: Module): CustomAction {
        return {
            type: ParkedItemActions.REMOVE_PARKED_ITEM,
            module: module,
            payload: {
                parkedItem
            }
        }
    }

    static REMOVE_ALL_PARKED_ITEM = '[ParkedItem] Remove All Parked Item';
    removeAllParkedItem(module: Module): CustomAction {
        return {
            type: ParkedItemActions.REMOVE_ALL_PARKED_ITEM,
            module: module,
        }
    }

    static LOAD_THEN_ADD_PARKED_ITEM = '[ParkedItem] Load Then Add Parked Item';
    loadThenAddParkedItem(parkedItemId: string, currentModule: Module, modulePrimaryKey: string, widgetListenKey: string): CustomAction {
        return {
            type: ParkedItemActions.LOAD_THEN_ADD_PARKED_ITEM,
            module: currentModule,
            payload: {
                parkedItemId,
                currentModule,
                modulePrimaryKey,
                widgetListenKey
            }
        }
    }

    static LOAD_THEN_ADD_PARKED_ITEM_SUCCESS = '[ParkedItem] Load Then Add Parked Item Success';
    loadThenAddParkedItemSuccess(parkedItem: ParkedItemModel, module: Module): CustomAction {
        return {
            type: ParkedItemActions.LOAD_THEN_ADD_PARKED_ITEM_SUCCESS,
            module: module,
            payload: {
                parkedItem
            }
        }
    }

    static ADD_DRAFT_ITEM = '[ParkedItem] Add Draft Item';
    addDraftItem(draftItem: ParkedItemModel, module: Module): CustomAction {
        return {
            type: ParkedItemActions.ADD_DRAFT_ITEM,
            module: module,
            payload: {
                draftItem
            }
        }
    }

    static REMOVE_DRAFT_ITEM = '[ParkedItem] Remove Draft Item';
    removeDraftItem(module: Module): CustomAction {
        return {
            type: ParkedItemActions.REMOVE_DRAFT_ITEM,
            module: module
        }
    }

    static REQUEST_SAVE_PARKED_ITEM_LIST = '[ParkedItem] Request Save Parked Item List';
    requestSaveParkedItemList(module: Module): CustomAction {
        return {
            type: ParkedItemActions.REQUEST_SAVE_PARKED_ITEM_LIST,
            module: module
        }
    }

    static REQUEST_TOGGLE_PANEL = '[ParkedItem] Request Toggle Panel';
    requestTogglePanel(isShow: boolean, module: Module): CustomAction {
        return {
            type: ParkedItemActions.REQUEST_TOGGLE_PANEL,
            module: module,
            payload: { isShow }
        }
    }

    static SELECT_PREVIOUS_PARKED_ITEM = '[ParkedItem] Select Previous Parked Item';
    selectPreviousParkedItem(module: Module): CustomAction {
        return {
            type: ParkedItemActions.SELECT_PREVIOUS_PARKED_ITEM,
            module: module
        }
    }

    static STORE_FIELD_CONFIG = '[ParkedItem] Store Field Config';
    storeFieldConfig(fieldConfig: any[], module: Module): CustomAction {
        return {
            type: ParkedItemActions.STORE_FIELD_CONFIG,
            module: module,
            payload: fieldConfig
        }
    }

    static TOGGLE_DISABLED_PANEL = '[ParkedItem] Toggle Disabled Panel';
    toggleDisabledPanel(isDisabled: boolean, module: Module): CustomAction {
        return {
            type: ParkedItemActions.TOGGLE_DISABLED_PANEL,
            module: module,
            payload: { isDisabled }
        }
    }

    static SET_COLLAPSE_STATE = '[ParkedItem] Set Collapse State';
    setCollapseState(isCollapsed: boolean, module: Module): CustomAction {
        return {
            type: ParkedItemActions.SET_COLLAPSE_STATE,
            module: module,
            payload: {
                isCollapsed
            }
        }
    }

    static REQUEST_RELOAD_LIST = '[ParkedItem] Request Reload List';
    requestReloadList(module: Module): CustomAction {
        return {
            type: ParkedItemActions.REQUEST_RELOAD_LIST,
            module: module
        }
    }

    static UPDATE_GLOBAL_SEARCH_STATE_FROM_LOCAL_STORAGE = '[ParkedItem] Update global search state from local storage';
    restoreAllState(data): CustomAction {
        return {
            type: ParkedItemActions.UPDATE_GLOBAL_SEARCH_STATE_FROM_LOCAL_STORAGE,
            payload: data
        }
    }
}
