import { CustomAction } from '@app/state-management/store/actions';
import {
    InvoiceApprovalProcessingActionNames,
    InvoiceApprovalProcessingFailedAction,
    InvoiceApprovalProcessingSuccessAction,
} from './invoice-approval-processing.actions';
import { InvoiceApprovalProcessingState } from './invoice-approval-processing.state';

const initialState: InvoiceApprovalProcessingState = {
    invoiceInfoAndPaymentOverviewExtracteMasterdData: null,
    supplierExtractedMasterData: null,
    mandantOverviewExtractedMasterData: null,
};

export function invoiceApprovalProcessingReducer(
    state = initialState,
    action: CustomAction,
): InvoiceApprovalProcessingState {
    switch (action.type) {
        case InvoiceApprovalProcessingActionNames.INVOICE_APPROVAL_PROCESSING_SUCCESS_ACTION:
            return actionSuccessReducer(state, action as InvoiceApprovalProcessingSuccessAction);

        case InvoiceApprovalProcessingActionNames.INVOICE_APPROVAL_PROCESSING_FAILED_ACTION:
            return actionFailedReducer(state, action as InvoiceApprovalProcessingFailedAction);

        case InvoiceApprovalProcessingActionNames.SET_EXTRACTED_MASTER_DATA_INVOICE_AND_PAYMENT_OVERVIEW_WIDGET:
            return {
                ...state,
                invoiceInfoAndPaymentOverviewExtracteMasterdData: action.payload,
            };
        case InvoiceApprovalProcessingActionNames.SET_EXTRACTED_MASTER_SUPPLIER_WIDGET:
            return {
                ...state,
                supplierExtractedMasterData: action.payload,
            };
        case InvoiceApprovalProcessingActionNames.SET_EXTRACTED_MASTER_MANDANT_OVERVIEW_WIDGET:
            return {
                ...state,
                mandantOverviewExtractedMasterData: action.payload,
            };
        default:
            return state;
    }
}

function actionSuccessReducer(state: InvoiceApprovalProcessingState, action: InvoiceApprovalProcessingSuccessAction) {
    switch (action.subType) {
        default:
            return state;
    }
}

function actionFailedReducer(state: InvoiceApprovalProcessingState, action: InvoiceApprovalProcessingFailedAction) {
    switch (action.subType) {
        default:
            return state;
    }
}
