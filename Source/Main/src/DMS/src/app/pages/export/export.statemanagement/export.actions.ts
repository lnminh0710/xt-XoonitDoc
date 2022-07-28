import { CustomAction } from '@app/state-management/store/actions';

export enum ExportActionNames {
    EXPORT_SUCCESS_ACTION = '[EXPORT] Success Action',
    EXPORT_FAILED_ACTION = '[EXPORT] Failed Action',
}


export class ExportSuccessAction implements CustomAction {
    public type = ExportActionNames.EXPORT_SUCCESS_ACTION;

    constructor(public subType: string, public payload?: any) { }
}

export class ExportFailedAction implements CustomAction {
    public type = ExportActionNames.EXPORT_FAILED_ACTION;

    constructor(public subType: string, public payload?: any) { }
}
