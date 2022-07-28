import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import {
    TabSummaryModel,
    SimpleTabModel,
    Module
} from '@app/models';
import { CustomAction } from '@app/state-management/store/actions/base';

@Injectable()
export class TabSummaryActions {
    static LOAD_TABS = '[TabSummary] Load Tabs';
    loadTabs(param: any): CustomAction {
        return {
            type: TabSummaryActions.LOAD_TABS,
            payload: param
        };
    }

    static LOAD_TABS_BY_IDDOCUMENTTYPE = '[TabSummary] Load Tabs by IdDocumentType';
    loadTabsByIdDocumentType(param: any): CustomAction {
        return {
            type: TabSummaryActions.LOAD_TABS_BY_IDDOCUMENTTYPE,
            payload: param
        };
    }

    static LOAD_TABS_SUCCESS = '[TabSummary] Load Tabs Success';
    loadTabsSuccess(tabs: TabSummaryModel[], module: Module): CustomAction {
        return {
            type: TabSummaryActions.LOAD_TABS_SUCCESS,
            module: module,
            payload: { tabs }
        };
    }

    static REMOVE_ALL_TABS = '[TabSummary] Remove All Tabs';
    removeAllTabs(module: Module): CustomAction {
        return {
            type: TabSummaryActions.REMOVE_ALL_TABS,
            module: module
        };
    }

    static SELECT_TAB = '[TabSummary] Select Tab';
    selectTab(tab: TabSummaryModel, module: Module): CustomAction {
        return {
            type: TabSummaryActions.SELECT_TAB,
            module: module,
            payload: { tab }
        }
    }

    static SELECT_SIMPLE_TAB = '[TabSummary] Select Simple Tab';
    selectSimpleTab(simpleTab: SimpleTabModel, module: Module): CustomAction {
        return {
            type: TabSummaryActions.SELECT_SIMPLE_TAB,
            module: module,
            payload: { simpleTab }
        }
    }

    static SELECT_ODE_TAB = '[TabSummary] Select ODE Tab';
    selectODETab(tab: any, module: Module): CustomAction {
        return {
            type: TabSummaryActions.SELECT_ODE_TAB,
            module: module,
            payload: { tab }
        }
    }

    static REQUEST_SELECT_SIMPLE_TAB = '[TabSummary] Request Select Simple Tab';
    requestSelectSimpleTab(simpleTabID: string | number, module: Module): CustomAction {
        return {
            type: TabSummaryActions.REQUEST_SELECT_SIMPLE_TAB,
            module: module,
            payload: simpleTabID
        }
    }

    static SELECT_SUB_TAB = '[TabSummary] Select Sub Tab';
    selectSubTab(subTab: any, module: Module): CustomAction {
        return {
            type: TabSummaryActions.SELECT_SUB_TAB,
            module: module,
            payload: { subTab }
        }
    }

    static TOGGLE_TAB_BUTTON = '[TabSummary] Toggle Tab Button';
    toggleTabButton(isShow, module: Module): CustomAction {
        return {
            type: TabSummaryActions.TOGGLE_TAB_BUTTON,
            module: module,
            payload: { isShow }
        }
    }

    static LOAD_TABS_FOR_NEW = '[TabSummary] Load Tabs For New';
    loadTabsForNew(newTabs, isMainTab, module: Module): CustomAction {
        return {
            type: TabSummaryActions.LOAD_TABS_FOR_NEW,
            module: module,
            payload: {
                isMainTab,
                newTabs
            }
        };
    }

    static STORE_ORIGIN_TABS = '[TabSummary] Store Origin Tabs';
    storeOriginTabs(module: Module): CustomAction {
        return {
            type: TabSummaryActions.STORE_ORIGIN_TABS,
            module: module
        };
    }

    static LOAD_ORIGIN_TABS = '[TabSummary] Load Origin Tabs';
    loadOriginTabs(module: Module): CustomAction {
        return {
            type: TabSummaryActions.LOAD_ORIGIN_TABS,
            module: module
        };
    }

    static SELECT_COLUMN_FILTER = '[TabSummary] Select Column Filter';
    selectColumnFilter(columnFilter, module: Module): CustomAction {
        return {
            type: TabSummaryActions.SELECT_COLUMN_FILTER,
            module: module,
            payload: { columnFilter }
        }
    }

    static UNSELECT_COLUMN_FILTER = '[TabSummary] Unselect Column Filter';
    unselectColumnFilter(module: Module): CustomAction {
        return {
            type: TabSummaryActions.UNSELECT_COLUMN_FILTER,
            module: module
        }
    }

    static STORE_COLUMN_FILTER_LIST = '[TabSummary] Store Column Filter List';
    storeColumnFilterList(columnFilterList, module: Module): CustomAction {
        return {
            type: TabSummaryActions.STORE_COLUMN_FILTER_LIST,
            module: module,
            payload: { columnFilterList }
        }
    }

    static UNCHECK_COLUMN_FILTER_LIST = '[TabSummary] Uncheck Column Filter List';
    uncheckColumnFilterList(module: Module): CustomAction {
        return {
            type: TabSummaryActions.UNCHECK_COLUMN_FILTER_LIST,
            module: module,
        }
    }

    // static STORE_SINGLE_CHOICE_FILTER = '[TabSummary] Store Single Choice Filter';
    // storeSingleChoiceFilter(singleChoiceFilter, module: Module): CustomAction {
    //     return {
    //         type: TabSummaryActions.STORE_SINGLE_CHOICE_FILTER,
    //         module: module,
    //         payload: { singleChoiceFilter }
    //     }
    // }

    // static CLEAR_SINGLE_CHOICE_FILTER = '[TabSummary] Clear Single Choice Filter';
    // clearSingleChoiceFilter(module: Module): CustomAction {
    //     return {
    //         type: TabSummaryActions.CLEAR_SINGLE_CHOICE_FILTER,
    //         module: module,
    //     }
    // }

    static REQUEST_SELECT_TAB = '[TabSummary] Request Select Tab';
    requestSelectTab(tabId: string, module: Module): CustomAction {
        return {
            type: TabSummaryActions.REQUEST_SELECT_TAB,
            module: module,
            payload: { tabId }
        }
    }

    static REQUEST_LOAD_TABS = '[TabSummary] Request Load Tabs';
    requestLoadTabs(module: Module): CustomAction {
        return {
            type: TabSummaryActions.REQUEST_LOAD_TABS,
            module: module,
        }
    }

    static SET_FORM_EDIT_DATA_ACTIVE_SUB_TAB = '[TabSummary] Set Form Edit Data Active Sub Tab';
    setFormEditDataActiveSubTab(isMainActive: boolean, module: Module): CustomAction {
        return {
            type: TabSummaryActions.SET_FORM_EDIT_DATA_ACTIVE_SUB_TAB,
            module: module,
            payload: { isMainActive }
        }
    }

    static SET_FORM_EDIT_SUB_TAB_1_CLICK = '[TabSummary] Set Form Edit Sub Tab 1 Click';
    setFormEditSubTab1Click(module: Module): CustomAction {
        return {
            type: TabSummaryActions.SET_FORM_EDIT_SUB_TAB_1_CLICK,
            module: module,
        }
    }

    static SET_FORM_EDIT_SUB_TAB_2_CLICK = '[TabSummary] Set Form Edit Sub Tab 2 Click';
    setFormEditSubTab2Click(module: Module): CustomAction {
        return {
            type: TabSummaryActions.SET_FORM_EDIT_SUB_TAB_2_CLICK,
            module: module,
        }
    }

    static SET_FORM_EDIT_TEXT_DATA_SUB_TAB = '[TabSummary] Set Form Edit Text Data Sub Tab';
    setFormEditTextDataSubTab(data: any, module: Module): CustomAction {
        return {
            type: TabSummaryActions.SET_FORM_EDIT_TEXT_DATA_SUB_TAB,
            module: module,
            payload: { data }
        }
    }

    static TOGGLE_TAB_HEADER = '[TabSummary] Toggle Tab Header';
    toggleTabHeader(isCollapsed: boolean, module: Module): CustomAction {
        return {
            type: TabSummaryActions.TOGGLE_TAB_HEADER,
            module: module,
            payload: { isCollapsed }
        }
    }

    static REQUEST_UPDATE_TAB_HEADER = '[TabSummary] Request Update Tab Header';
    requestUpdateTabHeader(tabHeader: string, module: Module): CustomAction {
        return {
            type: TabSummaryActions.REQUEST_UPDATE_TAB_HEADER,
            module: module,
            payload: { tabHeader }
        }
    }

    static CLEAR_REQUEST_UPDATE_TAB_HEADER = '[TabSummary] Clear Request Update Tab Header';
    clearRequestUpdateTabHeader(module: Module): CustomAction {
        return {
            type: TabSummaryActions.CLEAR_REQUEST_UPDATE_TAB_HEADER,
            module: module,
        }
    }

    static TAB_CHANGED_SUCCESS = '[TabSummary] Tab Changed Success';
    tabChangedSuccess(module: Module): CustomAction {
        return {
            type: TabSummaryActions.TAB_CHANGED_SUCCESS,
            module: module,
        }
    }

    static TAB_CHANGED_FAILED = '[TabSummary] Tab Changed Failed';
    tabChangedFailed(module: Module): CustomAction {
        return {
            type: TabSummaryActions.TAB_CHANGED_FAILED,
            module: module,
        }
    }

    static STORE_UNDERGROUND_TABS = '[TabSummary] Store Underground Tabs';
    storeUndergroundTabs(undergroundTabs: any[], module: Module): CustomAction {
        return {
            type: TabSummaryActions.STORE_UNDERGROUND_TABS,
            payload: {
                undergroundTabs
            },
            module: module,
        }
    }
}
