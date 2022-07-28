import { Injectable } from '@angular/core';
import { CustomAction } from '@app/state-management/store/actions/base';
import { Module } from '@app/models';

@Injectable()
export class DocumentActions {
    static DOCUMENT_SCANNING_STATUS_DATA = '[DOCUMENT] Scanning Status Data';
    scanningStatusData(data: any, module: Module): CustomAction {
        return {
            type: DocumentActions.DOCUMENT_SCANNING_STATUS_DATA,
            payload: data,
            module: module
        };
    }

    static DOCUMENT_SCANNING_STATUS_CALL_RELOAD = '[DOCUMENT] Scanning Status Call Reload';
    scanningStatusCallReload(data: any, module: Module): CustomAction {
        return {
            type: DocumentActions.DOCUMENT_SCANNING_STATUS_CALL_RELOAD,
            payload: data,
            module: module
        };
    }

    static DOCUMENT_SCANNING_STATUS_CALL_SKIP = '[DOCUMENT] Scanning Status Call Skip';
    scanningStatusCallSkip(data: any, module: Module): CustomAction {
        return {
            type: DocumentActions.DOCUMENT_SCANNING_STATUS_CALL_SKIP,
            payload: data,
            module: module
        };
    }

    static DOCUMENT_SCANNING_STATUS_CLEAR_ALL_DATA = '[DOCUMENT] Scanning Status Clear All Data';
    scanningStatusClearAllData(module: Module): CustomAction {
        return {
            type: DocumentActions.DOCUMENT_SCANNING_STATUS_CLEAR_ALL_DATA,
            module: module
        };
    }

    static DOCUMENT_SAVE= '[DOCUMENT] Save';
    save(module: Module): CustomAction {
        return {
            type: DocumentActions.DOCUMENT_SAVE,
            module: module
        };
    }
}
