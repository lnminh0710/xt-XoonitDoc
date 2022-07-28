import { Injectable } from '@angular/core';
import { MasterExtractedData } from '@app/models/approval/master-extracted.model';
import { CustomAction } from '@app/state-management/store/actions';

export enum InvoiceApprovalProcessingActionNames {
    INVOICE_APPROVAL_PROCESSING_SUCCESS_ACTION = '[INVOICE APPROVAL PROCESSING] Success Action',
    INVOICE_APPROVAL_PROCESSING_FAILED_ACTION = '[INVOICE APPROVAL PROCESSING] Failed Action',

    GET_INVOICE_ITEM_ACTION = '[INVOICE APPROVAL PROCESSING] Get Invoice Item Action',
    UPDATE_CONFIRM_APPROVAL = '[INVOICE APPROVAL PROCESSING] Update invoice approval  confirm',
    UPDATE_CONFIRM_USER = '[INVOICE APPROVAL PROCESSING] Update invoice approval confirm user',
    SHOW_HIGH_LIGHT_ERROR = '[INVOICE APPROVAL PROCESSING] Show highlight error',

    APPLY_EXTRACT_AI_DATA = '[INVOICE APPROVAL PROCESSING] Apply extracted AI data',
    APPLY_QR_CODE_DATA = '[INVOICE APPROVAL PROCESSING] Apply QR Code data',
    UPDATE_BOOKING_NR_PROPERTY = '[INVOICE APPROVAL PROCESSING] Update Booking Nr Property',

    CLEAR_COST_CENTRE_BY_GROUP_IDS = '[INVOICE APPROVAL PROCESSING] Clear cost centre by group ids',

    // extracted data
    GET_EXTRACTED_DATA_WHEN_INIT = '[INVOICE APPROVAL PROCESSING] Get Extracted data when init',
    SET_EXTRACTED_MASTER_DATA_INVOICE_AND_PAYMENT_OVERVIEW_WIDGET = '[INVOICE APPROVAL PROCESSING] Set extracted master data for invoice infomation widget and payment overview widget',
    SET_EXTRACTED_MASTER_SUPPLIER_WIDGET = '[INVOICE APPROVAL PROCESSING] Set extracted master data for supplier widget',
    SET_EXTRACTED_MASTER_MANDANT_OVERVIEW_WIDGET = '[INVOICE APPROVAL PROCESSING] Set extracted master data for Mandant Overview widget',
}

@Injectable()
export class InvoiceApprovalProcessingActions {
    /**
     * ACTION Invoice Approval CUSTOM
     */
    public getInvoiceItemAction(request: any): any {
        return {
            type: InvoiceApprovalProcessingActionNames.GET_INVOICE_ITEM_ACTION,
            payload: request,
        };
    }

    public updateConfirmApproval(payload: any) {
        return {
            type: InvoiceApprovalProcessingActionNames.UPDATE_CONFIRM_APPROVAL,
            payload,
        };
    }

    public updateConfirmUser(payload: any) {
        return {
            type: InvoiceApprovalProcessingActionNames.UPDATE_CONFIRM_USER,
            payload,
        };
    }

    public showHighlightError(payload: any) {
        return {
            type: InvoiceApprovalProcessingActionNames.SHOW_HIGH_LIGHT_ERROR,
            payload,
        };
    }

    public applyExtractAIData(payload: any) {
        return {
            type: InvoiceApprovalProcessingActionNames.APPLY_EXTRACT_AI_DATA,
            payload,
        };
    }

    public applyQRCodeData(payload: any) {
        return {
            type: InvoiceApprovalProcessingActionNames.APPLY_QR_CODE_DATA,
            payload,
        };
    }

    public updateBookingNrProperty(payload: boolean) {
        return {
            type: InvoiceApprovalProcessingActionNames.UPDATE_BOOKING_NR_PROPERTY,
            payload,
        };
    }

    public getExtractedDataWhenInitAction(idDocumentContainerScans: string) {
        return {
            type: InvoiceApprovalProcessingActionNames.GET_EXTRACTED_DATA_WHEN_INIT,
            payload: idDocumentContainerScans,
        };
    }

    public setExtractedMasterDataInvoiceAndPaymentWidgetAction(data: MasterExtractedData) {
        return {
            type: InvoiceApprovalProcessingActionNames.SET_EXTRACTED_MASTER_DATA_INVOICE_AND_PAYMENT_OVERVIEW_WIDGET,
            payload: data,
        };
    }

    public setExtractedMasterDataSupplierAction(data: MasterExtractedData) {
        return {
            type: InvoiceApprovalProcessingActionNames.SET_EXTRACTED_MASTER_SUPPLIER_WIDGET,
            payload: data,
        };
    }

    public setExtractedMasterDataMandantOveriewAction(data: MasterExtractedData) {
        return {
            type: InvoiceApprovalProcessingActionNames.SET_EXTRACTED_MASTER_MANDANT_OVERVIEW_WIDGET,
            payload: data,
        };
    }

    /**
     * ACTION DEFAULT
     */
    public invoiceApprovalProcessingSuccessAction(
        actionType: string,
        payload: any,
    ): InvoiceApprovalProcessingSuccessAction {
        return {
            type: InvoiceApprovalProcessingActionNames.INVOICE_APPROVAL_PROCESSING_SUCCESS_ACTION,
            subType: actionType,
            payload: payload,
        };
    }

    public invoiceApprovalProcessingFailedAction(
        actionType: string,
        payload: any,
    ): InvoiceApprovalProcessingFailedAction {
        return {
            type: InvoiceApprovalProcessingActionNames.INVOICE_APPROVAL_PROCESSING_FAILED_ACTION,
            subType: actionType,
            payload: payload,
        };
    }

    public clearCostCentreByGroupIds(payload: any) {
        return {
            type: InvoiceApprovalProcessingActionNames.CLEAR_COST_CENTRE_BY_GROUP_IDS,
            payload,
        };
    }
}

export class InvoiceApprovalProcessingSuccessAction implements CustomAction {
    public type = InvoiceApprovalProcessingActionNames.INVOICE_APPROVAL_PROCESSING_SUCCESS_ACTION;

    constructor(public subType: string, public payload?: any) {}
}

export class InvoiceApprovalProcessingFailedAction implements CustomAction {
    public type = InvoiceApprovalProcessingActionNames.INVOICE_APPROVAL_PROCESSING_FAILED_ACTION;

    constructor(public subType: string, public payload?: any) {}
}
