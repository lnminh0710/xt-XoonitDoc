import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Input,
    OnDestroy,
    TemplateRef,
    ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
    ExtractedMasterDataPersonType,
    ExtractedMasterDataWidgetType,
    MessageModal,
    TypeDataSet,
} from '@app/app.constants';
import { MasterExtractedData as MasterExtractedData } from '@app/models/approval/master-extracted.model';
import {
    InvoiceApprovalProcessingActionNames,
    InvoiceApprovalProcessingActions,
} from '@app/pages/invoice-approval-processing/invoice-approval-processing.statemanagement/invoice-approval-processing.actions';
import { InvoiceApprovalProcessingSelectors } from '@app/pages/invoice-approval-processing/invoice-approval-processing.statemanagement/invoice-approval-processing.selectors';
import { BaseComponent } from '@app/pages/private/base';
import { AppState } from '@app/state-management/store';
import { AdministrationDocumentActionNames, CustomAction } from '@app/state-management/store/actions';
import { Store } from '@ngrx/store';
import { takeUntil } from 'rxjs/operators';
import { HeaderNoticeRef } from '../global-popup/components/header-popup/header-notice-ref';
import { PopupRef } from '../global-popup/popup-ref';
import { PopupService } from '../global-popup/services/popup.service';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { IconNames } from '@app/app-icon-registry.service';
import { ExtractedDataHandlerComponent } from './extracted-data-handler/extracted-data-handler.component';
import { ToasterService } from 'angular2-toaster';
import { TranslateService } from '@ngx-translate/core';
import { InvoiceAprrovalService } from '@app/services';
import { AdministrationDocumentSelectors } from '@app/state-management/store/reducer';

@Component({
    selector: 'extracted-data-approval-processing',
    templateUrl: './extracted-data-approval-processing.component.html',
    styleUrls: ['./extracted-data-approval-processing.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExtractedDataApprovalProcessingComponent extends BaseComponent implements OnDestroy {
    @Input() globalProperties: any;

    public TYPE_DATA_SET = TypeDataSet;
    public EXTRACTED_MASTER_DATA_WIDGET_TYPE = ExtractedMasterDataWidgetType;
    public EXTRACTED_MASTER_DATA_PERSON_TYPE = ExtractedMasterDataPersonType;
    public ID_PERSON_KEY = 'IdPerson';
    IdRepPersonType;
    public ID_PERSON_TYPE_KEY = 'IdRepPersonType';
    public PERSON_TYPE_KEY = 'PersonType';
    public warningMessage = '';

    public idDocumentContainerScans: string;

    public showMandant = false;
    public showSupplier = false;
    public svgPrev = IconNames.GRIP;

    public mandantData: MasterExtractedData;
    public supplierData: MasterExtractedData;
    public contactsData: MasterExtractedData;

    public mandantList = [];
    public contactList = [];
    public supplierList = [];

    public mandantSelected: MasterExtractedData;
    public supplierSelected: MasterExtractedData;

    private idPersonMandant: string;
    private idPersonSupplier: string;

    public currentPopup: PopupRef<any>;
    @ViewChild('extractedDataTemplate') extractedDataTemplate: TemplateRef<any>;
    @ViewChild('mandantExtractDataHandler') mandantExtractDataHandler: ExtractedDataHandlerComponent;
    @ViewChild('supplierExtractDataHandler') supplierExtractDataHandler: ExtractedDataHandlerComponent;
    @ViewChild('elBtnClose') elBtnClose: ElementRef<any>;
    constructor(
        protected router: Router,
        private route: ActivatedRoute,
        protected cdRef: ChangeDetectorRef,
        protected store: Store<AppState>,
        public popupService: PopupService,
        protected invoiceApprovalProcessingActions: InvoiceApprovalProcessingActions,
        protected invoiceApprovalProcessingSelectors: InvoiceApprovalProcessingSelectors,
        private toastrService: ToasterService,
        protected translateService: TranslateService,
        private invoiceApprovalService: InvoiceAprrovalService,
        private administrationDocumentSelectors: AdministrationDocumentSelectors,
    ) {
        super(router);

        this.onSubscribeAction();
    }

    public ngOnDestroy(): void {
        super.onDestroy();
    }

    private onSubscribeAction() {
        this.invoiceApprovalProcessingSelectors
            .actionSuccessOfSubtype$(InvoiceApprovalProcessingActionNames.GET_EXTRACTED_DATA_WHEN_INIT)
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((action: CustomAction) => {
                if (this.currentPopup) this.currentPopup.close();

                const data = action?.payload?.item;
                if (!data || !data.length) {
                    this.store.dispatch(
                        this.invoiceApprovalProcessingActions.setExtractedMasterDataInvoiceAndPaymentWidgetAction(null),
                    );
                    return;
                }

                // // principle: for version 1
                // // 1/ if table:
                // //      a/ 1 record => apply direct to component ====> show: false
                // //      b/ else show true
                // // 2/ if form: show true
                // // 3/ null, empty: show false
                // this.showMandant = this.showDataOnDialog(this.mandantData);
                // this.showSupplier = this.showDataOnDialog(this.supplierData);
                // if (this.showMandant || this.showSupplier) {
                //     const currentWidth = window.screen.width;
                //     this.currentPopup = this.popupService.open({
                //         content: this.extractedDataTemplate,
                //         hasBackdrop: true,
                //         header: new HeaderNoticeRef({
                //             iconClose: true,
                //             title: 'Extraction Data',
                //             icon: { content: '', type: 'resource' },
                //         }),
                //         disableCloseOutside: true,
                //         width: (currentWidth * 95) / 100,
                //         optionResize: true,
                //     });
                //     this.currentPopup.afterClosed$.subscribe(
                //         (() => {
                //             console.log('close extractedDataTemplate');
                //         }).bind(this),
                //     );
                //     this.cdRef.detectChanges();
                // }

                // parse data for Invoice Infomation and Payment Overview widget
                const invoiceData = data.find(
                    (x) => x.widgetType === this.EXTRACTED_MASTER_DATA_WIDGET_TYPE.INVOICE_INFO,
                );
                if (invoiceData?.data?.length) {
                    this.store.dispatch(
                        this.invoiceApprovalProcessingActions.setExtractedMasterDataInvoiceAndPaymentWidgetAction(
                            invoiceData,
                        ),
                    );
                }

                this.contactsData = data.find((x) => x.widgetType === this.EXTRACTED_MASTER_DATA_WIDGET_TYPE.CONTACT);
                this.mandantData = data.find((x) => x.widgetType === this.EXTRACTED_MASTER_DATA_WIDGET_TYPE.MANDANT);
                this.supplierData = data.find((x) => x.widgetType === this.EXTRACTED_MASTER_DATA_WIDGET_TYPE.SUPPLIER);

                this.contactList = this.contactsData?.data;
                if (!this.contactList?.length) return;

                // not show dialog: when has 1 record with type Mandant/Supplier and IdPerson not null -> set direct to widget Mandant/Supplier
                if (this.contactList.length === 1) {
                    const itemData = this.contactList[0];
                    const idPerson = itemData[this.ID_PERSON_KEY];
                    if (idPerson) {
                        this.setExtractedMasterDataForMandantOrSupplier(itemData);
                        return;
                    }
                }

                // not show dialog: when has 2 records with: 1 is Mandant and 1 is Supplier and IdPerson not null -> set direct to 2 widget Mandant-Supplier
                if (this.contactList.length === 2) {
                    const firstItem = this.contactList[0];
                    const secondItem = this.contactList[1];

                    if (
                        firstItem[this.ID_PERSON_KEY] &&
                        secondItem[this.ID_PERSON_KEY] &&
                        ((firstItem[this.PERSON_TYPE_KEY] === this.EXTRACTED_MASTER_DATA_PERSON_TYPE.SUPPLIER &&
                            secondItem[this.PERSON_TYPE_KEY] === this.EXTRACTED_MASTER_DATA_PERSON_TYPE.MANDANT) ||
                            (firstItem[this.PERSON_TYPE_KEY] === this.EXTRACTED_MASTER_DATA_PERSON_TYPE.MANDANT &&
                                secondItem[this.PERSON_TYPE_KEY] === this.EXTRACTED_MASTER_DATA_PERSON_TYPE.SUPPLIER))
                    ) {
                        this.setExtractedMasterDataForMandantOrSupplier(firstItem);
                        this.setExtractedMasterDataForMandantOrSupplier(secondItem);
                        return;
                    }
                }

                const currentWidth = window.innerWidth;
                const currentHeight = window.innerHeight;
                const headerHeight = 53;
                const paddingScreen = 20;
                this.currentPopup = this.popupService.open({
                    content: this.extractedDataTemplate,
                    hasBackdrop: true,
                    header: new HeaderNoticeRef({
                        iconClose: true,
                        title: this.translateService.instant('EXTRACTED_DATA_APPROVAL_PROCESSING__extracted_data'),
                        icon: { content: '', type: 'resource' },
                    }),
                    disableCloseOutside: true,
                    width: currentWidth - paddingScreen,
                    height: currentHeight - headerHeight - paddingScreen,
                    offsetY: headerHeight / 2,
                    optionResize: false,
                    containerClass: 'custom-header',
                });
                this.currentPopup.afterClosed$.subscribe(
                    (() => {
                        this.resetData();
                    }).bind(this),
                );

                // run in the last
                setTimeout(() => {
                    // auto set data to Mandant & Supplier widgets
                    const mandantInContacts = this.contactList.filter(
                        (x) => x[this.PERSON_TYPE_KEY] === this.EXTRACTED_MASTER_DATA_PERSON_TYPE.MANDANT,
                    );
                    const supplierInContacts = this.contactList.filter(
                        (x) => x[this.PERSON_TYPE_KEY] === this.EXTRACTED_MASTER_DATA_PERSON_TYPE.SUPPLIER,
                    );
                    if (mandantInContacts?.length === 1) {
                        this.dropItemToMandant(mandantInContacts[0], true);
                    }
                    if (supplierInContacts?.length === 1) {
                        this.dropItemToSupplier(supplierInContacts[0], true);
                    }
                }, 0);
            });

            this.administrationDocumentSelectors
            .actionOfType$(AdministrationDocumentActionNames.CLOSE_EXTRACTION_DATA)
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((action: CustomAction) => {
                if (action.payload) {
                    this.elBtnClose?.nativeElement?.click();
                }
            });
    }

    private setExtractedMasterDataForMandantOrSupplier(itemData: any) {
        switch (itemData[this.PERSON_TYPE_KEY]) {
            case this.EXTRACTED_MASTER_DATA_PERSON_TYPE.SUPPLIER:
                const idPersonSupplier = itemData[this.ID_PERSON_KEY];
                this.store.dispatch(
                    this.invoiceApprovalProcessingActions.setExtractedMasterDataSupplierAction(<MasterExtractedData>{
                        typeDataSet: this.supplierData.typeDataSet,
                        data: itemData,
                        idPerson: idPersonSupplier,
                    }),
                );
                break;
            case this.EXTRACTED_MASTER_DATA_PERSON_TYPE.MANDANT:
                const idPersonMandant = itemData[this.ID_PERSON_KEY];
                this.store.dispatch(
                    this.invoiceApprovalProcessingActions.setExtractedMasterDataMandantOveriewAction(<
                        MasterExtractedData
                    >{
                        typeDataSet: this.mandantData.typeDataSet,
                        data: itemData,
                        idPerson: idPersonMandant,
                    }),
                );
                break;
            default:
                break;
        }
    }

    private resetData() {
        this.showMandant = false;
        this.showSupplier = false;

        this.mandantData = null;
        this.supplierData = null;
        this.contactsData = null;

        this.mandantSelected = null;
        this.supplierSelected = null;

        this.mandantList = [];
        this.supplierList = [];
        this.contactList = [];

        this.idPersonMandant = '';
        this.idPersonSupplier = '';

        this.cdRef.detectChanges();
    }
    public closeDialog(funcClose: any) {
        this.resetData();
        funcClose();
    }

    private sendExtractedMandantAndSupplier(closeFunc: any, hasSetIdPersonToItemInList = false) {
        if (this.isNotClosePopup()) return;

        if (this.idPersonMandant) {
            if (hasSetIdPersonToItemInList) this.setIdPersonToItemInMandantList(this.idPersonMandant);

            this.store.dispatch(
                this.invoiceApprovalProcessingActions.setExtractedMasterDataMandantOveriewAction(<MasterExtractedData>{
                    typeDataSet: this.mandantData.typeDataSet,
                    data: this.mandantExtractDataHandler.getDataSaveFunc(),
                    idPerson: this.idPersonMandant,
                }),
            );
        }

        if (this.idPersonSupplier) {
            if (hasSetIdPersonToItemInList) this.setIdPersonToItemInSupplierList(this.idPersonSupplier);

            this.store.dispatch(
                this.invoiceApprovalProcessingActions.setExtractedMasterDataSupplierAction(<MasterExtractedData>{
                    typeDataSet: this.supplierData.typeDataSet,
                    data: this.supplierExtractDataHandler.getDataSaveFunc(),
                    idPerson: this.idPersonSupplier,
                }),
            );
        }

        this.closeDialog(closeFunc);
    }
    public acceptAction(closeFunc: any) {
        const mandantIsValid = this.mandantExtractDataHandler.isValid();
        const supplierIsValid = this.supplierExtractDataHandler.isValid();
        if (!mandantIsValid || !supplierIsValid) {
            this.toastrService.clear();

            this.toastrService.pop(
                MessageModal.MessageType.error,
                this.translateService.instant('COMMON_LABEL__Error'),
                this.translateService.instant('COMMON_LABEL__There_are_some_fields_are_invalid'),
            );
            return;
        }

        this.idPersonMandant = this.idPersonMandant
            ? this.idPersonMandant
            : this.mandantList[0]
            ? this.mandantList[0][this.ID_PERSON_KEY]
            : '';
        this.idPersonSupplier = this.idPersonSupplier
            ? this.idPersonSupplier
            : this.supplierList[0]
            ? this.supplierList[0][this.ID_PERSON_KEY]
            : '';
        if (this.idPersonMandant && this.idPersonSupplier) {
            this.sendExtractedMandantAndSupplier(closeFunc);
            return;
        }

        const isMandantFormEmpty = this.mandantExtractDataHandler.wdDynamicForm.isAllDisplayFieldsEmpty();
        const isSupplierFormEmpty = this.supplierExtractDataHandler.wdDynamicForm.isAllDisplayFieldsEmpty();

        // if id null and form has value --> will set to -1 wait response from server
        this.idPersonMandant = !this.idPersonMandant && !isMandantFormEmpty ? '-1' : this.idPersonMandant;
        this.idPersonSupplier = !this.idPersonSupplier && !isSupplierFormEmpty ? '-1' : this.idPersonMandant;

        if (!this.idPersonMandant || this.idPersonMandant === '-1') {
            if (isMandantFormEmpty) {
                this.toastrService.pop(
                    MessageModal.MessageType.warning,
                    this.translateService.instant('COMMON_LABEL__Warning'),
                    this.translateService.instant('EXTRACTED_DATA_APPROVAL_PROCESSING__no_selection_MANDAT'),
                );
            } else {
                this.invoiceApprovalService
                    .saveDynamicForm(this.mandantExtractDataHandler.getDataSaveFunc())
                    .subscribe((response) => {
                        const item = response.item || {};
                        if (item.isSuccess && item.returnID !== -1) {
                            this.idPersonMandant = item.returnID;
                            this.mandantExtractDataHandler.wdDynamicForm.setFormValue(
                                this.ID_PERSON_KEY,
                                item.returnID,
                            );
                            this.setIdPersonToItemInMandantList(item.returnID);
                            this.sendExtractedMandantAndSupplier(closeFunc, true);
                        } else {
                            this.toastrService.pop(
                                MessageModal.MessageType.error,
                                this.translateService.instant('COMMON_LABEL__Error'),
                                this.translateService.instant(
                                    'EXTRACTED_DATA_APPROVAL_PROCESSING__create_MANDANT_Fail',
                                ),
                            );
                        }
                    });
            }
        }

        if (!this.idPersonSupplier || this.idPersonSupplier === '-1') {
            if (isSupplierFormEmpty) {
                this.toastrService.pop(
                    MessageModal.MessageType.warning,
                    this.translateService.instant('COMMON_LABEL__Warning'),
                    this.translateService.instant('EXTRACTED_DATA_APPROVAL_PROCESSING__no_selection_SUPPLIER'),
                );
            } else {
                this.invoiceApprovalService
                    .saveDynamicForm(this.supplierExtractDataHandler.getDataSaveFunc())
                    .subscribe((response) => {
                        const item = response.item || {};
                        if (item.isSuccess && item.returnID !== -1) {
                            this.idPersonSupplier = item.returnID;
                            this.supplierExtractDataHandler.wdDynamicForm.setFormValue(
                                this.ID_PERSON_KEY,
                                item.returnID,
                            );

                            this.setIdPersonToItemInSupplierList(item.returnID);
                            this.sendExtractedMandantAndSupplier(closeFunc, true);
                        } else {
                            this.toastrService.pop(
                                MessageModal.MessageType.error,
                                this.translateService.instant('COMMON_LABEL__Error'),
                                this.translateService.instant(
                                    'EXTRACTED_DATA_APPROVAL_PROCESSING__create_SUPPLIER_Fail',
                                ),
                            );
                        }
                    });
            }
        }

        if (this.isNotClosePopup()) return;

        //if idPersonMandant or idPersonSupplier has value
        this.sendExtractedMandantAndSupplier(closeFunc);

        this.closeDialog(closeFunc);
    }

    private isNotClosePopup(): boolean {
        // -1 is WAIT response from create mandant or supplier
        return this.idPersonMandant === '-1' || this.idPersonSupplier === '-1';
    }

    private setIdPersonToItemInMandantList(id: string) {
        if (this.mandantList[0] && id) {
            this.mandantList[0][this.ID_PERSON_KEY] = id;
        }
    }
    private setIdPersonToItemInSupplierList(id: string) {
        if (this.supplierList[0]) {
            this.supplierList[0][this.ID_PERSON_KEY] = id;
        }
    }

    public rowSelectedAction(rowSelected: MasterExtractedData) {
        if (!rowSelected) return;

        if ((rowSelected.widgetType = this.EXTRACTED_MASTER_DATA_WIDGET_TYPE.MANDANT))
            this.mandantSelected = rowSelected.data;
        else if ((rowSelected.widgetType = this.EXTRACTED_MASTER_DATA_WIDGET_TYPE.SUPPLIER))
            this.supplierSelected = rowSelected.data;
    }

    public drop(event: CdkDragDrop<any>, widgetType: string) {
        if (!event.item) return;

        if (event.previousContainer !== event.container) {
            this.setDataByWidgetType(widgetType, event.item.data);
        }
    }

    public setDataByWidgetType(widgetType, data) {
        switch (widgetType) {
            case this.EXTRACTED_MASTER_DATA_PERSON_TYPE.MANDANT:
                this.dropItemToMandant(data);
                break;
            case this.EXTRACTED_MASTER_DATA_PERSON_TYPE.SUPPLIER:
                this.dropItemToSupplier(data);
                break;
            default:
                break;
        }
    }

    private updateContactListAfterDropItem(itemData: any, firstItem: any) {
        const index = this.contactList.indexOf(itemData);
        this.contactList.splice(index, 1);
        if (firstItem) this.contactList.push(firstItem);
    }

    private dropItemToMandant(itemData: any, isReadOnly = false) {
        if (this.isDenyDragdropToForm(itemData, this.EXTRACTED_MASTER_DATA_PERSON_TYPE.SUPPLIER)) return;

        const firstItem = this.mandantList[0];
        if (firstItem) {
            this.mandantList = [];
        }
        this.mandantList.push(itemData);
        this._setMandantFormData(isReadOnly);
        this.updateContactListAfterDropItem(itemData, firstItem);

        this.cdRef.detectChanges();
    }

    private dropItemToSupplier(itemData: any, isReadOnly = false) {
        if (this.isDenyDragdropToForm(itemData, this.EXTRACTED_MASTER_DATA_PERSON_TYPE.MANDANT)) return;

        const firstItem = this.supplierList[0];
        if (firstItem) {
            this.supplierList = [];
        }
        this.supplierList.push(itemData);
        this._setSupplierFormData();
        this.updateContactListAfterDropItem(itemData, firstItem);

        this.cdRef.detectChanges();
    }

    private isDenyDragdropToForm(data: any, dataWidgetType): boolean {
        let result = !!data[this.ID_PERSON_KEY] && data[this.PERSON_TYPE_KEY] === dataWidgetType;
        if (result) {
            this.toastrService.clear();
            let mes;
            if (dataWidgetType === this.EXTRACTED_MASTER_DATA_PERSON_TYPE.MANDANT)
                mes = this.translateService.instant(
                    'EXTRACTED_DATA_APPROVAL_PROCESSING__mes_MANDANT_cannot_set_SUPPLIER',
                );
            if (dataWidgetType === this.EXTRACTED_MASTER_DATA_PERSON_TYPE.SUPPLIER)
                mes = this.translateService.instant(
                    'EXTRACTED_DATA_APPROVAL_PROCESSING__mes_SUPPLIER_cannot_set_MANDANT',
                );

            this.toastrService.pop(
                MessageModal.MessageType.warning,
                this.translateService.instant('COMMON_LABEL__Warning'),
                mes,
            );
        }
        return result;
    }

    private setStateForSupplierOrMandant(dataRequest: MasterExtractedData) {
        if (dataRequest.widgetType === this.EXTRACTED_MASTER_DATA_WIDGET_TYPE.SUPPLIER) {
            this.store.dispatch(
                this.invoiceApprovalProcessingActions.setExtractedMasterDataSupplierAction(dataRequest),
            );
        } else if (dataRequest.widgetType === this.EXTRACTED_MASTER_DATA_WIDGET_TYPE.MANDANT) {
            this.store.dispatch(
                this.invoiceApprovalProcessingActions.setExtractedMasterDataMandantOveriewAction(dataRequest),
            );
        }
    }

    public clearFormData(widgetType) {
        switch (widgetType) {
            case this.EXTRACTED_MASTER_DATA_WIDGET_TYPE.MANDANT:
                if (!this.mandantList[0]) break;
                this.contactList.push(this.mandantList[0]);
                this.mandantList = [];
                break;
            case this.EXTRACTED_MASTER_DATA_WIDGET_TYPE.SUPPLIER:
                if (!this.supplierList[0]) break;
                this.contactList.push(this.supplierList[0]);
                this.supplierList = [];
                break;
            default:
                break;
        }
    }

    private _setMandantFormData(isReadOnly = false) {
        const data = this.mandantList[0];
        if (!data) return;
        this.mandantExtractDataHandler.isShowClear = true;
        for (const key in data) {
            if (key === this.ID_PERSON_TYPE_KEY) continue;
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                const value = data[key];
                this.mandantExtractDataHandler.wdDynamicForm?.setFormValue(key, value, 0);
            }
        }
        if (isReadOnly) this.mandantExtractDataHandler.wdDynamicForm.disableForm();
    }

    private _setSupplierFormData(isReadOnly = false) {
        const data = this.supplierList[0];
        if (!data) return;
        this.supplierExtractDataHandler.isShowClear = true;
        for (const key in data) {
            if (key === this.ID_PERSON_TYPE_KEY) continue;
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                const value = data[key];
                if (key === 'Company') {
                    this.supplierExtractDataHandler.wdDynamicForm?.setFormValue('Supplier', value, 0);
                } else {
                    this.supplierExtractDataHandler.wdDynamicForm?.setFormValue(key, value, 0);
                }
            }
        }
        if (isReadOnly) this.mandantExtractDataHandler.wdDynamicForm.disableForm();
    }

    // unused: for version 1
    private showDataOnDialog(dataRequest: MasterExtractedData): boolean {
        let result = false;
        if (!dataRequest?.data) return result;

        switch (dataRequest.typeDataSet) {
            case this.TYPE_DATA_SET.DATA_TABLE:
                // greater 2 because: 1 is setting, 2 is data
                if (dataRequest.data.length < 2) break;

                const dataTable = dataRequest.data[1];
                // greater 2 because if 1 will set direct to widget, not show on dialog
                if (!dataTable || dataTable.length < 2) {
                    this.setStateForSupplierOrMandant(dataRequest);
                    break;
                }

                result = true;
                break;
            case this.TYPE_DATA_SET.DYNAMIC_FORM:
                const idPerson = dataRequest?.data?.formDefinitions[0]?.columnDefinitions?.find(
                    (x) => x.originalColumnName === this.ID_PERSON_KEY,
                )?.value;

                // has idPerson will set direct to widget, not show on dialog
                if (idPerson) {
                    this.setStateForSupplierOrMandant(dataRequest);
                    break;
                }

                result = true;
                break;
            default:
                result = true;
                break;
        }
        return result;
    }
}
