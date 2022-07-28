import { Action } from '@ngrx/store';
import { ReturnRefundActions } from '@app/state-management/store/actions';
import { ReturnPaymentModel, FormOutputModel, ArticleOrder, ReturnRefundInvoiceNumberModel } from '@app/models';
import { CustomAction } from '@app/state-management/store/actions/base';
import * as baseReducer from '@app/state-management/store/reducer/reducer.base';

export interface SubReturnRefundState {
    refundPaymentData: FormOutputModel;
    invoiceNumberData: ReturnRefundInvoiceNumberModel;
    invoiceNewData: FormOutputModel;
    returnPaymentData: ReturnPaymentModel;
    keepArticleOrders: Array<ArticleOrder>;
    allEditArticleOrders: Array<ArticleOrder>;
}

export const initialSubReturnRefundState: SubReturnRefundState = {
    refundPaymentData: null,
    invoiceNumberData: null,
    invoiceNewData: null,
    returnPaymentData: null,
    keepArticleOrders: null,
    allEditArticleOrders: null,
};

export interface ReturnRefundState {
    features: { [id: string]: SubReturnRefundState }
}

const initialState: ReturnRefundState = {
    features: {}
};

export function returnRefundReducer(state = initialState, action: CustomAction): ReturnRefundState {
    switch (action.type) {
        case ReturnRefundActions.SET_REFUND_PAYMENT: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                refundPaymentData: action.payload
            });
            return Object.assign({}, state);
        }
        case ReturnRefundActions.CLEAR_REFUND_PAYMENT: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                refundPaymentData: null
            });
            return Object.assign({}, state);
        }

        case ReturnRefundActions.UPDATE_INVOICE_NUMBER_DATA: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                invoiceNumberData: action.payload
            });
            return Object.assign({}, state);
        }

        case ReturnRefundActions.SET_RETURN_PAYMENT: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                returnPaymentData: action.payload
            });
            return Object.assign({}, state);
        }

        case ReturnRefundActions.SET_KEEP_ARTICLE_ORDERS: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                keepArticleOrders: action.payload
            });
            return Object.assign({}, state);
        }

        case ReturnRefundActions.SET_ALL_EDIT_ARTICLE_ORDERS: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                allEditArticleOrders: action.payload
            });
            return Object.assign({}, state);
        }

        case ReturnRefundActions.CLEAR_KEEP_ARTICLE_ORDERS: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                keepArticleOrders: null
            });
            return Object.assign({}, state);
        }

        case ReturnRefundActions.CLEAR_ALL_EDIT_ARTICLE_ORDERS: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                allEditArticleOrders: null
            });
            return Object.assign({}, state);
        }

        case ReturnRefundActions.REQUEST_UPDATE_INVOICE_NEW_DATA: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                invoiceNewData: action.payload
            });
            return Object.assign({}, state);
        }

        default: {
            return state;
        }
    }
}