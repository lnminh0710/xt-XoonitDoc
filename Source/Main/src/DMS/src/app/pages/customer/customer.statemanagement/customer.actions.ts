import { CustomAction } from '@app/state-management/store/actions';

export enum CustomerActionNames {
    CUSTOMER_SUCCESS_ACTION = '[CUSTOMER] Success Action',
    CUSTOMER_FAILED_ACTION = '[CUSTOMER] Failed Action',
}

export class CustomerSuccessAction implements CustomAction {
    public type = CustomerActionNames.CUSTOMER_SUCCESS_ACTION;

    constructor(public subType: string, public payload?: any) {}
}

export class CustomerFailedAction implements CustomAction {
    public type = CustomerActionNames.CUSTOMER_FAILED_ACTION;

    constructor(public subType: string, public payload?: any) {}
}
