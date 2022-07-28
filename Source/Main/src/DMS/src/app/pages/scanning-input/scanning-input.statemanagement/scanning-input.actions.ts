import { Action } from '@ngrx/store';
import { CustomAction } from '@app/state-management/store/actions';

export enum ScanningInputActionNames {
    SCANNING_INPUT_SUCCESS_ACTION = '[SCANNING INPUT] Success Action',
    SCANNING_INPUT_FAILED_ACTION = '[SCANNING INPUT] Failed Action',
}


export class ScanningInputSuccessAction implements CustomAction {
    public type = ScanningInputActionNames.SCANNING_INPUT_SUCCESS_ACTION;

    constructor(public subType: string, public payload?: any) { }
}

export class ScanningInputFailedAction implements CustomAction {
    public type = ScanningInputActionNames.SCANNING_INPUT_FAILED_ACTION;

    constructor(public subType: string, public payload?: any) { }
}
