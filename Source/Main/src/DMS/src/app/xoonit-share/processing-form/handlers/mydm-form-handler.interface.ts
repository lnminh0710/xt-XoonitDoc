import { InjectionToken } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DocumentProcessingTypeEnum } from '@app/app.constants';
import { ExtractedDataFormModel } from '@app/models/administration-document/document-form/extracted-data-form.model';
import { InvoiceQrCodeModel } from '@app/models/administration-document/document-form/invoice-form.model';
import { SharingContactInformationModel } from '@app/models/administration-document/document-form/sharing-contact-information.model';
import { ColumnDefinition } from '@app/models/common/column-definition.model';
import { FocusControlEvent } from '@xn-control/xn-dynamic-material-control/interfaces/focus-control-event.interface';
import { IMaterialControlConfig } from '@xn-control/xn-dynamic-material-control/interfaces/material-control-config.interface';
import { Subject } from 'rxjs';
import { BaseMyDmFormComponent } from '@app/xoonit-share/processing-form/base/base-mydm-form.component';
import { DocumentMetadata } from '../interfaces/document-metadata.interface';
import { DynamicField } from '../interfaces/dynamic-field.interface';
import { ILookupCompanyBehavior } from '../interfaces/lookup-company-behavior.interface';

export interface IFormHandler {
    formComponent: BaseMyDmFormComponent;

    setInstanceFormComponent(formComponent: BaseMyDmFormComponent): void;
    buildForm(columnDefinition: ColumnDefinition[]);
    clearForm(): void;
    resetDataForm(): void;
    orderByControls(controls: IMaterialControlConfig[]): void;
    registerCommonSubscriptions(): void;
    applyOcr(ocr: ExtractedDataFormModel[]): void;
    applyQRCode(callback?: (invoiceQrCodeModel: InvoiceQrCodeModel) => void): void;
    parseFormControlDynamicFields(
        dynamicFieldsSetting: ColumnDefinition,
        dynamicFields: DynamicField[],
        dynamicControls: IMaterialControlConfig[],
    ): { [key: string]: FormControl };
    addDynamicFields(dynamicFields: DynamicField[]): FormGroup;
    removeDynamicField(config: IMaterialControlConfig): void;
    updateDocumentMetadata(newMetadata: DocumentMetadata): void;
    onFocusChanged($event: FocusControlEvent);
    listenDetachEvent(detachSubject: Subject<boolean>): void;
}

export const FORM_HANDLER = new InjectionToken<IFormHandler>('FormHandler');
