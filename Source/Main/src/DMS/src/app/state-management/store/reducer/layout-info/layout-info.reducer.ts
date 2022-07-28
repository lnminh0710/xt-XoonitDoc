import { Action } from '@ngrx/store';
import { LayoutInfoActions } from '@app/state-management/store/actions/layout-info';
import { PageSize } from '@app/app.constants';
import { CustomAction } from '@app/state-management/store/actions/base';
import * as baseReducer from '@app/state-management/store/reducer/reducer.base';

export interface SubLayoutInfoState {
    // globalSearchHeight: string;
    parkedItemHeight: string;
    parkedItemTitleHeight: string;
    parkedItemBufferHeight: string;
    parkedItemPadding: string;
    selectedEntityHeight: string;
    mainContentHeight: string;
    headerHeight: string;
    smallHeaderLineHeight: string;
    tabHeaderHeight: string;
    tabHeaderBigSizeHeight: string;
    tabHeaderHeightOrderDataEntry: string;
    smallTabHeaderHeight: string;
    additionalInfoTabHeaderHeight: string;
    parkedItemWidth: string;
    rightMenuWidth: string;
    rightPropertyPanelWidth: string;
    //resizeSplitter: boolean;
    formPadding: string;
    dashboardPaddingTop: string;
    additionalInfoHeaderHeight: string;
    propertyPanelHeader: string;
    simpleTabHeight: string;
}

export const initialSubLayoutInfoState: SubLayoutInfoState = {
    // globalSearchHeight: '0',
    parkedItemHeight: '100',
    parkedItemTitleHeight: '40',
    parkedItemBufferHeight: '20',
    parkedItemPadding: '2',
    selectedEntityHeight: '135',
    mainContentHeight: '60',
    headerHeight: '0',//53
    smallHeaderLineHeight: '4',
    tabHeaderHeight: '130',
    tabHeaderBigSizeHeight: '160',
    tabHeaderHeightOrderDataEntry: '35',
    smallTabHeaderHeight: '34',
    additionalInfoTabHeaderHeight: '90',
    parkedItemWidth: '0',
    rightMenuWidth: '0',
    rightPropertyPanelWidth: '0',
    //resizeSplitter: false,
    formPadding: '10',
    dashboardPaddingTop: '5',
    additionalInfoHeaderHeight: '36',
    propertyPanelHeader: '35',
    simpleTabHeight: '38'
};

export interface LayoutInfoState {
    features: { [id: string]: SubLayoutInfoState }
}

const initialState: LayoutInfoState = {
    features: {}
};

export function layoutInfoReducer(state = initialState, action: CustomAction): LayoutInfoState {
    switch (action.type) {
        // case LayoutInfoActions.SET_GLOBAL_SEARCH_HEIGHT: {
        //     let feature = baseReducer.getFeature(action, state);
        //     state = baseReducer.updateStateData(action, feature, state, {
        //         globalSearchHeight: action.payload
        //     });
        //     return Object.assign({}, state);
        // }

        case LayoutInfoActions.SET_PARKED_ITEM_WIDTH: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                parkedItemWidth: action.payload
            });
            return Object.assign({}, state);
        }

        case LayoutInfoActions.SET_RIGHT_MENU_WIDTH: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                rightMenuWidth: action.payload
            });
            return Object.assign({}, state);
        }

        case LayoutInfoActions.SET_RIGHT_PROPERTY_PANEL_WIDTH: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                rightPropertyPanelWidth: action.payload
            });
            return Object.assign({}, state);
        }


        //case LayoutInfoActions.RESIZE_SPLITTER: {
        //    let feature = baseReducer.getFeature(action, state);
        //    state = baseReducer.updateStateData(action, feature, state, {
        //        resizeSplitter: action.payload
        //    });
        //    return Object.assign({}, state);
        //}

        case LayoutInfoActions.SET_TAB_HEADER_HEIGHT: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                tabHeaderHeight: action.payload,
                tabHeaderBigSizeHeight: action.payload,
            });
            return Object.assign({}, state);
        }

        case LayoutInfoActions.SET_TAB_HEADER_HEIGHT: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                tabHeaderHeight: action.payload,
                tabHeaderBigSizeHeight: action.payload,
            });
            return Object.assign({}, state);
        }

        default: {
            return state;
        }
    }
}
