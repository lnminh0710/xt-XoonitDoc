import {
    Component,
    OnInit,
    OnDestroy,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    AfterViewInit,
    TemplateRef,
    ViewChild,
    Output,
    EventEmitter,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
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
import {
    DocumentFormNameEnum,
    DocumentGroupFieldEnum,
    DocumentProcessingTypeEnum,
    DocumentTabIddEnum,
} from '@app/app.constants';
import { ExtractedDataFormModel } from '@app/models/administration-document/document-form/extracted-data-form.model';
import { WidgetDetail, TabSummaryModel } from '@app/models';
import { invoiceDisplayNameConstant, dataTypeFormControl } from '../control-model/document.enum';
import { ExtractedDataOcrState } from '@app/state-management/store/models/administration-document/state/extracted-data-ocr.state.model';
import { DropdownControl } from '../control-model/dropdown-control.model';
import { Router } from '@angular/router';
import { CustomAction } from '@app/state-management/store/actions';
import { isBoolean, cloneDeep } from 'lodash-es';
import { CapturedFormModeEnum } from '@app/models/administration-document/document-form/captured-form-mode.enum';
import { DynamicFieldsPayloadModel } from '@app/models/administration-document/document-form/dynamic-fields.payload.model';
import { ComboboxRepositoryStateModel } from '@app/state-management/store/models/administration-document/state/combobox-repository.state.model';
import { InvoiceFormModel } from '@app/models/administration-document/document-form/invoice-form.model';
import { Observable } from 'rxjs';
import * as tabSummaryReducer from '@app/state-management/store/reducer/tab-summary';
import { AppErrorHandler } from '@app/services';
import { CapturedFormElement } from '@app/state-management/store/models/administration-document/ocr-data-visitor-pattern/captured-form-element.payload';
import { filter, takeUntil } from 'rxjs/operators';

@Component({
    selector: 'widget-invoice-info',
    styleUrls: ['./widget-invoice-info.component.scss'],
    templateUrl: './widget-invoice-info.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidgetInvoiceInfoComponent extends WidgetDocumentForm implements OnInit, OnDestroy, AfterViewInit {
    private _fieldFormOnFocus: FieldFormOnFocusModel;
    private _dataSource: WidgetDetail;
    private _extractedData: ExtractedDataFormModel[];
    private _comboboxCurrency: ComboboxRepositoryStateModel[];
    private _comboboxMeansOfPayment: ComboboxRepositoryStateModel[];
    private _idDocumentTree: number;
    private _isUpdateMode = false;
    private _tabHeaderDataModel: Observable<TabSummaryModel[]>;
    private _tabWidget: TabSummaryModel;
    private _invoiceCapturedFormElement: CapturedFormElement;

    public data: DynamicFormData = new DynamicFormData();
    public form: FormGroup;
    public bisDatumData: TextControl;

    constructor(
        protected router: Router,
        protected store: Store<AppState>,
        protected administrationActions: AdministrationDocumentActions,
        protected administrationSelectors: AdministrationDocumentSelectors,
        private cdRef: ChangeDetectorRef,
        private appErrorHandler: AppErrorHandler,
    ) {
        super(router, store, administrationActions, administrationSelectors, DocumentFormNameEnum.WIDGET_INVOICE, null);
        this.isFirstLoading = true;
        this._tabHeaderDataModel = store.select(
            (state) => tabSummaryReducer.getTabSummaryState(state, this.ofModule.moduleNameTrim).tabs,
        );

        this._invoiceCapturedFormElement = new CapturedFormElement(DocumentFormNameEnum.WIDGET_INVOICE);
        this._invoiceCapturedFormElement.notifyOnAccept = () => {
            this.setExtractedOcrData(this._invoiceCapturedFormElement.ocrData);
        };
        this.store.dispatch(this.administrationActions.registerTabFormElement(this._invoiceCapturedFormElement));

        this.onSubcribeAction();
    }

    ngOnInit(): void {
        this.store.dispatch(this.administrationActions.getInvoiceColumnSetting());
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
        //         // console.log('widget-invoice-info', extractedDataFromOcr);
        //         super.setEmptyExtractedData(this._extractedData);
        //         this._extractedDataOcrState = extractedDataFromOcr;

        //         if (!this.form || !this._documentContainerOcr) return;

        //         this.mapExtractedDataIntoForm(this._extractedDataOcrState, this.form, this._extractedData);
        //         this.setBadgeColor();
        //         this.store.dispatch(
        //             this.administrationActions.initialFormState({
        //                 documentProcessingType: this._documentContainerOcr.DocumentType,
        //                 formState: {
        //                     data: this._extractedData,
        //                     form: this.form,
        //                     documentFormName: DocumentFormNameEnum.WIDGET_INVOICE,
        //                     formatDataBeforeSaving: this.formatDataBeforeSaving.bind(this),
        //                     validateData: this.validateData.bind(this),
        //                     onInit: true,
        //                 },
        //             }),
        //         );
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
                filter(
                    (data) =>
                        data &&
                        data.documentOnUpdate.documentType === DocumentProcessingTypeEnum.INVOICE &&
                        data.documentOnUpdate.formName === DocumentFormNameEnum.WIDGET_INVOICE,
                ),
                takeUntil(super.getUnsubscriberNotifier()),
            )
            .subscribe((documentsState) => {
                if (!this._extractedData) {
                    this.setEmptyDataValueOfFormAndExtractedData(this.form, this._extractedData);
                    return;
                }
                const currentData = this._extractedData.find(
                    (item) => item.OriginalColumnName === documentsState.documentOnUpdate.originalColumnName,
                );
                if (!currentData) return;

                const newDataState = documentsState.documentsForm[this._documentContainerOcr.DocumentType].formsState[
                    DocumentFormNameEnum.WIDGET_INVOICE
                ].data.find((item) => item.OriginalColumnName === documentsState.documentOnUpdate.originalColumnName);

                this.setValueOnForm(currentData, newDataState, this._fieldFormOnFocus);

                this.setBadgeColor();
                this.cdRef.markForCheck();
            });

        this.administrationSelectors.comboboxCurrency$
            .pipe(
                takeUntil(super.getUnsubscriberNotifier())
            )
            .subscribe((comboboxCurrency) => {
                this._comboboxCurrency = comboboxCurrency;
            });

        this.administrationSelectors.comboboxMeansOfPayment$
            .pipe(
                takeUntil(super.getUnsubscriberNotifier())
            )
            .subscribe((comboboxMeansOfPayment) => {
                this._comboboxMeansOfPayment = comboboxMeansOfPayment;
            });

        this.administrationSelectors
            .actionSuccessOfSubtype$(AdministrationDocumentActionNames.GET_INVOICE_COLUMN_SETTING)
            .pipe(
                takeUntil(super.getUnsubscriberNotifier())
            )
            .subscribe((actionInvoice) => {
                const isOriginalColumnName = false;
                const columnSettingResponse = this.generateColumnSetting̣(
                    actionInvoice,
                    invoiceDisplayNameConstant,
                    isOriginalColumnName,
                );
                // console.log('widget-invoice-info.component: generateColumnSetting̣', columnSettingResponse);

                this.defaultListControl = columnSettingResponse.listControl;
                // numberOfComboBox = columnSettingResponse.numberOfComboBox;
                this.data.listControl = this.defaultListControl;

                for (let i = 0; i < this.data.listControl.length; i++) {
                    const ctrl = this.data.listControl[i];
                    [this._comboboxCurrency, this._comboboxMeansOfPayment].forEach(
                        (combobox: ComboboxRepositoryStateModel[]) => {
                            if (
                                !(ctrl instanceof DropdownControl) ||
                                ctrl.originalColumnName.indexOf(combobox[0].dataType) <= 0
                            )
                                return;

                            this.setComboboxToControl(combobox, ctrl as DropdownControl);
                        },
                    );
                }

                this.generateFormData();
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

        this.administrationSelectors.folder$
            .pipe(
                filter((folder) => !!folder),
                takeUntil(super.getUnsubscriberNotifier()),
            )
            .subscribe((folder) => {
                this._folder = folder;
            });

        this._tabHeaderDataModel
            .pipe(
                filter((tabHeaders) => tabHeaders && tabHeaders.length >= 0),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((tabHeaderDataModel: TabSummaryModel[]) => {
                this.appErrorHandler.executeAction(() => {
                    this._tabWidget = tabHeaderDataModel.find(
                        (tab) => tab.tabSummaryInfor.tabID === 'Rechnungsinformationen',
                    );
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
                filter((action: CustomAction) => action.payload === DocumentTabIddEnum.INVOICE),
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
                filter((action: CustomAction) => action.payload === DocumentTabIddEnum.INVOICE),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((action) => {
                this.clearFormAction();
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

    private generateFormData() {
        if (!this._documentContainerOcr) return;

        this._extractedData = [];
        this.form = this.createFormGroupWithControls(this.data.listControl);

        for (const control of [...this.data.listControl]) {
            this._extractedData.push({
                GroupField: DocumentGroupFieldEnum.INVOICE,
                ColumnName: control.columnName,
                OriginalColumnName: control.originalColumnName,
                Value: this.form.controls[control.originalColumnName]
                    ? this.form.controls[control.originalColumnName].value
                    : null,
                WordsCoordinates: null,
                DataType: control.dataType,
                Data:
                    control.dataType.toLowerCase() === dataTypeFormControl.comboBox
                        ? (control as DropdownControl).options
                        : null,
            });
        }

        this.numberField.push(this.countPropertiesObject(this.form.value));
        // this.setColorBadge(this.form.value, 0);
        this.detectChangeValue(this.form, 0);
        this.bisDatumData = this.data.listControl.find((x) => x.originalColumnName === 'bisDatum') as TextControl;

        this.cdRef.detectChanges();

        // console.log(`widget-invoice: generateFormData(): create form controls`, this.form, this._extractedData);

        if (!this._documentContainerOcr) {
            // console.log(`widget-invoice: generateFormData(): this._documentContainerOcr is null => RETURN`);
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
                    documentFormName: DocumentFormNameEnum.WIDGET_INVOICE,
                    formatDataBeforeSaving: this.formatDataBeforeSaving.bind(this),
                    validateData: this.validateData.bind(this),
                    onInit: true,
                },
            }),
        );
    }

    private mapExtractedDataIntoForm(
        extractedDataFromOcr: ExtractedDataOcrState[],
        form: FormGroup,
        extractedDataList: ExtractedDataFormModel[],
    ): void {
        super.setEmptyDataValueOfFormAndExtractedData(form, extractedDataList);

        if (!extractedDataFromOcr || !extractedDataFromOcr.length) return;

        for (let i = 0; i < extractedDataFromOcr.length; i++) {
            const data = extractedDataFromOcr[i];
            if (!form.controls[data.OriginalColumnName]) continue;

            if (
                !!data.Value &&
                data.DataType.toLowerCase() === 'bit' &&
                typeof data.Value === 'string' &&
                (data.Value.toLowerCase() === 'true' || data.Value.toLowerCase() === 'false')
            ) {
                data.Value = data.Value.toLowerCase() === 'true' ? true : false;
            }

            form.controls[data.OriginalColumnName].setValue(
                data.Value || form.controls[data.OriginalColumnName].value,
                { emitEvent: false },
            );
            this.mapDataOcrStateToExtractedDataModel(data, extractedDataList);
        }
        this.defaultData = cloneDeep(this.form.value);
    }

    private formatDataBeforeSaving(): any {
        const invoiceData = new InvoiceFormModel();
        let originalColumnName: string;

        for (let i = 0; i < this._extractedData.length; i++) {
            const data = this._extractedData[i];
            originalColumnName = data.OriginalColumnName[0].toLowerCase() + data.OriginalColumnName.substring(1);
            if (invoiceData.hasOwnProperty(originalColumnName)) {
                if (isBoolean(data.Value)) {
                    invoiceData[originalColumnName] = data.Value ? '1' : '0';
                    continue;
                }
                invoiceData[originalColumnName] = data.Value;
            }
        }

        // format date string
        invoiceData.invoiceDate = invoiceData.invoiceDate
            ? super.formatDate(invoiceData.invoiceDate)
            : invoiceData.invoiceDate;
        invoiceData.guaranteeDateOfExpiry = invoiceData.guaranteeDateOfExpiry
            ? super.formatDate(invoiceData.guaranteeDateOfExpiry)
            : invoiceData.guaranteeDateOfExpiry;

        return invoiceData;
    }

    private validateData(): boolean {
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

        if (!this.form || !this._documentContainerOcr) return;

        this.mapExtractedDataIntoForm(this._extractedDataOcrState, this.form, this._extractedData);
        this.setBadgeColor();
        this.store.dispatch(
            this.administrationActions.initialFormState({
                documentProcessingType: this._documentContainerOcr.DocumentType,
                formState: {
                    data: this._extractedData,
                    form: this.form,
                    documentFormName: DocumentFormNameEnum.WIDGET_INVOICE,
                    formatDataBeforeSaving: this.formatDataBeforeSaving.bind(this),
                    validateData: this.validateData.bind(this),
                    onInit: true,
                },
            }),
        );
    }

    private clearFormAction() {
        this.setEmptyDataValueOfFormAndExtractedData(this.form, this._extractedData);
        this.setBadgeColor();
    }
}
