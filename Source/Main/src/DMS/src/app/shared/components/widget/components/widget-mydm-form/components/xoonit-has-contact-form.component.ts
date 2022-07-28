import { Directive, Injector } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { SharingContactInformationModel } from '@app/models/administration-document/document-form/sharing-contact-information.model';
import { IFormHasContactHandler } from '@app/xoonit-share/processing-form/handlers/form-has-contact-handler.service';
import { ILookupCompanyBehavior } from '@app/xoonit-share/processing-form/interfaces/lookup-company-behavior.interface';
import { IOpenFormParamsAction } from '@app/xoonit-share/processing-form/interfaces/open-form-params-action.interface';
import { IAutocompleteMaterialControlConfig, IMaterialControlConfig } from '@xn-control/xn-dynamic-material-control/interfaces/material-control-config.interface';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CommonXoonitFormComponent } from './common-xoonit-form.component';

@Directive()
export abstract class XoonitHasContactFormComponent extends CommonXoonitFormComponent implements ILookupCompanyBehavior {
    protected formContactHandler: IFormHasContactHandler;

    public formContact: FormGroup;

    constructor(
        protected router: Router,
        protected injector: Injector,
        protected companyCtrlName: string,
    ) {
        super(router, injector);
    }

    protected abstract configFormHasContactHandlerDependency(): IFormHasContactHandler;

    //#region implements interface ILookupCompanyBehavior
    public isFillingData: boolean;
    public sharingContact: SharingContactInformationModel;
    public showAutocompleteOptionsOnShowForm: boolean;
    public isShowAutocompleteWhenDblClickOCR: boolean;
    public sharingQCCodeContact: SharingContactInformationModel;
    public isShowAutocompleteWhenApplyQRCode: boolean;
    public companyAutoCompleteConfig: IAutocompleteMaterialControlConfig;
    //#endregion implements interface ILookupCompanyBehavior

    protected setup() {
        super.setup();
        const formContactHandler = this.configFormHasContactHandlerDependency();
        if (!formContactHandler) {
            throw new Error('Please config dependency IFormHasContactHandler instance');
        }
        this.formContactHandler = formContactHandler;
        this.formContactHandler.setInstanceFormLookupCompanyComponent(this);
        this.formContactHandler.setFormControlCompanyName(this.companyCtrlName);
    }

    public openForm(payload: IOpenFormParamsAction) {
        super.openForm(payload);
        this.formContactHandler.registerLookupSubscriptions();
    }

    public clearAllContactField() {
        if (this.formContact) {
            this.formContact.reset();
            this.formContact.enable({ emitEvent: false });
            this.sharingContact = null;
        } else {
            const sharingContact = super.buildContactModel();
            for (const key in sharingContact) {
                if (Object.prototype.hasOwnProperty.call(sharingContact, key)) {
                    const formControl = this.formGroup.controls[key] as FormControl;
                    if (formControl) {
                        formControl.reset();
                        formControl.enable();
                    }
                }
            }
        }
        this.companyAutoCompleteConfig?.enableAutocomplete();
    }

    public enabledSubContactField() {
        this.formContactHandler.enabledSubContactField();
    }

    public showFormUI() {
        super.showFormUI();
        if (!this.showAutocompleteOptionsOnShowForm) return;

        // _showAutocompleteOptionsOnShowForm = true
        this.formContactHandler.showCompanyAutocompleteOptions();

        this.showAutocompleteOptionsOnShowForm = false;
    }

    public resetAllContactField(): void {
        this.formContactHandler.resetAllContactField();
    }

    protected listenCompanyNameChanges(
        formGroup: FormGroup,
        controlConfigs: IMaterialControlConfig[],
        companyCtrlName: string,
    ): Observable<string> {
        const companyConfig = controlConfigs.find((c) => c.label === companyCtrlName);
        const companyCtrl = formGroup.controls[companyConfig.formControlName];

        return companyCtrl.valueChanges.pipe(debounceTime(500), distinctUntilChanged());
    }

    protected listenCompanyNameBlur(
        formGroup: FormGroup,
        controlConfigs: IMaterialControlConfig[],
        companyCtrlName: string,
    ): Observable<AbstractControl> {
        const companyConfig = controlConfigs.find((c) => c.label === companyCtrlName);
        return companyConfig.onControlBlur.asObservable();
    }
}
