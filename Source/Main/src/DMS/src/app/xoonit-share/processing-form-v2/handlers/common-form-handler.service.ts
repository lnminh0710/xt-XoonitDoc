import { ChangeDetectorRef, Injectable, InjectionToken, Injector } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ExtractedDataFormModel } from '@app/models/administration-document/document-form/extracted-data-form.model';
import { InvoiceQrCodeModel } from '@app/models/administration-document/document-form/invoice-form.model';
import { ColumnDefinition } from '@app/models/common/column-definition.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DocumentMetadataV2 } from '../interfaces/document-metadata.interface';
import { DynamicFieldV2 } from '../interfaces/dynamic-field.interface';
import { IOpenFormParamsActionV2 } from '../interfaces/open-form-params-action.interface';
import { BaseMyDMFormHandlerV2 } from './base-mydm-form-handler.service';
import { IFormHandlerV2 } from './mydm-form-handler.interface';

export const COMMON_HANDLER = new InjectionToken<ICommonFormHandlerV2>('CommonFormHandler');

export interface ICommonFormHandlerV2 extends IFormHandlerV2 {
}

@Injectable()
export class CommonFormHandlerV2 extends BaseMyDMFormHandlerV2 implements ICommonFormHandlerV2 {

    constructor(
        protected injector: Injector,
        protected cdRef: ChangeDetectorRef,
    ) {
        super(injector);
    }

    public hideFormUI() {
        throw new Error('Method not implemented.');
    }
    public showFormUI() {
        throw new Error('Method not implemented.');
    }

    public getColumnSettings(): void {
        throw new Error('Method not implemented.');
    }

    public openForm(payload: IOpenFormParamsActionV2) {
        throw new Error('Method not implemented.');
    }
    public reopenForm(params: IOpenFormParamsActionV2): void {
        throw new Error('Method not implemented.');
    }

    public applyOcr(ocr: ExtractedDataFormModel[], formGroup?: FormGroup) {
        const objCtrlValues = this._buildObjectOcrValue(ocr);
        super.patchValueForm(formGroup, objCtrlValues);
    }

    public applyQRCode(callback?: (invoiceQrCodeModel: InvoiceQrCodeModel) => void): void {

    }

}
