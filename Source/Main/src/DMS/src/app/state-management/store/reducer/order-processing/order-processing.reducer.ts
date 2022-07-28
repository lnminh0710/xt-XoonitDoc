import { OrderProcessingActions } from '@app/state-management/store/actions';
import { CustomAction } from '@app/state-management/store/actions/base';
import * as baseReducer from '@app/state-management/store/reducer/reducer.base';
import { DocType, DocUpdateMode, OrderProcessingUpdateModel } from '@app/pages/private/modules/customer/models/document';

export interface OrderProcessingUpdateData {
    documentType: DocType;
    updateMode: DocUpdateMode;
    data: OrderProcessingUpdateModel;
}

export interface SubOrderProcessingState {
    orderProcessingUpdateData: OrderProcessingUpdateData;
}

export const initialSubOrderProcessingState: SubOrderProcessingState = {
    orderProcessingUpdateData: null
};

export interface OrderProcessingState {
    features: { [id: string]: SubOrderProcessingState }
}

const initialState: OrderProcessingState = {
    features: {}
};

export function orderProcessingReducer(state = initialState, action: CustomAction): OrderProcessingState {
    switch (action.type) {
        case OrderProcessingActions.REQUEST_ORDER: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                orderProcessingUpdateData: action.payload
            });
            return Object.assign({}, state);
        }

        case OrderProcessingActions.CLEAR_REQUEST_ORDER: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                orderProcessingUpdateData: null
            });
            return Object.assign({}, state);
        }

        default: {
            return state;
        }
    }
};
