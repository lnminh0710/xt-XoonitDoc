import { CustomAction } from '@app/state-management/store/actions';

export enum MyContactActionNames {
    MY_CONTACT_SUCCESS_ACTION = '[MY CONTACT] Success Action',
    MY_CONTACT_FAILED_ACTION = '[MY CONTACT] Failed Action',
    GET_CONTACT_BY_KEYWORD = '[MY CONTACT] Get Contact by keyword'
}

export class GetContactByKeywordAction implements CustomAction {
    public type = MyContactActionNames.GET_CONTACT_BY_KEYWORD;

    constructor(
        public payload: string,
    ) { }
}
export class MyContactSuccessAction implements CustomAction {
    public type = MyContactActionNames.MY_CONTACT_SUCCESS_ACTION;

    constructor(public subType: string, public payload?: any) { }
}

export class MyContactFailedAction implements CustomAction {
    public type = MyContactActionNames.MY_CONTACT_FAILED_ACTION;

    constructor(public subType: string, public payload?: any) { }
}
