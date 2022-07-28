import { CustomAction } from '@app/state-management/store/actions';
import { Action } from '@ngrx/store';
import { IOpenFormParamsAction } from '@app/xoonit-share/processing-form/interfaces/open-form-params-action.interface';
import { IOpenFormParamsActionV2 } from '../../../../../../xoonit-share/processing-form-v2/interfaces/open-form-params-action.interface';

export enum WidgetMyDmFormActionNames {
    OPEN_CONTRACT_FORM = '[WIDGET MYDM FORM] Open Contract My DM Form',
    OPEN_INVOICE_FORM = '[WIDGET MYDM FORM] Open Invoice My DM Form',
    OPEN_OTHER_DOCUMENTS_FORM = '[WIDGET MYDM FORM] Open Other Documents My DM Form',
    OPEN_MYDM_FORM = '[WIDGET MYDM FORM] Open MyDM Form',
    CLOSE_MYDM_FORM = '[WIDGET MYDM FORM] Close MyDM Form',
    CLEAR_FORM = '[WIDGET MYDM FORM] Clear MyDM Form',
    RESET_DATA_FORM = '[WIDGET MYDM FORM] Reset Data MyDM Form',
    SHOW_MYDM_FORM_UI = '[WIDGET MYDM FORM] Show MyDM Form UI',
    HIDE_MYDM_FORM_UI = '[WIDGET MYDM FORM] Hide MyDM Form UI',
}

export enum OpenFormMethodEnum {
    LOAD_COLUMN_SETTINGS = 1,
    LOAD_DETAIL = 2,
}

export class OpenContractFormAction implements Action {
    public type = WidgetMyDmFormActionNames.OPEN_CONTRACT_FORM;

    public constructor(public payload: IOpenFormParamsAction) {}
}

export class OpenInvoiceFormAction implements Action {
    public type = WidgetMyDmFormActionNames.OPEN_INVOICE_FORM;

    public constructor(public payload: IOpenFormParamsAction) {}
}

export class OpenOtherDocumentsFormAction implements Action {
    public type = WidgetMyDmFormActionNames.OPEN_OTHER_DOCUMENTS_FORM;

    public constructor(public payload: IOpenFormParamsAction) {}
}

export class OpenMyDMFormAction implements CustomAction {
    public type = WidgetMyDmFormActionNames.OPEN_MYDM_FORM;

    public constructor(
        public payload: IOpenFormParamsAction | IOpenFormParamsActionV2,
    ) {}
}

export class CloseMyDMFormAction implements Action {
    public type = WidgetMyDmFormActionNames.CLOSE_MYDM_FORM;

    public constructor() {}
}

export class ClearMyDMFormAction implements Action {
    public type = WidgetMyDmFormActionNames.CLEAR_FORM;

    public constructor() {}
}

export class ResetDataMyDMFormAction implements Action {
    public type = WidgetMyDmFormActionNames.RESET_DATA_FORM;

    public constructor() {}
}

export class ShowMyDMFormUIAction implements Action {
    public type = WidgetMyDmFormActionNames.SHOW_MYDM_FORM_UI;

    public constructor(
        public payload: {
            acknowledge: (ack: boolean) => void;
        },
    ) {}
}

export class HideMyDMFormUIAction implements Action {
    public type = WidgetMyDmFormActionNames.HIDE_MYDM_FORM_UI;

    public constructor(
        public payload: {
            acknowledge: (ack: boolean) => void;
        },
    ) {}
}
