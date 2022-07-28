import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import { CustomAction } from '@app/state-management/store/actions/base';
import { Module } from '@app/models';
import { SplitterDirectionMode } from '@app/app.constants';

@Injectable()
export class LayoutInfoActions {
    // static SET_GLOBAL_SEARCH_HEIGHT = '[LayoutInfo] Set Global Search Height';
    // setGlobalSearchHeight(height: string, module: Module): CustomAction {
    //     return {
    //         type: LayoutInfoActions.SET_GLOBAL_SEARCH_HEIGHT,
    //         module: module,
    //         payload: height
    //     };
    // }

    static SET_PARKED_ITEM_WIDTH = '[LayoutInfo] Set Parked Item Width';
    setParkedItemWidth(width: string, module: Module): CustomAction {
        return {
            type: LayoutInfoActions.SET_PARKED_ITEM_WIDTH,
            module: module,
            payload: width,
        };
    }

    static SET_RIGHT_MENU_WIDTH = '[LayoutInfo] Set Right Menu Width';
    setRightMenuWidth(width: string, module: Module): CustomAction {
        return {
            type: LayoutInfoActions.SET_RIGHT_MENU_WIDTH,
            module: module,
            payload: width,
        };
    }

    static SET_RIGHT_PROPERTY_PANEL_WIDTH = '[LayoutInfo] Set Right Property Panel Width';
    setRightPropertyPanelWidth(width: string, module: Module): CustomAction {
        return {
            type: LayoutInfoActions.SET_RIGHT_PROPERTY_PANEL_WIDTH,
            module: module,
            payload: width,
        };
    }

    static RESIZE_SPLITTER = '[LayoutInfo] Resize Splitter';
    resizeSplitter(module: Module, directionMode?: SplitterDirectionMode): CustomAction {
        let mode = SplitterDirectionMode.Horizontal;
        if (directionMode) {
            mode = directionMode;
        }

        return {
            type: LayoutInfoActions.RESIZE_SPLITTER,
            module: module,
            payload: mode,
        };
    }

    static SET_TAB_HEADER_HEIGHT = '[LayoutInfo] Set Tab Header Height';
    setTabHeaderHeight(height: string, module: Module): CustomAction {
        return {
            type: LayoutInfoActions.SET_TAB_HEADER_HEIGHT,
            module: module,
            payload: height,
        };
    }

    static HIDE_SPLIT_AREA_TAB_ID = '[LayoutInfo] Hide Split Area Tab ID';
    hideSplitAreaTabID(payload: { tabID: string; acknowledge: (ack: boolean) => void }, module: Module): CustomAction {
        return {
            type: LayoutInfoActions.HIDE_SPLIT_AREA_TAB_ID,
            module: module,
            payload: payload,
        };
    }

    static SHOW_SPLIT_AREA_TAB_ID = '[LayoutInfo] Show Split Area Tab ID';
    showSplitAreaTabID(payload: { tabID: string; acknowledge: (ack: boolean) => void }, module: Module): CustomAction {
        return {
            type: LayoutInfoActions.SHOW_SPLIT_AREA_TAB_ID,
            module: module,
            payload: payload
        };
    }

    static SET_SPLIT_AREAS_SIZE = '[LayoutInfo] Set Split Areas Size';
    setSplitAreasSize(tabID: string, config: { hideSplitter: boolean, sizes: number[] }, module: Module): CustomAction {
        return {
            type: LayoutInfoActions.SET_SPLIT_AREAS_SIZE,
            module: module,
            payload: {
                tabID,
                config
            },
        };
    }

    static TOGGLE_SCAN_SPLIT_AREA = '[LayoutInfo] Toggle Scab Split Area';
    toggleScanSplitArea(isShowPreview: boolean, isShowConfiguration: boolean, module: Module): CustomAction {
        return {
            type: LayoutInfoActions.TOGGLE_SCAN_SPLIT_AREA,
            module: module,
            payload: {
                isShowPreview,
                isShowConfiguration,
            },
        };
    }

    static REQUEST_FULLSCREEN = '[LayoutInfo] Request Toggle FullScreen';
    requestToggleFullScreen(module, data): CustomAction {
        return {
            type: LayoutInfoActions.REQUEST_FULLSCREEN,
            module: module,
            payload: data
        };
    }
}
