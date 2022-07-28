import { CustomAction } from '@app/state-management/store/actions';
import {
    InvoiceApprovalActionNames,
    InvoiceApprovalFailedAction,
    InvoiceApprovalSuccessAction,
} from './invoice-approval.actions';
import { IInvoiceApprovalState } from './invoice-approval.state';

const initialState: IInvoiceApprovalState = {};

export function invoiceApprovalReducer(state = initialState, action: CustomAction): IInvoiceApprovalState {
    switch (action.type) {
        case InvoiceApprovalActionNames.INVOICE_APPROVAL_SUCCESS_ACTION:
            return actionSuccessReducer(state, action as InvoiceApprovalSuccessAction);

        case InvoiceApprovalActionNames.INVOICE_APPROVAL_FAILED_ACTION:
            return actionFailedReducer(state, action as InvoiceApprovalFailedAction);

        default:
            return state;
    }
}

function actionSuccessReducer(state: IInvoiceApprovalState, action: InvoiceApprovalSuccessAction) {
    switch (action.subType) {
        default:
            return state;
    }
}

function actionFailedReducer(state: IInvoiceApprovalState, action: InvoiceApprovalFailedAction) {
    switch (action.subType) {
        default:
            return state;
    }
}
