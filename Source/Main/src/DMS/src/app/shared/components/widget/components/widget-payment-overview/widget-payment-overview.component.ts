import { DatePipe } from '@angular/common';
import {
    AfterViewInit,
    Component,
    ElementRef,
    Injector,
    Input,
    OnInit,
    QueryList,
    ViewChildren,
    ViewContainerRef,
} from '@angular/core';
import {
    AbstractControl,
    FormArray,
    FormBuilder,
    FormControl,
    FormGroup,
    ValidatorFn,
    Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ComboBoxTypeConstant } from '@app/app.constants';
import {
    ApiResultResponse,
    ControlGridModel,
    FieldFilter,
    IWidgetCommonAction,
    PaymentCurrency,
    PaymentFlag,
    PaymentFormProperty,
    WidgetApp,
    WidgetPropertyModel,
} from '@app/models';
import { BaseComponent, ModuleList } from '@app/pages/private/base';
import {
    AppErrorHandler,
    BloombergService,
    CommonService,
    DatatableService,
    InvoiceAprrovalService,
    PropertyPanelService,
} from '@app/services';
import {
    AdministrationDocumentActionNames,
    AdministrationDocumentActions,
    CustomAction,
    DocumentThumbnailActions,
    LayoutInfoActions,
} from '@app/state-management/store/actions';
import { Uti } from '@app/utilities';
import { ReducerManagerDispatcher, Store } from '@ngrx/store';
import { combineLatest, forkJoin, merge, Observable, of, Subject } from 'rxjs';
import { auditTime, debounceTime, distinctUntilChanged, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import * as dayFns from 'date-fns';
import { AppState } from '@app/state-management/store';
import { AdministrationDocumentSelectors } from '@app/state-management/store/reducer';
import { MaterialControlType } from '../widget-mydm-form/consts/material-control-type.enum';
import { DataState } from '@app/state-management/store/models/administration-document/state/extracted-data-ocr.state.model';
import { MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@xn-control/light-material-ui/autocomplete';
import { WidgetMyDmFormActionNames } from '../widget-mydm-form/actions/widget-mydm-form.actions';
import { Actions, ofType } from '@ngrx/effects';
import { DocumentContainerScanStateModel } from '@app/state-management/store/models/administration-document/state/document-container-scan.state.model';
import {
    FormStatus,
    IWidgetIsAbleToSave,
} from '@app/state-management/store/models/app-global/widget-is-able-to-save.payload.model';
import { AppInjectWigetInstanceIsAbleToSaveAction } from '@app/state-management/store/actions/app-global/app-global.actions';
import { AppSelectors } from '@app/state-management/store/reducer/app';
import { InvoiceApprovalProcessingActionNames } from '@app/pages/invoice-approval-processing/invoice-approval-processing.statemanagement/invoice-approval-processing.actions';
import { InvoiceIncludeExchanged, KostnestelleChange } from '@app/state-management/store/actions/app/app.actions';
import { BaseWidgetCommonAction } from '../base-widget-common-action';
import { InvoiceApprovalProcessingSelectors } from '@app/pages/invoice-approval-processing/invoice-approval-processing.statemanagement/invoice-approval-processing.selectors';
import { MasterExtractedData } from '@app/models/approval/master-extracted.model';
import { ToasterService } from 'angular2-toaster';

const DAY_FORMAT: string = 'dd.MM.yyyy';

@Component({
    selector: 'widget-payment-overview',
    templateUrl: './widget-payment-overview.component.html',
    styleUrls: ['./widget-payment-overview.component.scss'],
})
export class WidgetPaymentOverviewComponent
    extends BaseWidgetCommonAction
    implements OnInit, AfterViewInit, IWidgetIsAbleToSave {
    public readonly PaymentFormProperty = PaymentFormProperty;
    public readonly PaymentCurrency = PaymentCurrency;
    public readonly PaymentFlag = PaymentFlag;
    public readonly ModuleList = ModuleList;

    width: number = 0;
    height: number = 0;

    idDocument: number = null;
    idInvoiceMainApproval: number = null;
    mustHide: boolean = true;
    clickedSave: boolean;
    hasNoVATInDropdown: boolean;
    isNoVAT: boolean;

    perfectScrollbarConfig: any = {};
    baseCurrency = 'CHF';
    ratioExchange: number;
    dataSourceBookingNr: ControlGridModel;
    dataSourceCostCentre: ControlGridModel;
    dataSourceCostType: ControlGridModel;
    dataSourceProjectNumber: ControlGridModel;
    lastVATFormFocus: FormControl;

    vatsDropdown: any[] = [];
    filteredVats: any[] = [];
    filteredCurrencies: any[] = [];
    filteredCountries: any[] = [];

    paymentForm = this.fb.group({
        costCentre: this.fb.group({
            [PaymentFormProperty.TITLE]: '',
            [PaymentFormProperty.ORIGINAL]: [''],
            [PaymentFormProperty.EXCHANGE]: null,
            [PaymentFormProperty.ID]: [null, [this.validatorDropdown('costCentre')]],
            [PaymentFormProperty.ORIGINAL_COLUMN_NAME]: 'IdRepCostCentre',
            [PaymentFormProperty.TEXT_COLUMN_NAME]: 'CostCentre',
            [PaymentFormProperty.IS_HIDDEN]: false,
            [PaymentFormProperty.ALIAS_NAME]: '',
        }),
        costType: this.fb.group({
            [PaymentFormProperty.TITLE]: '',
            [PaymentFormProperty.ORIGINAL]: [''],
            [PaymentFormProperty.EXCHANGE]: null,
            [PaymentFormProperty.ID]: [null, [this.validatorDropdown('costType')]],
            [PaymentFormProperty.ORIGINAL_COLUMN_NAME]: 'IdRepCostType',
            [PaymentFormProperty.TEXT_COLUMN_NAME]: 'CostType',
            [PaymentFormProperty.IS_HIDDEN]: false,
            [PaymentFormProperty.ALIAS_NAME]: '',
        }),
        projectNumber: this.fb.group({
            [PaymentFormProperty.TITLE]: '',
            [PaymentFormProperty.ORIGINAL]: [''],
            [PaymentFormProperty.EXCHANGE]: null,
            [PaymentFormProperty.ID]: [null, [this.validatorDropdown('projectNumber')]],
            [PaymentFormProperty.ORIGINAL_COLUMN_NAME]: 'IdRepProjectNumber',
            [PaymentFormProperty.TEXT_COLUMN_NAME]: 'ProjectNumber',
            [PaymentFormProperty.IS_HIDDEN]: false,
            [PaymentFormProperty.ALIAS_NAME]: '',
        }),
        idRepCurrencyCode: this.fb.group({
            [PaymentFormProperty.ID]: null,
            [PaymentFormProperty.ORIGINAL_COLUMN_NAME]: 'IdRepCurrencyCode',
            [PaymentFormProperty.ALIAS_NAME]: '',
        }),
        idCurrency: this.fb.group({
            [PaymentFormProperty.ORIGINAL]: 'CHF',
            [PaymentFormProperty.EXCHANGE]: '',
            [PaymentFormProperty.ORIGINAL_COLUMN_NAME]: 'IdRepCurrencyCodeInvoice',
            [PaymentFormProperty.TEXT_COLUMN_NAME]: 'CurrencyCode',
            [PaymentFormProperty.ALIAS_NAME]: '',
            [PaymentFormProperty.ID]: [null, [Validators.required]],
        }),
        exclVATInvoice: this.fb.group({
            [PaymentFormProperty.ORIGINAL]: '0.00',
            [PaymentFormProperty.EXCHANGE]: '0.00',
            [PaymentFormProperty.ORIGINAL_COLUMN_NAME]: 'InvoiceAmountExclNoVAT',
            [PaymentFormProperty.ALIAS_NAME]: '',
        }),
        inclVATInvoice: this.fb.group({
            [PaymentFormProperty.ORIGINAL]: ['0.00', this.validatorIncl()],
            [PaymentFormProperty.EXCHANGE]: '0.00',
            [PaymentFormProperty.ORIGINAL_COLUMN_NAME]: 'InvoiceAmountInclVAT',
            [PaymentFormProperty.ALIAS_NAME]: '',
            [PaymentFormProperty.CALCULATE]: ['0.00', this.validatorIncl()],
            [PaymentFormProperty.OCR_COLUMN_NAME]: 'InvoiceAmount',
        }),
        country: this.fb.group({
            [PaymentFormProperty.ORIGINAL]: '',
            [PaymentFormProperty.EXCHANGE]: '',
            [PaymentFormProperty.ID]: [null, [Validators.required]],
            [PaymentFormProperty.ORIGINAL_COLUMN_NAME]: 'IdRepIsoCountryCode', // TODO value "IdDocumentTreeMedia" in config
            [PaymentFormProperty.TEXT_COLUMN_NAME]: 'Country',
            [PaymentFormProperty.ALIAS_NAME]: '',
        }),
        vATs: this.fb.array([]),
        term: this.fb.group({
            [PaymentFormProperty.ORIGINAL]: '0',
            [PaymentFormProperty.EXCHANGE]: null,
            [PaymentFormProperty.ORIGINAL_COLUMN_NAME]: 'PaymentTerm',
            [PaymentFormProperty.ALIAS_NAME]: '',
        }),
        date: this.fb.group({
            [PaymentFormProperty.ORIGINAL]: this.datePipe.transform(new Date(), 'dd.MM.yyyy'),
            [PaymentFormProperty.EXCHANGE]: null,
            [PaymentFormProperty.ORIGINAL_COLUMN_NAME]: 'PaymentrunDate',
            [PaymentFormProperty.ALIAS_NAME]: '',
        }),
        bookingNr: this.fb.group({
            [PaymentFormProperty.TITLE]: '',
            [PaymentFormProperty.ORIGINAL]: [''],
            [PaymentFormProperty.EXCHANGE]: null,
            [PaymentFormProperty.ID]: [null, [this.validatorDropdown('bookingNr')]],
            [PaymentFormProperty.ORIGINAL_COLUMN_NAME]: 'IdChartOfAccounts',
            [PaymentFormProperty.TEXT_COLUMN_NAME]: 'ChartOfAccounts',
            valueColumnName: 'TitleChartOfAccounts',
            [PaymentFormProperty.IS_HIDDEN]: false,
            [PaymentFormProperty.ALIAS_NAME]: '',
            dataTitle: '',
        }),
    });
    baseId: string = Uti.guid();
    displayExchangeCurrency = {
        key: 'exchangeCurrency',
        isHidden: false,
    };

    formFocuses: { id: string; form: FormControl }[] = [];
    formFocusing: { id: string; form: FormControl };
    private removingVAT: boolean;
    private forceCalculateByIncl: boolean;
    private qRCode: any = {
        applying: false,
        idCurrency: null,
        inclVATInvoice: '0.00',
        currency: '',
    };
    private aiCode: any = {
        applying: false,
    };
    private initedCurrency: boolean;
    private selectingCountryFromApi: boolean;
    private isSetDetailSuccess: boolean;
    private apiNeeded = {
        country$: new Subject<boolean>(),
        vat$: new Subject<boolean>(),
    };
    private legacyData: any;

    currencies: { dataType: string; idValue: string; textValue: string }[] = [];
    countries: {
        currency: string;
        dataType: string;
        idValue: string;
        textValue: string;
        isMainCountry: PaymentFlag;
    }[] = [];
    bookingNrReadonly: any;

    private extractedMasterData = null;

    get costCentre(): FormGroup {
        return this.paymentForm.get('costCentre') as FormGroup;
    }

    get costType(): FormGroup {
        return this.paymentForm.get('costType') as FormGroup;
    }

    get projectNumber(): FormGroup {
        return this.paymentForm.get('projectNumber') as FormGroup;
    }

    get idRepCurrencyCode(): FormGroup {
        return this.paymentForm.get('idRepCurrencyCode') as FormGroup;
    }

    get idCurrency(): FormGroup {
        return this.paymentForm.get('idCurrency') as FormGroup;
    }

    get exclVATInvoice(): FormGroup {
        return this.paymentForm.get('exclVATInvoice') as FormGroup;
    }

    get inclVATInvoice(): FormGroup {
        return this.paymentForm.get('inclVATInvoice') as FormGroup;
    }

    get country(): FormGroup {
        return this.paymentForm.get('country') as FormGroup;
    }

    get vATs(): FormArray {
        return this.paymentForm.get('vATs') as FormArray;
    }

    get term(): FormGroup {
        return this.paymentForm.get('term') as FormGroup;
    }

    get date(): FormGroup {
        return this.paymentForm.get('date') as FormGroup;
    }

    get bookingNr(): FormGroup {
        return this.paymentForm.get('bookingNr') as FormGroup;
    }

    @Input() globalProperties: any;
    @Input() widgetProperties: WidgetPropertyModel[];
    @ViewChildren('vatComplete') vatCompletes: QueryList<MatAutocompleteTrigger>;
    @ViewChildren('currencyComplete') currencyCompletes: QueryList<MatAutocompleteTrigger>;
    @ViewChildren('countryComplete') countryCompletes: QueryList<MatAutocompleteTrigger>;

    constructor(
        protected router: Router,
        protected injector: Injector,
        protected viewContainerRef: ViewContainerRef,
        private fb: FormBuilder,
        private element: ElementRef,
        private commonService: CommonService,
        private appErrorHandler: AppErrorHandler,
        private bloombergService: BloombergService,
        private invoiceAprrovalService: InvoiceAprrovalService,
        private dispatcher: ReducerManagerDispatcher,
        private datePipe: DatePipe,
        private store: Store<AppState>,
        private administrationActions: AdministrationDocumentActions,
        private administrationSelectors: AdministrationDocumentSelectors,
        private datatableService: DatatableService,
        private activatedRoute: ActivatedRoute,
        private action$: Actions,
        private appSelectors: AppSelectors,
        private toasterService: ToasterService,
        protected invoiceApprovalProcessingSelectors: InvoiceApprovalProcessingSelectors,
    ) {
        super(injector, viewContainerRef, router);
    }

    getIsApproval(): boolean {
        return this.ofModule.idSettingsGUI === ModuleList.Approval.idSettingsGUI;
    }

    getSetDetailSuccessNotApproval(): boolean {
        return this.isSetDetailSuccess && !this.getIsApproval();
    }

    resetWidget() {
        this.isSetDetailSuccess = !this.idDocument;
        this.apiNeeded.country$.next(this.isSetDetailSuccess);
        this.apiNeeded.vat$.next(this.isSetDetailSuccess);
        if (this.idDocument) {
            while (this.vATs.length) {
                this.vATs.removeAt(0);
            }
            this.setData(this.legacyData);
        } else {
            this.reset();
        }
    }

    filterDisplayFields(displayFields: Array<FieldFilter>) {
        displayFields.forEach((field) => {
            if (field.fieldName === this.displayExchangeCurrency.key) {
                this.displayExchangeCurrency.isHidden = !field.selected;
                return;
            }
            for (const [key, value] of Object.entries(this.paymentForm.value)) {
                if (key === field.fieldName) {
                    this[key].get(PaymentFormProperty.IS_HIDDEN)?.patchValue(!field.selected);
                }
            }
        });
    }

    ngOnInit() {
        super.ngOnInit();
        this.updateFieldFilter();
        this.store.dispatch(new AppInjectWigetInstanceIsAbleToSaveAction(this));
        this.subscribe();
        this.parseConfigToWidthHeight();

        this.activatedRoute.queryParamMap
            .pipe(
                switchMap((param) => {
                    const params = param?.['params'];
                    if (params?.['idInvoiceMainApproval'] !== undefined) {
                        this.idInvoiceMainApproval = param?.['params']?.['idInvoiceMainApproval'];
                    }
                    if (params?.['idDocument'] !== undefined) {
                        this.idDocument = param?.['params']?.['idDocument'];
                        this.mustHide = false;
                        this.isSetDetailSuccess = !this.idDocument;
                        this.apiNeeded.country$.next(this.isSetDetailSuccess);
                        this.apiNeeded.vat$.next(this.isSetDetailSuccess);
                        return this.invoiceAprrovalService.getPaymentOverview(this.idDocument);
                    }
                    return of();
                }),
                tap((data: ApiResultResponse) => {
                    if (data.item) {
                        this.legacyData = data.item[1];
                        this.parseSettingForSave(data.item[1]);
                        if (this.idDocument) {
                            while (this.vATs.length) {
                                this.vATs.removeAt(0);
                            }
                            this.setData(data.item[1]);
                        }
                    }
                }),
                switchMap(() => {
                    return this.initedCurrency ? of() : this.commonService.getListComboBox(ComboBoxTypeConstant.currency + '');
                }),
                tap((response: ApiResultResponse) => {
                    if (Uti.isResquestSuccess(response)) {
                        if (response.item.currency && !this.getIsApproval()) {
                            this.filteredCurrencies = this.currencies = response.item.currency;
                            const defaultCurrency = this.currencies?.find((cur) => cur.textValue.includes('CHF'));
                            this.idRepCurrencyCode.get(PaymentFormProperty.ID).patchValue(defaultCurrency?.idValue);
                            if (!this.qRCode.applying && !this.idDocument) {
                                this.idCurrency.get(PaymentFormProperty.ID).patchValue(defaultCurrency?.idValue);
                            }
                            this.initedCurrency = true;
                            this.applyQRCode();
                        }
                    }
                }),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe();
    }

    ngOnDestroy() {
        super.onDestroy();
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();
        if (!this.getIsApproval()) {
            combineLatest([this.apiNeeded.country$, this.apiNeeded.vat$])
                .pipe(
                    filter(() => !this.isSetDetailSuccess),
                    takeUntil(this.getUnsubscriberNotifier()),
                )
                .subscribe((apisSuccess: [boolean, boolean]) => {
                    this.isSetDetailSuccess = !apisSuccess.some((api) => !api);
                });

            this.action$
                .pipe(
                    ofType(WidgetMyDmFormActionNames.CLEAR_FORM, DocumentThumbnailActions.DOCUMENT_THUMBNAIL_NO_ITEM),
                    tap(() => this.reset()),
                    ofType(DocumentThumbnailActions.DOCUMENT_THUMBNAIL_NO_ITEM),
                    tap(() => (this.mustHide = true)),
                    takeUntil(this.getUnsubscriberNotifier()),
                )
                .subscribe();

            this.action$
                .pipe(
                    ofType(InvoiceApprovalProcessingActionNames.APPLY_QR_CODE_DATA),
                    takeUntil(this.getUnsubscriberNotifier()),
                )
                .subscribe((data: CustomAction) => {
                    this.prepareQRCode(data.payload);
                    this.applyQRCode();
                });

            this.administrationSelectors
                .actionOfType$(AdministrationDocumentActionNames.SCAN_OCR_TEXT)
                .pipe(
                    map((action: CustomAction) => {
                        return {
                            formFocus: this.formFocuses.find((form) => form.id === action.payload.OriginalColumnName),
                            action,
                        };
                    }),
                    filter(({ formFocus }) => !!formFocus),
                    takeUntil(this.getUnsubscriberNotifier()),
                )
                .subscribe(({ formFocus, action }) => {
                    const newValue =
                        action.payload.DataState !== DataState.DELETE
                            ? action.payload.Value
                            : formFocus.form !== this.bookingNr.get(PaymentFormProperty.ORIGINAL) &&
                              formFocus.form !== this.idCurrency.get(PaymentFormProperty.ORIGINAL) &&
                              formFocus.form !== this.country.get(PaymentFormProperty.ORIGINAL)
                            ? '0.00'
                            : '';
                    try {
                        if (formFocus.form === this.idCurrency.get(PaymentFormProperty.ORIGINAL)) {
                            const item = this.currencies.find(
                                (currency) => currency.textValue.toUpperCase() === newValue.toUpperCase(),
                            );
                            this.idCurrency.get(PaymentFormProperty.ID).patchValue(item?.idValue);
                            formFocus.form.patchValue(newValue);
                        } else if (formFocus.form === this.country.get(PaymentFormProperty.ORIGINAL)) {
                            const item = this.countries.find(
                                (currency) => currency.textValue.toUpperCase() === newValue.toUpperCase(),
                            );
                            this.country.get(PaymentFormProperty.ID).patchValue(item?.idValue);
                            formFocus.form.patchValue(newValue);
                        } else if (formFocus.form === this.bookingNr.get(PaymentFormProperty.ORIGINAL)) {
                            formFocus.form.patchValue(newValue);
                        } else if (formFocus.form === this.term.get(PaymentFormProperty.ORIGINAL)) {
                            if (Number.isInteger(Number(newValue))) {
                                formFocus.form.patchValue(Number(newValue));
                            }
                        } else if (
                            this.vATs.controls.some(
                                (contrl) => contrl.get(PaymentFormProperty.ORIGINAL) === formFocus.form,
                            )
                        ) {
                            this.lastVATFormFocus = formFocus.form;
                            const { existVATs, index } = this.getExistVatsByFormFocusing(formFocus.form);
                            const filteredVats = this.vatsDropdown.filter((option) => {
                                return (
                                    (index === 0 && isNaN(+option.textValue)) ||
                                    (!existVATs.some((exist) => +exist === +option.textValue) &&
                                        !isNaN(+option.textValue))
                                );
                            });
                            formFocus.form.parent
                                .get(PaymentFormProperty.ID)
                                .patchValue(filteredVats.find((v) => +newValue === +newValue)?.idValue);
                            formFocus.form.patchValue(
                                Uti.transformCommaNumber(
                                    Uti.transformNumberHasDecimal(Uti.transformCommaNumber(newValue)),
                                    true,
                                ),
                            );
                        } else {
                            formFocus.form.patchValue(
                                Uti.transformCommaNumber(
                                    Uti.transformNumberHasDecimal(Uti.transformCommaNumber(newValue)),
                                    true,
                                ),
                            );
                        }
                    } catch (err) {}
                });
        }

        this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return action.type === InvoiceApprovalProcessingActionNames.CLEAR_COST_CENTRE_BY_GROUP_IDS;
                }),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((action: CustomAction) => {
                const ids = action.payload || [];
                const item = ids.find((id) => String(id) === this.costCentre.get(PaymentFormProperty.ID).value);
                if (item) {
                    this.costCentre.get(PaymentFormProperty.ORIGINAL).patchValue('');
                    this.costCentre.patchValue({ dataTitle: '', [PaymentFormProperty.ID]: null });
                }
            });

        this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return action.type === LayoutInfoActions.RESIZE_SPLITTER;
                }),
                auditTime(100),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((action: CustomAction) => {
                this.parseConfigToWidthHeight();
            });

        this.dispatcher
            .pipe(
                filter(
                    (action: CustomAction) =>
                        action.type === InvoiceApprovalProcessingActionNames.UPDATE_BOOKING_NR_PROPERTY,
                ),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((action: CustomAction) => {
                if (this.bookingNrReadonly === action.payload) return;
                if (action.payload) {
                    this.bookingNr.get(PaymentFormProperty.ORIGINAL).patchValue('');
                    this.bookingNr.patchValue({ dataTitle: '', [PaymentFormProperty.ID]: null });
                }
                this.bookingNrReadonly = action.payload;
            });

        /** SET DATA From OCR AND QR CODE AND EXTRACTED DATA MASTER */
        this.administrationSelectors.documentContainerScan$
            .pipe(
                filter((docContainerOcr: DocumentContainerScanStateModel) => !!docContainerOcr && !this.idDocument),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((docContainerOcr: DocumentContainerScanStateModel) => {
                this.reset();
                if (docContainerOcr.images?.[0]?.JsonQRCode) {
                    this.prepareQRCode(docContainerOcr.images?.[0]?.JsonQRCode);
                    this.applyQRCode();
                }
                this.mustHide = false;
            });

        this.dispatcher
            .pipe(
                filter(
                    (action: CustomAction) =>
                        action.type === InvoiceApprovalProcessingActionNames.APPLY_EXTRACT_AI_DATA &&
                        ((this.idDocument && !action.payload.firstInit) || !this.idDocument),
                ),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((action: CustomAction) => {
                try {
                    const items = action.payload.item?.[1] || action.payload.data.item[1];
                    const controlNames = Object.keys(this.paymentForm.controls);
                    let formGroup: FormGroup;
                    items.forEach((item) => {
                        formGroup = this[
                            controlNames.find(
                                (controlName) =>
                                    this[controlName].get(PaymentFormProperty.OCR_COLUMN_NAME)?.value ===
                                    item.OriginalColumnName,
                            )
                        ];
                        if (formGroup && item.Value) {
                            this.aiCode.applying = true;
                            formGroup
                                .get(PaymentFormProperty.ORIGINAL)
                                .patchValue(
                                    Uti.transformCommaNumber(
                                        Uti.transformNumberHasDecimal(Uti.transformCommaNumber(item.Value)),
                                        true,
                                    ),
                                );
                        }
                    });
                    if (this.getSetDetailSuccessNotApproval() && this.aiCode.applying) {
                        this.aiCode.applying = false;
                    }

                    this.forceUpdateDataByExtractedMasterData();
                } catch (err) {
                    console.log('Some thing error when parse AI into payment overview');
                }
            });

        this.invoiceApprovalProcessingSelectors.invoiceInfoAndPaymentOverviewExtractedData$
            .pipe(
                filter(
                    (invoiceInfoAndPaymentOverviewExtractedData) =>
                        !!invoiceInfoAndPaymentOverviewExtractedData && !this.idDocument,
                ),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((paymentInfo: MasterExtractedData) => {
                if (!paymentInfo) {
                    this.extractedMasterData = null;
                    return;
                }

                this.extractedMasterData = paymentInfo.data;
                this.forceUpdateDataByExtractedMasterData();
            });
        /** SET DATA From OCR AND QR CODE AND EXTRACTED DATA MASTER */
    }

    addVAT(data?: {
        [PaymentFormProperty.ORIGINAL]: string;
        id: string;
        [PaymentFormProperty.EXCHANGE]?: string;
        [PaymentFormProperty.CALCULATE]: string;
        inputValue: string;
        idInvoiceTaxAmount: string;
    }) {
        if (!this.vatsDropdown.length && this.getSetDetailSuccessNotApproval()) return;
        const existVATs = this.vATs.value.map((v) => v[PaymentFormProperty.ORIGINAL]);
        const newVAT = this.vatsDropdown.filter(
            (option) => !existVATs.some((exist) => +exist === +option.textValue || isNaN(+option.textValue)),
        )[0];

        const newForm = this.fb.group({
            [PaymentFormProperty.ORIGINAL]: [
                data?.[PaymentFormProperty.ORIGINAL] || newVAT?.textValue,
                this.validatorVAT(),
            ],
            inputValue: data?.inputValue || '0.00',
            [PaymentFormProperty.CALCULATE]: data?.[PaymentFormProperty.CALCULATE],
            [PaymentFormProperty.EXCHANGE]: data?.[PaymentFormProperty.EXCHANGE],
            id: data?.id || newVAT?.idValue,
            idInvoiceTaxAmount: data?.idInvoiceTaxAmount || null,
        });
        this.vATs.push(newForm);
        if (this.vATs.controls.length === 2 && this.getSetDetailSuccessNotApproval()) {
            this.vATs.controls[0].get(PaymentFormProperty.INPUT).patchValue('0.00');
            this.exclVATInvoice.get(PaymentFormProperty.ORIGINAL).patchValue('0.00');
            this.inclVATInvoice.get(PaymentFormProperty.CALCULATE).patchValue('0.00');
            const isEqual =
                Uti.transformNumberHasDecimal(
                    Uti.transformCommaNumber(this.inclVATInvoice.get(PaymentFormProperty.CALCULATE).value),
                ) ===
                Uti.transformNumberHasDecimal(
                    Uti.transformCommaNumber(this.inclVATInvoice.get(PaymentFormProperty.ORIGINAL).value),
                );
            const error = isEqual || this.vATs.controls.length < 2 ? null : { isEqual: { value: '0.00' } };
            this.inclVATInvoice.get(PaymentFormProperty.ORIGINAL).setErrors(error);
            this.inclVATInvoice.get(PaymentFormProperty.CALCULATE).setErrors(error);
        }
    }

    removeVAT(index: number, form: FormControl) {
        const indexFocus = this.formFocuses.findIndex((formFocus) => formFocus.form === form);
        if (indexFocus > -1) {
            this.formFocuses.splice(indexFocus, 1);
        }
        // cheat, keep inclVAT
        this.forceCalculateByIncl = this.vATs.controls.length === 2;
        this.removingVAT = true;
        setTimeout(() => {
            this.removingVAT = false;
        }, 200);
        this.vATs.removeAt(index);
        this.inclVATInvoice
            .get(PaymentFormProperty.ORIGINAL)
            .patchValue(
                Uti.transformCommaNumber(
                    Uti.transformNumberHasDecimal(
                        Uti.transformCommaNumber(this.inclVATInvoice.get(PaymentFormProperty.ORIGINAL).value),
                    ),
                    true,
                ),
            );

        if (this.vATs.controls.length === 1) {
            this.inclVATInvoice.get(PaymentFormProperty.CALCULATE).setErrors(null);
            this.inclVATInvoice.get(PaymentFormProperty.ORIGINAL).setErrors(null);
        }
    }

    blurVat(form: FormControl, isDropdown?: boolean) {
        if (this.getIsApproval()) return;

        this.formFocusing = null;
        if (!isDropdown) {
            this.lastVATFormFocus = form;
            const formParent = form.parent;
            const formGrand = formParent.parent as FormArray;
            const index = formGrand.controls.findIndex((control) => control.get(PaymentFormProperty.ORIGINAL) === form);
            form.parent
                .get(PaymentFormProperty.ID)
                .patchValue(
                    this.vatsDropdown.find((v) => +v.textValue === +form.value && (index === 0 || !isNaN(+v.textValue)))
                        ?.idValue,
                );
            return;
        }
    }

    blurCountryAndCurrency(form: FormControl, propFilterArray: string, array: any[], formGroup: FormGroup) {
        if (this.getIsApproval()) return;
        // Carefullly !!! race condition with choosen by mouse from list in mat-autocomplete
        setTimeout(() => {
            this.formFocusing = (
                this.formFocusing?.form === this.idCurrency.get(PaymentFormProperty.ORIGINAL)
                || this.formFocusing?.form === this.country.get(PaymentFormProperty.ORIGINAL)
            ) ? null : this.formFocusing;
            this[propFilterArray] = array;
            const item = array.find((currency) => currency.textValue.toUpperCase() === form.value.toUpperCase());
            formGroup.get(PaymentFormProperty.ID).patchValue(item?.idValue);
            formGroup.get(PaymentFormProperty.EXCHANGE).patchValue(item?.isMainCountry || PaymentFlag.ZEROS);
        }, 100);
    }

    setFocusOCRScan(temp: FocusEvent, form: FormControl) {
        let formFocusing = this.formFocuses.find((formFocus) => formFocus.form === form);
        temp.target?.['setSelectionRange']?.(0, temp.target?.['value']?.length);
        if (!formFocusing) {
            formFocusing = {
                id: this.baseId + temp.target?.['id'],
                form,
            };
            this.formFocuses.push(formFocusing);
        }
        this.formFocusing = formFocusing;

        const formFocus = {
            fieldOnFocus: formFocusing.id,
            formOnFocus: new FormGroup({ [formFocusing.id]: new FormControl() }),
            documentFormName: '',
            isFieldImageCrop: false,
            fieldConfig: {
                type: MaterialControlType.INPUT,
            },
        };
        this.store.dispatch(this.administrationActions.setFieldFormOnFocus(formFocus as any));

        const { existVATs, index } = this.getExistVatsByFormFocusing(this.formFocusing.form);
        this.filteredVats = this.vatsDropdown.filter((option) => {
            return (
                (index === 0 && isNaN(+option.textValue)) ||
                (!existVATs.some((exist) => +exist === +option.textValue) && !isNaN(+option.textValue))
            );
        });
    }

    choose(event: Array<any>, formGroup: FormGroup, dataSourceProp: string) {
        event.forEach((e) => {
            if (
                e.key === 'IdChartOfAccounts' ||
                e.key === 'IdRepCostCentre' ||
                e.key === 'IdRepCostType' ||
                e.key === 'IdRepProjectNumber'
            ) {
                formGroup.get(PaymentFormProperty.ID).patchValue(e.value + '');
            }
            if (
                e.key === 'AccountMainNumber' ||
                e.key === 'CostCentre' ||
                e.key === 'CostType' ||
                e.key === 'ProjectNumber'
            ) {
                formGroup.patchValue({
                    [PaymentFormProperty.TITLE]: e.value,
                    [PaymentFormProperty.ORIGINAL]: e.value,
                });
            }
            if (e.key === 'Title') {
                formGroup.get('dataTitle')?.patchValue(e.value);
            }
        });
        this[dataSourceProp] = null;
    }

    selectVAT(matComplete: MatAutocompleteSelectedEvent, form: FormGroup) {
        form.get(PaymentFormProperty.ID).patchValue(
            this.vatsDropdown.find((v) => v.textValue === matComplete.option.value)?.idValue,
        );
    }

    selectCurrencyAndCountry(matComplete: MatAutocompleteSelectedEvent, form: FormGroup, originalArray: any[]) {
        form.get(PaymentFormProperty.ID).patchValue(
            originalArray.find((v) => v.textValue.toLowerCase() === matComplete.option.value.toLowerCase())?.idValue,
        );
    }

    validateBeforeSave(): boolean {
        this.clickedSave = true;
        return this.paymentForm.valid;
    }

    validateForm(): FormStatus {
        return <FormStatus>{
            isValid: this.paymentForm.valid,
            formTitle: 'Payment Overview',
            errorMessages: ['Error'],
        };
    }

    getDataSave(): { [key: string]: any } {
        const data = {} as any;
        for (const [key, value] of Object.entries(this.paymentForm.value)) {
            if (Array.isArray(value)) continue;
            const newKey = this[key].get(PaymentFormProperty.ALIAS_NAME)?.value;
            if (key === 'date') {
                const newdate = value[PaymentFormProperty.ORIGINAL].split('.').reverse().join('.');
                data[newKey] = newdate;
            } else if (key === 'exclVATInvoice' || key === 'inclVATInvoice' || key === 'term') {
                data[newKey] = value[PaymentFormProperty.ORIGINAL]['replaceAll']("'", '');
            } else {
                data[newKey] =
                    value[PaymentFormProperty.ID] || value[PaymentFormProperty.ID] === null
                        ? value[PaymentFormProperty.ID]
                        : value[PaymentFormProperty.ORIGINAL];
            }
        }

        let dataInvoiceMainApproval: any = {
            JSONInvoiceMainApproval: {
                InvoiceMainApproval: [
                    { ...data, ExchangeRate: this.ratioExchange, IdInvoiceMainApproval: this.idInvoiceMainApproval },
                ],
            },
        };

        if (
            this.vATs.controls.length &&
            !this.vATs.controls.some((control) =>
                isNaN(+control.get(PaymentFormProperty.ORIGINAL).value['replaceAll']("'", '')),
            )
        ) {
            dataInvoiceMainApproval = {
                ...dataInvoiceMainApproval,
                JSONInvoiceTaxAmount: {
                    InvoiceTaxAmount: this.vATs.controls.map((control) => ({
                        IdInvoiceTaxAmount: control.get('idInvoiceTaxAmount')?.value,
                        IdInvoiceMainApproval: this.idInvoiceMainApproval || null,
                        IdRepTaxRate: control.get(PaymentFormProperty.ID)?.value,
                        TaxAmount: control.get(PaymentFormProperty.CALCULATE)?.value['replaceAll']("'", ''),
                        TaxPercentage: control.get(PaymentFormProperty.ORIGINAL)?.value,
                        IsActive: 1,
                        IsDeleted: 0,
                        GrossAmount: control.get(PaymentFormProperty.INPUT)?.value['replaceAll']("'", ''), // TODO change property name "TaxInput"
                    })),
                },
            };
        }

        return dataInvoiceMainApproval;
    }

    reset() {
        this.clickedSave = false;
        this.bookingNrReadonly = false;
        this.apiNeeded.country$.next(false);
        this.apiNeeded.vat$.next(false);
        this.paymentForm.patchValue(this.getDataReset());
        while (this.vATs.length) {
            this.vATs.removeAt(0);
        }
        this.addVAT();
    }

    onKeydownCloseAutoComplete(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            this.vatCompletes?.forEach((vatComplete) => {
                vatComplete.closePanel?.();
            });
            this.currencyCompletes?.forEach((currencyComplete) => {
                currencyComplete.closePanel?.();
            });
            this.countryCompletes?.forEach((countryComplete) => {
                countryComplete.closePanel?.();
            });
        }
    }

    private updateFieldFilter() {
        if (this.widgetProperties?.length) {
            const propDisplayFields: WidgetPropertyModel = this.propertyPanelService.getItemRecursive(
                this.widgetProperties,
                'DisplayField',
            );
            const savingFieldFilters: FieldFilter[] = propDisplayFields.options.map((x) => {
                return new FieldFilter({
                    fieldName: x.key,
                    fieldDisplayName: x.value,
                    selected: x.selected,
                    isEditable: x.isEditable,
                    isHidden: x.isHidden,
                });
            });

            let item: FieldFilter;
            const applyFileds: FieldFilter[] = [];
            for (const [key, value] of Object.entries(this.paymentForm.value)) {
                item = savingFieldFilters.find((p) => p.fieldName === key);
                if (item) {
                    this[key].get(PaymentFormProperty.IS_HIDDEN)?.patchValue(!item.selected);
                }
                if (this[key].get(PaymentFormProperty.IS_HIDDEN)) {
                    applyFileds.push(
                        new FieldFilter({
                            fieldDisplayName: key,
                            fieldName: key,
                            selected: !this[key].get(PaymentFormProperty.IS_HIDDEN).value,
                            isHidden: this[key].get(PaymentFormProperty.IS_HIDDEN).value,
                            isEditable: false,
                            isTableField: false,
                        }),
                    );
                }
            }
            item = savingFieldFilters.find((p) => p.fieldName === this.displayExchangeCurrency.key);
            if (item) {
                this.displayExchangeCurrency.isHidden = !item.selected;
            }
            applyFileds.push(
                new FieldFilter({
                    fieldDisplayName: this.displayExchangeCurrency.key,
                    fieldName: this.displayExchangeCurrency.key,
                    selected: !this.displayExchangeCurrency.isHidden,
                    isHidden: this.displayExchangeCurrency.isHidden,
                    isEditable: false,
                    isTableField: false,
                }),
            );
            this.displayFieldsSubject.next(applyFileds);
        }
    }

    private setData(data: any[]) {
        const controlNames = Object.keys(this.paymentForm.controls);
        const patchValue = (form: AbstractControl, value: string, withComma: boolean = true): void => {
            if (!form) return;
            if (isNaN(Number(value))) {
                form.patchValue(value);
            } else if (!withComma) {
                form.patchValue(Uti.transformCommaNumber(value, false));
            } else {
                form.patchValue(Uti.transformCommaNumber(Uti.transformNumberHasDecimal(value), true));
            }
        };

        controlNames.forEach((controlName) => {
            let originalValue: string, textValue: string, valueTitle: string;
            data.forEach((d) => {
                if (d.OriginalColumnName === this[controlName].get(PaymentFormProperty.ORIGINAL_COLUMN_NAME)?.value) {
                    originalValue = d.Value;
                }
                if (d.OriginalColumnName === this[controlName].get(PaymentFormProperty.TEXT_COLUMN_NAME)?.value) {
                    textValue = d.Value;
                    patchValue(this[controlName].get(PaymentFormProperty.ORIGINAL), textValue, false);
                }
                if (d.OriginalColumnName === this[controlName].get('valueColumnName')?.value) {
                    valueTitle = d.Value;
                    patchValue(this[controlName].get('dataTitle'), valueTitle);
                }
            });
            if (originalValue) {
                if (this[controlName].get(PaymentFormProperty.ID)) {
                    this[controlName].get(PaymentFormProperty.ID).patchValue(originalValue);
                } else {
                    patchValue(
                        this[controlName].get(PaymentFormProperty.ORIGINAL),
                        originalValue,
                        controlName !== 'term',
                    );
                    patchValue(
                        this[controlName].get(PaymentFormProperty.CALCULATE),
                        originalValue,
                        controlName !== 'term',
                    );
                }
            }
        });

        this.ratioExchange = data.find((d) => d.OriginalColumnName === 'ExchangeRate')?.Value;
        const vatValue = data.find((d) => d.OriginalColumnName === 'VAT')?.Value;
        if (vatValue) {
            const vATs = JSON.parse(vatValue);
            vATs?.forEach((vAT) => {
                this.addVAT({
                    id: vAT.IdRepTaxRate,
                    [PaymentFormProperty.CALCULATE]: Uti.transformCommaNumber(
                        Uti.transformNumberHasDecimal(vAT.TaxAmount || ''),
                        true,
                    ),
                    [PaymentFormProperty.ORIGINAL]: Uti.transformCommaNumber(
                        Uti.transformNumberHasDecimal(vAT.TaxPercentage || ''),
                        true,
                    ),
                    inputValue: Uti.transformCommaNumber(Uti.transformNumberHasDecimal(vAT.GrossAmount || ''), true),
                    idInvoiceTaxAmount: vAT.IdInvoiceTaxAmount,
                });
            });
        }
    }

    private prepareQRCode(payload: any) {
        try {
            payload = JSON.parse(payload);
            const slip = payload.Slip;
            this.qRCode.applying = true;
            this.qRCode.currency = slip.Curreny;
            this.qRCode.idCurrency = this.currencies.find((cur) => cur.textValue.includes(slip.Curreny)).idValue;
            this.qRCode.inclVATInvoice = slip.InvoiceAmount;
        } catch (err) {
            console.log('some thing wrong when prepare QR code into payment-ovewview');
        }
    }

    private applyQRCode() {
        try {
            if (this.initedCurrency && this.qRCode.applying) {
                if (this.qRCode.idCurrency != null) {
                    this.idCurrency.get(PaymentFormProperty.ID).patchValue(this.qRCode.idCurrency);
                    this.idCurrency.get(PaymentFormProperty.ORIGINAL).patchValue(this.qRCode.currency);
                }
                if (this.qRCode.inclVATInvoice != null) {
                    this.inclVATInvoice.get(PaymentFormProperty.ORIGINAL).patchValue(this.qRCode.inclVATInvoice);
                }

                this.forceUpdateDataByExtractedMasterData();
            }
        } catch (err) {
            this.qRCode.applying = false;
            console.log('some thing wrong when apply QR code into payment-ovewview');
        }
    }

    private getDataReset(): any {
        return {
            costCentre: {
                [PaymentFormProperty.ORIGINAL]: '',
                [PaymentFormProperty.EXCHANGE]: null,
                [PaymentFormProperty.TITLE]: '',
                [PaymentFormProperty.ID]: null,
            },
            costType: {
                [PaymentFormProperty.ORIGINAL]: '',
                [PaymentFormProperty.EXCHANGE]: null,
                [PaymentFormProperty.TITLE]: '',
                [PaymentFormProperty.ID]: null,
            },
            projectNumber: {
                [PaymentFormProperty.ORIGINAL]: '',
                [PaymentFormProperty.EXCHANGE]: null,
                [PaymentFormProperty.TITLE]: '',
                [PaymentFormProperty.ID]: null,
            },
            idRepCurrencyCode: {
                [PaymentFormProperty.ID]: this.currencies?.find((cur) => cur.textValue.includes('CHF'))?.idValue,
            },
            idCurrency: {
                [PaymentFormProperty.ORIGINAL]: 'CHF',
                [PaymentFormProperty.EXCHANGE]: '',
                [PaymentFormProperty.ID]: this.currencies?.find((cur) => cur.textValue.includes('CHF'))?.idValue,
            },
            exclVATInvoice: {
                [PaymentFormProperty.ORIGINAL]: '0.00',
                [PaymentFormProperty.EXCHANGE]: '0.00',
            },
            inclVATInvoice: {
                [PaymentFormProperty.ORIGINAL]: '0.00',
                [PaymentFormProperty.EXCHANGE]: '0.00',
            },
            country: {
                [PaymentFormProperty.ORIGINAL]: this.countries[0]?.textValue,
                [PaymentFormProperty.EXCHANGE]: '',
                [PaymentFormProperty.ID]: this.countries[0]?.idValue,
            },
            term: {
                [PaymentFormProperty.ORIGINAL]: '0',
                [PaymentFormProperty.EXCHANGE]: null,
            },
            date: {
                [PaymentFormProperty.ORIGINAL]: this.datePipe.transform(new Date(), 'dd.MM.yyyy'),
                [PaymentFormProperty.EXCHANGE]: null,
            },
            bookingNr: {
                [PaymentFormProperty.ORIGINAL]: '',
                [PaymentFormProperty.EXCHANGE]: null,
                [PaymentFormProperty.TITLE]: '',
                [PaymentFormProperty.ID]: null,
                dataTitle: '',
            },
        };
    }

    private cheatForceCalculateByIncl() {
        this.forceCalculateByIncl = true;
        this.removingVAT = true;
        setTimeout(() => {
            this.removingVAT = false;
            this.forceCalculateByIncl = false;
        }, 200);
    }

    private subscribe() {
        this.vATs.valueChanges
            .pipe(
                // set id for VAT and NOVAT
                tap(() => {
                    if (this.isNoVAT) {
                        this.cheatForceCalculateByIncl();
                    }
                    this.isNoVAT = this.vATs.controls.some(
                        (contrl, index) => isNaN(+contrl.get(PaymentFormProperty.ORIGINAL).value) && index === 0,
                    );
                    if (this.isNoVAT) {
                        this.cheatForceCalculateByIncl();
                        for (let i = this.vATs.length - 1; i > 0; i--) {
                            this.vATs.removeAt(i);
                        }
                        this.inclVATInvoice.get(PaymentFormProperty.ORIGINAL).setErrors(null);
                        this.inclVATInvoice.get(PaymentFormProperty.CALCULATE).setErrors(null);
                    }

                    if (this.formFocusing?.form !== this.inclVATInvoice.get(PaymentFormProperty.ORIGINAL)) {
                        this.inclVATInvoice
                            .get(PaymentFormProperty.ORIGINAL)
                            .patchValue(
                                Uti.transformCommaNumber(
                                    Uti.transformNumberHasDecimal(
                                        Uti.transformCommaNumber(
                                            this.inclVATInvoice.get(PaymentFormProperty.ORIGINAL).value,
                                        ),
                                    ),
                                    true,
                                ),
                            );
                    }
                }),
                // calculate when form change values
                map(() => {
                    for (const vATControl of this.vATs.controls) {
                        if (vATControl.get(PaymentFormProperty.ORIGINAL) === this.formFocusing?.form) {
                            return PaymentFormProperty.ORIGINAL;
                        } else if (vATControl.get('inputValue') === this.formFocusing?.form) {
                            return 'inputValue';
                        }
                    }
                    return null;
                }),
                filter((control: string) => !!control || (this.removingVAT && !this.forceCalculateByIncl)),
                tap((control: string) => {
                    if (this.vATs.controls.length > 1 || (this.removingVAT && !this.forceCalculateByIncl)) {
                        let excl = '0',
                            incl = '0';
                        this.vATs.controls.forEach((current: FormGroup) => {
                            const eachExclRow = +Uti.transformNumberHasDecimal(
                                Uti.transformCommaNumber(current.get(PaymentFormProperty.INPUT).value),
                            );

                            excl = Uti.transformNumberHasDecimal(+excl + eachExclRow + '', 2, true);

                            incl = Uti.transformNumberHasDecimal(
                                +incl +
                                    eachExclRow +
                                    (eachExclRow *
                                        +Uti.transformNumberHasDecimal(
                                            Uti.transformCommaNumber(current.get(PaymentFormProperty.ORIGINAL).value),
                                        )) /
                                        100 +
                                    '',
                                2,
                                true,
                            );
                        });

                        this.exclVATInvoice
                            .get(PaymentFormProperty.ORIGINAL)
                            .patchValue(Uti.transformCommaNumber(excl + '', true));
                        this.inclVATInvoice
                            .get(PaymentFormProperty.CALCULATE)
                            .patchValue(Uti.transformCommaNumber(incl + '', true));
                    }
                }),
                map((control: string) => {
                    if (control === PaymentFormProperty.ORIGINAL) {
                        const { existVATs, index } = this.getExistVatsByFormFocusing(this.formFocusing?.form);
                        return this.vatsDropdown.filter(
                            (option) =>
                                !existVATs.some(
                                    (v) => +v === +option.textValue || (isNaN(+option.textValue) && index > 0),
                                ),
                        );
                    }
                    return [];
                }),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((validVats) => {
                this.filteredVats = validVats.filter(
                    (option) => option.textValue.indexOf(this.formFocusing?.form.value) === 0,
                );
            });

        // calculate date by term and (invoiceDate in supplier)
        combineLatest([this.term.get(PaymentFormProperty.ORIGINAL).valueChanges, this.appSelectors.invoiceDate$])
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe(([term, invoiceDate]) => {
                try {
                    this.date
                        .get(PaymentFormProperty.ORIGINAL)
                        .patchValue(
                            this.datePipe.transform(
                                dayFns.addDays(invoiceDate || new Date(), Number(Uti.transformCommaNumber(term))),
                                DAY_FORMAT,
                            ),
                        );
                } catch {
                    console.warn('error when parse day');
                }
            });

        // calculate inclVATInvoice by VAT and exclVATInvoice
        merge(this.exclVATInvoice.get(PaymentFormProperty.ORIGINAL).valueChanges, this.vATs.valueChanges)
            .pipe(
                filter(
                    () =>
                        this.getSetDetailSuccessNotApproval() &&
                        this.vATs.controls.length < 2 &&
                        this.formFocusing?.form !== this.inclVATInvoice.get(PaymentFormProperty.ORIGINAL) &&
                        !this.removingVAT &&
                        !this.qRCode.applying &&
                        !this.aiCode.applying,
                ),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe(() => {
                const excl = +Uti.transformNumberHasDecimal(
                    Uti.transformCommaNumber(this.exclVATInvoice.get(PaymentFormProperty.ORIGINAL).value),
                );
                const value = Uti.transformNumberHasDecimal(
                    excl +
                        this.vATs.controls.reduce(
                            (accumulator: number, current: FormGroup) =>
                                (+Uti.transformCommaNumber(current.get(PaymentFormProperty.ORIGINAL).value) * excl) /
                                    100 +
                                accumulator,
                            0,
                        ) +
                        '',
                    2,
                    true,
                );
                this.inclVATInvoice.get(PaymentFormProperty.ORIGINAL).patchValue(Uti.transformCommaNumber(value, true));
            });

        // calculate exclVATInvoice by inclVATInvoice
        this.inclVATInvoice
            .get(PaymentFormProperty.ORIGINAL)
            .valueChanges.pipe(
                filter(
                    () =>
                        this.getSetDetailSuccessNotApproval() &&
                        this.vATs.controls.length < 2 &&
                        (this.formFocusing?.form === this.inclVATInvoice.get(PaymentFormProperty.ORIGINAL) ||
                            (this.removingVAT && this.forceCalculateByIncl) ||
                            this.qRCode.applying),
                ),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((value) => {
                value = +Uti.transformNumberHasDecimal(Uti.transformCommaNumber(value));
                const sumRatio = this.vATs.controls.reduce((accumulator: number, current: FormGroup) => {
                    return (
                        accumulator + +Uti.transformCommaNumber(current.get(PaymentFormProperty.ORIGINAL).value) / 100
                    );
                }, 1);
                const returnValue = Uti.transformNumberHasDecimal(
                    value / (isNaN(sumRatio) ? 1 : sumRatio) + '',
                    2,
                    true,
                );
                this.exclVATInvoice
                    .get(PaymentFormProperty.ORIGINAL)
                    .patchValue(Uti.transformCommaNumber(returnValue, true));
            });

        this.inclVATInvoice
            .get(PaymentFormProperty.EXCHANGE)
            .valueChanges.pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((value) => {
                this.store.dispatch(
                    new InvoiceIncludeExchanged({ invoiceIncludeExchanged: Uti.transformCommaNumber(value) }),
                );
            });

        // currency and country
        this.idCurrency
            .get(PaymentFormProperty.ID)
            .valueChanges.pipe(
                filter((idCurrency) => !!idCurrency),
                distinctUntilChanged(),
                switchMap((idCurrency) => {
                    const currency = this.idDocument
                        ? this.idCurrency.get(PaymentFormProperty.ORIGINAL).value
                        : this.currencies.find((curr) => idCurrency === curr.idValue)?.textValue;
                    return forkJoin([
                        this.bloombergService.getExchangeMoney(currency, this.baseCurrency),
                        this.commonService.getListComboBox(
                            `CountriesCurrency&strObject=CountriesCurrency&mode=${currency}`,
                        ),
                    ]);
                }),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe(([resExchange, resCountries]) => {
                if (!this.getIsApproval()) {
                    if (!resExchange.item) {
                        this.toasterService.pop('warning', 'System', 'Something occurs error when get exchange rate');
                    } else if (resExchange.item.chf && this.getSetDetailSuccessNotApproval()) {
                        this.ratioExchange = resExchange.item.chf.toFixed(12);
                    }
                    if ((Object.keys(resCountries.item) + '').indexOf('CountriesCurrency') !== -1) {
                        this.filteredCountries = this.countries = resCountries.item.countriesCurrency || [];
                        this.selectingCountryFromApi = true;
                        console.log(this.getSetDetailSuccessNotApproval());
                        if (this.getSetDetailSuccessNotApproval()) {
                            this.country.get(PaymentFormProperty.ID).patchValue(this.countries[0]?.idValue);
                            this.country.get(PaymentFormProperty.ORIGINAL).patchValue(this.countries[0]?.textValue);
                            this.country.get(PaymentFormProperty.EXCHANGE).patchValue(this.countries[0]?.isMainCountry);
                        }
                        setTimeout(() => {
                            this.selectingCountryFromApi = false;
                        });
                    }
                    this.apiNeeded.country$.next(true);
                }
            });

        this.idCurrency
            .get(PaymentFormProperty.ORIGINAL)
            .valueChanges.pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((value) => {
                this.appErrorHandler.executeAction(() => {
                    if (this.formFocusing?.form === this.idCurrency.get(PaymentFormProperty.ORIGINAL)) {
                        this.filteredCurrencies = this.currencies.filter(
                            (option) =>
                                option.textValue.toUpperCase().indexOf(this.formFocusing?.form.value.toUpperCase()) ===
                                0,
                        );
                    }
                });
            });

        this.country
            .get(PaymentFormProperty.ID)
            .valueChanges.pipe(
                filter((idCountry) => !!idCountry),
                distinctUntilChanged(),
                switchMap((idCountry) => {
                    return this.commonService.getListComboBox(`VAT&strObject=VAT&mode=${idCountry}`);
                }),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((response: ApiResultResponse) => {
                this.appErrorHandler.executeAction(() => {
                    if (!this.getIsApproval()) {
                        if (!this.qRCode.applying && !this.aiCode.applying && this.getSetDetailSuccessNotApproval()) {
                            this.inclVATInvoice.get(PaymentFormProperty.ORIGINAL).patchValue('0.00');
                            this.exclVATInvoice.get(PaymentFormProperty.ORIGINAL).patchValue('0.00');
                        }

                        while (this.vATs.length && this.getSetDetailSuccessNotApproval()) {
                            this.vATs.removeAt(0);
                        }

                        this.qRCode.applying = false;
                        this.aiCode.applying = false;
                        this.vatsDropdown =
                            response?.item?.vat?.map((v) => {
                                return {
                                    ...v,
                                    textValue: isNaN(+v.textValue)
                                        ? v.textValue
                                        : Uti.transformNumberHasDecimal(v.textValue),
                                };
                            }) || [];
                        this.hasNoVATInDropdown = this.vatsDropdown.some((vat) => isNaN(+vat.textValue));
                        this.filteredVats = this.vatsDropdown;
                        if (this.vatsDropdown.length && this.getSetDetailSuccessNotApproval()) {
                            this.addVAT();
                        }
                        this.apiNeeded.vat$.next(true);
                    }
                });
            });

        this.country
            .get(PaymentFormProperty.ORIGINAL)
            .valueChanges.pipe(
                filter(() => !this.selectingCountryFromApi),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((value) => {
                this.appErrorHandler.executeAction(() => {
                    if (this.formFocusing?.form === this.country.get(PaymentFormProperty.ORIGINAL)) {
                        this.filteredCountries = this.countries.filter(
                            (option) =>
                                option.textValue.toUpperCase().indexOf(this.formFocusing?.form.value.toUpperCase()) ===
                                0,
                        );
                    }
                });
            });

        this.bookingNr
            .get(PaymentFormProperty.ORIGINAL)
            .valueChanges.pipe(
                tap((booking) => {
                    if (!booking) {
                        this.bookingNr.patchValue({ [PaymentFormProperty.ID]: null });
                    }
                }),
                filter(
                    (booking) =>
                        this.getSetDetailSuccessNotApproval() &&
                        booking !== this.bookingNr.get(PaymentFormProperty.TITLE).value &&
                        (this.formFocusing?.form === this.bookingNr.get(PaymentFormProperty.ORIGINAL) ||
                            this.bookingNr.get(PaymentFormProperty.ORIGINAL).value),
                ),
                tap(() => {
                    this.bookingNr.patchValue({ dataTitle: '', [PaymentFormProperty.ID]: null });
                }),
                debounceTime(100),
                switchMap((booking) => {
                    return this.invoiceAprrovalService.searchBookingInfo(booking);
                }),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((res: any) => {
                this.dataSourceBookingNr = this.datatableService.buildEditableDataSource(res.item);
            });

        this.costCentre
            .get(PaymentFormProperty.ORIGINAL)
            .valueChanges.pipe(
                tap((booking) => {
                    if (!booking) {
                        this.costCentre.patchValue({ [PaymentFormProperty.ID]: null });
                    }
                }),
                filter(
                    (booking) =>
                        this.getSetDetailSuccessNotApproval() &&
                        booking !== this.costCentre.get(PaymentFormProperty.TITLE).value &&
                        (this.formFocusing?.form === this.costCentre.get(PaymentFormProperty.ORIGINAL) ||
                            this.costCentre.get(PaymentFormProperty.ORIGINAL).value),
                ),
                tap(() => {
                    this.costCentre.patchValue({ dataTitle: '', [PaymentFormProperty.ID]: null });
                }),
                debounceTime(100),
                switchMap((booking) => {
                    return this.invoiceAprrovalService.searchCostCentre(booking);
                }),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((res: any) => {
                this.dataSourceCostCentre = this.datatableService.buildEditableDataSource(res.item);
            });

        this.costCentre
            .get(PaymentFormProperty.ID)
            .valueChanges.pipe(distinctUntilChanged(), takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((id) => {
                this.store.dispatch(
                    new KostnestelleChange({
                        kostnestelleData: {
                            type: WidgetApp.WidgetPaymentOverview,
                            data: id,
                        },
                    }),
                );
            });

        this.costType
            .get(PaymentFormProperty.ORIGINAL)
            .valueChanges.pipe(
                tap((booking) => {
                    if (!booking) {
                        this.costType.patchValue({ [PaymentFormProperty.ID]: null });
                    }
                }),
                filter(
                    (booking) =>
                        this.getSetDetailSuccessNotApproval() &&
                        booking !== this.costType.get(PaymentFormProperty.TITLE).value &&
                        (this.formFocusing?.form === this.costType.get(PaymentFormProperty.ORIGINAL) ||
                            this.costType.get(PaymentFormProperty.ORIGINAL).value),
                ),
                tap(() => {
                    this.costType.patchValue({ dataTitle: '', [PaymentFormProperty.ID]: null });
                }),
                debounceTime(100),
                switchMap((booking) => {
                    return this.invoiceAprrovalService.searchCostType(booking);
                }),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((res: any) => {
                this.dataSourceCostType = this.datatableService.buildEditableDataSource(res.item);
            });

        this.projectNumber
            .get(PaymentFormProperty.ORIGINAL)
            .valueChanges.pipe(
                tap((booking) => {
                    if (!booking) {
                        this.projectNumber.patchValue({ [PaymentFormProperty.ID]: null });
                    }
                }),
                filter(
                    (booking) =>
                        this.getSetDetailSuccessNotApproval() &&
                        booking !== this.projectNumber.get(PaymentFormProperty.TITLE).value &&
                        (this.formFocusing?.form === this.projectNumber.get(PaymentFormProperty.ORIGINAL) ||
                            this.projectNumber.get(PaymentFormProperty.ORIGINAL).value),
                ),
                tap(() => {
                    this.projectNumber.patchValue({ dataTitle: '', [PaymentFormProperty.ID]: null });
                }),
                debounceTime(100),
                switchMap((booking) => {
                    return this.invoiceAprrovalService.searchProjectNumber(booking);
                }),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((res: any) => {
                this.dataSourceProjectNumber = this.datatableService.buildEditableDataSource(res.item);
            });
    }

    private getExistVatsByFormFocusing(form: FormControl): { existVATs: string[]; index: number } {
        let index: number;
        const existVATs = this.vATs.controls.reduce((accumulator: string[], vATControl: FormGroup, i: number) => {
            if (vATControl.get(PaymentFormProperty.ORIGINAL) !== form) {
                accumulator.push(vATControl.get(PaymentFormProperty.ORIGINAL).value);
            } else {
                index = i;
            }
            return accumulator;
        }, []);
        return { existVATs, index };
    }

    private parseConfigToWidthHeight() {
        try {
            this.width = $(this.element.nativeElement).parent().width();
            this.height = $(this.element.nativeElement).parent().height();
        } catch (error) {
            this.width = 0;
            this.height = 0;
        }
    }

    private validatorDropdown(formGroupName: string): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {
            const valid =
                this.paymentForm?.get(formGroupName)?.get(PaymentFormProperty.ORIGINAL)?.value === '' ||
                this.paymentForm?.get(formGroupName)?.get(PaymentFormProperty.ID)?.value;
            return valid ? null : { invalid: { value: control.value } };
        };
    }

    private validatorVAT(): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {
            const { existVATs, index } = this.getExistVatsByFormFocusing(
                this.formFocusing?.form || this.lastVATFormFocus,
            );
            const validVATs = this.vatsDropdown.filter((option) => {
                return !existVATs.some(
                    (exist) => exist === option.textValue || (isNaN(+option.textValue) && index > 0),
                );
            });
            const isBelong =
                validVATs.some(
                    (v) =>
                        v.textValue ===
                        (isNaN(+control.value) ? control.value : Uti.transformNumberHasDecimal(control.value)),
                ) ||
                (!control.touched && control.pristine);
            return isBelong ? null : { isBelong: { value: control.value } };
        };
    }

    private validatorIncl(): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {
            if (this.paymentForm?.get('inclVATInvoice')) {
                const isEqual =
                    Uti.transformNumberHasDecimal(
                        Uti.transformCommaNumber(this.inclVATInvoice.get(PaymentFormProperty.CALCULATE).value),
                    ) ===
                    Uti.transformNumberHasDecimal(
                        Uti.transformCommaNumber(this.inclVATInvoice.get(PaymentFormProperty.ORIGINAL).value),
                    );
                const error =
                    this.getIsApproval() || isEqual || this.vATs.controls.length < 2
                        ? null
                        : { isEqual: { value: control.value } };
                this.inclVATInvoice.get(PaymentFormProperty.ORIGINAL).setErrors(error);
                this.inclVATInvoice.get(PaymentFormProperty.CALCULATE).setErrors(error);
                return error;
            }
        };
    }

    private parseSettingForSave(data: any) {
        let setting: any[];
        const controlNames = Object.keys(this.paymentForm.controls);
        let controlName: string = '';
        data.forEach((it) => {
            controlName = controlNames.find(
                (controlName) =>
                    this[controlName].get(PaymentFormProperty.ORIGINAL_COLUMN_NAME)?.value === it.OriginalColumnName,
            );
            if (controlName) {
                setting = JSON.parse(it.Setting)[1]?.CallConfig;
                this[controlName].get(PaymentFormProperty.ALIAS_NAME)?.patchValue(setting[0]?.Alias);
            }
        });
    }

    private changePropToLowerCase(data: { [key: string]: any }): { [key: string]: any } {
        let newO, origKey, newKey, value;
        if (data instanceof Array) {
            return data.map((value) => {
                if (typeof value === 'object') {
                    value = this.changePropToLowerCase(value);
                }
                return value;
            });
        } else {
            newO = {};
            for (origKey in data) {
                if (data.hasOwnProperty(origKey)) {
                    newKey = (origKey.charAt(0).toLowerCase() + origKey.slice(1) || origKey).toString();
                    value = data[origKey];
                    if (value instanceof Array || (value !== null && value.constructor === Object)) {
                        value = this.changePropToLowerCase(value);
                    }
                    newO[newKey] = value;
                }
            }
        }
        return newO;
    }

    private forceUpdateDataByExtractedMasterData() {
        if (!this.extractedMasterData) return;
        try {
            const totalString = this.extractedMasterData.find((x) => x.name === 'InvoiceAmountInclVAT')?.value;
            let vatString = this.extractedMasterData.find((x) => x.name === 'vat_percent')?.value;
            let vatItem;
            if (vatString) {
                vatString = vatString.replace('%', '');
                const vatNumber = Number(vatString);
                vatItem = this.vatsDropdown.find((x) => vatNumber === Number(x.textValue));
            } else {
                vatItem = this.vatsDropdown.find((x) => Number('7.7') === Number(x.textValue));
            }
            if (vatItem) {
                this.vATs.controls[0]?.get(PaymentFormProperty.ID).patchValue(vatItem.idValue);
                this.vATs.controls[0]?.get(PaymentFormProperty.ORIGINAL).patchValue(vatItem.textValue);
            }
            if (totalString) {
                this.cheatForceCalculateByIncl();
                const total = Uti.transformCommaNumber(Uti.transformNumberHasDecimal(totalString.split(' ')[0]));
                this.inclVATInvoice.controls[PaymentFormProperty.ORIGINAL].patchValue(total);
            }
        } catch (error) {
            console.warn(error);
        }
    }
}
