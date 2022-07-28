import { Injectable } from '@angular/core';
import { Module } from '@app/models';
import { CustomAction } from '@app/state-management/store/actions/base';

@Injectable()
export class ScanningActions {
    static SCANNING_ADD_IMAGE = '[Scanning tool] Add image after scan';
    addImage(data: any, module?: Module): CustomAction {
        return {
            type: ScanningActions.SCANNING_ADD_IMAGE,
            payload: data,
            module: module,
        };
    }

    static SCANNING_TOGGLE_SEND_TO_CAPTURE = '[Scanning tool] Is send to capture';
    toggleIsSendToCapture(data: any, module?: Module): CustomAction {
        return {
            type: ScanningActions.SCANNING_TOGGLE_SEND_TO_CAPTURE,
            payload: data,
            module: module,
        };
    }

    static SCANNING_SELECT_DOCUMENT = '[Scanning tool] Select image to preview';
    selectImage(data: any, module?: Module): CustomAction {
        return {
            type: ScanningActions.SCANNING_SELECT_DOCUMENT,
            payload: data,
            module: module,
        };
    }

    static SCANNING_UPDATE_IMAGE = '[Scanning tool] Update image to storage';
    updateImage(data: any, module?: Module): CustomAction {
        return {
            type: ScanningActions.SCANNING_UPDATE_IMAGE,
            payload: data,
            module: module,
        };
    }

    static SCANNING_ACTION_GROUP_IMAGE = '[Scanning tool action] Group image';
    groupImage(module?: Module): CustomAction {
        return {
            type: ScanningActions.SCANNING_ACTION_GROUP_IMAGE,
            module: module,
        };
    }

    static SCANNING_ACTION_DELETE_IMAGE = '[Scanning tool action] Delete image';
    deleteAllImage(module?: Module): CustomAction {
        return {
            type: ScanningActions.SCANNING_ACTION_DELETE_IMAGE,
            module: module,
        };
    }

    static SCANNING_ACTION_SAVE_IMAGE = '[Scanning tool action] Upload image';
    uploadImage(data: any, module?: Module): CustomAction {
        console.log('SCANNING_ACTION_SAVE_IMAGE');
        return {
            type: ScanningActions.SCANNING_ACTION_SAVE_IMAGE,
            payload: data,
            module: module,
        };
    }

    static SCANNING_TOGGLE_SCAN_MODE = '[Scanning tool action] Toggle scanning configuration';
    toggleScanningMode(data: any, module?: Module): CustomAction {
        return {
            type: ScanningActions.SCANNING_TOGGLE_SCAN_MODE,
            payload: data,
            module: module,
        };
    }

    // tree
    static SCANNING_SET_DOCTYPE_SELECTED_IN_TREE = '[Scanning tool tree] Set doctype selected in tree';
    setDoctypeSelectedInTree(data: any, module?: Module): CustomAction {
        return {
            type: ScanningActions.SCANNING_SET_DOCTYPE_SELECTED_IN_TREE,
            payload: data,
            module: module,
        };
    }

    static SCANNING_RESET_DOCTYPE_QUANTITY_IN_TREE = '[Scanning tool tree] Reset doctype quantity in tree';
    resetDoctype(): CustomAction {
        return {
            type: ScanningActions.SCANNING_RESET_DOCTYPE_QUANTITY_IN_TREE,
        };
    }

    static SCANNING_SET_DOCTYPE_QUANTITY_IN_TREE = '[Scanning tool tree] Set doctype quantity in tree';
    setDoctypeQuantityInTree(data: any, module?: Module): CustomAction {
        return {
            type: ScanningActions.SCANNING_SET_DOCTYPE_QUANTITY_IN_TREE,
            payload: data,
            module: module,
        };
    }

    static SCANNING_TOGGLE_VIEW_ALL_PAGE = '[Scanning tool tree] Set doctype quantity in tree';
    toggleViewAllPage(data: any): CustomAction {
        return {
            type: ScanningActions.SCANNING_TOGGLE_VIEW_ALL_PAGE,
            payload: data,
        };
    }

    static LOAD_CONFIGURATION_SCAN_SETTING_DONE = '[Scanning tool] Load configuation scan setting done';
    loadConfigurationScanSettingDone(): CustomAction {
        return {
            type: ScanningActions.LOAD_CONFIGURATION_SCAN_SETTING_DONE,
        };
    }
}
