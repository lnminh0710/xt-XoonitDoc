import {
    Component,
    OnInit,
    OnDestroy,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Injector,
    Inject,
    Output,
    EventEmitter,
} from '@angular/core';
import { Router } from '@angular/router';
import {
    AdministrationDocumentActions,
    AdministrationDocumentActionNames,
    CustomAction,
    GlobalSearchActions,
    ModuleActions,
} from '@app/state-management/store/actions';
import { AdministrationDocumentSelectors } from '@app/state-management/store/reducer';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import { ContactDetailRequestModel } from '@app/models/contact-document.model';
import { ToasterService } from 'angular2-toaster';
import { MessageModal, LocalStorageKey } from '@app/app.constants';
import { Actions, ofType } from '@ngrx/effects';
import { ModuleList } from '@app/pages/private/base';
import { filter, takeUntil } from 'rxjs/operators';
import { BaseMyDmFormComponent } from '@app/xoonit-share/processing-form/base/base-mydm-form.component';
import { ColumnDefinition } from '@app/models/common/column-definition.model';
import {
    IMaterialControlConfig,
    IAutocompleteMaterialControlConfig,
} from '@xn-control/xn-dynamic-material-control/interfaces/material-control-config.interface';
import { of } from 'rxjs';
import { ContactDetailFormModel } from '@app/models/administration-document/document-form/person-form.model';
import { Uti } from '../../../../../utilities';
import { XoonitHasContactFormComponent } from '../widget-mydm-form/components/xoonit-has-contact-form.component';
import {
    FormHasContactHandler,
    IFormHasContactHandler,
} from '@app/xoonit-share/processing-form/handlers/form-has-contact-handler.service';
import { FORM_HANDLER, IFormHandler } from '@app/xoonit-share/processing-form/handlers/mydm-form-handler.interface';
import { IconNames } from '@app/app-icon-registry.service';
enum FormControlNameEnum {
    COMPANY_NAME = 'Company',
    IS_GUARANTEE = 'IsGuarantee',
    GUARANTEEE_EXPIRY_DATE = 'GuranteeExpiryDate',
    INVOICE_DATE = 'InvoiceDate',
    GUARANTEE_HEADER = '**Guarantee**',
    CURRENCY = 'Currency',
}
@Component({
    selector: 'widget-contact-detail',
    templateUrl: './widget-contact-detail.component.html',
    styleUrls: ['./widget-contact-detail.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [{ provide: FORM_HANDLER, useClass: FormHasContactHandler }],
})
export class WidgetContactDeailComponent extends XoonitHasContactFormComponent implements OnInit, OnDestroy {
    processing = {
        notAllowSave: true,
        isLoading: false,
    };

    public IconNamesEnum = IconNames;
    public controls: IMaterialControlConfig[] = [];
    public formContact: FormGroup;
    private _companyAutoCompleteConfig: IAutocompleteMaterialControlConfig;
    private _currentIdPerson: string;
    private _currentIdPersonType: string;

    public isFullScreen = false;
    @Output() onMaximizeWidget = new EventEmitter<any>();

    constructor(
        protected router: Router,
        protected store: Store<AppState>,
        private action$: Actions,
        protected administrationActions: AdministrationDocumentActions,
        protected administrationSelectors: AdministrationDocumentSelectors,
        private moduleActions: ModuleActions,
        private fb: FormBuilder,
        private toastrService: ToasterService,
        protected injector: Injector,
        @Inject(FORM_HANDLER) private formHandler: FormHasContactHandler,
    ) {
        super(router, injector, FormControlNameEnum.COMPANY_NAME);
        this.setup();
    }

    ngOnInit(): void {
        this.initAction();
    }

    ngOnDestroy(): void {
        super.onDestroy();
    }

    protected configFormHasContactHandlerDependency(): IFormHasContactHandler {
        return this.formHandler;
    }

    public applyQRCode(): void {}

    public registerGetDetailFn(fn: () => ColumnDefinition[]): void {}

    public getColumnSettings(): void {}

    protected configFormHandlerDependency(): IFormHandler {
        return this.formHandler;
    }

    protected registerSubscriptions(): void {
        this.subscribeAction();
    }

    subscribeAction() {
        this.action$
            .pipe(
                ofType(GlobalSearchActions.ROW_DOUBLE_CLICK),
                filter((action: CustomAction) => this.isValidPayloadContactDetail(action)),
                takeUntil(super.getUnsubscriberNotifier()),
            )
            .subscribe((action: CustomAction) => {
                this.onGetContactDetail(action.payload);
            });

        // subscribe save action
        this.administrationSelectors
            .actionSuccessOfSubtype$(AdministrationDocumentActionNames.SAVE_CONTACT_DETAIL)
            .pipe(takeUntil(super.getUnsubscriberNotifier()))
            .subscribe((action: CustomAction) => {
                var payload = action.payload;
                if (!payload.isSuccess) {
                    this.saveContactFail();
                    return;
                }

                this.toastrService.pop(MessageModal.MessageType.success, 'System', `Save contact successfully!`);
                setTimeout(() => {
                    this.store.dispatch(this.administrationActions.globalSearchContactAction());
                    this.processing.notAllowSave = false;
                    this.processing.isLoading = false;
                    this.cdRef.detectChanges();
                }, 300);
            });
        this.administrationSelectors
            .actionFailedOfSubtype$(AdministrationDocumentActionNames.SAVE_CONTACT_DETAIL)
            .pipe(takeUntil(super.getUnsubscriberNotifier()))
            .subscribe((action: CustomAction) => {
                this.toastrService.pop(MessageModal.MessageType.error, 'System', `Cannot save contact!`);
                this.processing.notAllowSave = false;
                this.processing.isLoading = false;
                this.cdRef.detectChanges();
            });

        this.administrationSelectors
            .actionSuccessOfSubtype$(AdministrationDocumentActionNames.GET_CONTACT_DETAIL)
            .pipe(takeUntil(super.getUnsubscriberNotifier()))
            .subscribe((action: CustomAction) => {
                const payload = action.payload;
                const columnSettings = payload as ColumnDefinition[];
                this._currentIdPerson = columnSettings.find((x) => x.columnName === 'IdPerson')?.value;

                if (!columnSettings || !columnSettings.length) return;
                ///set Company To Header
                const companyName = columnSettings.find((x) => x.columnName === 'Company').value;
                this.store.dispatch(this.moduleActions.getCompany(companyName));
                const { controlConfigs, formGroup } = super.buildForm(columnSettings);
                this.controls.push(...controlConfigs);
                this.formContact = this.fb.group(formGroup);
                this.processing.notAllowSave = this._currentIdPerson ? false : true;
                this.listenCompanyNameBlur(this.formContact, this.controls, FormControlNameEnum.COMPANY_NAME).subscribe(
                    (val: FormControl) => {
                        this.store.dispatch(this.moduleActions.getCompany(val.value));
                    },
                );
                this.cdRef.detectChanges();
            });
    }

    private saveContactFail() {
        this.toastrService.pop(MessageModal.MessageType.error, 'System', `Cannot save contact!`);
        this.processing.notAllowSave = false;
        this.processing.isLoading = false;
        this.cdRef.detectChanges();
    }

    public shouldAddColumnToForm(columnSetting: ColumnDefinition): boolean {
        if (super.isColumnHeader(columnSetting)) {
            return false;
        }
        return true;
    }

    public configAutocompleteControl(autocompleteCtrl: IAutocompleteMaterialControlConfig): void {
        switch (autocompleteCtrl.formControlName) {
            case 'B00SharingCompany_Company':
                autocompleteCtrl.options = of([]);
                autocompleteCtrl.valueMemberOpt = () => 'B00SharingCompany_Company';
                autocompleteCtrl.displayMemberOpt = () => 'B00SharingCompany_Company';
                this._companyAutoCompleteConfig = autocompleteCtrl;
                break;
        }
    }

    initAction() {
        // get data from local storage
        const actions = JSON.parse(
            window.localStorage.getItem(
                LocalStorageKey.buildKey(LocalStorageKey.LocalStorageGSStepKey, Uti.defineBrowserTabId()),
            ),
        ) as CustomAction[];
        if (actions && this.isValidPayloadContactDetail(actions[0])) {
            this.onGetContactDetail(actions[0].payload);
            setTimeout(() => {
                window.localStorage.removeItem(
                    LocalStorageKey.buildKey(LocalStorageKey.LocalStorageGSStepKey, Uti.defineBrowserTabId()),
                );
            }, 2000);
        } else {
            this._currentIdPerson = null;
            this.store.dispatch(
                this.administrationActions.getContactDetailAction(<ContactDetailRequestModel>{
                    idPerson: null,
                    idPersonType: null,
                }),
            );
        }
        this.cdRef.detectChanges();
    }

    saveContactDetail() {
        this.processing.notAllowSave = true;
        this.processing.isLoading = true;
        this.cdRef.detectChanges();

        const data = Object.assign({}, this.formContact.value) as ContactDetailFormModel;
        this.store.dispatch(this.administrationActions.saveContactDetailAction(data));
    }

    public reload() {
        this.controls = [];
        this.cdRef.detectChanges();
        
        this.store.dispatch(
            this.administrationActions.getContactDetailAction(<ContactDetailRequestModel>{
                idPerson: this._currentIdPerson,
                idPersonType: this._currentIdPersonType,
            }),
        );
    }

    public expandWidget() {
        this.isFullScreen = !this.isFullScreen;
        this.onMaximizeWidget.emit({
            isMaximized: this.isFullScreen,
        });
    }

    private isValidPayloadContactDetail(action: CustomAction) {
        return (
            action.payload &&
            action.payload.selectedModule &&
            (action.payload.selectedModule.idSettingsGUI === ModuleList.Contact.idSettingsGUI ||
                action.payload.selectedModule.idSettingsGUI === ModuleList.AttachmentGlobalSearch.idSettingsGUI)
        );
    }

    private onGetContactDetail(payload: any) {
        const idPerson =
            payload.selectedModule.subModuleName === ModuleList.AttachmentGlobalSearch.moduleName &&
            payload.data.contacts
                ? payload.data.contacts[0]?.idPerson
                : payload.data.idPerson;
        const idPersonType =
            payload.selectedModule.subModuleName === ModuleList.AttachmentGlobalSearch.moduleName &&
            payload.data.contacts
                ? payload.data.contacts[0]?.idPersonType
                : payload.data.idPersonType;
        if (
            payload.selectedModule.subModuleName === ModuleList.AttachmentGlobalSearch.moduleName &&
            this._currentIdPerson === idPerson
        )
            return;

        if (this.formContact && Object.keys(this.formContact.controls).length) {
            this.controls = [];
            this.cdRef.detectChanges();
        }

        this._currentIdPersonType = idPersonType;
        this.store.dispatch(
            this.administrationActions.getContactDetailAction(<ContactDetailRequestModel>{
                idPerson,
                idPersonType,
            }),
        );
    }
}
