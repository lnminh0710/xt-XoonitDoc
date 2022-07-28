import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { FormGroup, FormArray, FormBuilder } from '@angular/forms';
import { WidgetDocumentForm } from '../widget-document-form.component';
import { DynamicFormData } from '../control-model/dynamic-form-data.model';
import { TextControl } from '../control-model/text-control.model';
import { AppState } from '@app/state-management/store';
import { Store } from '@ngrx/store';
import {
    AdministrationDocumentActions,
    AdministrationDocumentActionNames,
} from '@app/state-management/store/actions/administration-document';
import { AdministrationDocumentSelectors } from '@app/state-management/store/reducer';
import { FieldFormOnFocusModel } from '@app/state-management/store/models/administration-document/field-form-on-focus.model.payload';
import { Uti } from '@app/utilities';
import {
    DocumentFormNameEnum,
    DocumentProcessingTypeEnum,
    DocumentGroupFieldEnum,
    DocumentTabIddEnum,
    DocumentFormContactName,
} from '@app/app.constants';
import { ExtractedDataFormModel } from '@app/models/administration-document/document-form/extracted-data-form.model';
import { personContactDisplayNameConstant, documentContactTypeList } from '../control-model/document.enum';
import { cloneDeep } from 'lodash-es';
import { BaseControl } from '../control-model/base-control.model';
import { ExtractedDataOcrState } from '@app/state-management/store/models/administration-document/state/extracted-data-ocr.state.model';
import { Router } from '@angular/router';
import { isBoolean } from 'lodash-es';
import { CustomAction } from '@app/state-management/store/actions';
import { CapturedFormModeEnum } from '@app/models/administration-document/document-form/captured-form-mode.enum';
import { PersonFormModel } from '@app/models/administration-document/document-form/person-form.model';
import { Observable } from 'rxjs';
import { TabSummaryModel } from '@app/models';
import * as tabSummaryReducer from '@app/state-management/store/reducer/tab-summary';
import { AppErrorHandler } from '@app/services';
import { ContactFormColleague } from '@app/state-management/store/models/administration-document/captured-form-colleague.payload';
import { CapturedFormElement } from '@app/state-management/store/models/administration-document/ocr-data-visitor-pattern/captured-form-element.payload';
import { filter, takeUntil } from 'rxjs/operators';

@Component({
    selector: 'widget-kontakt',
    styleUrls: ['./widget-kontakt.component.scss'],
    templateUrl: './widget-kontakt.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidgetKontaktComponent extends WidgetDocumentForm implements OnInit, OnDestroy, AfterViewInit {
    private _fieldFormOnFocus: FieldFormOnFocusModel;
    private _contactTypeObj: any;
    private _extractedData: ExtractedDataFormModel[];
    private isShowPersonal = false;
    private _isUpdateMode = false;
    private _tabHeaderDataModel: Observable<TabSummaryModel[]>;
    private _tabWidget: TabSummaryModel;
    private _contactFormColleague: ContactFormColleague;
    private _contactCapturedFormElement: CapturedFormElement;

    public dynamicFormList: DynamicFormData[] = [];
    public formGroup: FormGroup;
    public formArray: FormArray;
    public placeData: TextControl[] = [];

    // set layout for special case
    private colNameZip = 'B00SharingAddress_Zip';
    private colNamePlace = 'B00SharingAddress_Place';

    constructor(
        protected router: Router,
        protected store: Store<AppState>,
        private fb: FormBuilder,
        protected administrationActions: AdministrationDocumentActions,
        protected administrationSelectors: AdministrationDocumentSelectors,
        private cdRef: ChangeDetectorRef,
        private appErrorHandler: AppErrorHandler,
    ) {
        super(router, store, administrationActions, administrationSelectors, DocumentFormNameEnum.WIDGET_CONTACT, null);
        this.isFirstLoading = true;

        this._tabHeaderDataModel = store.select(
            (state) => tabSummaryReducer.getTabSummaryState(state, this.ofModule.moduleNameTrim).tabs,
        );

        this._contactFormColleague = new ContactFormColleague();
        this._contactFormColleague.notify = (toggle: boolean) => {
            this.showPersonalKontaktForm(toggle);
        };
        this.store.dispatch(
            this.administrationActions.registerLinkConnectionContactFormColleague(this._contactFormColleague),
        );

        this._contactCapturedFormElement = new CapturedFormElement(DocumentFormNameEnum.WIDGET_CONTACT);
        this._contactCapturedFormElement.notifyOnAccept = () => {
            this.setExtractedOcrData(this._contactCapturedFormElement.ocrData);
        };
        this.store.dispatch(this.administrationActions.registerTabFormElement(this._contactCapturedFormElement));
        this.onSubcribeAction();
    }

    ngOnInit(): void {}

    ngOnDestroy(): void {
        super.onDestroy();
        Uti.unsubscribe(this);
    }

    ngAfterViewInit(): void {}

    onSubcribeAction() {
        this.administrationSelectors.documentContainerOcr$
            .pipe(
                filter((documentContainerOcr) => !!documentContainerOcr),
                takeUntil(super.getUnsubscriberNotifier()),
            )
            .subscribe((documentContainerOcr) => {
                // if (
                //     this._documentContainerOcr &&
                //     this._documentContainerOcr.DocumentType === documentContainerOcr.DocumentType
                // ) {
                //     return;
                // }
                // this._documentContainerOcr = documentContainerOcr;
                // this._contactTypeObj = documentContactTypeList.find(
                //     (x) => x.type === documentContainerOcr.DocumentType,
                // );

                // this.documentProcessingType = documentContainerOcr.DocumentType;
                super.onChangeDocumentContainer(documentContainerOcr);
                this._contactTypeObj = documentContactTypeList.find(
                    (x) => x.type === documentContainerOcr.DocumentType,
                );
                if (
                    !this._prevDocumentContainerOrc ||
                    (this._prevDocumentContainerOrc &&
                        this._prevDocumentContainerOrc.DocumentType !== documentContainerOcr.DocumentType)
                ) {
                    this.getDataSettingColumnBasedOnDocumentType(this.documentProcessingType);
                }
            });

        // get contact and new form control
        this.administrationSelectors
            .actionSuccessOfSubtype$(
                AdministrationDocumentActionNames.GET_PERSON_CONTACT_COLUMN_SETTING_OF_DOCUMENT_TYPE,
            )
            .pipe(
                takeUntil(super.getUnsubscriberNotifier())
            )
            .subscribe((action) => {
                this._extractedData = [];
                const columnSettingResponse = this.generateColumnSetting̣(action, personContactDisplayNameConstant);
                this.defaultListControl = columnSettingResponse.listControl;

                this.newFormAndExtractData();
            });

        this.administrationSelectors.detailedDocumentDataState$
            .pipe(
                filter((detailedDocumentDataState) => detailedDocumentDataState && detailedDocumentDataState.length > 0),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((detailedDocumentDataState) => {
                this._extractedDataOcrState = detailedDocumentDataState.map((item) => item.mapToExtractedData());
                this.setExtractedOcrData(this._extractedDataOcrState);
            });

        // this.administrationSelectors.extractedDataFromOcr$
        //     .filter((extractedDataFromOcr) => extractedDataFromOcr && extractedDataFromOcr.length > 0)
        //     .takeUntil(super.getUnsubscriberNotifier())
        //     .subscribe((extractedDataFromOcr) => {
        //         super.setEmptyExtractedData(this._extractedData);
        //         this._extractedDataOcrState = extractedDataFromOcr;

        //         if (!this.formGroup || !this._documentContainerOcr) return;

        //         for (let index = 0; index < this._contactTypeObj.data.length; index++) {
        //             const element = this._contactTypeObj.data[index];
        //             this.mapExtractedDataIntoForm(
        //                 this._extractedDataOcrState,
        //                 this.formArray.controls[index] as FormGroup,
        //                 element.prefix,
        //                 this._extractedData,
        //             );
        //         }

        //         this.setBadgeColor();
        //         const hasData = this.isPersonalFormHasData();
        //         this.togglePersonContactIconOnTab(hasData);

        //         this.store.dispatch(
        //             this.administrationActions.initialFormState({
        //                 documentProcessingType: this._documentContainerOcr.DocumentType,
        //                 formState: {
        //                     data: this._extractedData,
        //                     form: this.formGroup,
        //                     documentFormName: DocumentFormNameEnum.WIDGET_CONTACT,
        //                     formatDataBeforeSaving: this.formatDataBeforeSaving.bind(this),
        //                     validateData: this.validateData.bind(this),
        //                     onInit: true,
        //                 },
        //             }),
        //         );

        //         this.cdRef.markForCheck();
        //     });

        this.administrationSelectors.fieldFormOnFocus$
            .pipe(
                filter((fieldFormOnFocus) => !!fieldFormOnFocus),
                takeUntil(super.getUnsubscriberNotifier()),
            )
            .subscribe((data: FieldFormOnFocusModel) => {
                this._fieldFormOnFocus = data;
            });

        this.administrationSelectors.documentsState$
            .pipe(
                filter((data) => data && data.documentOnUpdate.formName === DocumentFormNameEnum.WIDGET_CONTACT),
                takeUntil(super.getUnsubscriberNotifier()),
            )
            .subscribe((documentsState) => {
                if (!this._extractedData) {
                    return;
                }
                const currentData = this._extractedData.find(
                    (item) => item.OriginalColumnName === documentsState.documentOnUpdate.originalColumnName,
                );
                if (!currentData) return;

                const newDataState = documentsState.documentsForm[this._documentContainerOcr.DocumentType].formsState[
                    DocumentFormNameEnum.WIDGET_CONTACT
                ].data.find((item) => item.OriginalColumnName === documentsState.documentOnUpdate.originalColumnName);

                this.setValueOnForm(currentData, newDataState, this._fieldFormOnFocus);

                this.setBadgeColor();
                this.cdRef.markForCheck();
            });

        this.administrationSelectors.capturedFormMode$
            .pipe(
                takeUntil(this.getUnsubscriberNotifier())
            )
            .subscribe((mode: CapturedFormModeEnum) => {
                switch (mode) {
                    case CapturedFormModeEnum.Updated:
                        this._isUpdateMode = true;
                        break;

                    case CapturedFormModeEnum.Created:
                    default:
                        this._isUpdateMode = false;
                        break;
                }
            });

        this._tabHeaderDataModel
            .pipe(
                filter((tabHeaders) => tabHeaders && tabHeaders.length >= 0),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((tabHeaderDataModel: TabSummaryModel[]) => {
                this.appErrorHandler.executeAction(() => {
                    this._tabWidget = tabHeaderDataModel.find((tab) => tab.tabSummaryInfor.tabID === 'Kontakt');
                });
            });

        this.administrationSelectors
            .actionOfType$(AdministrationDocumentActionNames.SET_EMPTY_FORM_STATE)
            .pipe(
                takeUntil(this.getUnsubscriberNotifier())
            )
            .subscribe((_) => {
                this.setEmptyExtractedData(this._extractedData);
                if (!this.formArray) {
                    return;
                }
                this.setEmptyDataForm(this.formGroup);
                this.setBadgeColor();
            });

        this.administrationSelectors
            .actionOfType$(AdministrationDocumentActionNames.RESET_DOCUMENT)
            .pipe(
                filter((action: CustomAction) => action.payload === DocumentTabIddEnum.CONTACT),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((action) => {
                if (!this._isUpdateMode) {
                    this.clearFormAction();
                    return;
                }

                const data = cloneDeep(this.defaultData);
                this.formGroup.setValue(data);
                this.setBadgeColor();
                this.cdRef.detectChanges();
            });

        this.administrationSelectors
            .actionOfType$(AdministrationDocumentActionNames.CLEAR_DOCUMENT)
            .pipe(
                filter((action: CustomAction) => action.payload === DocumentTabIddEnum.CONTACT),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((action) => {
                this.clearFormAction();
            });

        this.administrationSelectors.folder$
            .pipe(
                filter((folder) => !!folder),
                takeUntil(super.getUnsubscriberNotifier()),
            )
            .subscribe((folder) => {
                this._folder = folder;
            });

        this.administrationSelectors
            .actionSuccessOfSubtype$(
                AdministrationDocumentActionNames.SAVE_DOCUMENT_INVOICE_FORMS,
                AdministrationDocumentActionNames.SAVE_DOCUMENT_CONTRACT_FORMS,
                AdministrationDocumentActionNames.SAVE_OTHER_DOCUMENT_FORMS,
            )
            .pipe(
                takeUntil(this.getUnsubscriberNotifier())
            )
            .subscribe((action) => {
                this.defaultData = cloneDeep(this.formGroup.value);
            });
    }

    private showPersonalKontaktForm(isShow: boolean) {
        this.isShowPersonal = isShow;
        this.cdRef.detectChanges();
    }

    togglePersonContactIconOnTab(hasData: boolean) {
        this._contactFormColleague.sendToggle(hasData);
        this.showPersonalKontaktForm(hasData);
    }

    private getDataSettingColumnBasedOnDocumentType(documentTypeProcessing: DocumentProcessingTypeEnum) {
        switch (documentTypeProcessing) {
            case DocumentProcessingTypeEnum.INVOICE:
                this.store.dispatch(
                    this.administrationActions.getPersonContactColumnSettingBasedOnDocumentType('invoice'),
                );
                return;

            case DocumentProcessingTypeEnum.CONTRACT:
                this.store.dispatch(
                    this.administrationActions.getPersonContactColumnSettingBasedOnDocumentType('contract'),
                );
                return;

            case DocumentProcessingTypeEnum.OTHER_DOCUMENT:
                this.store.dispatch(
                    this.administrationActions.getPersonContactColumnSettingBasedOnDocumentType('otherdocuments'),
                );
                return;

            default:
                return;
        }
    }

    switchData(currentIndex: number) {
        const listKontakt = [...this.formArray.value];
        const contact_1 = listKontakt[0];
        const contact_2 = listKontakt[1];

        const newContact_1 = {};
        const newContact_2 = {};

        for (const key in contact_2) {
            const newKey = key.replace(this._contactTypeObj.data[1].prefix, this._contactTypeObj.data[0].prefix);
            newContact_1[newKey] = contact_2[key];
        }

        for (const key in contact_1) {
            const newKey = key.replace(this._contactTypeObj.data[0].prefix, this._contactTypeObj.data[1].prefix);
            newContact_2[newKey] = contact_1[key];
        }

        this.formArray.setValue([newContact_1, newContact_2]);
    }

    initColorBadge() {
        for (let index = 0; index < this.formArray.length; index++) {
            const element = this.formArray.value[index];
        }
    }

    initFunction() {}

    private newFormAndExtractData() {
        this.dynamicFormList = [];
        this.placeData = [];
        this.numberField = [];
        this._extractedData = [];

        for (let index = 0; index < this._contactTypeObj.data.length; index++) {
            const element = this._contactTypeObj.data[index];
            const contact = new DynamicFormData();
            contact.nameForm = index === 0 ? DocumentFormContactName.MAIN_CONTACT : DocumentFormContactName.SUB_CONTACT;

            // change original column name with suffix
            // contact.listControl = this.cloneControlsFromDefaultControlsWithSuffixOriginalColumnName(this.defaultListControl, element.prefix)
            //     .sort((a, b) => a.orderBy - b.orderBy);
            const _defaultListControl = this.defaultListControl.filter((ctrl) => {
                if (ctrl.originalColumnName.lastIndexOf(element.prefix) >= 0) return true;

                return false;
            });

            contact.listControl = _defaultListControl.sort((a, b) => a.orderBy - b.orderBy);

            this.dynamicFormList.push(contact);
        }

        if (this.dynamicFormList.length) {
            this.formArray = this.fb.array([]);
            this.dynamicFormList.forEach((element) => {
                const form = this.createFormGroupWithControls(element.listControl);
                this.formArray.push(form);
                this.placeData.push(
                    element.listControl.find((x) => x.originalColumnName.includes(this.colNamePlace)) as TextControl,
                );
                this.numberField.push(this.countPropertiesObject(form.value));

                for (const control of element.listControl) {
                    this._extractedData.push({
                        GroupField: DocumentGroupFieldEnum.CONTACT,
                        ColumnName: control.columnName,
                        OriginalColumnName: control.originalColumnName,
                        Value: form.controls[control.originalColumnName]
                            ? form.controls[control.originalColumnName].value
                            : null,
                        WordsCoordinates: null,
                        DataType: control.dataType,
                    });
                }
            });
            this.formGroup = this.fb.group({
                controls: this.formArray,
            });

            for (let index = 0; index < this._contactTypeObj.data.length; index++) {
                const element = this._contactTypeObj.data[index];
                this.mapExtractedDataIntoForm(
                    this._extractedDataOcrState,
                    this.formArray.controls[index] as FormGroup,
                    element.prefix,
                    this._extractedData,
                );
            }

            if (!this._documentContainerOcr) return;

            this.setBadgeColor();
            const hasData = this.isPersonalFormHasData();
            this.togglePersonContactIconOnTab(hasData);

            this.store.dispatch(
                this.administrationActions.initialFormState({
                    documentProcessingType: this._documentContainerOcr.DocumentType,
                    formState: {
                        data: this._extractedData,
                        form: this.formGroup,
                        documentFormName: DocumentFormNameEnum.WIDGET_CONTACT,
                        formatDataBeforeSaving: this.formatDataBeforeSaving.bind(this),
                        validateData: this.validateData.bind(this),
                        onInit: true,
                    },
                }),
            );

            this.cdRef.markForCheck();

            this.initColorBadge();
            this.detectChangeValue(this.formGroup, 0);
        }
        this.cdRef.detectChanges();

        this.isFirstLoading = false;
    }

    private mapExtractedDataIntoForm(
        extractedDataFromOcr: ExtractedDataOcrState[],
        form: FormGroup,
        suffixOriginalColumnName: string,
        extractedDataList: ExtractedDataFormModel[],
    ): void {
        super.setEmptyDataForm(form, ['typeContact']);
        if (!extractedDataFromOcr || !extractedDataFromOcr.length) return;

        let found = false;

        for (let i = 0; i < extractedDataFromOcr.length; i++) {
            const data = { ...extractedDataFromOcr[i] };

            if (!this._isUpdateMode) {
                data.OriginalColumnName = data.OriginalColumnName + '_' + suffixOriginalColumnName;
            }

            found = this.mapFormFieldAndSetValue(form, data);
            if (!found) continue;

            this.mapDataOcrStateToExtractedDataModel(data, extractedDataList);
        }
        this.defaultData = cloneDeep(this.formGroup.value);
    }

    private mapFormFieldAndSetValue(form: FormGroup, data: ExtractedDataOcrState): boolean {
        if (!form.controls[data.OriginalColumnName]) return false;

        form.controls[data.OriginalColumnName].setValue(data.Value || form.controls[data.OriginalColumnName].value, {
            emitEvent: false,
        });
        return true;
    }

    // clone all controls from default controls list by new original column name with adding suffix
    private cloneControlsFromDefaultControlsWithSuffixOriginalColumnName(
        controlsList: BaseControl<any>[],
        suffixName: string,
    ): any[] {
        return controlsList.map((ctrl) => {
            const newCtrl = cloneDeep(ctrl) as BaseControl<any>;
            newCtrl.originalColumnName = newCtrl.originalColumnName + '_' + suffixName;
            return newCtrl;
        });
    }

    private formatDataBeforeSaving(): any {
        const hostPerson = new PersonFormModel();
        const privatePerson = new PersonFormModel();

        const suffixHostPersonName = this._contactTypeObj.data[0].prefix;
        const suffixPrivatePersonName = this._contactTypeObj.data[1].prefix;

        const normalizeOriginalColumnName = (originalColumnName) =>
            originalColumnName[0].toLowerCase() + originalColumnName.substring(1, originalColumnName.lastIndexOf('_'));
        const getValue = (value: string) => {
            if (isBoolean(value)) {
                value = value ? '1' : '0';
            }
            return value;
        };

        this._extractedData
            .filter((data) => data.OriginalColumnName.lastIndexOf(suffixHostPersonName) >= 0)
            .forEach((data) => {
                const normalizedOriginalColumnName = normalizeOriginalColumnName(data.OriginalColumnName);
                if (hostPerson.hasOwnProperty(normalizedOriginalColumnName)) {
                    hostPerson[normalizedOriginalColumnName] = getValue(data.Value);
                }
            });

        if (!this.isShowPersonal) return { hostPerson, privatePerson: null };

        this._extractedData
            .filter((data) => data.OriginalColumnName.lastIndexOf(suffixPrivatePersonName) >= 0)
            .forEach((data) => {
                const normalizedOriginalColumnName = normalizeOriginalColumnName(data.OriginalColumnName);
                if (privatePerson.hasOwnProperty(normalizedOriginalColumnName)) {
                    privatePerson[normalizedOriginalColumnName] = getValue(data.Value);
                }
            });

        return { hostPerson, privatePerson };
    }

    validateData(): boolean {
        const isValid = super.validateAllControlsAsTouched(this.formGroup, (ctrl) => {
            ctrl.markAsDirty({ onlySelf: true });
        });
        this.cdRef.detectChanges();

        return isValid;
    }

    private setBadgeColor() {
        const badgeFunc = this.getBadgeTabForm(this.formArray.controls[0] as FormGroup);
        badgeFunc(this._tabWidget);
    }

    private isPersonalFormHasData() {
        let hasData = false;
        Uti.iterateFormControl(this.formArray.controls[1], (ctrl, ctrlName) => {
            if (hasData) return;

            if (isBoolean(ctrl.value)) {
                return;
            }
            if (ctrl.value && ctrl.value.length > 0) {
                hasData = true;
            }
        });

        return hasData;
    }

    private setExtractedOcrData(ocrData: ExtractedDataOcrState[]) {
        super.setEmptyExtractedData(this._extractedData);
        this._extractedDataOcrState = ocrData;

        if (!this.formGroup || !this._documentContainerOcr) return;

        for (let index = 0; index < this._contactTypeObj.data.length; index++) {
            const element = this._contactTypeObj.data[index];
            this.mapExtractedDataIntoForm(
                this._extractedDataOcrState,
                this.formArray.controls[index] as FormGroup,
                element.prefix,
                this._extractedData,
            );
        }

        this.setBadgeColor();
        const hasData = this.isPersonalFormHasData();
        this.togglePersonContactIconOnTab(hasData);

        this.store.dispatch(
            this.administrationActions.initialFormState({
                documentProcessingType: this._documentContainerOcr.DocumentType,
                formState: {
                    data: this._extractedData,
                    form: this.formGroup,
                    documentFormName: DocumentFormNameEnum.WIDGET_CONTACT,
                    formatDataBeforeSaving: this.formatDataBeforeSaving.bind(this),
                    validateData: this.validateData.bind(this),
                    onInit: true,
                },
            }),
        );

        this.cdRef.markForCheck();
    }

    private clearFormAction() {
        this.setEmptyDataValueOfFormAndExtractedData(this.formGroup, this._extractedData);
        this.setBadgeColor();
    }
}
