import { User, HotKey } from '@app/models';
import { DocumentTreeModel } from '@app/models/administration-document/document-tree.payload.model';
import { KostnestelleData } from '@app/models/kostneststelle-change.model';
import { TreeNode } from '@circlon/angular-tree-component';
import { Action } from '@ngrx/store';
import { CustomAction } from '../base';

export enum AppActionNames {
    APP_SUCCESS_ACTION = '[App] Success Action',
    APP_FAILED_ACTION = '[App] Failed Action',
    GET_COMPANY_DROPDOWN_LIST = '[App] Get Company Dropdown List',
    APP_SAVE_GLOBAL = '[APP] Save Global',
    APP_DELETE_GLOBAL = '[APP] Delete Global',
    APP_EXPAND_DOCUMENT_FORM_GLOBAL = '[APP] Expand Document Form Global',
    APP_UPDATE_USER_PROFILE = '[APP] Update User Profile',
    APP_INVOICE_DATE_CHANGE = '[APP] Invoice Date Change',
    SELECT_FOLDER_TREE = '[APP] Select Folder Tree',
    EXPAND_COLLASPE_FOLDER_TREE = '[APP] Expand collaspe folder tree',
    TOGGLE_IS_GUARANTEE = '[APP] Toggle Is Guarantee',
    ADD_HOT_KEY = '[APP] Add Hot Key',
    APP_NEXT_DOCUMENT = '[APP] Next Document',
    TOGGLE_STATE_URGENT = '[APP] Toggle Urgent',
    APP_KOSTNESTSTELLE_CHANGE = '[APP] Kostneststelle Change',
    APP_INVOICE_INCLUDE_EXCHANGED = '[APP] Invoice Include Change'
}

export class AppSuccessAction implements CustomAction {
    public type = AppActionNames.APP_SUCCESS_ACTION;

    constructor(public subType: string, public payload?: any) {}
}

export class AppFailedAction implements CustomAction {
    public type = AppActionNames.APP_FAILED_ACTION;

    constructor(public subType: string, public payload?: any) {}
}

export class SaveGlobalAction implements Action {
    public type = AppActionNames.APP_SAVE_GLOBAL;
}

export class DeleteGlobalAction implements Action {
    public type = AppActionNames.APP_DELETE_GLOBAL;
}

export class ExpandDocumentFormGlobalAction implements Action {
    public type = AppActionNames.APP_EXPAND_DOCUMENT_FORM_GLOBAL;

    constructor(public payload: { isExpanded: boolean }) {}
}

export class GetCompanyListAction implements CustomAction {
    public type = AppActionNames.GET_COMPANY_DROPDOWN_LIST;

    constructor() {}
}

export class UpdateUserProfileAction implements CustomAction {
    public type = AppActionNames.APP_UPDATE_USER_PROFILE;

    constructor(public payload: User) {}
}

export class InvoiceDateChange implements CustomAction {
    public type = AppActionNames.APP_INVOICE_DATE_CHANGE;

    constructor(public payload: {InvoiceDate: any}) {}
}

export class FolerTreeChange implements CustomAction {
    public type = AppActionNames.SELECT_FOLDER_TREE;

    constructor(public payload: {folder: DocumentTreeModel}) {}
}

export class FolerTreeExpandCollaspe implements CustomAction {
    public type = AppActionNames.EXPAND_COLLASPE_FOLDER_TREE;

    constructor(public payload: {node: TreeNode}) {}
}

export class AddHotKey implements CustomAction {
    public type = AppActionNames.ADD_HOT_KEY;

    constructor(public payload: HotKey ) { }
}

export class UrgentStateAction implements CustomAction {
    public type = AppActionNames.TOGGLE_STATE_URGENT;

    constructor(public payload: boolean) {}
}
export class KostnestelleChange implements CustomAction {
    public type = AppActionNames.APP_KOSTNESTSTELLE_CHANGE;

    constructor(public payload: { kostnestelleData: KostnestelleData }) { }
}

export class InvoiceIncludeExchanged implements CustomAction {
    public type = AppActionNames.APP_INVOICE_INCLUDE_EXCHANGED;

    constructor(public payload: { invoiceIncludeExchanged: string }) { }
}
