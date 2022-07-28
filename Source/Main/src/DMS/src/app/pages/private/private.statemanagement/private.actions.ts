import { Action } from '@ngrx/store';
import { CustomAction } from '@app/state-management/store/actions';

export enum PrivateActionNames {
    PRIVATE_SUCCESS_ACTION = '[PRIVATE] Success Action',
    PRIVATE_FAILED_ACTION = '[PRIVATE] Failed Action',
}


export class PrivateSuccessAction implements CustomAction {
    public type = PrivateActionNames.PRIVATE_SUCCESS_ACTION;

    constructor(public subType: string, public payload?: any) { }
}

export class PrivateFailedAction implements CustomAction {
    public type = PrivateActionNames.PRIVATE_FAILED_ACTION;

    constructor(public subType: string, public payload?: any) { }
}
