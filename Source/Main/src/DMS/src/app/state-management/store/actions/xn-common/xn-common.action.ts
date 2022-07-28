import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import { LayoutPageInfoModel, HotKey } from '@app/models';
import { CustomAction } from '@app/state-management/store/actions/base';
import { Module } from '@app/models';

@Injectable()
export class XnCommonActions {
    static LOAD_COMBO_BOX_LIST = '[COMBOBOX] LOAD COMBO BOX LIST';
    loadComboBoxList(comboboxIds: any[], module: Module): CustomAction {
        return {
            type: XnCommonActions.LOAD_COMBO_BOX_LIST,
            module: module,
            payload: comboboxIds,
        };
    }

    static LOAD_COMBO_BOX_LIST_SUCCESS = '[COMBOBOX] LOAD COMBO BOX LIST Successfully';
    loadComboBoxListSuccess(listComboBox: any, module: Module): CustomAction {
        return {
            type: XnCommonActions.LOAD_COMBO_BOX_LIST_SUCCESS,
            module: module,
            payload: listComboBox,
        };
    }

    static GET_MODULE_TO_PERSON_TYPE = '[COMMON] GET MODULE TO PERSON TYPE';
    getModuleToPersonType(data: any, module: Module): CustomAction {
        return {
            type: XnCommonActions.GET_MODULE_TO_PERSON_TYPE,
            module: module,
            payload: data,
        };
    }

    static SET_WIDGETBOXES_INFO = '[LayoutInfo] Set Widget boxes';
    setWidgetboxesInfo(data: LayoutPageInfoModel, module: Module): CustomAction {
        return {
            type: XnCommonActions.SET_WIDGETBOXES_INFO,
            module: module,
            payload: data,
        };
    }

    static CHANGE_COUNTRY_CODE = '[COMMON] Change Country Code';
    changeCountryCode(data: any, module: Module): CustomAction {
        return {
            type: XnCommonActions.CHANGE_COUNTRY_CODE,
            module: module,
            payload: data,
        };
    }

    static ADD_HOT_KEY = '[COMMON] Add Hot Key';
    addHotKey(data: HotKey, module: Module): CustomAction {
        return {
            type: XnCommonActions.ADD_HOT_KEY,
            module: module,
            payload: data,
        };
    }

    static CONTEXT_MENU_CLICKED = '[COMMON] MENU CLICKED';
    contextMenuClicked(data: any, module: Module): CustomAction {
        return {
            type: XnCommonActions.CONTEXT_MENU_CLICKED,
            module: module,
            payload: data,
        };
    }

    static SHOW_FEEDBACK = '[COMMON] SHOW FEEDBACK';
    showFeedbackClicked(data: any): CustomAction {
        return {
            type: XnCommonActions.SHOW_FEEDBACK,
            payload: data,
        };
    }

    static SHOW_FEEDBACK_COMPLETE = '[COMMON] SHOW FEEDBACK COMPLETE';
    showFeedbackComplete(): CustomAction {
        return {
            type: XnCommonActions.SHOW_FEEDBACK_COMPLETE,
        };
    }

    static STORE_FEEDBACK_DATA = '[COMMON] STORE FEEDBACK DATA';
    storeFeedbacData(data: any): CustomAction {
        return {
            type: XnCommonActions.STORE_FEEDBACK_DATA,
            payload: data,
        };
    }

    static RELOAD_FEEDBACK_DATA = '[COMMON] RELOAD FEEDBACK DATA';
    reLoadFeedbacData(): CustomAction {
        return {
            type: XnCommonActions.RELOAD_FEEDBACK_DATA,
        };
    }

    static LOAD_PDF = '[COMMON] Load PDF';
    loadPDF(pdfUrl): CustomAction {
        return {
            type: XnCommonActions.LOAD_PDF,
            payload: pdfUrl,
        };
    }

    static TEST_CLOUD_CONNECTION = '[COMMON] Test cloud connection';
    testCloudConnection(): CustomAction {
        return {
            type: XnCommonActions.TEST_CLOUD_CONNECTION,
        };
    }
}
