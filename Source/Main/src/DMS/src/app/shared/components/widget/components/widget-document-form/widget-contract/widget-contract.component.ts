import {
    OnInit,
    OnDestroy,
    ChangeDetectionStrategy,
    Component,
    ChangeDetectorRef,
    AfterViewInit,
    ViewChild,
    TemplateRef,
    Output,
    EventEmitter,
} from '@angular/core';
import { WidgetDocumentForm } from '../widget-document-form.component';
import { Store } from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import {
    AdministrationDocumentActions,
    AdministrationDocumentActionNames,
} from '@app/state-management/store/actions/administration-document';
import { AdministrationDocumentSelectors } from '@app/state-management/store/reducer';
import { DocumentFormNameEnum, DocumentProcessingTypeEnum, DocumentTabIddEnum } from '@app/app.constants';
import { DynamicFormData } from '../control-model/dynamic-form-data.model';
import { contractDisplayNameConstant } from '../control-model/document.enum';
import { FormGroup } from '@angular/forms';
import { ExtractedDataFormModel } from '@app/models/administration-document/document-form/extracted-data-form.model';
import { FieldFormOnFocusModel } from '@app/state-management/store/models/administration-document/field-form-on-focus.model.payload';
import { ExtractedDataOcrState } from '@app/state-management/store/models/administration-document/state/extracted-data-ocr.state.model';
import { Router } from '@angular/router';
import { isBoolean, cloneDeep } from 'lodash-es';
import { ContractFormModel } from '@app/models/administration-document/document-form/contract-form.model';
import { ComboboxRepositoryStateModel } from '@app/state-management/store/models/administration-document/state/combobox-repository.state.model';
import { DropdownControl } from '../control-model/dropdown-control.model';
import { Observable } from 'rxjs';
import { TabSummaryModel } from '@app/models';
import * as tabSummaryReducer from '@app/state-management/store/reducer/tab-summary';
import { AppErrorHandler } from '@app/services';
import { CustomAction } from '@app/state-management/store/actions';
import { CapturedFormElement } from '@app/state-management/store/models/administration-document/ocr-data-visitor-pattern/captured-form-element.payload';
import { CapturedFormModeEnum } from '@app/models/administration-document/document-form/captured-form-mode.enum';
import { filter, takeUntil } from 'rxjs/operators';

@Component({
    selector: 'widget-contract',
    styleUrls: ['./widget-contract.component.scss'],
    templateUrl: './widget-contract.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidgetContractComponent extends WidgetDocumentForm implements OnInit, AfterViewInit, OnDestroy {
    private _fieldFormOnFocus: FieldFormOnFocusModel;
    private _extractedData: ExtractedDataFormModel[];
    private _isUpdateMode = false;
    // private _documentContainerOcr: DocumentContainerOcrStateModel;
    private _documentOcr: {
        IdDocumentContainerOcr: number;
        IdDocumentContainerScans: number;
        IdDocumentContainerProcessed: number;
        WidgetTitle: string;
    };
    private _idDocumentTree: number;
    private _comboboxCurrency: ComboboxRepositoryStateModel[];
    private _tabHeaderDataModel: Observable<TabSummaryModel[]>;
    private _tabWidget: TabSummaryModel;
    private _contractCapturedFormElement: CapturedFormElement;

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
        super(
            router,
            store,
            administrationActions,
            administrationSelectors,
            DocumentFormNameEnum.WIDGET_CONTRACT,
            null,
        );
        this.isFirstLoading = true;
        this._tabHeaderDataModel = store.select(
            (state) => tabSummaryReducer.getTabSummaryState(state, this.ofModule.moduleNameTrim).tabs,
        );
        this._contractCapturedFormElement = new CapturedFormElement(DocumentFormNameEnum.WIDGET_CONTRACT);
        this._contractCapturedFormElement.notifyOnAccept = () => {
            this.setExtractedOcrData(this._contractCapturedFormElement.ocrData);
        };
        this.store.dispatch(this.administrationActions.registerTabFormElement(this._contractCapturedFormElement));
        this.onSubcribeAction();
    }

    ngOnInit(): void {
        this.store.dispatch(this.administrationActions.getContractColumnSetting());
    }

    ngOnDestroy(): void {
        super.onDestroy();
    }

    ngAfterViewInit(): void {}

    onSubcribeAction() {
        this.administrationSelectors.comboboxCurrency$
            .pipe(
                takeUntil(super.getUnsubscriberNotifier())
            )
            .subscribe((comboboxCurrency) => {
                this._comboboxCurrency = comboboxCurrency;
            });

        this.administrationSelectors
            .actionSuccessOfSubtype$(AdministrationDocumentActionNames.GET_CONTRACT_COLUMN_SETTING)
            .pipe(
                takeUntil(super.getUnsubscriberNotifier())
            )
            .subscribe((action) => {
                const isOriginalColumnName = false;
                const columnSettingResponse = super.generateColumnSetting̣(
                    action,
                    contractDisplayNameConstant,
                    isOriginalColumnName,
                );
                // console.log('widget-contract.component: generateColumnSetting̣', columnSettingResponse);
                this.defaultListControl = columnSettingResponse.listControl;
                this.data.listControl = this.defaultListControl;

                for (let i = 0; i < this.data.listControl.length; i++) {
                    const ctrl = this.data.listControl[i];

                    [this._comboboxCurrency].forEach((combobox: ComboboxRepositoryStateModel[]) => {
                        if (
                            !(ctrl instanceof DropdownControl) ||
                            ctrl.originalColumnName.indexOf(combobox[0].dataType) <= 0
                        )
                            return;

                        this.setComboboxToControl(combobox, ctrl as DropdownControl);
                    });
                }

                this.generateFormData();
            });

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
        //         // console.log('widget-contract', extractedDataFromOcr);
        //         super.setEmptyExtractedData(this._extractedData);
        //         this._extractedDataOcrState = extractedDataFromOcr;

        //         if (!this.form || !this._documentContainerOcr) return;

        //         this.mapExtractedDataIntoForm(this._extractedDataOcrState, this.form, this._extractedData);

        //         this.setBadgeColor();
        //         this.store.dispatch(
        //             this.administrationActions.initialFormState({
        //                 documentProcessingType: this.documentProcessingType,
        //                 formState: {
        //                     data: this._extractedData,
        //                     form: this.form,
        //                     documentFormName: DocumentFormNameEnum.WIDGET_CONTRACT,
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

        this.administrationSelectors.documentsState$
            .pipe(
                filter(
                    (data) =>
                        data &&
                        data.documentOnUpdate.documentType === DocumentProcessingTypeEnum.CONTRACT &&
                        data.documentOnUpdate.formName === DocumentFormNameEnum.WIDGET_CONTRACT,
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
                    DocumentFormNameEnum.WIDGET_CONTRACT
                ].data.find((item) => item.OriginalColumnName === documentsState.documentOnUpdate.originalColumnName);

                this.setValueOnForm(currentData, newDataState, this._fieldFormOnFocus);

                this.setBadgeColor();
                this.cdRef.markForCheck();
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
                    this._tabWidget = tabHeaderDataModel.find((tab) => tab.tabSummaryInfor.tabID === 'Contract');
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
                filter((action: CustomAction) => action.payload === DocumentTabIddEnum.CONTRACT),
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
                filter((action: CustomAction) => action.payload === DocumentTabIddEnum.CONTRACT),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((action) => {
                this.clearFormAction();
            });

        this.administrationSelectors
            .actionSuccessOfSubtype$(AdministrationDocumentActionNames.SAVE_DOCUMENT_CONTRACT_FORMS)
            .pipe(
                takeUntil(this.getUnsubscriberNotifier())
            )
            .subscribe((action) => {
                this.defaultData = cloneDeep(this.form.value);
            });
    }

    initFunction() {}

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

            form.controls[data.OriginalColumnName].setValue(
                data.Value || form.controls[data.OriginalColumnName].value,
                { emitEvent: false },
            );
            this.mapDataOcrStateToExtractedDataModel(data, extractedDataList);
        }

        this.defaultData = cloneDeep(this.form.value);
    }

    private formatDataBeforeSaving(): any {
        const contractData = new ContractFormModel();
        let originalColumnName: string;

        for (let i = 0; i < this._extractedData.length; i++) {
            const data = this._extractedData[i];
            originalColumnName = data.OriginalColumnName[0].toLowerCase() + data.OriginalColumnName.substring(1);
            if (contractData.hasOwnProperty(originalColumnName)) {
                if (isBoolean(data.Value)) {
                    contractData[originalColumnName] = data.Value ? '1' : '0';
                    continue;
                }
                contractData[originalColumnName] = data.Value;
            }
        }

        // format date string
        contractData.termOfContract = contractData.termOfContract
            ? super.formatDate(contractData.termOfContract)
            : contractData.termOfContract;
        contractData.commencementOfInsurance = contractData.commencementOfInsurance
            ? super.formatDate(contractData.commencementOfInsurance)
            : contractData.commencementOfInsurance;

        return contractData;
    }

    private validateData(): boolean {
        const isValid = super.validateAllControlsAsTouched(this.form, (ctrl) => {
            ctrl.markAsDirty({ onlySelf: true });
        });
        this.cdRef.detectChanges();

        return isValid;
    }

    private generateFormData() {
        if (!this._documentContainerOcr) return;

        this._extractedData = [];
        this.form = this.createFormGroupWithControls(this.data.listControl);

        for (const control of [...this.data.listControl]) {
            this._extractedData.push({
                GroupField: this._documentContainerOcr.DocumentType,
                ColumnName: control.columnName,
                OriginalColumnName: control.originalColumnName,
                Value: this.form.controls[control.originalColumnName]
                    ? this.form.controls[control.originalColumnName].value
                    : null,
                WordsCoordinates: null,
                DataType: control.dataType,
            });
        }

        this.numberField.push(this.countPropertiesObject(this.form.value));
        // this.setColorBadge(this.form.value, 0);
        this.detectChangeValue(this.form, 0);

        /* TODO: will uncomment and remove initialFormState after has get extracted data for contract */

        // this.cdRef.detectChanges();

        // if (!this._idDocumentContainerOcr) return;

        // this.store.dispatch(this.administrationActions.initialFormState({
        //     documentProcessingType: this.documentProcessingType,
        //     formState: {
        //         data: this._extractedData,
        //         form: this.form,
        //         documentFormName: DocumentFormNameEnum.WIDGET_CONTRACT,
        //         formatDataBeforeSaving: this.formatDataBeforeSaving.bind(this),
        //         validateData: this.validateData.bind(this),
        //     },
        // }));
        // this.cdRef.detectChanges();

        this.mapExtractedDataIntoForm(this._extractedDataOcrState, this.form, this._extractedData);
        this.setBadgeColor();
        this.store.dispatch(
            this.administrationActions.initialFormState({
                documentProcessingType: this.documentProcessingType,
                formState: {
                    data: this._extractedData,
                    form: this.form,
                    documentFormName: DocumentFormNameEnum.WIDGET_CONTRACT,
                    formatDataBeforeSaving: this.formatDataBeforeSaving.bind(this),
                    validateData: this.validateData.bind(this),
                    onInit: true,
                },
            }),
        );

        this.cdRef.markForCheck();

        /* TODO: will uncomment and remove initialFormState after has get extracted data for contract */
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
                documentProcessingType: this.documentProcessingType,
                formState: {
                    data: this._extractedData,
                    form: this.form,
                    documentFormName: DocumentFormNameEnum.WIDGET_CONTRACT,
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
