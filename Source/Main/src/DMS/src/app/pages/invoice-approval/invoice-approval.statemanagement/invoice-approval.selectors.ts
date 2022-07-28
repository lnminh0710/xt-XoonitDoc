import { Injectable } from '@angular/core';
import { BaseSelector } from '@app/state-management/store/reducer/base-selector.selector';
import { Actions } from '@ngrx/effects';
import { createFeatureSelector, Store } from '@ngrx/store';
import { InvoiceApprovalActionNames } from './invoice-approval.actions';
import { IInvoiceApprovalState } from './invoice-approval.state';

export const invoiceApprovalState = createFeatureSelector<IInvoiceApprovalState>('invoiceApprovalState');

@Injectable()
export class InvoiceApprovalSelectors extends BaseSelector {
    constructor(private store: Store<IInvoiceApprovalState>, protected actions: Actions) {
        super(
            actions,
            InvoiceApprovalActionNames.INVOICE_APPROVAL_SUCCESS_ACTION,
            InvoiceApprovalActionNames.INVOICE_APPROVAL_FAILED_ACTION,
        );
    }
}
