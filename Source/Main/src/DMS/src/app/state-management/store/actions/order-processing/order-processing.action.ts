import { Injectable } from '@angular/core';
import { Module } from '@app/models';
import { CustomAction } from '@app/state-management/store/actions/base';
import { OrderProcessingUpdateData } from '@app/state-management/store/reducer/order-processing';

@Injectable()
export class OrderProcessingActions {

    static REQUEST_ORDER = '[OrderProcessing] Request Order';
    requestOrder(data: OrderProcessingUpdateData, module: Module): CustomAction {
        return {
            type: OrderProcessingActions.REQUEST_ORDER,
            module: module,
            payload: data
        };
    }

    static CLEAR_REQUEST_ORDER = '[OrderProcessing] Clear Request Order';
    clearRequestOrder(module: Module): CustomAction {
        return {
            type: OrderProcessingActions.CLEAR_REQUEST_ORDER,
            module: module,
        };
    }
}
