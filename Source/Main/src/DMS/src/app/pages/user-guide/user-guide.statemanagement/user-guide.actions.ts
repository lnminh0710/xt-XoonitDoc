import { CustomAction } from '@app/state-management/store/actions';

export enum UserGuideActionNames {
    USER_GUIDE_SUCCESS_ACTION = '[USER GUIDE] Success Action',
    USER_GUIDE_FAILED_ACTION = '[USER GUIDE] Failed Action',
}


export class UserGuideSuccessAction implements CustomAction {
    public type = UserGuideActionNames.USER_GUIDE_SUCCESS_ACTION;

    constructor(public subType: string, public payload?: any) { }
}

export class UserGuideFailedAction implements CustomAction {
    public type = UserGuideActionNames.USER_GUIDE_FAILED_ACTION;

    constructor(public subType: string, public payload?: any) { }
}
