import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, Inject, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { IMyDMForm, IToolbarForm } from '@app/xoonit-share/processing-form/interfaces/mydm-form.interface';
import { AppState } from '@app/state-management/store';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import {
    AdministrationDocumentActions,
    AdministrationDocumentActionNames,
    CustomAction,
    ModuleActions,
} from '@app/state-management/store/actions';
import { AdministrationDocumentSelectors } from '@app/state-management/store/reducer';
import { AppErrorHandler } from '@app/services';
import { takeUntil, filter, take } from 'rxjs/operators';
import { ColumnDefinition } from '@app/models/common/column-definition.model';
import {
    IMaterialControlConfig,
    IAutocompleteMaterialControlConfig,
} from '@xn-control/xn-dynamic-material-control/interfaces/material-control-config.interface';
import { DocumentTreeModel } from '@app/models/administration-document/document-tree.payload.model';
import { DocumentContainerOcrStateModel } from '@app/state-management/store/models/administration-document/state/document-container-ocr.state.model';
import { Subject, of } from 'rxjs';
import { ExtractedDataFormModel } from '@app/models/administration-document/document-form/extracted-data-form.model';
import { ToasterService } from 'angular2-toaster';
import { MessageModal, DocumentProcessingTypeEnum } from '@app/app.constants';
import { TranslateService } from '@ngx-translate/core';
import { defaultLanguage } from '@app/app.resource';
import { ContactFormModel } from '@app/models/administration-document/document-form/contact-form.model';
import { Uti } from '@app/utilities';
import { SaveOtherDocumentForms } from '@app/state-management/store/models/administration-document/document-other.model.payload';
import { LoadContactSettingEnum } from '../../consts/load-contact-setting.enum';
import { cloneDeep, trim } from 'lodash-es';
import { MatDialog } from '@xn-control/light-material-ui/dialog';
import { SharingContactInformationModel } from '@app/models/administration-document/document-form/sharing-contact-information.model';
import { SharingContactDialogComponent } from '../sharing-contact-dialog/sharing-contact-dialog.component';
import { isObject, isString } from 'util';
import { OpenFormMethodEnum } from '../../actions/widget-mydm-form.actions';
import { FocusControlEvent } from '@xn-control/xn-dynamic-material-control/interfaces/focus-control-event.interface';
import { DocumentFormType } from '@app/models/administration-document/document-form/document-form-type.model';
import { IconNames } from '@app/app-icon-registry.service';
import { ISaveFormHandler } from '@app/xoonit-share/processing-form/interfaces/save-form-handler.interface';
import { ILookupCompanyBehavior } from '@app/xoonit-share/processing-form/interfaces/lookup-company-behavior.interface';
import { FORM_HANDLER, IFormHandler } from '@app/xoonit-share/processing-form/handlers/mydm-form-handler.interface';
import {
    FormHasContactHandler,
    IFormHasContactHandler,
} from '@app/xoonit-share/processing-form/handlers/form-has-contact-handler.service';
import { DynamicField } from '@app/xoonit-share/processing-form/interfaces/dynamic-field.interface';
import { XoonitHasContactFormComponent } from '../xoonit-has-contact-form.component';
import { FormStatus, IWidgetIsAbleToSave } from '@app/state-management/store/models/app-global/widget-is-able-to-save.payload.model';

enum FormControlNameEnum {
    COMPANY_NAME = 'Company',
}

@Component({
    selector: 'other-documents-form',
    templateUrl: 'other-documents-form.component.html',
    styleUrls: ['other-documents-form.component.scss'],
    providers: [{ provide: FORM_HANDLER, useClass: FormHasContactHandler }],
})
export class OtherDocumentsFormComponent
    extends XoonitHasContactFormComponent
    implements IMyDMForm<IToolbarForm>, ISaveFormHandler, ILookupCompanyBehavior, IWidgetIsAbleToSave, OnInit {
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

    public formOtherDocuments: FormGroup;
    public formContact: FormGroup;
    private allAddons: any = {};

    public switchToggleGuarantee: boolean;

    public svgIconClear = IconNames.WIDGET_MYDM_FORM_Reset;
    public svgIconEdit = IconNames.WIDGET_MYDM_FORM_Edit;
    public svgIconUndo = IconNames.WIDGET_MYDM_FORM_Undo;

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
        @Inject(FORM_HANDLER) private formHandler: FormHasContactHandler,
    ) {
        super(router, injector, FormControlNameEnum.COMPANY_NAME);
        this.setup();
    }

    protected registerSubscriptions() {
        this.administrationSelectors
            .actionSuccessOfSubtype$(AdministrationDocumentActionNames.GET_OTHER_DOCUMENTS_COLUMN_SETTING)
            .pipe(takeUntil(this.onDetachForm$))
            .subscribe((action: CustomAction) => {
                const payload = action.payload;
                const columnSettings = payload.item as ColumnDefinition[];
                if (!columnSettings || !columnSettings.length) return;

                this.columnSettings.push(...columnSettings);

                const { controlConfigs, formGroup } = this.formHandler.buildForm(columnSettings);
                this.controls.push(...controlConfigs);
                this.formOtherDocuments = this.fb.group(formGroup);

                super.publishEventFormIntialized(!!this.formContact && !!this.formOtherDocuments);
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

                super.publishEventFormIntialized(!!this.formContact && !!this.formOtherDocuments);
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
                    ...(this.formOtherDocuments?.controls || []),
                });
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

        // this._subscribeExtractedDataFromOcrUntilHasData();

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
                super.assignFormControlToModel(allAddons, this.allAddons);
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
        this.store.dispatch(this.administrationActions.getOtherDocumentsColumnSetting());
        this.store.dispatch(this.administrationActions.getBankContactColumnSetting(LoadContactSettingEnum.CONTACT));
    }

    public reset(): void {
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
        this._cacheColumnIds(this.columnSettings, this._cacheIds);
        this.listenCompanyNameChanges(this.formGroup, this.controls, FormControlNameEnum.COMPANY_NAME).subscribe(
            (val) => {
                this.formHandler.lookupCompanyName(val);
            },
        );
        this.formHandler.listenCompanyNameBlur(this.controls);
        this.formHandler.disabledSubContactField(this.formGroup, super.buildContactModel());

        this.cdRef.detectChanges();
    }

    public applyQRCode() {
        this.formHandler.applyQRCode((invoice) => {
            if (invoice) {
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

        if (this.formContact) {
            contactCtrls = Uti.assignIntersection(this.formGroup.controls, this.formContact.controls) as {
                [key: string]: FormControl;
            };
        }

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
            otherDocuments: {
                idDocumentContainerScans: this.documentContainerOcr.IdDocumentContainerScans.toString(),
                idDocumentTree: this._cacheIds.IdDocumentTree || this.folder.idDocument.toString(),
                ...(this.allAddons || {})
            },

            personContact: this.objHasValue(dataFormContact) ? dataFormContact : null,
            dynamicFields: dynamicFields,
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
