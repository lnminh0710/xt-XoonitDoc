import { InjectionToken } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ExtractedDataFormModel } from '@app/models/administration-document/document-form/extracted-data-form.model';
import { InvoiceQrCodeModel } from '@app/models/administration-document/document-form/invoice-form.model';
import { ColumnDefinition } from '@app/models/common/column-definition.model';
import { FocusControlEvent } from '@xn-control/xn-dynamic-material-control/interfaces/focus-control-event.interface';
import { IMaterialControlConfig } from '@xn-control/xn-dynamic-material-control/interfaces/material-control-config.interface';
import { Subject } from 'rxjs';
import { DocumentMetadataV2 } from '../interfaces/document-metadata.interface';
import { DynamicFieldV2 } from '../interfaces/dynamic-field.interface';
import { DynamicFormGroupDefinition } from '@app/models/common/form-group-definition.model';
import { XFormGroupConfigDefinitionV2 } from '../interfaces/x-form-group-config.interface';
import { BaseMyDmFormComponentV2 } from '../base/base-mydm-form.component';

export interface IFormHandlerV2 {
    formComponent: BaseMyDmFormComponentV2;

    setInstanceFormComponent(formComponent: BaseMyDmFormComponentV2): void;
    buildForm(columnDefinition: ColumnDefinition[]);
    buildFormGroupDefinition(formGroupDefinition: DynamicFormGroupDefinition): XFormGroupConfigDefinitionV2;
    buildFormGroupDefinitionForSaving(xFormGroupConfigDef: XFormGroupConfigDefinitionV2, hiddenValues: { [key: string]: any }): DynamicFormGroupDefinition;
    buildJsonForSaving(xFormGroupConfigDef: XFormGroupConfigDefinitionV2, hiddenValues: { [key: string]: any }): { [key: string]: any }
    clearForm(): void;
    clearAllForms(formGroupDef: XFormGroupConfigDefinitionV2): void;
    resetDataForm(): void;
    orderByControls(controls: IMaterialControlConfig[]): void;
    registerCommonSubscriptions(): void;
    applyOcr(ocr: ExtractedDataFormModel[], formGroup: FormGroup): void;
    applyQRCode(callback?: (invoiceQrCodeModel: InvoiceQrCodeModel) => void): void;
    parseFormControlDynamicFields(
        dynamicFieldsSetting: ColumnDefinition,
        dynamicFields: DynamicFieldV2[],
        dynamicControls: IMaterialControlConfig[],
    ): { [key: string]: FormControl };
    addDynamicFields(dynamicFields: DynamicFieldV2[]): FormGroup;
    removeDynamicField(config: IMaterialControlConfig): void;
    updateDocumentMetadata(newMetadata: DocumentMetadataV2): void;
    onFocusChanged($event: FocusControlEvent);
    listenDetachEvent(detachSubject: Subject<boolean>): void;
    patchValueForm(formGroup: FormGroup, values: any): void;
}

export const FORM_HANDLER = new InjectionToken<IFormHandlerV2>('FormHandler');
