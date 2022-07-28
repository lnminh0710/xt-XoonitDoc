import { Injectable } from '@angular/core';
import { CustomAction } from '@app/state-management/store/actions';

export enum InvoiceApprovalActionNames {
    INVOICE_APPROVAL_SUCCESS_ACTION = '[INVOICE APPROVAL] Success Action',
    INVOICE_APPROVAL_FAILED_ACTION = '[INVOICE APPROVAL] Failed Action',

    GET_INVOICE_ITEM_ACTION = '[INVOICE APPROVAL] Get Invoice Item Action',
}

@Injectable()
export class InvoiceApprovalActions {
    /**
     * ACTION Invoice Approval CUSTOM
     */
    public getInvoiceItemAction(request: any): any {
        return {
            type: InvoiceApprovalActionNames.GET_INVOICE_ITEM_ACTION,
            payload: request,
        };
    }

    /**
     * ACTION DEFAULT
     */
    public invoiceApprovalSuccessAction(actionType: string, payload: any): InvoiceApprovalSuccessAction {
        return {
            type: InvoiceApprovalActionNames.INVOICE_APPROVAL_SUCCESS_ACTION,
            subType: actionType,
            payload: payload,
        };
    }

    public invoiceApprovalFailedAction(actionType: string, payload: any): InvoiceApprovalFailedAction {
        return {
            type: InvoiceApprovalActionNames.INVOICE_APPROVAL_FAILED_ACTION,
            subType: actionType,
            payload: payload,
        };
    }
}

export class InvoiceApprovalSuccessAction implements CustomAction {
    public type = InvoiceApprovalActionNames.INVOICE_APPROVAL_SUCCESS_ACTION;

    constructor(public subType: string, public payload?: any) {}
}

export class InvoiceApprovalFailedAction implements CustomAction {
    public type = InvoiceApprovalActionNames.INVOICE_APPROVAL_FAILED_ACTION;

    constructor(public subType: string, public payload?: any) {}
}
