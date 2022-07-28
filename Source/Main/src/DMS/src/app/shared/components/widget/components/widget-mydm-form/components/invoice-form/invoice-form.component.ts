import {
    Component,
    OnInit,
    ChangeDetectorRef,
    ChangeDetectionStrategy,
    ViewChild,
    Inject,
    Injector,
} from '@angular/core';
import { IMyDMForm, IToolbarForm } from '@app/xoonit-share/processing-form/interfaces/mydm-form.interface';
import { Router } from '@angular/router';
import { BaseMyDmFormComponent } from '@app/xoonit-share/processing-form/base/base-mydm-form.component';
import { AppState } from '@app/state-management/store';
import { Store } from '@ngrx/store';
import { FormBuilder, FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import {
    AdministrationDocumentActions,
    AdministrationDocumentActionNames,
    CustomAction,
    ModuleActions,
} from '@app/state-management/store/actions';
import { AdministrationDocumentSelectors } from '@app/state-management/store/reducer';
import { AppErrorHandler } from '@app/services';
import { ColumnDefinition } from '@app/models/common/column-definition.model';
import { takeUntil, take, filter } from 'rxjs/operators';
import {
    IMaterialControlConfig,
    ISelectMaterialControlConfig,
    IAutocompleteMaterialControlConfig,
} from '@xn-control/xn-dynamic-material-control/interfaces/material-control-config.interface';
import { LoadContactSettingEnum } from '../../consts/load-contact-setting.enum';
import { ComboboxRepositoryStateModel } from '@app/state-management/store/models/administration-document/state/combobox-repository.state.model';
import { Subject, Observable, of } from 'rxjs';
import { MainDocumentModel } from '@app/models/administration-document/document-form/main-document.model';
import { DocumentTreeMediaModel } from '@app/models/administration-document/document-form/document-tree-media.model';
import { FolderCapturedChangeModel } from '@app/models/administration-document/document-form/folder-captured-change.model';
import { DocumentTreeModel } from '@app/models/administration-document/document-tree.payload.model';
import { DocumentContainerOcrStateModel } from '@app/state-management/store/models/administration-document/state/document-container-ocr.state.model';
import { MessageModal, DocumentProcessingTypeEnum } from '@app/app.constants';
import { ToasterService } from 'angular2-toaster';
import { InvoiceFormModel } from '@app/models/administration-document/document-form/invoice-form.model';
import { SaveDocumentInvoiceModel } from '@app/state-management/store/models/administration-document/document-invoice.model.payload';
import { ContactFormModel } from '@app/models/administration-document/document-form/contact-form.model';
import { Uti } from '@app/utilities';
import { isBoolean, isObject, isString } from 'util';
import * as moment from 'moment';
import { TranslateService } from '@ngx-translate/core';
import { defaultLanguage } from '@app/app.resource';
import { ExtractedDataFormModel } from '@app/models/administration-document/document-form/extracted-data-form.model';
import { PerfectScrollbarDirective } from 'ngx-perfect-scrollbar';
import { SharingContactInformationModel } from '@app/models/administration-document/document-form/sharing-contact-information.model';
import { cloneDeep, trim } from 'lodash-es';
import { MatDialog } from '@xn-control/light-material-ui/dialog';
import { SharingContactDialogComponent } from '../sharing-contact-dialog/sharing-contact-dialog.component';
import { FocusControlEvent } from '@xn-control/xn-dynamic-material-control/interfaces/focus-control-event.interface';
import { DocumentFormType } from '@app/models/administration-document/document-form/document-form-type.model';
import { OpenFormMethodEnum } from '../../actions/widget-mydm-form.actions';
import {
    ExtractedDataOcrState,
    DataState,
} from '@app/state-management/store/models/administration-document/state/extracted-data-ocr.state.model';
import { IconNames } from '@app/app-icon-registry.service';
import {
    FormHasContactHandler,
    IFormHasContactHandler,
} from '@app/xoonit-share/processing-form/handlers/form-has-contact-handler.service';
import { FORM_HANDLER, IFormHandler } from '@app/xoonit-share/processing-form/handlers/mydm-form-handler.interface';
import { ISaveFormHandler } from '@app/xoonit-share/processing-form/interfaces/save-form-handler.interface';
import { ILookupCompanyBehavior } from '@app/xoonit-share/processing-form/interfaces/lookup-company-behavior.interface';
import { DynamicField } from '@app/xoonit-share/processing-form/interfaces/dynamic-field.interface';
import { XoonitHasContactFormComponent } from '../xoonit-has-contact-form.component';
import { AppSelectors } from '@app/state-management/store/reducer/app';
import { FormStatus, IWidgetIsAbleToSave } from '@app/state-management/store/models/app-global/widget-is-able-to-save.payload.model';

enum FormControlNameEnum {
    COMPANY_NAME = 'Company',
    IS_GUARANTEE = 'IsGuarantee',
    GUARANTEEE_EXPIRY_DATE = 'GuranteeExpiryDate',
    INVOICE_DATE = 'InvoiceDate',
    GUARANTEE_HEADER = '**Guarantee**',
    CURRENCY = 'Currency',
}

@Component({
    selector: 'invoice-form',
    templateUrl: 'invoice-form.component.html',
    styleUrls: ['invoice-form.component.scss'],
    providers: [{ provide: FORM_HANDLER, useClass: FormHasContactHandler }],
})
export class InvoiceFormComponent
    extends XoonitHasContactFormComponent
    implements IMyDMForm<IToolbarForm>, ISaveFormHandler, IWidgetIsAbleToSave, OnInit {
    private _defaultCurrency = 'CHF';
    private _comboboxCurrency: ComboboxRepositoryStateModel[];
    private _comboboxMeansOfPayment: ComboboxRepositoryStateModel[];
    private _cacheIds: {
        IdMainDocument: string;
        IdDocumentTree: string;
        IdDocumentTreeMedia: string;
        OldFolder?: DocumentTreeModel;
        NewFolder?: DocumentTreeModel;
    } = {
        IdMainDocument: null,
        IdDocumentTree: null,
        IdDocumentTreeMedia: null,
        OldFolder: null,
        NewFolder: null,
    };

    public formInvoice: FormGroup;
    public formContact: FormGroup;
    private allAddons: any = {};

    public svgIconClear = IconNames.WIDGET_MYDM_FORM_Reset;
    public svgIconEdit = IconNames.WIDGET_MYDM_FORM_Edit;
    public svgIconUndo = IconNames.WIDGET_MYDM_FORM_Undo;

    @ViewChild('perfectScrollbar', { read: PerfectScrollbarDirective }) perfectScrollbar: PerfectScrollbarDirective;

    constructor(
        protected router: Router,
        protected injector: Injector,
        protected store: Store<AppState>,
        private fb: FormBuilder,
        protected administrationActions: AdministrationDocumentActions,
        protected administrationSelectors: AdministrationDocumentSelectors,
        private moduleActions: ModuleActions,
        private appErrorHandler: AppErrorHandler,
        private toasterService: ToasterService,
        private translateService: TranslateService,
        private dialog: MatDialog,
        private appSelectors: AppSelectors,
        @Inject(FORM_HANDLER) private formHandler: FormHasContactHandler,
    ) {
        super(router, injector, FormControlNameEnum.COMPANY_NAME);
        this.setup();
    }

    protected registerSubscriptions() {
        this.administrationSelectors
            .actionSuccessOfSubtype$(AdministrationDocumentActionNames.GET_INVOICE_COLUMN_SETTING)
            .pipe(takeUntil(this.onDetachForm$))
            .subscribe((action: CustomAction) => {
                const payload = action.payload;
                const columnSettings = payload.item as ColumnDefinition[];
                if (!columnSettings || !columnSettings.length) return;

                this.columnSettings.push(...columnSettings);

                const { controlConfigs, formGroup } = this.formHandler.buildForm(columnSettings);
                this.controls.push(...controlConfigs);
                this.formInvoice = this.fb.group(formGroup);

                super.publishEventFormIntialized(!!this.formContact && !!this.formInvoice);
            });

        this.administrationSelectors
            .actionSuccessOfSubtype$(AdministrationDocumentActionNames.GET_BANK_CONTACT_COLUMN_SETTING)
            .pipe(takeUntil(this.onDetachForm$))
            .subscribe((action: CustomAction) => {
                const payload = action.payload;
                const columnSettings = payload.item as ColumnDefinition[];
                if (!columnSettings || !columnSettings.length) return;
                this.columnSettings.push(...columnSettings);
                const { controlConfigs, formGroup } = this.formHandler.buildForm(columnSettings);
                this.controls.push(...controlConfigs);
                this.formContact = this.fb.group(formGroup);

                super.publishEventFormIntialized(!!this.formContact && !!this.formInvoice);
            });

        this.administrationSelectors.comboboxCurrency$
            .pipe(takeUntil(this.onDetachForm$))
            .subscribe((comboboxCurrency) => {
                this._comboboxCurrency = comboboxCurrency;
            });

        this.administrationSelectors.comboboxMeansOfPayment$
            .pipe(takeUntil(this.onDetachForm$))
            .subscribe((comboboxMeansOfPayment) => {
                this._comboboxMeansOfPayment = comboboxMeansOfPayment;
            });

        this.onFormInitialized$
            .pipe(
                filter((val) => val),
                takeUntil(this.onDetachForm$),
            )
            .subscribe((_) => {
                this.formHandler.orderByControls(this.controls);
                this.formGroup = this.fb.group({
                    ...(this.formContact?.controls || []),
                    ...(this.formInvoice?.controls || []),
                });
                this._listenIsGuaranteeChanges();
                this._listenInvoiceDateChanges();
                this._setCurrencyValue();
                this.listenCompanyNameChanges(
                    this.formGroup,
                    this.controls,
                    FormControlNameEnum.COMPANY_NAME,
                ).subscribe((val) => {
                    this.formHandler.lookupCompanyName(val);
                });
                this.formHandler.listenCompanyNameBlur(this.controls);

                this.cdRef.detectChanges();
            });

        this.administrationSelectors
            .actionOfType$(AdministrationDocumentActionNames.CHANGE_DOCUMENT_DETAIL_INTO_FOLDER)
            .pipe(takeUntil(this.onDetachForm$))
            .subscribe((action: CustomAction) => {
                const payload = action.payload as DocumentTreeModel;
                if (payload.idDocument === this.folder.idDocument) {
                    this._cacheIds.NewFolder = null;
                    this._cacheIds.OldFolder = null;
                } else {
                    this._cacheIds.NewFolder = cloneDeep(action.payload);
                    this._cacheIds.OldFolder = cloneDeep(this.folder);
                }
            });
        this.administrationSelectors.allAddons$
            .pipe(takeUntil(this.onDetachForm$))
            .subscribe((allAddons) => {
                this.assignFormControlToModel(allAddons, this.allAddons);
            });
    }

    public ngOnInit() {}

    public ngOnDestroy() {
        super.ngOnDestroy();
    }

    protected configFormHasContactHandlerDependency(): IFormHasContactHandler {
        return this.formHandler;
    }

    protected configFormHandlerDependency(): IFormHandler {
        return this.formHandler;
    }

    public getColumnSettings(): void {
        this.store.dispatch(this.administrationActions.getInvoiceColumnSetting());
        this.store.dispatch(this.administrationActions.getBankContactColumnSetting(LoadContactSettingEnum.CONTACT));
    }

    public reset(): void {
        this.formInvoice = null;
        this.formContact = null;

        Object.keys(this._cacheIds).forEach((key) => {
            this._cacheIds[key] = null;
        });

        super.reset();
    }

    public registerGetDetailFn(fn: () => ColumnDefinition[]) {
        const columnSettings = fn();
        // if (!this.hasChangedColumnSettings(columnSettings)) {
        //     return;
        // }

        this.reset();

        this.columnSettings.push(...columnSettings);
        const { controlConfigs, formGroup } = this.formHandler.buildForm(columnSettings);
        this.controls.push(...controlConfigs);

        const dynamicFieldsSetting = this.columnSettings.find((col) => col.originalColumnName === 'JsonDynamicFields');
        if (dynamicFieldsSetting && dynamicFieldsSetting.value) {
            const formControls = this.formHandler.parseFormControlDynamicFields(
                dynamicFieldsSetting,
                this.dynamicFields,
                this.dynamicControlConfigList,
            );
            this.formDynamic = this.fb.group(formControls);
        }

        this.formHandler.orderByControls(this.controls);

        this.formGroup = this.fb.group(formGroup);
        this._listenIsGuaranteeChanges();
        this._listenInvoiceDateChanges();
        this._setCurrencyValue();
        this._cacheColumnIds(this.columnSettings, this._cacheIds);
        this.listenCompanyNameChanges(this.formGroup, this.controls, FormControlNameEnum.COMPANY_NAME).subscribe(
            (val) => {
                this.formHandler.lookupCompanyName(val);
            },
        );
        this.formHandler.listenCompanyNameBlur(this.controls);

        this.formHandler.disabledSubContactField(this.formGroup, super.buildContactModel());
        this.cdRef.detectChanges();
        if (dynamicFieldsSetting.value) {
            this.perfectScrollbar.update();
        }
    }

    public applyQRCode() {
        this.formHandler.applyQRCode((invoice) => {
            if (invoice) {
                if (invoice.Currency && this._comboboxCurrency) {
                    const currency = this._comboboxCurrency.find(
                        (x) => x.textValue.toUpperCase() == invoice.Currency.toUpperCase(),
                    );
                    if (currency) {
                        invoice.Currency = currency.idValue;
                    }
                }
                this.formHandler.patchValueForm(this.formGroup, invoice);
            }
        });
    }

    validateBeforeSave() {
        return this.formGroup.valid; 
    }

    validateForm() {
        return <FormStatus>{
            isValid: this.formGroup.valid,
            formTitle: 'Widget Invoice Form',
            errorMessages: ['Please check again, something errors']
        };
    }

    getDataSave() {
        return this.save();
    }

    public save(): any {
        if (!this.documentContainerOcr) {
            this.toasterService.pop(MessageModal.MessageType.warning, 'System', 'There is no document');
            return;
        }

        if (!this.folder) {
            this.toasterService.pop(MessageModal.MessageType.warning, 'System', 'Please assign document into a folder');
            return;
        }

        if (!this.formGroup) {
            return;
        }

        if (!this._validate()) {
            return;
        }

        const result = super.getMainDocumentInfo(
            this.folder,
            this.documentContainerOcr,
            this._cacheIds,
            this.documentMetadata,
        );

        if (!result) {
            this.toasterService.pop('');
            return;
        }

        let contactCtrls = null;
        let invoiceCtrls = null;

        if (this.formContact && this.formInvoice) {
            contactCtrls = Uti.assignIntersection(this.formGroup.controls, this.formContact.controls) as {
                [key: string]: FormControl;
            };
            invoiceCtrls = Uti.assignIntersection(this.formGroup.controls, this.formInvoice.controls) as {
                [key: string]: FormControl;
            };
        }

        const dataFormInvoice = new InvoiceFormModel();
        super.assignFormControlToModel(invoiceCtrls || this.formGroup.controls, dataFormInvoice);
        dataFormInvoice.notes = this.documentMetadata.keyword;

        const dataFormContact = new ContactFormModel();
        super.assignFormControlToModel(contactCtrls || this.formGroup.controls, dataFormContact);
        dataFormContact.personNr = this.sharingContact?.PersonNr;

        let dynamicFields = null;
        if (this.dynamicFields && this.dynamicFields.length) {
            Object.keys(this.formDynamic.controls).forEach((key) => {
                const dynamicField = this.dynamicFields.find((f) => f.fieldName === key);
                dynamicField.fieldValue = this.formDynamic.controls[key].value;
            });
            dynamicFields = this.dynamicFields;
        }

        return {
            personBeneficiary: this.objHasValue(dataFormContact) ? dataFormContact : null,

            invoice: dataFormInvoice ? {...dataFormInvoice, ...(this.allAddons || {})} : null,
            dynamicFields: dynamicFields,
        } as SaveDocumentInvoiceModel;
    }

    public configSelectControl(selectCtrl: ISelectMaterialControlConfig): void {
        switch (selectCtrl.formControlName) {
            case 'Currency':
                selectCtrl.options = this._comboboxCurrency;
                selectCtrl.valueMemberOpt = () => 'idValue';
                selectCtrl.displayMemberOpt = () => 'textValue';
                break;

            case 'IdRepMeansOfPayment':
                selectCtrl.options = this._comboboxMeansOfPayment;
                selectCtrl.valueMemberOpt = () => 'idValue';
                selectCtrl.displayMemberOpt = () => 'textValue';
                break;

            default:
                return;
        }
    }

    public configAutocompleteControl(autocompleteCtrl: IAutocompleteMaterialControlConfig): void {
        switch (autocompleteCtrl.formControlName) {
            case 'B00SharingCompany_Company':
                autocompleteCtrl.options = of([]);
                autocompleteCtrl.valueMemberOpt = () => 'B00SharingCompany_Company';
                autocompleteCtrl.displayMemberOpt = () => 'B00SharingCompany_Company';
                autocompleteCtrl.highlightSearchText = true;
                this.companyAutoCompleteConfig = autocompleteCtrl;
                break;
        }
    }

    public shouldAddColumnToForm(column: ColumnDefinition) {
        if (super.isColumnHeader(column)) {
            return false;
        }

        switch (column.columnName) {
            default:
                return true;
        }
    }

    private _listenIsGuaranteeChanges() {
        const invoiceDateCtrl = this.formGroup.controls[FormControlNameEnum.INVOICE_DATE] as FormControl;
        const invoiceDateConfig = this.controls.find(
            (ctrl) => ctrl.formControlName === FormControlNameEnum.INVOICE_DATE,
        );
        const invoiceDateValidators = this.dynamicMaterialHelper.getValidators(invoiceDateConfig);

        this.appSelectors.isGuarantee$.pipe(takeUntil(this.onDetachForm$)).subscribe((value: boolean) => {
            // if switch on and invoice date value is valid then that we don't need to check invoice date must be required.

            if (value && invoiceDateCtrl.value && moment(invoiceDateCtrl.value).isValid()) {
                return;
            }

            if (value) {
                invoiceDateCtrl.setValidators([Validators.required, ...invoiceDateValidators]);
                invoiceDateCtrl.markAsTouched();
                this.cdRef.detectChanges();
                this.cdRef.markForCheck();
            } else {
                this._resetDefaultValidators(invoiceDateCtrl, invoiceDateConfig);
                this.cdRef.detectChanges();
                this.cdRef.markForCheck();
            }
            invoiceDateCtrl.updateValueAndValidity({ onlySelf: true, emitEvent: false });
        });
    }

    private _listenInvoiceDateChanges() {
        const invoiceDateCtrl = this.formGroup.controls[FormControlNameEnum.INVOICE_DATE] as FormControl;

        invoiceDateCtrl.valueChanges.pipe(takeUntil(super.getUnsubscriberNotifier())).subscribe((value: Date) => {
            const _moment = moment(value);
            this.store.dispatch(this.administrationActions.changeInvoiceDate(value));
        });
    }

    private _cacheColumnIds(
        columnSettings: ColumnDefinition[],
        cache: {
            IdMainDocument: string;
            IdDocumentTree: string;
            IdDocumentTreeMedia: string;
            OldFolder?: DocumentTreeModel;
            NewFolder?: DocumentTreeModel;
        },
    ) {
        const keys = Object.keys(cache);
        for (let i = 0; i < columnSettings.length; i++) {
            const columnSetting = columnSettings[i];
            if (keys.indexOf(columnSetting.originalColumnName) !== -1) {
                cache[columnSetting.originalColumnName] = columnSetting.value;
            }
        }
    }

    private _setCurrencyValue() {
        const currencyCtrl = this.formGroup.controls[FormControlNameEnum.CURRENCY] as FormControl;
        if (!currencyCtrl.value) {
            const defaultValue = this._comboboxCurrency.find(
                (x) => x.textValue.toUpperCase() == this._defaultCurrency.toUpperCase(),
            );
            currencyCtrl.setValue(defaultValue.idValue);
        }
    }

    private _correctGuaranteeDateBeforeSave(invoiceFormModel: InvoiceFormModel) {
        if (!invoiceFormModel.invoiceDate) {
            invoiceFormModel.guranteeExpiryDate = '';
        }
    }

    private _validate(): boolean {
        super.markFormGroupTouchedAndDirty(this.formGroup);
        super.markFormGroupDynamicFieldTouchedAndDirty(this.formDynamic, this.dynamicFields);

        if (!this.formHandler.validateCompanyFieldBeforeSave()) {
            this.translateService
                .get(defaultLanguage.WIDGET_MYDM_FORM__Company_Name_Already_Existed)
                .subscribe((val) => {
                    this.toasterService.pop(MessageModal.MessageType.warning, 'System', val);
                });
            this.store.dispatch(this.administrationActions.saveDocumentFormFailAction());
            return false;
        }

        if (this.formGroup.invalid || this.formDynamic?.invalid) {
            this.translateService
                .get(defaultLanguage.COMMON_LABEL__There_are_some_fields_are_invalid)
                .subscribe((val) => {
                    this.toasterService.pop(MessageModal.MessageType.warning, 'System', val);
                });
            this.store.dispatch(this.administrationActions.saveDocumentFormFailAction());
            return false;
        }

        return true;
    }
}
