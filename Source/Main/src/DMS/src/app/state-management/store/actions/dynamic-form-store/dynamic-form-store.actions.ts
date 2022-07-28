import { Action } from '@ngrx/store';

export enum DynamicFormStoreActionNames {
    SUCCESS = '[Dynamic Form Store] Action Success',
    FAILED = '[Dynamic Form Store] Action Failed',
    SAVE_DOCUMENT_FORM_SUCCESSFULLY = '[Dynamic Form Store] Save Document Successfully',
    GET_FORM_GROUP_SETTINGS = '[Dynamic Form Store] Get Form Group Settings',
}

export class DynamicFormStoreSuccessAction implements Action {
    public type = DynamicFormStoreActionNames.SUCCESS;

    constructor(
        public subType: DynamicFormStoreActionNames,
        public payload: any
    ) { }
}

export class DynamicFormStoreFailedAction implements Action {
    public type = DynamicFormStoreActionNames.FAILED;

    constructor(
        public subType: DynamicFormStoreActionNames,
        public payload: any
    ) { }
}

export class SaveDocumentDynamicFormsSuccessfullyAction implements Action {
    public type = DynamicFormStoreActionNames.SAVE_DOCUMENT_FORM_SUCCESSFULLY;

    constructor(public payload: {
        isUpdate: boolean,
    }) { }
}

export class GetFormGroupSettingsAction implements Action {
    public type = DynamicFormStoreActionNames.GET_FORM_GROUP_SETTINGS;
    constructor(
        public payload: {
            idMainDocument?: number;
            idDocumentContainerScans?: number;
            idBranch?: number;
            methodName: string;
            object: string;
            mode?: string;
        },
    ) {}
}
