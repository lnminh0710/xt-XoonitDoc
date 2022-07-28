import { DocumentTreeModel } from '@app/models/administration-document/document-tree.payload.model';
import { DocumentContainerOcrStateModel } from '@app/state-management/store/models/administration-document/state/document-container-ocr.state.model';
import { ColumnDefinition } from '@app/models/common/column-definition.model';
import { ExtractedDataFormModel } from '@app/models/administration-document/document-form/extracted-data-form.model';
import { DynamicFieldV2 } from './dynamic-field.interface';
import { IOpenFormParamsActionV2 } from './open-form-params-action.interface';
import { DocumentMetadataV2 } from './document-metadata.interface';
import { DynamicFormGroupDefinition } from '@app/models/common/form-group-definition.model';

export interface IToolbarFormV2 {
    scanQR: boolean;
    scanOCR: boolean;
    resetForm: boolean;
    clearForm: boolean;
    addDynamicField: boolean;
}

export interface IMyDMFormV2<T extends IToolbarFormV2> {
    hideFormUI();
    showFormUI();
    toolbar: T;
    folder: DocumentTreeModel;
    documentContainerOcr: DocumentContainerOcrStateModel;
    setColumnSettings(formGroupDef: DynamicFormGroupDefinition);
    getColumnSettings(): void;
    openForm(payload: IOpenFormParamsActionV2);
    reopenForm(params: IOpenFormParamsActionV2): void;
    applyOcr(ocr: ExtractedDataFormModel[]): void;
    applyQRCode(): void;
    registerGetDetailFn(fn: () => DynamicFormGroupDefinition): void;
    reset(): void;
    clearForm(): void;
    resetDataForm(): void;
    addDynamicFields(dynamicFields: DynamicFieldV2[]);
    updateDocumentMetadata(newMetadata: DocumentMetadataV2);
    detach(): void;
    attach(): void;
    validateDataBeforeSaving(): boolean;
    getDataForSaving(): { [key: string]: any };
}
