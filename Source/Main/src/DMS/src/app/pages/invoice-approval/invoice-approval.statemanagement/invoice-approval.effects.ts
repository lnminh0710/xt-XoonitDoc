import { Injectable } from '@angular/core';
import { InvoiceAprrovalService } from '@app/services';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Observable } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { InvoiceApprovalActionNames, InvoiceApprovalActions } from './invoice-approval.actions';

@Injectable()
export class InvoiceApprovalEffects {
    constructor(
        private actions$: Actions,
        private invoiceApprovalActions: InvoiceApprovalActions,
        private invoiceAprrovalService: InvoiceAprrovalService,
    ) {}

    @Effect()
    getUserByIdLogin = this.actions$.pipe(
        ofType(InvoiceApprovalActionNames.GET_INVOICE_ITEM_ACTION),
        switchMap((action: any) => {
            return this.invoiceAprrovalService.getInvoiceItem(action.payload).pipe(
                map((data: any[]) => {
                    return this.invoiceApprovalActions.invoiceApprovalSuccessAction(action.type, data);
                }),
                catchError((err) =>
                    Observable.of(this.invoiceApprovalActions.invoiceApprovalFailedAction(action.type, err)),
                ),
            );
        }),
    );
}
