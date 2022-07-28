import { Injectable } from '@angular/core';
import { InvoiceAprrovalService } from '@app/services';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Observable } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import {
    InvoiceApprovalProcessingActionNames,
    InvoiceApprovalProcessingActions,
} from './invoice-approval-processing.actions';

@Injectable()
export class InvoiceApprovalProcessingEffects {
    constructor(
        private actions$: Actions,
        private invoiceApprovalProcessingActions: InvoiceApprovalProcessingActions,
        private invoiceAprrovalService: InvoiceAprrovalService,
    ) {}

    @Effect()
    getUserByIdLogin = this.actions$.pipe(
        ofType(InvoiceApprovalProcessingActionNames.GET_INVOICE_ITEM_ACTION),
        switchMap((action: any) => {
            return this.invoiceAprrovalService.getInvoiceItem(action.payload).pipe(
                map((data: any[]) => {
                    return this.invoiceApprovalProcessingActions.invoiceApprovalProcessingSuccessAction(
                        action.type,
                        data,
                    );
                }),
                catchError((err) =>
                    Observable.of(
                        this.invoiceApprovalProcessingActions.invoiceApprovalProcessingFailedAction(action.type, err),
                    ),
                ),
            );
        }),
    );

    @Effect()
    getExtractedDataWhenInit = this.actions$.pipe(
        ofType(InvoiceApprovalProcessingActionNames.GET_EXTRACTED_DATA_WHEN_INIT),
        switchMap((action: any) => {
            return this.invoiceAprrovalService.getExtractedDataWhenInitApporvalProcessing(action.payload).pipe(
                map((data: any[]) => {
                    return this.invoiceApprovalProcessingActions.invoiceApprovalProcessingSuccessAction(
                        action.type,
                        data,
                    );
                }),
                catchError((err) =>
                    Observable.of(
                        this.invoiceApprovalProcessingActions.invoiceApprovalProcessingFailedAction(action.type, err),
                    ),
                ),
            );
        }),
    );
}
