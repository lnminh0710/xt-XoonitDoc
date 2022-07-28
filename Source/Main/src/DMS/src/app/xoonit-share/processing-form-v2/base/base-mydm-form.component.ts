import { Directive, Injector, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { BaseComponent } from '@app/pages/private/base';
import {
    ColumnDefinition
} from '@app/models/common/column-definition.model';
import {
    IMaterialControlConfig,
    ISelectMaterialControlConfig,
    IAutocompleteMaterialControlConfig,
} from '@xn-control/xn-dynamic-material-control/interfaces/material-control-config.interface';
import {  FormGroup} from '@angular/forms';
import { DocumentTreeModel } from '@app/models/administration-document/document-tree.payload.model';
import { DocumentContainerOcrStateModel } from '@app/state-management/store/models/administration-document/state/document-container-ocr.state.model';
import { Uti } from '@app/utilities';
import { Observable } from 'rxjs';
import { SharingContactInformationModel } from '@app/models/administration-document/document-form/sharing-contact-information.model';
import { InvoiceQrCodeModel } from '@app/models/administration-document/document-form/invoice-form.model';
import { QrCodeModel } from '@app/models/administration-document/document-form/qr-code.model';
import { FocusControlEvent } from '@xn-control/xn-dynamic-material-control/interfaces/focus-control-event.interface';
import { XnDynamicMaterialHelperService } from '@xn-control/xn-dynamic-material-control/services/xn-dynamic-matertial-helper.service';
import { Module } from '@app/models';
import { DynamicFieldV2 } from '@app/xoonit-share/processing-form-v2/interfaces/dynamic-field.interface';
import { DocumentMetadataV2 } from '@app/xoonit-share/processing-form-v2/interfaces/document-metadata.interface';
import { XFormGroupConfigDefinitionV2 } from '../interfaces/x-form-group-config.interface';

@Directive()
export abstract class BaseMyDmFormComponentV2 extends BaseComponent implements OnDestroy {
    public currentModule: Module;
    public documentContainerOcr: DocumentContainerOcrStateModel;
    public isShowUI = false;

    public formGroupConfigDef: XFormGroupConfigDefinitionV2;
    public ctrlFocusing: FocusControlEvent;
    public dynamicFields: DynamicFieldV2[];
    public dynamicControlConfigList: IMaterialControlConfig[];
    public formDynamic: FormGroup;
    public documentMetadata: DocumentMetadataV2;
    public dynamicMaterialHelper: XnDynamicMaterialHelperService;

    public middlewareMaterialControlConfigFn: (opts: { config: IMaterialControlConfig; columnDefinitions: ColumnDefinition[]; }) => void;

    private readonly _checkSeparateRealsNumberByDot = new RegExp(
        /^[\d]{1,3}(?:[\d]*(?:[.][\d]{0,})?|(?:,[\d]{3})*(?:\.[\d]{0,})?)$/,
        'g',
    ); // 10.000,00

    private readonly _checkSeparateRealsNumberByComma = new RegExp(
        /^[\d]{1,3}(?:[\d]*(?:[,][\d]{0,})?|(?:\.[\d]{3})*(?:,[\d]{0,})?)$/,
        'g',
    ); // 10,000.00

    constructor(protected router: Router, protected injector: Injector) {
        super(router);
        this.currentModule = this.ofModule;
    }

    public ngOnDestroy() {
        this.onDestroy();
    }

    public abstract configSelectControl(selectCtrl: ISelectMaterialControlConfig): Observable<boolean>;
    public abstract configAutocompleteControl(autocompleteCtrl: IAutocompleteMaterialControlConfig): void;
    public abstract shouldAddColumnToForm(columnSetting: ColumnDefinition): boolean;
    public abstract configMaterialControlConfigMiddleware(): (opts: { config: IMaterialControlConfig; columnDefinitions: ColumnDefinition[]; }) => void;

    protected mergeDocumentMetadataInfo(
        folder: DocumentTreeModel,
        documentContainerOcr: DocumentContainerOcrStateModel,
        metadata: DocumentMetadataV2,
    ): { [key: string]: any } {
        let data = {};
        data = {
            idDocumentTree: folder?.idDocument || documentContainerOcr?.IdDocumentTree,
            idDocumentContainerScans: documentContainerOcr?.IdDocumentContainerScans,
            idRepTreeMediaType: '1',
            isToDo: metadata.isTodo,
            keyword: metadata.keyword,
            mediaName: metadata.originalFileName || documentContainerOcr?.OriginalFileName,
            toDoNotes: metadata.toDos,
            ...metadata.headquarterInfo,
        };

        return data;
    }

    protected markFormGroupTouchedAndDirty(formGroup: FormGroup) {
        formGroup.markAllAsTouched();
        formGroup.markAsDirty();
    }

    protected mappingQrCodeToField(qrCode: any): QrCodeModel {
        if (!qrCode) {
            return { contact: null, invoice: null };
        }
        const qrCodeJson: any = JSON.parse(qrCode);
        const payee: any = qrCodeJson['Payee'] || {};
        const contactModel: SharingContactInformationModel = {
            B00SharingCompany_Company: payee['Company'],
            B00SharingAddress_Street: payee['Street'],
            B00SharingAddress_Zip: payee['ZIP'],
            B00SharingAddress_Place: payee['Place'],
            PersonNr: '',
            B00SharingCommunication_TelOffice: '',
            B00SharingName_FirstName: '',
            B00SharingName_LastName: '',
        };
        const slip: any = qrCodeJson['Slip'] || {};
        const invoiceModel: InvoiceQrCodeModel = {
            Currency: Uti.transformNumberHasDecimal(slip['Curreny'], 2),
            InvoiceAmount: Uti.transformNumberHasDecimal(slip['InvoiceAmount'], 2),
        };

        const model: QrCodeModel = { contact: contactModel, invoice: invoiceModel };
        return model;
    }

    public buildContactModel(): SharingContactInformationModel {
        return {
            B00SharingCompany_Company: '',
            B00SharingAddress_Street: '',
            B00SharingAddress_Zip: '',
            B00SharingAddress_Place: '',
            PersonNr: '',
            B00SharingCommunication_TelOffice: '',
            B00SharingName_FirstName: '',
            B00SharingName_LastName: '',
        };
    }
}
