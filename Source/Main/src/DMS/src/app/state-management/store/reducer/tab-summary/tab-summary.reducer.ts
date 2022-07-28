import { Action } from '@ngrx/store';
import cloneDeep from 'lodash-es/cloneDeep';
import {
    TabSummaryModel,
    SimpleTabModel
} from '@app/models';
import { TabSummaryActions } from '@app/state-management/store/actions/tab-summary';
import { CustomAction } from '@app/state-management/store/actions/base';
import * as baseReducer from '@app/state-management/store/reducer/reducer.base';

export interface SubTabSummaryState {
    tabs: TabSummaryModel[];
    undergroundTabs: TabSummaryModel[];
    selectedTab: TabSummaryModel;
    selectedODETab: any;
    selectedSimpleTab: SimpleTabModel;
    selectedSubTab: any;
    showTabButton: boolean;
    originTabs: TabSummaryModel[];
    columnFilter: any;
    columnFilterList: Array<any>;
    // singleChoiceFilter: any;
    requestSelectTab: any;
    formEditTextDataSubTab: any;
    formEditActiveSubTab: any;
    isTabCollapsed: boolean;
    requestUpdateTabHeader: any;
}

export const initialSubTabSummaryState: SubTabSummaryState = {
    tabs: [],
    undergroundTabs: [],
    selectedTab: null,
    selectedODETab: null,
    selectedSimpleTab: null,
    selectedSubTab: null,
    showTabButton: false,
    originTabs: [],
    columnFilter: null,
    columnFilterList: [],
    // singleChoiceFilter: {},
    requestSelectTab: null,
    formEditTextDataSubTab: {},
    formEditActiveSubTab: null,
    isTabCollapsed: false,
    requestUpdateTabHeader: null
};

export interface TabSummaryState {
    features: { [id: string]: SubTabSummaryState }
}

const initialState: TabSummaryState = {
    features: {}
};

export function tabSummaryReducer(state = initialState, action: CustomAction): TabSummaryState {
    switch (action.type) {
        case TabSummaryActions.LOAD_TABS_SUCCESS: {
            const feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                tabs: action.payload.tabs || [],
                selectedTab: getSelectedTab(feature.selectedTab, action.payload.tabs),
                undergroundTabs: []
            });
            return Object.assign({}, state);
        }

        case TabSummaryActions.REMOVE_ALL_TABS: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                tabs: [],
                undergroundTabs: [],
                originTabs: [],
                selectedTab: null,
                selectedSimpleTab: null,
            });
            return Object.assign({}, state);
        }

        case TabSummaryActions.SELECT_TAB: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                selectedTab: action.payload.tab,
                selectedSimpleTab: null,
                selectedODETab: null
            });
            return Object.assign({}, state);
        }

        case TabSummaryActions.SELECT_ODE_TAB: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                selectedODETab: action.payload.tab,
                selectedTab: null,
                selectedSimpleTab: null,
            });
            return Object.assign({}, state);
        }

        case TabSummaryActions.SELECT_SIMPLE_TAB: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                selectedSimpleTab: action.payload.simpleTab
            });
            return Object.assign({}, state);
        }

        case TabSummaryActions.SELECT_SUB_TAB: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                selectedSubTab: action.payload.subTab
            });
            return Object.assign({}, state);
        }

        case TabSummaryActions.TOGGLE_TAB_BUTTON: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                showTabButton: action.payload.isShow
            });
            return Object.assign({}, state);
        }

        case TabSummaryActions.LOAD_TABS_FOR_NEW: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                tabs: action.payload.newTabs,
                selectedTab: action.payload.isMainTab ? selectMainTab(cloneDeep(action.payload.newTabs)) : getSelectedTab(feature.selectedTab, cloneDeep(action.payload.newTabs))
            });
            return Object.assign({}, state);
        }

        case TabSummaryActions.STORE_ORIGIN_TABS: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                originTabs: feature.tabs.length ? cloneDeep(feature.tabs) : (feature.undergroundTabs.length ? feature.undergroundTabs : [])
            });
            return Object.assign({}, state);
        }

        case TabSummaryActions.LOAD_ORIGIN_TABS: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                tabs: feature.originTabs.length ? cloneDeep(feature.originTabs) : feature.tabs,
                selectedTab: feature.originTabs.length ? getSelectedTab(feature.selectedTab, cloneDeep(feature.originTabs)) : feature.selectedTab
            });
            return Object.assign({}, state);
        }

        case TabSummaryActions.SELECT_COLUMN_FILTER: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                columnFilter: action.payload.columnFilter
            });
            return Object.assign({}, state);
        }

        case TabSummaryActions.UNSELECT_COLUMN_FILTER: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                columnFilter: null
            });
            return Object.assign({}, state);
        }

        case TabSummaryActions.STORE_COLUMN_FILTER_LIST: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                columnFilterList: action.payload.columnFilterList
            });
            return Object.assign({}, state);
        }

        case TabSummaryActions.UNCHECK_COLUMN_FILTER_LIST: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                columnFilterList: uncheckAllColumnFilterList(feature.columnFilterList)
            });
            return Object.assign({}, state);
        }

        // case TabSummaryActions.STORE_SINGLE_CHOICE_FILTER: {
        //     let feature = baseReducer.getFeature(action, state);
        //     state = baseReducer.updateStateData(action, feature, state, {
        //         singleChoiceFilter: action.payload.singleChoiceFilter
        //     });
        //     return Object.assign({}, state);
        // }

        // case TabSummaryActions.CLEAR_SINGLE_CHOICE_FILTER: {
        //     let feature = baseReducer.getFeature(action, state);
        //     state = baseReducer.updateStateData(action, feature, state, {
        //         singleChoiceFilter: {}
        //     });
        //     return Object.assign({}, state);
        // }

        case TabSummaryActions.REQUEST_SELECT_TAB: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                requestSelectTab: {
                    tabId: action.payload.tabId
                }
            });
            return Object.assign({}, state);
        }

        case TabSummaryActions.SET_FORM_EDIT_DATA_ACTIVE_SUB_TAB: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                formEditActiveSubTab: {
                    isMainActive: action.payload.isMainActive
                }
            });
            return Object.assign({}, state);
        }

        case TabSummaryActions.SET_FORM_EDIT_TEXT_DATA_SUB_TAB: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                formEditTextDataSubTab: action.payload.data
            });
            return Object.assign({}, state);
        }

        case TabSummaryActions.TOGGLE_TAB_HEADER: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                isTabCollapsed: action.payload.isCollapsed
            });
            return Object.assign({}, state);
        }

        case TabSummaryActions.REQUEST_UPDATE_TAB_HEADER: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                requestUpdateTabHeader: {
                    tabHeader: action.payload.tabHeader
                }
            });
            return Object.assign({}, state);
        }

        case TabSummaryActions.CLEAR_REQUEST_UPDATE_TAB_HEADER: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                requestUpdateTabHeader: null
            });
            return Object.assign({}, state);
        }

        case TabSummaryActions.STORE_UNDERGROUND_TABS: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                undergroundTabs: action.payload.undergroundTabs
            });
            return Object.assign({}, state);
        }

        default: {
            return state;
        }
    }
};

function selectMainTab(tabs) {
    if (tabs.length) {
        return tabs[0];
    }

    return null;
}

function getSelectedTab(selectedTabState, tabs: any[]) {
    if (selectedTabState) {
        return selectedTabState;
    }

    if (tabs.length) {
        return tabs.find(t => t.accessRight && t.accessRight.read);
    }

    return null;
}

function uncheckAllColumnFilterList(columnFilterList) {
    if (!columnFilterList) {
        return [];
    }

    for (const filterItem of columnFilterList) {
        filterItem.isChecked = false;
    }

    return columnFilterList;
}
