import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import { ReturnPaymentModel, FormOutputModel, ArticleOrder, Module } from '@app/models';
import { CustomAction } from '@app/state-management/store/actions/base';

@Injectable()
export class ReturnRefundActions {
    static SET_REFUND_PAYMENT = '[ReturnRefund] Set Refund Payment';
    setRefundPayment(data: FormOutputModel, module: Module): CustomAction {
        return {
            type: ReturnRefundActions.SET_REFUND_PAYMENT,
            module: module,
            payload: data
        }
    }
    static CLEAR_REFUND_PAYMENT = '[ReturnRefund] CLEAR Refund Payment';
    clearRefundPayment(module: Module): CustomAction {
        return {
            type: ReturnRefundActions.CLEAR_REFUND_PAYMENT,
            module: module
        }
    }

    static UPDATE_INVOICE_NUMBER_DATA = '[ReturnRefund] Return & Refund Invoice Number Data updated';
    updateInvoiceNumberData(data: any, module: Module): CustomAction {
        return {
            type: ReturnRefundActions.UPDATE_INVOICE_NUMBER_DATA,
            module: module,
            payload: data
        };
    }

    static SET_RETURN_PAYMENT = '[ReturnRefund] Set Return Payment';
    setReturnPayment(data: ReturnPaymentModel, module: Module): CustomAction {
        return {
            type: ReturnRefundActions.SET_RETURN_PAYMENT,
            module: module,
            payload: data
        }
    }

    static SET_KEEP_ARTICLE_ORDERS = '[ReturnRefund] Set Keep Article Orders';
    setKeepArticleOrders(data: Array<ArticleOrder>, module: Module): CustomAction {
        return {
            type: ReturnRefundActions.SET_KEEP_ARTICLE_ORDERS,
            module: module,
            payload: data
        }
    }

    static CLEAR_KEEP_ARTICLE_ORDERS = '[ReturnRefund] Clear Keep Article Orders';
    clearKeepArticleOrders(module: Module): CustomAction {
        return {
            type: ReturnRefundActions.CLEAR_KEEP_ARTICLE_ORDERS,
            module: module
        }
    }

    static SET_ALL_EDIT_ARTICLE_ORDERS = '[ReturnRefund] Set All Editted Article Orders';
    setAllEditArticleOrders(data: Array<ArticleOrder>, module: Module): CustomAction {
        return {
            type: ReturnRefundActions.SET_ALL_EDIT_ARTICLE_ORDERS,
            module: module,
            payload: data
        }
    }

    static CLEAR_ALL_EDIT_ARTICLE_ORDERS = '[ReturnRefund] Clear All Editted Article Orders';
    clearAllEditArticleOrders(module: Module): CustomAction {
        return {
            type: ReturnRefundActions.CLEAR_ALL_EDIT_ARTICLE_ORDERS,
            module: module
        }
    }

    static REQUEST_UPDATE_INVOICE_NEW_DATA = '[ReturnRefund] Return & Refund Invoice New Data updated';
    requestUpdateInvoiceNewData(data: any, module: Module): CustomAction {
        return {
            type: ReturnRefundActions.REQUEST_UPDATE_INVOICE_NEW_DATA,
            module: module,
            payload: data
        };
    }

    static REQUEST_NEW_INVOICE = '[ReturnRefund] Request New Invoice';
    requestNewInvoice(module: Module): CustomAction {
        return {
            type: ReturnRefundActions.REQUEST_NEW_INVOICE,
            module: module
        }
    }

    static REQUEST_CONFIRM = '[ReturnRefund] Request Confirm';
    requestConfirm(module: Module): CustomAction {
        return {
            type: ReturnRefundActions.REQUEST_CONFIRM,
            module: module
        }
    }

    static RESET_ALL_EDITABLE_FORM = '[ReturnRefund] Reset All Editable Form';
    resetAllEditableForm(module: Module): CustomAction {
        return {
            type: ReturnRefundActions.RESET_ALL_EDITABLE_FORM,
            module: module
        }
    }
}
