import { CustomAction } from '@app/state-management/store/actions/base';
import { CustomerActionNames, CustomerSuccessAction, CustomerFailedAction } from './customer.actions';
import { ICustomerState } from './customer.state';

const initialState: ICustomerState = {};

export function customerReducer(state = initialState, action: CustomAction): ICustomerState {
    switch (action.type) {
        case CustomerActionNames.CUSTOMER_SUCCESS_ACTION:
            return actionSuccessReducer(state, action as CustomerSuccessAction);

        case CustomerActionNames.CUSTOMER_FAILED_ACTION:
            return actionFailedReducer(state, action as CustomerFailedAction);

        default:
            return state;
    }
}

function actionSuccessReducer(state: ICustomerState, action: CustomerSuccessAction) {
    switch (action.subType) {
        default:
            return state;
    }
}

function actionFailedReducer(state: ICustomerState, action: CustomerFailedAction) {
    switch (action.subType) {
        default:
            return state;
    }
}
