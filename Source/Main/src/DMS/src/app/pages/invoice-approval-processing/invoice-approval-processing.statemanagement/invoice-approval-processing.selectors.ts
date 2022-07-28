import { Injectable } from '@angular/core';
import { MasterExtractedData } from '@app/models/approval/master-extracted.model';
import { BaseSelector } from '@app/state-management/store/reducer/base-selector.selector';
import { Actions } from '@ngrx/effects';
import { createFeatureSelector, createSelector, Store } from '@ngrx/store';
import { Observable } from 'rxjs/Rx';
import { InvoiceApprovalProcessingActionNames } from './invoice-approval-processing.actions';
import { InvoiceApprovalProcessingState } from './invoice-approval-processing.state';

export const invoiceApprovalProcessingState = createFeatureSelector<InvoiceApprovalProcessingState>(
    'invoiceApprovalProcessingState',
);

const setInvoiceInfoAndPaymentOverviewExtractedData = createSelector(
    invoiceApprovalProcessingState,
    (state: InvoiceApprovalProcessingState) => state.invoiceInfoAndPaymentOverviewExtracteMasterdData,
);

const setSupplierExtractedMasterData = createSelector(
    invoiceApprovalProcessingState,
    (state: InvoiceApprovalProcessingState) => state.supplierExtractedMasterData,
);

const setMandantOverviewExtractedMasterData = createSelector(
    invoiceApprovalProcessingState,
    (state: InvoiceApprovalProcessingState) => state.mandantOverviewExtractedMasterData,
);

@Injectable()
export class InvoiceApprovalProcessingSelectors extends BaseSelector {
    public invoiceInfoAndPaymentOverviewExtractedData$: Observable<MasterExtractedData>;
    public supplierExtractedMasterData$: Observable<MasterExtractedData>;
    public mandantOverviewExtractedMasterData$: Observable<MasterExtractedData>;

    constructor(private store: Store<InvoiceApprovalProcessingState>, protected actions: Actions) {
        super(
            actions,
            InvoiceApprovalProcessingActionNames.INVOICE_APPROVAL_PROCESSING_SUCCESS_ACTION,
            InvoiceApprovalProcessingActionNames.INVOICE_APPROVAL_PROCESSING_FAILED_ACTION,
        );

        this.invoiceInfoAndPaymentOverviewExtractedData$ = this.store.select(
            setInvoiceInfoAndPaymentOverviewExtractedData,
        );
        this.supplierExtractedMasterData$ = this.store.select(setSupplierExtractedMasterData);
        this.mandantOverviewExtractedMasterData$ = this.store.select(setMandantOverviewExtractedMasterData);
    }
}
