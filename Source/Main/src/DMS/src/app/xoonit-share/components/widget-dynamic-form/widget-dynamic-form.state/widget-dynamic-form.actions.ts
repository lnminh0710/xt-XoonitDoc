import { Action } from '@ngrx/store';
import { DocumentTreeModel } from '@app/models/administration-document/document-tree.payload.model';
import { FormGroupDefinition } from '@app/models/common/form-group-definition.model';
import { DocumentTreeMediaModel } from '@app/models/administration-document/document-form/document-tree-media.model';
import { MainDocumentModel } from '@app/models/administration-document/document-form/main-document.model';

export enum WidgetDynamicFormActionNames {
    SUCCESS = '[WIDGET DYNAMIC FORM] Success Action',
    FAILED = '[WIDGET DYNAMIC FORM] Failed Action',
    GET_DYNAMIC_COLUMN_SETTINGS = '[WIDGET DYNAMIC FORM] Get Dynamic Column Settings',
    SAVE_DYNAMIC_COLUMN_SETTINGS = '[WIDGET DYNAMIC FORM] Save Dynamic Column Settings',
}

export class WidgetDynamicSuccessAction implements Action {
    public type = WidgetDynamicFormActionNames.SUCCESS;
    constructor(public subType: string, public payload?: any) {}
}

export class WidgetDynamicFailedAction implements Action {
    public type = WidgetDynamicFormActionNames.FAILED;
    constructor(public subType: string, public payload?: any) {}
}

export class GetDynamicColumnSettingsAction implements Action {
    public type = WidgetDynamicFormActionNames.GET_DYNAMIC_COLUMN_SETTINGS;
    constructor(
        public payload: {
            idMainDocument?: number;
            idBranch?: number;
        },
    ) {}
}

export class SaveDynamicColumnSettingsAction implements Action {
    public type = WidgetDynamicFormActionNames.SAVE_DYNAMIC_COLUMN_SETTINGS;
    constructor(
        public payload: {
            folder: DocumentTreeModel;
            documentTreeMedia: DocumentTreeMediaModel,
            mainDocument: MainDocumentModel,
            formGroupDefinition: FormGroupDefinition,
        },
    ) {}
}
