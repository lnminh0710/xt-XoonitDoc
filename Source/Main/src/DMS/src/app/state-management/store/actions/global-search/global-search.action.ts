import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import { Module } from '@app/models';
import { CustomAction } from '@app/state-management/store/actions/base';
import { Uti } from '@app/utilities';

@Injectable()
export class GlobalSearchActions {
    static SEARCH_KEYWORD_STORAGE = '[GlobalSearch Storage] Search keyword';
    static SEARCH_KEYWORD = '[GlobalSearch] Search keyword';
    searchKeyword(keyword): CustomAction {
        return {
            type: GlobalSearchActions.SEARCH_KEYWORD,
            payload: keyword,
            browserTabId: Uti.defineBrowserTabId(),
        };
    }

    static CHANGE_MODULE_TAB_STORAGE = '[GlobalSearch Storage] Change Module Tab';
    static CHANGE_MODULE_TAB = '[GlobalSearch] Change Module Tab';
    changeModuleTab(data): CustomAction {
        return {
            type: GlobalSearchActions.CHANGE_MODULE_TAB,
            payload: data,
            browserTabId: Uti.defineBrowserTabId(),
        };
    }

    static ACTIVE_MODULE_TAB_STORAGE = '[GlobalSearch Storage] Add Tab';
    static ACTIVE_MODULE_TAB = '[GlobalSearch] Active Module Tab';
    activeModuleTab(data): CustomAction {
        return {
            type: GlobalSearchActions.ACTIVE_MODULE_TAB,
            payload: data,
            browserTabId: Uti.defineBrowserTabId(),
        };
    }

    static CLOSE_MODULE_TAB_STORAGE = '[GlobalSearch Storage] Close Module Tab';
    static CLOSE_MODULE_TAB = '[GlobalSearch] Close Module Tab';
    closeModuleTab(data): CustomAction {
        return {
            type: GlobalSearchActions.CLOSE_MODULE_TAB,
            payload: data,
            browserTabId: Uti.defineBrowserTabId(),
        };
    }

    static CLOSE_ALL_TABS_STORAGE = '[GlobalSearch Storage] Close All Tabs';
    static CLOSE_ALL_TABS = '[GlobalSearch] Close All Tabs';
    closeAllTabs(): CustomAction {
        return {
            type: GlobalSearchActions.CLOSE_ALL_TABS,
            payload: {},
            browserTabId: Uti.defineBrowserTabId(),
        };
    }

    static UPDATE_TAB = '[GlobalSearch] Update Tab';
    updateTab(data): CustomAction {
        return {
            type: GlobalSearchActions.UPDATE_TAB,
            payload: data,
        };
    }

    static ACTIVE_MODULE = '[GlobalSearch] Active Module';
    activeModule(data): CustomAction {
        return {
            type: GlobalSearchActions.ACTIVE_MODULE,
            payload: data,
        };
    }

    static ACTIVE_SUB_MODULE = '[GlobalSearch] Active Sub Module';
    activeSubModule(data): CustomAction {
        return {
            type: GlobalSearchActions.ACTIVE_SUB_MODULE,
            payload: data,
        };
    }

    static UPDATE_GLOBAL_SEARCH_STATE_FROM_LOCAL_STORAGE =
        '[GlobalSearch] Update global search state from local storage';
    restoreAllState(data): CustomAction {
        return {
            type: GlobalSearchActions.UPDATE_GLOBAL_SEARCH_STATE_FROM_LOCAL_STORAGE,
            payload: data,
        };
    }

    static CHANGE_PAGING = '[GlobalSearch] Change Paging';
    changePage(page): CustomAction {
        return {
            type: GlobalSearchActions.CHANGE_PAGING,
            payload: page,
        };
    }

    static CHANGE_PAGE_SIZE = '[GlobalSearch] Change Page Size';
    changePageSize(data): CustomAction {
        return {
            type: GlobalSearchActions.CHANGE_PAGE_SIZE,
            payload: data,
        };
    }

    static ROW_CLICK = '[GlobalSearch] Row Click';
    rowClick(data): CustomAction {
        return {
            type: GlobalSearchActions.ROW_CLICK,
            payload: data,
        };
    }

    static ROW_DOUBLE_CLICK_STORAGE = '[GlobalSearch Storage] Row Double Click';
    static ROW_DOUBLE_CLICK = '[GlobalSearch] Row Double Click';
    rowDoubleClick(data): CustomAction {
        return {
            type: GlobalSearchActions.ROW_DOUBLE_CLICK,
            payload: data,
            browserTabId: Uti.defineBrowserTabId(),
        };
    }

    static ADD_TO_PARKED_ITEM = '[GlobalSearch] Add to parked item';
    addToParkedItem(data): CustomAction {
        return {
            type: GlobalSearchActions.ADD_TO_PARKED_ITEM,
            payload: data,
        };
    }

    static CLOSE_POPUP_STORAGE = '[GlobalSearch Storage] Close Popup Storage';
    static CLOSE_POPUP = '[GlobalSearch Storage] Close Popup';
    closePopup(): CustomAction {
        return {
            type: GlobalSearchActions.CLOSE_POPUP,
            payload: { guid: Uti.guid() },
            browserTabId: Uti.defineBrowserTabId(),
        };
    }

    static MENU_CONTEXT_ACTION_STORAGE = '[GlobalSearch Storage] Menu Context Action Storage';
    static MENU_CONTEXT_ACTION = '[GlobalSearch] Menu Context Action';
    menuContextAction(data): CustomAction {
        return {
            type: GlobalSearchActions.MENU_CONTEXT_ACTION,
            payload: data,
            browserTabId: Uti.defineBrowserTabId(),
        };
    }

    static UPDATE_TREE_LIST_STORAGE_ACTION = '[GlobalSearch Storage] Update tree list storage';
    updateTreeListStorageAction(data): CustomAction {
        return {
            type: GlobalSearchActions.UPDATE_TREE_LIST_STORAGE_ACTION,
            payload: data,
        };
    }
}
