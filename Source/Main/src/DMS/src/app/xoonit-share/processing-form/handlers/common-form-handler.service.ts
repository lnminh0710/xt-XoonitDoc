import { ChangeDetectorRef, Injectable, InjectionToken, Injector } from '@angular/core';
import { ExtractedDataFormModel } from '@app/models/administration-document/document-form/extracted-data-form.model';
import { InvoiceQrCodeModel } from '@app/models/administration-document/document-form/invoice-form.model';
import { ColumnDefinition } from '@app/models/common/column-definition.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DocumentMetadata } from '../interfaces/document-metadata.interface';
import { DynamicField } from '../interfaces/dynamic-field.interface';
import { IOpenFormParamsAction } from '../interfaces/open-form-params-action.interface';
import { BaseMyDMFormHandler } from './base-mydm-form-handler.service';
import { IFormHandler } from './mydm-form-handler.interface';

export const COMMON_HANDLER = new InjectionToken<ICommonFormHandler>('CommonFormHandler');

export interface ICommonFormHandler extends IFormHandler {
}

@Injectable()
export class CommonFormHandler extends BaseMyDMFormHandler implements ICommonFormHandler {

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

    public openForm(payload: IOpenFormParamsAction) {
        throw new Error('Method not implemented.');
    }
    public reopenForm(params: IOpenFormParamsAction): void {
        throw new Error('Method not implemented.');
    }

    public applyOcr(ocr: ExtractedDataFormModel[]) {
        const objCtrlValues = this._buildObjectOcrValue(ocr);
        super.patchValueForm(this.formComponent.formGroup, objCtrlValues);
    }

    public applyQRCode(callback?: (invoiceQrCodeModel: InvoiceQrCodeModel) => void): void {

    }

}
