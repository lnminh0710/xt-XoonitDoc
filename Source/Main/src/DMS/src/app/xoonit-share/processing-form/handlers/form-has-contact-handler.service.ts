import { ChangeDetectorRef, Injectable, InjectionToken, Injector } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ExtractedDataFormModel } from '@app/models/administration-document/document-form/extracted-data-form.model';
import { SharingContactInformationModel } from '@app/models/administration-document/document-form/sharing-contact-information.model';
import { AppState } from '@app/state-management/store';
import {
    AdministrationDocumentActionNames,
    AdministrationDocumentActions,
    CustomAction,
    ModuleActions,
} from '@app/state-management/store/actions';
import { AdministrationDocumentSelectors } from '@app/state-management/store/reducer';
import { Store } from '@ngrx/store';
import {
    IAutocompleteMaterialControlConfig,
    IMaterialControlConfig,
} from '@xn-control/xn-dynamic-material-control/interfaces/material-control-config.interface';
import { XnDynamicMaterialHelperService } from '@xn-control/xn-dynamic-material-control/services/xn-dynamic-matertial-helper.service';
import { Observable, of } from 'rxjs';
import { isObject, isString } from 'util';
import { trim } from 'lodash-es';
import { InvoiceQrCodeModel } from '@app/models/administration-document/document-form/invoice-form.model';
import { IFormHandler } from './mydm-form-handler.interface';
import { BaseMyDMFormHandler } from './base-mydm-form-handler.service';
import { QrCodeModel } from '@app/models/administration-document/document-form/qr-code.model';
import { Uti } from '@app/utilities';
import { ModuleList } from '@app/pages/private/base';
import { IMyDMForm, IToolbarForm } from '../interfaces/mydm-form.interface';
import { ILookupCompanyBehavior } from '../interfaces/lookup-company-behavior.interface';
import { TranslateService } from '@ngx-translate/core';
import { ToasterService } from 'angular2-toaster';
import { takeUntil } from 'rxjs/operators';
import { ExtractedDataOcrState } from '@app/state-management/store/models/administration-document/state/extracted-data-ocr.state.model';
import { FocusControlEvent } from '@xn-control/xn-dynamic-material-control/interfaces/focus-control-event.interface';
import { CommonFormHandler } from './common-form-handler.service';

export interface IFormHasContactHandler extends IFormHandler {
    setInstanceFormLookupCompanyComponent(formLookupCompInstance: ILookupCompanyBehavior): void;
    setFormControlCompanyName(companyNameCtrl: string): void;
    registerLookupSubscriptions(): void;
    lookupCompanyName(companyName: string | SharingContactInformationModel): void;
    listenCompanyNameBlur(controlConfigs: IMaterialControlConfig[]): void;
    disabledSubContactField(formGroup: FormGroup, sharingContact: SharingContactInformationModel): void;
    enabledSubContactField();
    showCompanyAutocompleteOptions(): void;
    handleResponseLookupCompanyOnField(response: SharingContactInformationModel[], fieldName: string): void;
    resetDataFormAndFormContact(): void;
    clearFormAndFormContact(): void;
    validateCompanyFieldBeforeSave(): boolean;
    resetAllContactField(): void;
}

export const FORM_HAS_CONTACT_HANDLER = new InjectionToken<IFormHasContactHandler>('FormHasContactHandler');

@Injectable()
export class FormHasContactHandler extends CommonFormHandler implements IFormHasContactHandler {
    private _formLookupCompanyInstance: ILookupCompanyBehavior;
    private _formControlCompanyName: string;

    constructor(
        protected injector: Injector,
        protected moduleActions: ModuleActions,
        protected cdRef: ChangeDetectorRef,
    ) {
        super(injector, cdRef);
    }

    public setFormControlCompanyName(companyNameCtrl: string) {
        this._formControlCompanyName = companyNameCtrl;
    }

    public setInstanceFormLookupCompanyComponent(formLookupCompInstance: ILookupCompanyBehavior) {
        this._formLookupCompanyInstance = formLookupCompInstance;
    }

    public registerLookupSubscriptions(): void {
        this.administrationSelectors
            .actionSuccessOfSubtype$(AdministrationDocumentActionNames.CHECK_AND_GET_COMPANY_NAME_LIST)
            .pipe(takeUntil(this._onDetachForm.asObservable()))
            .subscribe((action: CustomAction) => {
                const payload = action.payload as SharingContactInformationModel[];
                if (!payload || !payload.length) {
                    if (this._formLookupCompanyInstance.isShowAutocompleteWhenApplyQRCode) {
                        this.patchValueForm(
                            this.formComponent.formGroup,
                            this._formLookupCompanyInstance.sharingQCCodeContact,
                        );
                        this._formLookupCompanyInstance.isShowAutocompleteWhenApplyQRCode = false;
                    }
                    // this.formGroup.enable();
                    this._formLookupCompanyInstance.isFillingData = false;
                    this._setEmptyOptionsAutocomplete();
                    this._formLookupCompanyInstance.showAutocompleteOptionsOnShowForm = false;
                    return;
                }

                // auto select when has 1 option only (only with ocr data)
                if (
                    payload.length === 1 &&
                    (this._formLookupCompanyInstance.isShowAutocompleteWhenDblClickOCR ||
                        this._formLookupCompanyInstance.isShowAutocompleteWhenApplyQRCode)
                ) {
                    this._setSharingContact(action.payload[0] as SharingContactInformationModel);
                    this._formLookupCompanyInstance.showAutocompleteOptionsOnShowForm = false;
                    this._formLookupCompanyInstance.isShowAutocompleteWhenApplyQRCode = false;
                    this._formLookupCompanyInstance.isShowAutocompleteWhenDblClickOCR = false;
                    return;
                }

                this._formLookupCompanyInstance.companyAutoCompleteConfig?.updateOptions(of(payload));
                this._formLookupCompanyInstance.showAutocompleteOptionsOnShowForm = this._formLookupCompanyInstance.showAutocompleteOptionsOnShowForm;
                this._formLookupCompanyInstance.isShowAutocompleteWhenApplyQRCode = false;
                this.showCompanyAutocompleteOptions();
                if (this._formLookupCompanyInstance.isShowAutocompleteWhenDblClickOCR) {
                    this._formLookupCompanyInstance.companyAutoCompleteConfig?.openAutocompleteOptions();
                    this._formLookupCompanyInstance.isShowAutocompleteWhenDblClickOCR = false;
                }
                this._formLookupCompanyInstance.isFillingData = false;
                this.cdRef.detectChanges();
            });
    }

    protected _applyScanningOcrText(
        payload: ExtractedDataOcrState,
        ctrlFocusing: FocusControlEvent,
        controlConfigs: IMaterialControlConfig[],
    ) {
        this._formLookupCompanyInstance.isShowAutocompleteWhenDblClickOCR =
            this.formComponent.ctrlFocusing &&
            this.formComponent.ctrlFocusing.config &&
            this.formComponent.ctrlFocusing.config.label === this._formControlCompanyName;
        super._applyScanningOcrText(payload, ctrlFocusing, controlConfigs);
    }

    public lookupCompanyName(companyName: string | SharingContactInformationModel) {
        let companyValue = null;

        // isString when user on typing
        if (isString(companyName)) {
            companyValue = companyName;
            this._dispatchCompanyValue(companyValue);
            if (this._formLookupCompanyInstance.sharingContact?.B00SharingCompany_Company === companyValue) {
                this._formLookupCompanyInstance.companyAutoCompleteConfig?.disableAutocomplete();
            } else {
                this._formLookupCompanyInstance.companyAutoCompleteConfig?.enableAutocomplete();
            }
        } else if (isObject(companyName)) {
            // isObject when user select option from autocomplete
            companyValue = companyName.B00SharingCompany_Company;
            this._dispatchCompanyValue(companyValue);
            this._setSharingContact(companyName);
            return;
        }

        // if value is empty || do applying OCR || getting company information
        if (!companyValue || !companyValue.trim().length || this._formLookupCompanyInstance.isFillingData) {
            if (!companyValue || !companyValue.trim().length) {
                this._setEmptyOptionsAutocomplete();
            }
            return;
        }

        this._formLookupCompanyInstance.isFillingData = true;
        // this.formGroup.disable();
        if (this._formLookupCompanyInstance.isShowAutocompleteWhenDblClickOCR) {
            companyValue = trim(companyValue);
        }
        this.store.dispatch(
            this.administrationActions.checkAndGetCompanyNameList({
                companyName: companyValue,
            }),
        );
    }

    public listenCompanyNameBlur(controlConfigs: IMaterialControlConfig[]) {
        const companyConfig = controlConfigs.find((c) => c.label === this._formControlCompanyName);

        companyConfig.onControlBlur
            .asObservable()
            .pipe(takeUntil(this._onDetachForm.asObservable()))
            .subscribe((ctrl: FormControl) => {
                if (!ctrl.value) return;

                const autocompleteOptionsState = this._formLookupCompanyInstance.companyAutoCompleteConfig.getAutocompleteOptionsState();
                // has no option OR has more than 1 item autocomplete
                if (!autocompleteOptionsState.hasOptions || autocompleteOptionsState.options.length !== 1) return;

                const displayMember = this._formLookupCompanyInstance.companyAutoCompleteConfig.displayMemberOpt();
                const itemAutocomplete = autocompleteOptionsState.options[0][displayMember] as string;

                // ctrl value string is not equal item string option[displayMember] in autocomplete
                if ((ctrl.value as string).toLowerCase?.().trim() !== itemAutocomplete.toLowerCase().trim()) {
                    return;
                }

                this._formLookupCompanyInstance.companyAutoCompleteConfig.setValueAtIndex(0);
                const selectedAutocomplete = this._formLookupCompanyInstance.companyAutoCompleteConfig.getSelectedAutocomplete();
                this._setSharingContact(selectedAutocomplete);
            });
    }

    public handleResponseLookupCompanyOnField(response: SharingContactInformationModel[], fieldName: string) {
        if (!response || !response.length) {
            if (this._formLookupCompanyInstance.isShowAutocompleteWhenApplyQRCode) {
                this._patchValueFormOverloading(
                    this.formComponent.formGroup,
                    this._formLookupCompanyInstance.sharingQCCodeContact,
                );
                this._formLookupCompanyInstance.isShowAutocompleteWhenApplyQRCode = false;
            }
            // this.formGroup.enable();
            this._formLookupCompanyInstance.isFillingData = false;
            this._setEmptyOptionsAutocomplete();
            this._formLookupCompanyInstance.showAutocompleteOptionsOnShowForm = false;
            return;
        }

        // auto select when has 1 option only (only with ocr data)
        if (
            response.length === 1 &&
            (this._formLookupCompanyInstance.isShowAutocompleteWhenDblClickOCR ||
                this._formLookupCompanyInstance.isShowAutocompleteWhenApplyQRCode)
        ) {
            this._setSharingContact(response[0] as SharingContactInformationModel);
            this._formLookupCompanyInstance.showAutocompleteOptionsOnShowForm = false;
            this._formLookupCompanyInstance.isShowAutocompleteWhenApplyQRCode = false;
            this._formLookupCompanyInstance.isShowAutocompleteWhenDblClickOCR = false;
            return;
        }

        this._formLookupCompanyInstance.companyAutoCompleteConfig?.updateOptions(of(response));
        this._formLookupCompanyInstance.showAutocompleteOptionsOnShowForm = this._formLookupCompanyInstance.showAutocompleteOptionsOnShowForm;
        this._formLookupCompanyInstance.isShowAutocompleteWhenApplyQRCode = false;
        this.showCompanyAutocompleteOptions();
        if (this._formLookupCompanyInstance.isShowAutocompleteWhenDblClickOCR) {
            this._formLookupCompanyInstance.companyAutoCompleteConfig?.openAutocompleteOptions();
            this._formLookupCompanyInstance.isShowAutocompleteWhenDblClickOCR = false;
        }

        this._formLookupCompanyInstance.isFillingData = false;
    }

    public clearFormAndFormContact(): void {
        super.clearForm();
        this._formLookupCompanyInstance.sharingContact = null;
        this._formLookupCompanyInstance.isFillingData = false;
        this._formLookupCompanyInstance.companyAutoCompleteConfig?.enableAutocomplete();
        this.enabledSubContactField();
    }

    public resetDataFormAndFormContact(): void {
        super.resetDataForm();
        this._formLookupCompanyInstance.sharingContact = null;
        this._formLookupCompanyInstance.isFillingData = false;
        this._formLookupCompanyInstance.companyAutoCompleteConfig?.enableAutocomplete();
    }

    public showCompanyAutocompleteOptions() {
        if (!this.formComponent.isShowUI) return;

        if (
            !this.formComponent.ctrlFocusing ||
            this.formComponent.ctrlFocusing.config.label !== this._formControlCompanyName
        ) {
            setTimeout(() => {
                this._formLookupCompanyInstance.companyAutoCompleteConfig?.openAutocompleteOptions();
            }, 500);
        }
    }

    public validateCompanyFieldBeforeSave(): boolean {
        const companyConfig = this.formComponent.controls.find((c) => c.label === this._formControlCompanyName);
        const companyCtrl = this.formComponent.formGroup.controls[companyConfig.formControlName];

        if (companyCtrl.value) {
            const autocompleteOpts = this._formLookupCompanyInstance.companyAutoCompleteConfig.getAutocompleteOptionsState();
            const options = autocompleteOpts.options;
            const displayMember = this._formLookupCompanyInstance.companyAutoCompleteConfig.displayMemberOpt();
            const found = options.find(
                (opt) => (opt[displayMember] as string).toLowerCase().trim() === companyCtrl.value.toLowerCase().trim(),
            );

            // find a item in autocomplete options equals to companyCtrl value but user has not selected yet.
            // then set focus back to the control and prevent from saving document
            if (found && !this._formLookupCompanyInstance.sharingContact?.PersonNr) {
                this._formLookupCompanyInstance.companyAutoCompleteConfig.setFocus();
                return false;
            }
        }

        return true;
    }

    public enabledSubContactField(): void {
        if (!this.formComponent || !this.formComponent.formGroup) {
            return;
        }

        const sharingContact = this._formLookupCompanyInstance.sharingContact || this.formComponent.buildContactModel();
        for (const key in sharingContact) {
            if (Object.prototype.hasOwnProperty.call(sharingContact, key)) {
                const formControl = this.formComponent.formGroup.controls[key] as FormControl;
                if (formControl) {
                    formControl.enable();
                }
            }
        }
    }

    public disabledSubContactField(formGroup: FormGroup, sharingContact: SharingContactInformationModel) {
        for (const key in sharingContact) {
            if (Object.prototype.hasOwnProperty.call(sharingContact, key)) {
                const formControl = formGroup.controls[key] as FormControl;
                if (key !== 'B00SharingCompany_Company' && formControl) {
                    formControl.disable();
                }
            }
        }
    }

    /**
     * override common-handler serviice
     */
    public applyOcr(ocr: ExtractedDataFormModel[]) {
        this._qrCodeValues = null;
        this._ocrValues = null;
        const objCtrlValues = this._buildObjectOcrValue(ocr);
        this._ocrValues = objCtrlValues
        if (this._formLookupCompanyInstance) {
            this._formLookupCompanyInstance.isFillingData = false;
            this._formLookupCompanyInstance.sharingContact = null;
            this._formLookupCompanyInstance.companyAutoCompleteConfig?.enableAutocomplete();
        }

        this._patchValueFormOverloading(this.formComponent.formGroup, objCtrlValues);
    }

    /**
     * override common-handler serviice
     */
    public applyQRCode(callback?: (invoiceQrCodeModel: InvoiceQrCodeModel) => void) {
        const { contact, invoice } = this._mappingQrCodeToField(this.formComponent.documentContainerOcr.JsonQRCode);

        if (contact) {
            this._qrCodeValues = null;
            this._ocrValues = null;
            this._qrCodeValues = contact;
            this._formLookupCompanyInstance.sharingQCCodeContact = contact;
            this._formLookupCompanyInstance.isShowAutocompleteWhenApplyQRCode = true;
            for (const key in contact) {
                if (Object.prototype.hasOwnProperty.call(contact, key)) {
                    const formControl = this.formComponent.formGroup.controls[key] as FormControl;
                    if (key !== 'B00SharingCompany_Company' && formControl) {
                        formControl.reset();
                    } else if (key === 'B00SharingCompany_Company' && formControl) {
                        if (formControl.value === contact.B00SharingCompany_Company) {
                            this._dispatchActionGetCompanyInformation(contact.B00SharingCompany_Company);
                            continue;
                        }
                        formControl.setValue(contact.B00SharingCompany_Company);
                        this._formLookupCompanyInstance.companyAutoCompleteConfig?.enableAutocomplete();
                    }
                }
            }
        }

        callback && callback(invoice);
    }

    private _setSharingContact(sharingContact: SharingContactInformationModel) {
        this._formLookupCompanyInstance.sharingContact = sharingContact;
        this._patchValueFormOverloading(this.formComponent.formGroup, this._formLookupCompanyInstance.sharingContact);
        this.disabledSubContactField(this.formComponent.formGroup, this._formLookupCompanyInstance.sharingContact);
        this._formLookupCompanyInstance.companyAutoCompleteConfig?.disableAutocomplete();
        this._setEmptyOptionsAutocomplete();
    }

    private _setEmptyOptionsAutocomplete() {
        this._formLookupCompanyInstance.companyAutoCompleteConfig?.updateOptions(of([]));
        // this.cdRef.detectChanges();
    }

    private _patchValueFormOverloading(formGroup: FormGroup, values: any) {
        super.patchValueForm(formGroup, values);

        // this event patchValue above will fire company Name ctrl valueChanges in asyncronous
        // there is a subscription to listen and call request to check and get company information
        // so we put setTimeout until valueChanges of Company Name already run done after 500ms we set isFillingData = true
        // to prevent it calls multiple times
        this._scheduleSetFillingDataBooleanToFalse(this._formLookupCompanyInstance);
    }

    private _scheduleSetFillingDataBooleanToFalse(formLookupCompInstance: ILookupCompanyBehavior) {
        setTimeout(() => {
            if (!formLookupCompInstance) return;
            formLookupCompInstance.isFillingData = false;
        }, 500);
    }

    private _dispatchActionGetCompanyInformation(companyName: string | SharingContactInformationModel) {
        let companyValue = null;

        // isString when user on typing
        if (isString(companyName)) {
            companyValue = companyName;
            this._dispatchCompanyValue(companyValue);
            if (this._formLookupCompanyInstance.sharingContact?.B00SharingCompany_Company === companyValue) {
                this._formLookupCompanyInstance.companyAutoCompleteConfig?.disableAutocomplete();
            } else {
                this._formLookupCompanyInstance.companyAutoCompleteConfig?.enableAutocomplete();
            }
        } else if (isObject(companyName)) {
            // isObject when user select option from autocomplete
            companyValue = companyName.B00SharingCompany_Company;
            this._dispatchCompanyValue(companyValue);
            this._setSharingContact(companyName);
            return;
        }

        // if value is empty || do applying OCR || getting company information
        if (!companyValue || !companyValue.trim().length || this._formLookupCompanyInstance.isFillingData) {
            if (!companyValue || !companyValue.trim().length) {
                this._setEmptyOptionsAutocomplete();
            }
            return;
        }

        this._formLookupCompanyInstance.isFillingData = true;
        // this.formGroup.disable();
        if (this._formLookupCompanyInstance.isShowAutocompleteWhenDblClickOCR) {
            companyValue = trim(companyValue);
        }
        this.store.dispatch(
            this.administrationActions.checkAndGetCompanyNameList({
                companyName: companyValue,
            }),
        );
    }

    private _dispatchCompanyValue(companyName: string) {
        if (
            this.formComponent.currentModule &&
            this.formComponent.currentModule.moduleName == ModuleList.Document.moduleName
        ) {
            this.store.dispatch(this.moduleActions.getCompany(companyName));
        }
    }

    private _mappingQrCodeToField(qrCode: any): QrCodeModel {
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

    public validateCompanyField(formLookupCompInstance: ILookupCompanyBehavior, companyCtrlName: string): boolean {
        const companyConfig = this.formComponent.controls.find((c) => c.label === companyCtrlName);
        const companyCtrl = this.formComponent.formGroup.controls[companyConfig.formControlName];

        if (!formLookupCompInstance.sharingContact && companyCtrl.value) {
            // this._companyAutoCompleteConfig.setFocus();
            return false;
        }

        return true;
    }

    public resetAllContactField(): void {
       // const values = super._buildObjectControlValue(this.formComponent.columnSettings);
       const values = this._qrCodeValues
       ? this._qrCodeValues
       : this._ocrValues
       ? this._ocrValues
       : super._buildObjectControlValue(this.formComponent.columnSettings);
        // if (this.formComponent.formContact) {
        //     this.formComponent.formContact.reset();
        //     this.formComponent.formContact.enable({ emitEvent: false });
        //     this.formComponent.sharingContact = null;
        // } else {
        const sharingContact = this.formComponent.buildContactModel();
        for (const key in sharingContact) {
            if (Object.prototype.hasOwnProperty.call(sharingContact, key)) {
                const formControl = this.formComponent.formGroup.controls[key] as FormControl;
                if (formControl) {
                    formControl.reset(values[key], { onlySelf: true, emitEvent: false }); 
                }
            }
        }
        // }
        this._formLookupCompanyInstance.companyAutoCompleteConfig?.enableAutocomplete();
    }
}
