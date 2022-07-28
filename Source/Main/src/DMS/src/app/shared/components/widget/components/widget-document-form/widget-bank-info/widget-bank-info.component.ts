import {
    Component,
    OnInit,
    OnDestroy,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    AfterViewInit,
    ViewChild,
    TemplateRef,
    Output,
    EventEmitter,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { WidgetDocumentForm } from '../widget-document-form.component';
import { DynamicFormData } from '../control-model/dynamic-form-data.model';
import { RadioToggleControl } from '../control-model/radio-toggle.model';
import { AppState } from '@app/state-management/store';
import { Store } from '@ngrx/store';
import {
    AdministrationDocumentActions,
    AdministrationDocumentActionNames,
} from '@app/state-management/store/actions/administration-document';
import { AdministrationDocumentSelectors } from '@app/state-management/store/reducer';
import {
    DocumentFormNameEnum,
    DocumentProcessingTypeEnum,
    DocumentGroupFieldEnum,
    DocumentTabIddEnum,
} from '@app/app.constants';
import {
    contactModeEnum,
    communicationTypeSettingEnum,
    communicationTypeDisplayNameConstant,
    personContactDisplayNameConstant,
} from '../control-model/document.enum';
import { ExtractedDataFormModel } from '@app/models/administration-document/document-form/extracted-data-form.model';
import { FieldFormOnFocusModel } from '@app/state-management/store/models/administration-document/field-form-on-focus.model.payload';
import { ExtractedDataOcrState } from '@app/state-management/store/models/administration-document/state/extracted-data-ocr.state.model';
import { Router } from '@angular/router';
import { isBoolean, cloneDeep } from 'lodash-es';
import { CustomAction } from '@app/state-management/store/actions';
import { CapturedFormModeEnum } from '@app/models/administration-document/document-form/captured-form-mode.enum';
import { PersonBankFormModel } from '@app/models/administration-document/document-form/person-bank-form.model';
import { TabSummaryModel } from '@app/models';
import { Observable } from 'rxjs';
import * as tabSummaryReducer from '@app/state-management/store/reducer/tab-summary';
import { AppErrorHandler } from '@app/services';
import { DocumentTreeModel } from '@app/models/administration-document/document-tree.payload.model';
import { CapturedFormElement } from '@app/state-management/store/models/administration-document/ocr-data-visitor-pattern/captured-form-element.payload';
import { takeUntil, filter } from 'rxjs/operators';

@Component({
    selector: 'widget-bank-info',
    styleUrls: ['./widget-bank-info.component.scss'],
    templateUrl: './widget-bank-info.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidgetBankInfoComponent extends WidgetDocumentForm implements OnInit, OnDestroy, AfterViewInit {
    private _extractedData: ExtractedDataFormModel[];
    private _fieldFormOnFocus: FieldFormOnFocusModel;
    private _isUpdateMode = false;
    private _tabHeaderDataModel: Observable<TabSummaryModel[]>;
    private _tabWidget: TabSummaryModel;
    private _bankCapturedFormElement: CapturedFormElement;

    public data: DynamicFormData = new DynamicFormData();
    public form: FormGroup;

    constructor(
        protected router: Router,
        protected store: Store<AppState>,
        protected administrationActions: AdministrationDocumentActions,
        protected administrationSelectors: AdministrationDocumentSelectors,
        private cdRef: ChangeDetectorRef,
        private appErrorHandler: AppErrorHandler,
    ) {
        super(router, store, administrationActions, administrationSelectors, DocumentFormNameEnum.WIDGET_BANK, null);
        this.isFirstLoading = true;
        this._tabHeaderDataModel = store.select(
            (state) => tabSummaryReducer.getTabSummaryState(state, this.ofModule.moduleNameTrim).tabs,
        );
        this._bankCapturedFormElement = new CapturedFormElement(DocumentFormNameEnum.WIDGET_BANK);
        this._bankCapturedFormElement.notifyOnAccept = () => {
            this.setExtractedOcrData(this._bankCapturedFormElement.ocrData);
        };
        this.store.dispatch(this.administrationActions.registerTabFormElement(this._bankCapturedFormElement));

        this.onSubcribeAction();
    }

    ngOnInit(): void {
        this.store.dispatch(this.administrationActions.getBankContactColumnSetting(contactModeEnum.bank));
    }

    ngOnDestroy(): void {
        super.onDestroy();
    }

    ngAfterViewInit(): void {}

    onSubcribeAction() {
        this.administrationSelectors.documentContainerOcr$
            .pipe(
                filter((documentContainerOcr) => !!documentContainerOcr),
                takeUntil(super.getUnsubscriberNotifier()),
            )
            .subscribe((documentContainerOcr) => {
                super.onChangeDocumentContainer(documentContainerOcr);
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
        //         // console.log('widget-bank-info', extractedDataFromOcr);
        //         super.setEmptyExtractedData(this._extractedData);
        //         this._extractedDataOcrState = extractedDataFromOcr;

        //         if (!this.form || !this._documentContainerOcr) {
        //             return;
        //         }

        //         this.mapExtractedDataIntoForm(this._extractedDataOcrState, this.form, this._extractedData);

        //         // console.log(`widget-bank: subscribe state on 2nd times to fire the action initialFormState`, {
        //         //     documentProcessingType: this._documentContainerOcr.DocumentType,
        //         //     formState: {
        //         //         data: this._extractedData,
        //         //         form: this.form,
        //         //         documentFormName: DocumentFormNameEnum.WIDGET_BANK,
        //         //         formatDataBeforeSaving: this.formatDataBeforeSaving.bind(this),
        //         //         validateData: this.validateData.bind(this),
        //         //     },
        //         // });
        //         this.setBadgeColor();
        //         this.store.dispatch(
        //             this.administrationActions.initialFormState({
        //                 documentProcessingType: this._documentContainerOcr.DocumentType,
        //                 formState: {
        //                     data: this._extractedData,
        //                     form: this.form,
        //                     documentFormName: DocumentFormNameEnum.WIDGET_BANK,
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
            .subscribe((fieldFormOnFocus) => {
                this._fieldFormOnFocus = fieldFormOnFocus;
            });

        this.administrationSelectors.documentsState$
            .pipe(
                filter(
                    (documentsState) =>
                        documentsState &&
                        documentsState.documentOnUpdate.documentType === DocumentProcessingTypeEnum.INVOICE &&
                        documentsState.documentOnUpdate.formName === DocumentFormNameEnum.WIDGET_BANK,
                ),
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
                    DocumentFormNameEnum.WIDGET_BANK
                ].data.find((item) => item.OriginalColumnName === documentsState.documentOnUpdate.originalColumnName);

                this.setValueOnForm(currentData, newDataState, this._fieldFormOnFocus);

                this.setBadgeColor();
                this.cdRef.markForCheck();
            });

        // get contact and new form control
        this.administrationSelectors
            .actionSuccessOfSubtype$(AdministrationDocumentActionNames.GET_BANK_CONTACT_COLUMN_SETTING)
            .pipe(
                takeUntil(super.getUnsubscriberNotifier())
            )
            .subscribe((action) => {
                const columnSettingResponse = this.generateColumnSetting̣(action, personContactDisplayNameConstant);
                this.defaultListControl = columnSettingResponse.listControl;

                this.data.nameForm = 'Zahlungsinformationen';
                this.data.listControl = this.defaultListControl.sort((a, b) => a.orderBy - b.orderBy);

                this.form = this.createFormGroupWithControls(this.data.listControl);
                this.numberField.push(this.countPropertiesObject(this.form.value));
                // this.setColorBadge(this.form.value, 0);
                this.detectChangeValue(this.form, 0);

                this._extractedData = [];
                for (const control of [...this.data.listControl]) {
                    this._extractedData.push({
                        GroupField: DocumentGroupFieldEnum.BANK,
                        ColumnName: control.columnName,
                        OriginalColumnName: control.originalColumnName,
                        Value: this.form.controls[control.originalColumnName]
                            ? this.form.controls[control.originalColumnName].value
                            : null,
                        WordsCoordinates: null,
                        DataType: control.dataType,
                    });
                }

                this.cdRef.detectChanges();
                // console.log(`widget-bank: after get GET_BANK_CONTACT_COLUMN_SETTING: create new form control`, this.form, this._extractedData);
                this.isFirstLoading = false;
                // console.log(`set isFirstLoading to false: ${this.isFirstLoading}`);

                if (!this._documentContainerOcr) {
                    // console.log(`widget-bank: after get GET_BANK_CONTACT_COLUMN_SETTING but this._documentContainerOcr is null`);
                    return;
                }

                this.mapExtractedDataIntoForm(this._extractedDataOcrState, this.form, this._extractedData);
                // console.log(`widget-bank: init componnet on the first times to fire the action initialFormState`, {
                //     documentProcessingType: this._documentContainerOcr.DocumentType,
                //     formState: {
                //         data: this._extractedData,
                //         form: this.form,
                //         documentFormName: DocumentFormNameEnum.WIDGET_BANK,
                //         formatDataBeforeSaving: this.formatDataBeforeSaving.bind(this),
                //         validateData: this.validateData.bind(this),
                //     },
                // });
                this.setBadgeColor();
                this.store.dispatch(
                    this.administrationActions.initialFormState({
                        documentProcessingType: this._documentContainerOcr.DocumentType,
                        formState: {
                            data: this._extractedData,
                            form: this.form,
                            documentFormName: DocumentFormNameEnum.WIDGET_BANK,
                            formatDataBeforeSaving: this.formatDataBeforeSaving.bind(this),
                            validateData: this.validateData.bind(this),
                            onInit: true,
                        },
                    }),
                );

                this.cdRef.markForCheck();
            });

        this._tabHeaderDataModel
            .pipe(
                filter((tabHeaders) => tabHeaders && tabHeaders.length >= 0),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((tabHeaderDataModel: TabSummaryModel[]) => {
                this.appErrorHandler.executeAction(() => {
                    this._tabWidget = tabHeaderDataModel.find((tab) => tab.tabSummaryInfor.tabID === 'Bank');
                });
            });

        this.administrationSelectors
            .actionOfType$(AdministrationDocumentActionNames.SET_EMPTY_FORM_STATE)
            .pipe(
                takeUntil(this.getUnsubscriberNotifier())
            )
            .subscribe((_) => {
                this.clearFormAction();
            });

        this.administrationSelectors
            .actionOfType$(AdministrationDocumentActionNames.RESET_DOCUMENT)
            .pipe(
                filter((action: CustomAction) => action.payload === DocumentTabIddEnum.BANK),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((action) => {
                if (!this._isUpdateMode) {
                    this.clearFormAction();
                    return;
                }

                const data = cloneDeep(this.defaultData);
                this.form.setValue(data);
                this.setBadgeColor();
                this.cdRef.detectChanges();
            });

        this.administrationSelectors
            .actionOfType$(AdministrationDocumentActionNames.CLEAR_DOCUMENT)
            .pipe(
                filter((action: CustomAction) => action.payload === DocumentTabIddEnum.BANK),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((action) => {
                this.clearFormAction();
            });

        this.administrationSelectors.folder$
            .pipe(
                takeUntil(this.getUnsubscriberNotifier())
            )
            .subscribe((folder: DocumentTreeModel) => {
                this._folder = folder;
            });

        this.administrationSelectors
            .actionSuccessOfSubtype$(AdministrationDocumentActionNames.SAVE_DOCUMENT_INVOICE_FORMS)
            .pipe(
                takeUntil(this.getUnsubscriberNotifier())
            )
            .subscribe((action) => {
                this.defaultData = cloneDeep(this.form.value);
            });
    }

    public initFunction() {}

    private mapExtractedDataIntoForm(
        extractedDataFromOcr: ExtractedDataOcrState[],
        form: FormGroup,
        extractedDataList: ExtractedDataFormModel[],
    ): void {
        super.setEmptyDataValueOfFormAndExtractedData(form, extractedDataList, ['bankPostZahlung']);

        if (!extractedDataFromOcr || !extractedDataFromOcr.length) return;

        for (let i = 0; i < extractedDataFromOcr.length; i++) {
            const data = extractedDataFromOcr[i];
            if (!form.controls[data.OriginalColumnName]) continue;

            form.controls[data.OriginalColumnName].setValue(
                data.Value || form.controls[data.OriginalColumnName].value,
                { emitEvent: false },
            );

            this.mapDataOcrStateToExtractedDataModel(data, extractedDataList);
        }
        this.defaultData = cloneDeep(this.form.value);
    }

    private formatDataBeforeSaving(): any {
        const personBank = new PersonBankFormModel();

        const normalizeOriginalColumnName = (originalColumnName) =>
            originalColumnName[0].toLowerCase() + originalColumnName.substring(1);
        const getValue = (value: string) => {
            if (isBoolean(value)) {
                value = value ? '1' : '0';
            }
            return value;
        };

        for (let i = 0; i < this._extractedData.length; i++) {
            const data = this._extractedData[i];
            const normalizedOriginalColumnName = normalizeOriginalColumnName(data.OriginalColumnName);
            if (personBank.hasOwnProperty(normalizedOriginalColumnName)) {
                personBank[normalizedOriginalColumnName] = getValue(data.Value);
            }
        }

        return personBank;
    }

    validateData(): boolean {
        const isValid = super.validateAllControlsAsTouched(this.form, (ctrl) => {
            ctrl.markAsDirty({ onlySelf: true });
        });
        this.cdRef.detectChanges();
        return isValid;
    }

    private setBadgeColor() {
        const badgeFunc = this.getBadgeTabForm(this.form);
        badgeFunc(this._tabWidget);
    }

    private setExtractedOcrData(ocrData: ExtractedDataOcrState[]) {
        super.setEmptyExtractedData(this._extractedData);
        this._extractedDataOcrState = ocrData;

        if (!this.form || !this._documentContainerOcr) {
            return;
        }

        this.mapExtractedDataIntoForm(this._extractedDataOcrState, this.form, this._extractedData);

        this.setBadgeColor();
        this.store.dispatch(
            this.administrationActions.initialFormState({
                documentProcessingType: this._documentContainerOcr.DocumentType,
                formState: {
                    data: this._extractedData,
                    form: this.form,
                    documentFormName: DocumentFormNameEnum.WIDGET_BANK,
                    formatDataBeforeSaving: this.formatDataBeforeSaving.bind(this),
                    validateData: this.validateData.bind(this),
                    onInit: true,
                },
            }),
        );

        this.cdRef.markForCheck();
    }

    private clearFormAction() {
        this.setEmptyDataValueOfFormAndExtractedData(this.form, this._extractedData);
        this.setBadgeColor();
    }
}
