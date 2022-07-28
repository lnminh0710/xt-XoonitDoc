import { DocumentTreeModel } from '@app/models/administration-document/document-tree.payload.model';
import { DocumentContainerOcrStateModel } from '@app/state-management/store/models/administration-document/state/document-container-ocr.state.model';
import { ColumnDefinition } from '@app/models/common/column-definition.model';
import { ExtractedDataFormModel } from '@app/models/administration-document/document-form/extracted-data-form.model';
import { DynamicField } from './dynamic-field.interface';
import { IOpenFormParamsAction } from './open-form-params-action.interface';
import { DocumentMetadata } from './document-metadata.interface';
import { FormStatus } from '@app/state-management/store/models/app-global/widget-is-able-to-save.payload.model';

export interface IToolbarForm {
    scanQR: boolean;
    scanOCR: boolean;
    resetForm: boolean;
    clearForm: boolean;
    addDynamicField: boolean;
}

export interface IMyDMForm<T extends IToolbarForm> {
    hideFormUI();
    showFormUI();
    toolbar: T;
    folder: DocumentTreeModel;
    documentContainerOcr: DocumentContainerOcrStateModel;
    getColumnSettings(idDocumentType?: number): void;
    openForm(payload: IOpenFormParamsAction);
    reopenForm(params: IOpenFormParamsAction): void;
    applyOcr(ocr: ExtractedDataFormModel[]): void;
    applyQRCode(): void;
    registerGetDetailFn(fn: () => ColumnDefinition[]): void;
    reset(): void;
    clearForm(): void;
    resetDataForm(): void;
    addDynamicFields(dynamicFields: DynamicField[]);
    updateDocumentMetadata(newMetadata: DocumentMetadata);
    detach(): void;
    attach(): void;
    validateForm?(): FormStatus;
    validateBeforeSave?(): boolean;
    getDataSave?(): { [key: string]: any };
    reload?();
}
