import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import { CustomAction } from '@app/state-management/store/actions/base';
import {
    Module
} from '@app/models';

@Injectable()
export class BackofficeActions {
    static REQUEST_DOWNLOAD_PDF = '[Backoffice] Request Download Pdf';
    requestDownloadPdf(module: Module, selectedEntity?: any): CustomAction {
        return {
            type: BackofficeActions.REQUEST_DOWNLOAD_PDF,
            module: module,
            payload: selectedEntity
        };
    }

    static REQUEST_GO_TO_TRACKING_PAGE = '[Backoffice] Request Go To Tracking Page';
    requestGoToTrackingPage(module: Module, selectedEntity?: any): CustomAction {
        return {
            type: BackofficeActions.REQUEST_GO_TO_TRACKING_PAGE,
            module: module,
            payload: selectedEntity
        };
    }

    static REQUEST_OPEN_RETURN_REFUND_MODULE = '[Backoffice] Request Open Return Refund Module';
    requestOpenReturnRefundModule(module: Module, selectedEntity?: any): CustomAction {
        return {
            type: BackofficeActions.REQUEST_OPEN_RETURN_REFUND_MODULE,
            module: module,
            payload: selectedEntity
        };
    }

    static STORE_SELECTED_ENTITY = '[Backoffice] Store Selected Entity';
    storeSelectedEntity(module: Module, selectedEntity: any): CustomAction {
        return {
            type: BackofficeActions.STORE_SELECTED_ENTITY,
            module: module,
            payload: selectedEntity
        };
    }
}
