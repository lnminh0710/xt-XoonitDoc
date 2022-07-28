import {
    Component,
    Input,
    Output,
    EventEmitter,
    OnInit,
    OnDestroy,
    AfterViewInit,
    ElementRef,
    ViewChild,
    ChangeDetectorRef,
} from '@angular/core';
import {
    ControlBase,
    FieldFilter,
    NumberBoxControl,
    TextboxControl,
    CheckboxControl,
    DateControl,
    DropdownControl,
    ApiResultResponse,
    WidgetDetail,
    GroupFieldFilter,
    Module,
    MessageModel,
} from '@app/models';
import { Uti } from '@app/utilities';
import { FilterModeEnum, ControlType, ComboBoxTypeConstant, MenuModuleId, MessageModal } from '@app/app.constants';
import isNil from 'lodash-es/isNil';
import isEmpty from 'lodash-es/isEmpty';
import { parse } from 'date-fns/esm';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { CommonService, ObservableShareService, AppErrorHandler, WidgetTemplateSettingService } from '@app/services';
import { DocType, DocUpdateMode } from '@app/pages/private/modules/customer/models/document';
import { DynamicFormComponent } from '../dynamic-form';
import { OrderDetailSummaryComponent } from '@app/pages/private/modules/customer/components/order-detail-summary';
import { BaseWidgetModuleInfo, XnWidgetMenuStatusComponent } from '@app/shared/components/widget';
import { Store } from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import * as orderProcessingReducer from '@app/state-management/store/reducer/order-processing';
import { OrderProcessingUpdateData } from '@app/state-management/store/reducer/order-processing';
import { OrderProcessingActions } from '@app/state-management/store/actions';
import { ModuleSearchDialogCustomerComponent } from '../module-search-dialog-customer';
import { XnFormFocusDirective } from '@app/shared/directives/xn-form-focus/xn-form-focus.directive';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'document-form',
    templateUrl: './document-form.component.html',
    styleUrls: ['./document-form.component.scss'],
})
export class DocumentFormComponent implements OnInit, OnDestroy, AfterViewInit {
    public MODULE_DIALOG: any = {
        CUSTOMER: {
            title: 'Search Customer',
            searchIndex: 'customer',
            module: new Module({ idSettingsGUI: MenuModuleId.contact }),
        },
    };

    private orderProcessingState: Observable<OrderProcessingUpdateData>;
    private orderProcessingStateSubscription: Subscription;

    public invoiceChecked: boolean = false;
    public orderChecked: boolean = false;
    public offerChecked: boolean = false;

    public invoiceDisabled: boolean = false;
    public orderDisabled: boolean = false;
    public offerDisabled: boolean = false;

    private generalDataSourceIndex = 1;
    private invoiceDataSourceIndex = 3;
    private orderDataSourceIndex = 5;
    private offerDataSourceIndex = 7;

    public DocType = DocType;
    public generalDataSource: any;
    public processingDatasource: any;
    public isFormChanged: boolean;
    public orderProcessingUpdateData: OrderProcessingUpdateData;
    public focusHandleStart: boolean = false;
    public enableSearhCustomer: boolean;
    public customerNr = '';
    public customerId = '';

    private _isActivated: boolean;
    @Input() set isActivated(status: boolean) {
        this._isActivated = status;
        if (!status) {
            this.ref.detach();
        } else {
            this.ref.reattach();
        }
    }

    get isActivated() {
        return this._isActivated;
    }

    @Input()
    readonly = false;

    @Input()
    groupFieldFilter: Array<GroupFieldFilter>;

    @Input()
    filterMode: FilterModeEnum;

    private _data: WidgetDetail;
    @Input() set data(data: WidgetDetail) {
        this._data = data;
        // this.processData();
    }

    private _parentInstance;
    @Input() set parentInstance(instance: BaseWidgetModuleInfo) {
        this._parentInstance = instance;
    }

    get parentInstance() {
        return this._parentInstance;
    }

    @Input() set widgetMenuStatusComponent(widgetMenuStatusComponent: XnWidgetMenuStatusComponent) {
        if (widgetMenuStatusComponent) {
            widgetMenuStatusComponent.toggleToolButtonsWithoutClick(true);
        }
    }

    @Input() currentModule: Module;

    @Output()
    onFormChanged: EventEmitter<any> = new EventEmitter();

    @Output()
    onSaveDataSuccess: EventEmitter<WidgetDetail> = new EventEmitter();

    @Output() dispatchData = new EventEmitter<any>();

    @ViewChild(DynamicFormComponent) generalForm: DynamicFormComponent;
    @ViewChild(OrderDetailSummaryComponent) orderDetailSummaryComponent: OrderDetailSummaryComponent;
    @ViewChild('searchCustomerDialogModule') searchCustomerDialogModule: ModuleSearchDialogCustomerComponent;
    @ViewChild(XnFormFocusDirective) formFocusDirective: XnFormFocusDirective;

    get data() {
        return this._data;
    }

    constructor(
        private _eref: ElementRef,
        private commonService: CommonService,
        private appErrorHandler: AppErrorHandler,
        private obserableShareService: ObservableShareService,
        private widgetTemplateSettingService: WidgetTemplateSettingService,
        private store: Store<AppState>,
        private orderProcessingActions: OrderProcessingActions,
        private ref: ChangeDetectorRef,
    ) {
        this.orderProcessingState = this.store.select(
            (state) =>
                orderProcessingReducer.getOrderProcessingState(state, this.currentModule.moduleNameTrim)
                    .orderProcessingUpdateData,
        );
    }

    /**
     * ngOnInit
     */
    public ngOnInit() {}

    /**
     * ngOnDestroy
     */
    public ngOnDestroy() {
        Uti.unsubscribe(this);
        this.store.dispatch(this.orderProcessingActions.clearRequestOrder(this.currentModule));
    }

    /**
     * ngAfterViewInit
     */
    public ngAfterViewInit() {
        this.subscribeOrderProcessingState();
    }

    /**
     * subscribeOrderProcessingState
     **/
    private subscribeOrderProcessingState() {
        this.orderProcessingStateSubscription = this.orderProcessingState.subscribe(
            (data: OrderProcessingUpdateData) => {
                this.orderProcessingUpdateData = data;
                if (data) {
                    switch (data.updateMode) {
                        case DocUpdateMode.New:
                            this.processForCreatingNewDocument(data);
                            break;
                        case DocUpdateMode.Edit:
                            this.processForEditingDocument(data);
                            break;
                    }
                } else {
                    this.createNewForAll();
                }
            },
        );
    }

    /**
     * processForCreatingNewDocument
     **/
    private processForCreatingNewDocument(orderProcessingUpdateData: OrderProcessingUpdateData) {
        switch (orderProcessingUpdateData.documentType) {
            case DocType.All:
                this.createNewForAll();
                break;
            case DocType.Invoice:
                this.createNewForInvoice(orderProcessingUpdateData);
                break;
            case DocType.Offer:
                this.createNewForOffer(orderProcessingUpdateData);
                break;
            case DocType.Order:
                this.createNewForOrder(orderProcessingUpdateData);
                break;
        }
    }

    /**
     * getCustomerIdForCreatingNewAllDocument
     **/
    private getCustomerIdForCreatingNewAllDocument() {
        if (!this.customerId) {
            if (
                this.orderProcessingUpdateData &&
                this.orderProcessingUpdateData.data &&
                this.orderProcessingUpdateData.data['idPerson']
            ) {
                return this.orderProcessingUpdateData.data['idPerson'];
            }
            let data = this.getListenKeyRequest();
            if (data && data['IdPerson']) {
                return data['IdPerson'];
            }
            return null;
        }
        return this.customerId;
    }

    /**
     * Create new document
     * We only need IdPerson to create new order processing
     */
    private createNewForAll() {
        this.invoiceChecked = true;
        this.offerChecked = true;
        this.orderChecked = true;
        this.enableSearhCustomer = true;
        this.customerId = this.getCustomerIdForCreatingNewAllDocument();
        if (this.customerId) {
            this.getData(null, this.customerId, null, null, null);
        } else {
            console.warn('Need idperson to create new order processing... ');
        }
    }

    /**
     * Create new Invoice
     * @param orderProcessingUpdateData
     */
    private createNewForInvoice(orderProcessingUpdateData: OrderProcessingUpdateData) {
        this.invoiceChecked = true;
        this.offerChecked = false;
        this.orderChecked = false;
        if (orderProcessingUpdateData && orderProcessingUpdateData.data) {
            let data = orderProcessingUpdateData.data;
            this.customerId = data.idPerson;
            // Create new from Order
            if (orderProcessingUpdateData.data['idOrder']) {
                // Create new Invoice from Order
                // Disable Order Info on UI
                this.orderDisabled = true;
                this.orderChecked = false;
                this.getData(data.idOrderProcessing, data.idPerson, null, null, data.idOrder);
            }
            // Create new from Offer
            else if (orderProcessingUpdateData.data['idOffer']) {
                // Create new Invoice from Offer
                // Disable Offer Info on UI
                this.offerDisabled = true;
                this.offerChecked = false;
                this.getData(data.idOrderProcessing, data.idPerson, null, data.idOffer, null);
            }
            // Create new
            else if (orderProcessingUpdateData.data['idPerson']) {
                this.getData(data.idOrderProcessing, data.idPerson, null, null, null);
            }
        }
    }

    /**
     * Create new Offer from existing document
     * @param orderProcessingUpdateData
     */
    private createNewForOffer(orderProcessingUpdateData: OrderProcessingUpdateData) {
        this.offerChecked = true;
        this.orderChecked = false;
        this.invoiceChecked = false;

        if (orderProcessingUpdateData && orderProcessingUpdateData.data) {
            let data = orderProcessingUpdateData.data;
            this.customerId = data.idPerson;
            // Update for new logic: Aug-06-2019
            // Check which doc need to create
            if (orderProcessingUpdateData.data.idInvoice) {
                // Create new Offer from Invoice
                // Disable Invoice Info on UI
                this.invoiceDisabled = true;
                this.invoiceChecked = true;
                this.getData(data.idOrderProcessing, data.idPerson, data.idInvoice, null, null);
            } else if (orderProcessingUpdateData.data.idOrder) {
                // Create new Offer from Order
                // Disable Order Info on UI
                this.orderDisabled = true;
                this.orderChecked = true;
                this.getData(data.idOrderProcessing, data.idPerson, null, null, data.idOrder);
            }
            // Create new
            else if (orderProcessingUpdateData.data.idPerson) {
                this.getData(data.idOrderProcessing, data.idPerson, null, null, null);
            }
        }
    }

    /**
     * Create new Order
     * @param orderProcessingUpdateData
     */
    private createNewForOrder(orderProcessingUpdateData: OrderProcessingUpdateData) {
        this.orderChecked = true;
        //
        this.invoiceChecked = false;
        this.offerChecked = false;

        if (orderProcessingUpdateData && orderProcessingUpdateData.data) {
            let data = orderProcessingUpdateData.data;
            this.customerId = data.idPerson;
            // Check which doc need to create
            /* 22-Aug-2019 : Order must create from Offer If any.
            if (orderProcessingUpdateData.data['idInvoice']) {
                // Create new order from Invoice
                // Disable Invoice Info on UI
                this.invoiceDisabled = true;
                this.invoiceChecked = true;
                this.getData(data.idOrderProcessing, data.idPerson, data.idInvoice, null, null);
            }
            */
            if (orderProcessingUpdateData.data.idOffer) {
                // Create new order from Offer
                // Disable Offer Info on UI
                this.offerDisabled = true;
                this.offerChecked = false;
                this.getData(data.idOrderProcessing, data.idPerson, null, data.idOffer, null);
            }
            // Create new
            else if (orderProcessingUpdateData.data.idPerson) {
                this.getData(data.idOrderProcessing, data.idPerson, null, null, null);
            }
        }
    }

    /**
     * processForEditingOrder
     **/
    private processForEditingDocument(orderProcessingUpdateData: OrderProcessingUpdateData) {
        if (orderProcessingUpdateData) {
            this.customerId = orderProcessingUpdateData.data.idPerson;
            switch (orderProcessingUpdateData.documentType) {
                case DocType.Invoice:
                    this.editForInvoice(orderProcessingUpdateData);
                    break;
                case DocType.Order:
                    this.editForOrder(orderProcessingUpdateData);
                    break;
                case DocType.Offer:
                    this.editForOffer(orderProcessingUpdateData);
                    break;
            }
        }
    }

    /**
     * editForInvoice
     * @param orderProcessingUpdateData
     */
    private editForInvoice(orderProcessingUpdateData: OrderProcessingUpdateData) {
        this.invoiceChecked = true;
        this.orderChecked = false;
        this.offerChecked = false;
        this.orderDisabled = true;
        this.offerDisabled = true;
        if (orderProcessingUpdateData && orderProcessingUpdateData.data) {
            let data = orderProcessingUpdateData.data;
            if (orderProcessingUpdateData.data.idInvoice) {
                this.getData(data.idOrderProcessing, data.idPerson, data.idInvoice, null, null);
            }
        }
    }

    /**
     * editForOrder
     * @param orderProcessingUpdateData
     */
    private editForOrder(orderProcessingUpdateData: OrderProcessingUpdateData) {
        this.orderChecked = true;
        this.invoiceChecked = false;
        this.offerChecked = false;
        this.invoiceDisabled = true;
        this.offerDisabled = true;
        if (orderProcessingUpdateData && orderProcessingUpdateData.data) {
            let data = orderProcessingUpdateData.data;
            if (orderProcessingUpdateData.data.idOrder) {
                this.getData(data.idOrderProcessing, data.idPerson, null, null, data.idOrder);
            }
        }
    }

    /**
     * editForOffer
     * @param orderProcessingUpdateData
     */
    private editForOffer(orderProcessingUpdateData: OrderProcessingUpdateData) {
        this.offerChecked = true;
        this.orderChecked = false;
        this.invoiceChecked = false;
        this.orderDisabled = true;
        this.invoiceDisabled = true;

        if (orderProcessingUpdateData && orderProcessingUpdateData.data) {
            let data = orderProcessingUpdateData.data;
            if (orderProcessingUpdateData.data.idOffer) {
                this.getData(data.idOrderProcessing, data.idPerson, null, data.idOffer, null);
            }
        }
    }

    private getData(idOrderProcessing?, idPerson?, idInvoice?, idOffer?, idOrder?) {
        let filterParam = {
            IdOrderProcessing: idOrderProcessing || null,
            IdPerson: idPerson || null,
            IdInvoice: idInvoice || null,
            IdOffer: idOffer || null,
            IdOrder: idOrder || null,
        };
        this.widgetTemplateSettingService
            .getWidgetDetailByRequestString(this.data, filterParam)
            .pipe(
                finalize(() => {
                    //setTimeout(() => {
                    //    this.registerEnterFocus();
                    //    this.ref.detectChanges();
                    //}, 350);
                }),
            )
            .subscribe((widgetDetail: WidgetDetail) => {
                if (widgetDetail) {
                    this.processData();
                }
            });
    }

    /**
     * processData
     **/
    private processData() {
        if (this.data && this.data.contentDetail) {
            let dataSource = this.data.contentDetail.data;
            if (dataSource) {
                let invoiceDataSource: Array<any>;
                let orderDataSource: Array<any>;
                let offerDataSource: Array<any>;
                if (dataSource[this.generalDataSourceIndex]) {
                    this.generalDataSource = dataSource[this.generalDataSourceIndex];
                }
                if (dataSource[this.invoiceDataSourceIndex]) {
                    invoiceDataSource = dataSource[this.invoiceDataSourceIndex];
                }
                if (dataSource[this.orderDataSourceIndex]) {
                    orderDataSource = dataSource[this.orderDataSourceIndex];
                }
                if (dataSource[this.offerDataSourceIndex]) {
                    offerDataSource = dataSource[this.offerDataSourceIndex];
                }

                this.processingDatasource = {
                    invoiceDataSource,
                    orderDataSource,
                    offerDataSource,
                };

                if (this.generalDataSource) {
                    const personNrItem = this.generalDataSource.find(
                        (p) => p.OriginalColumnName == 'B00Person_PersonNr',
                    );
                    if (personNrItem) {
                        this.customerNr = personNrItem.Value;
                    }
                }

                this.dispatchDataForValidPrimaryKey();
            }
        }
    }

    getSavingData() {
        let resultData: any = {};
        if (this.generalForm) {
            let generalData = this.generalForm.getSavingData();

            if (!generalData['B05OrderProcessing_IdPerson']) {
                this.customerId = this.getCustomerIdForCreatingNewAllDocument();
                generalData['B05OrderProcessing_IdPerson'] = this.customerId;
            }
            if (generalData) {
                resultData = {
                    OrderProcessingData: generalData,
                    IsForOffer: this.offerChecked && !this.offerDisabled,
                    IsForOrder: this.orderChecked && !this.orderDisabled,
                    IsForInvoice: this.invoiceChecked && !this.invoiceDisabled,
                };
            }
        }
        if (this.orderDetailSummaryComponent) {
            let data = this.orderDetailSummaryComponent.getSavingData();
            resultData = Object.assign(resultData, data);
        }

        // Process new logic for creating new document manual
        this.manualCreateNewDocumentFromOtherDocument(resultData);

        // Update articles for Order when creating new Invoice
        let isCreatingNewInvoice = this.isCreatingNewInvoice(resultData);
        if (isCreatingNewInvoice) {
            // Check this invoice created from an Order
            let count = this.numberOfOrdersThatInvoiceCreated(resultData.InvoiceData);
            if (count == 1) {
                resultData.IsForOrder = true;
            }
        }

        return resultData;
    }

    private numberOfOrdersThatInvoiceCreated(invoiceData) {
        let count = 0;
        if (invoiceData.B05Order_IdOrder) {
            let idOrders: Array<any> = invoiceData.B05Order_IdOrder.split(',');
            count = idOrders.length;
        }
        return count;
    }

    private manualCreateNewDocumentFromOtherDocument(resultData) {
        // this.createNewOfferFromNewOrder(resultData);
        this.createNewOrderFromNewInvoice(resultData);
    }

    private createNewOfferFromNewOrder(resultData) {
        // Case 1: From Order ==> Offer
        let isCreatingNewOrder = this.isCreatingNewOrder(resultData);
        // Case : Create new Order
        if (isCreatingNewOrder) {
            let offerData = this.orderDetailSummaryComponent.getSavingDataForOfferDocument();
            // Offer data has not created yet.
            let offerNotCreatedYet = offerData && offerData.OfferData && !offerData.OfferData.B05Offer_IdOffer;
            if (offerNotCreatedYet && !this.offerChecked) {
                // We need to create Offer based on Order Info
                let sourceControlList: Array<ControlBase<
                    any
                >> = this.orderDetailSummaryComponent.getControlListForOrderDocument();
                let destControlList: Array<ControlBase<
                    any
                >> = this.orderDetailSummaryComponent.getControlListForOfferDocument();
                this.mappingDataFromSourceDocumentToDestDocument(
                    resultData.OrderData,
                    offerData.OfferData,
                    sourceControlList,
                    destControlList,
                );
                resultData = Object.assign(resultData, offerData);
                resultData.IsForOffer = true;
            }
        }
    }

    private createNewOrderFromNewInvoice(resultData) {
        // Case 2: From Invoice => Order ==> Offer
        let isCreatingNewInvoice = this.isCreatingNewInvoice(resultData);
        // Case : Create new Invoice
        if (isCreatingNewInvoice) {
            let orderData = this.orderDetailSummaryComponent.getSavingDataForOrderDocument();
            // Order data has not created yet.
            let orderNotCreatedYet = orderData && orderData.OrderData && !orderData.OrderData.B05Order_IdOrder;
            if (orderNotCreatedYet && !this.orderChecked) {
                // We need to create Order based on Invoice Info
                let sourceControlList: Array<ControlBase<
                    any
                >> = this.orderDetailSummaryComponent.getControlListForInvoiceDocument();
                let destControlList: Array<ControlBase<
                    any
                >> = this.orderDetailSummaryComponent.getControlListForOrderDocument();
                this.mappingDataFromSourceDocumentToDestDocument(
                    resultData.InvoiceData,
                    orderData.OrderData,
                    sourceControlList,
                    destControlList,
                );

                resultData = Object.assign(resultData, orderData);
                resultData.IsForOrder = true;
                // this.createNewOfferFromNewOrder(resultData);
            }
        }
    }

    private mappingDataFromSourceDocumentToDestDocument(
        sourceData,
        destData,
        sourceControlList: Array<ControlBase<any>>,
        destControlList: Array<ControlBase<any>>,
    ) {
        Object.keys(sourceData).forEach((key) => {
            let sourceItem = sourceControlList.find((p) => p.key == key);
            if (sourceItem) {
                let mappingField = sourceItem.mappingField;
                if (mappingField) {
                    let destItem = destControlList.find((p) => p.mappingField == mappingField);
                    if (destItem) {
                        destData[destItem.key] = sourceData[key];
                    }
                }
            }
        });

        //
        Object.keys(destData).forEach((key) => {
            // If empty , then check required field
            if (!destData[key]) {
                let destItem = destControlList.find((p) => p.key == key);
                if (destItem.required) {
                    if (destItem.controlType == 'dropdown') {
                        let dropdownItem = destItem as DropdownControl;
                        if (dropdownItem.options && dropdownItem.options.length) {
                            destData[key] = dropdownItem.options[0].key;
                        }
                    } else {
                        destData[key] = 'default';
                    }
                }
            }
        });
    }

    private isCreatingNewOrder(resultData) {
        return resultData && resultData.OrderData && !resultData.OrderData.B05Order_IdOrder;
    }

    private isCreatingNewInvoice(resultData) {
        return resultData && resultData.InvoiceData && !resultData.InvoiceData.B05Invoice_IdInvoice;
    }

    /**
     * getListenKeyRequest
     **/
    private getListenKeyRequest() {
        if (this.data && this.data.widgetDataType) {
            return this.data.widgetDataType.listenKeyRequest(this.currentModule.moduleNameTrim);
        }
        return null;
    }

    /**
     * dispatchDataForValidPrimaryKey
     **/
    private dispatchDataForValidPrimaryKey() {
        // If have primaryKey , then dispatch data
        if (
            this.data.widgetDataType &&
            this.data.widgetDataType.primaryKey &&
            this.generalDataSource &&
            this.generalDataSource.length
        ) {
            let data = [];
            let item = this.generalDataSource.find(
                (p) => p.OriginalColumnName == 'B05OrderProcessing_IdOrderProcessing',
            );
            if (item) {
                data.push({
                    key: 'IdOrderProcessing',
                    value: item.Value || null,
                });
            }

            item = this.processingDatasource.invoiceDataSource.find(
                (p) => p.OriginalColumnName == 'B05Invoice_IdInvoice',
            );
            if (item) {
                data.push({
                    key: 'IdInvoice',
                    value: item.Value || null,
                });
            }

            item = this.processingDatasource.orderDataSource.find((p) => p.OriginalColumnName == 'B05Order_IdOrder');
            if (item) {
                data.push({
                    key: 'IdOrder',
                    value: item.Value || null,
                });
            }

            item = this.processingDatasource.offerDataSource.find((p) => p.OriginalColumnName == 'B05Offer_IdOffer');
            if (item) {
                data.push({
                    key: 'IdOffer',
                    value: item.Value || null,
                });
            }

            item = this.generalDataSource.find((p) => p.OriginalColumnName == 'B05OrderProcessing_IdPerson');
            if (item) {
                this.customerId = item.Value || this.getCustomerIdForCreatingNewAllDocument();
                data.push({
                    key: 'IdPerson',
                    value: this.customerId,
                });
            }

            // Incase New All: We need to pass valid Idperson
            //if (!this.orderProcessingUpdateData || (this.orderProcessingUpdateData &&
            //    this.orderProcessingUpdateData.updateMode == DocUpdateMode.New &&
            //    this.orderProcessingUpdateData.documentType == DocType.All)) {
            //    this.customerId = this.getCustomerIdForCreatingNewAllDocument();
            //    data.push({
            //        key: 'IdPerson',
            //        value: this.customerId
            //    });
            //}
            //else {
            //    item = this.generalDataSource.find(p => p.OriginalColumnName == 'B05OrderProcessing_IdPerson');
            //    if (item) {
            //        data.push({
            //            key: 'IdPerson',
            //            value: item.Value || null
            //        });
            //    }
            //}

            if (data && data.length) {
                this.dispatchData.emit(data);
            }
        }
    }

    save() {}

    formChanged(event) {
        if (event) {
            this.onFormChanged.emit(true);
            this.isFormChanged = true;
        }
    }

    public customerItemSelect(data) {
        if (!data) return;

        this.customerNr = Uti.getValueFromArrayByKey(data, 'personNr');

        //let forceRequest: boolean;
        //if (!this.customerId) {
        //    forceRequest = true;
        //}

        this.customerId = Uti.getValueFromArrayByKey(data, 'idPerson');
        if (this.customerId) {
            this.getData(null, this.customerId, null, null, null);
        }
        // this.createNewForAll();

        //if (forceRequest) {
        //    this.createNewForAll();
        //}
        //else {
        //    this.dispatchDataForValidPrimaryKey();
        //}
    }

    public customerCloseSearchDialog($event) {}

    public customerShowSearchDialog() {
        this.searchCustomerDialogModule.open(this.customerNr || '*');
    }

    public isValid() {
        let isValid: boolean = true;
        if (this.generalForm.form) {
            isValid = this.generalForm.form.valid;
            if (!isValid) {
                this.generalForm.focusOnFirstFieldError();
                return isValid;
            }
        }
        if (this.orderDetailSummaryComponent) {
            isValid = this.orderDetailSummaryComponent.isValid();
        }
        return isValid;
    }

    public editField(data) {
        if (data && data.control && data.control.controlType == 'dropdown' && data.control.key == 'B05Order_IdOrder') {
            let dispatchData = [];
            let item = this.generalDataSource.find(
                (p) => p.OriginalColumnName == 'B05OrderProcessing_IdOrderProcessing',
            );
            if (item) {
                dispatchData.push({
                    key: 'IdOrderProcessing',
                    value: item.Value || null,
                });
            }

            dispatchData.push({
                key: 'IdInvoice',
                value: null,
            });

            dispatchData.push({
                key: 'IdOrder',
                value: data.control.value,
            });

            dispatchData.push({
                key: 'IdOffer',
                value: null,
            });

            dispatchData.push({
                key: 'IdPerson',
                value: this.customerId,
            });

            this.dispatchData.emit(dispatchData);

            if (!data.control.value) {
                this.orderChecked = false;
                this.orderDisabled = false;
                this.getNewOrderData(null);
            } else {
                this.orderChecked = false;
                this.orderDisabled = true;
            }
        }
    }

    private getNewOrderData(idOrder) {
        let filterParam = {
            IdOrderProcessing:
                this.orderProcessingUpdateData && this.orderProcessingUpdateData.data
                    ? this.orderProcessingUpdateData.data.idOrderProcessing
                    : null,
            IdPerson: this.customerId,
            IdInvoice: null,
            IdOffer: null,
            IdOrder: idOrder,
        };

        this.widgetTemplateSettingService
            .getWidgetDetailByRequestString(this.data, filterParam)
            .pipe(finalize(() => {}))
            .subscribe((widgetDetail: WidgetDetail) => {
                if (widgetDetail && widgetDetail.contentDetail) {
                    let dataSource = widgetDetail.contentDetail.data;
                    if (dataSource) {
                        let orderDataSource: Array<any>;
                        if (dataSource[this.orderDataSourceIndex]) {
                            orderDataSource = dataSource[this.orderDataSourceIndex];
                        }
                        if (this.processingDatasource) {
                            this.processingDatasource.orderDataSource = orderDataSource;
                        }
                        this.orderDetailSummaryComponent.updateOrderDataSource(orderDataSource);
                    }
                }
            });
    }

    public docStatusChange($event) {
        this.registerEnterFocus();
    }

    private registerEnterFocus() {
        if (this.formFocusDirective) {
            this.formFocusDirective.focusHandleStart = true;
        }
    }

    public renderCompleted($event) {
        this.registerEnterFocus();
        this.ref.detectChanges();
    }
}
