import {
    Component,
    Input,
    Output,
    EventEmitter,
    OnInit,
    OnDestroy,
    AfterViewInit,
    ElementRef,
    ViewChildren,
    QueryList,
    forwardRef,
    ChangeDetectorRef,
} from '@angular/core';
import { OrderProcessing, OrderProcessingDetail } from '../../models';
import {
    DocumentDetail,
    DocumentFile,
    DocumentCustomer,
    DocType,
    DocumentDetailListGroup,
} from '../../models/document/document-detail.model';
import { DocumentService } from '@app/services';
import { Uti } from '@app/utilities';
import { FilterModeEnum } from '@app/app.constants';
import { GroupFieldFilter, ControlBase, Module } from '@app/models';
import { OrderInfoComponent } from '@app/pages/private/modules/customer/components/order-detail-summary';
import { Column } from 'ag-grid-community';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'order-detail-summary',
    templateUrl: './order-detail-summary.component.html',
    styleUrls: ['./order-detail-summary.component.scss'],
})
export class OrderDetailSummaryComponent implements OnInit, OnDestroy, AfterViewInit {
    public DocType = DocType;
    public documentDetails: Array<DocumentDetail> = [];
    public documentCustomer: DocumentCustomer;
    public isLoading: boolean;
    public documentDetailListGroup: Array<DocumentDetailListGroup> = [];

    private numberDocTypeRendered: number = 0;

    @Input() currentModule: Module;

    private _data;
    @Input() set data(val) {
        this._data = val;
        this.processData();
    }

    get data() {
        return this._data;
    }

    private _itemData;
    @Input() set itemData(val) {
        this._itemData = val;
        this.getData(val);
    }

    get itemData() {
        return this._itemData;
    }

    private _columns: Array<any>;
    @Input() set columns(columns: Array<Column>) {
        this._columns = columns;
        if (columns && columns.length) {
            this.updateVisibleStatusByColumn();
            if (this.renderCallback) {
                setTimeout(() => {
                    this.renderCallback();
                }, 350);
            }
        }
    }

    get columns() {
        return this._columns;
    }

    public updateVisibleStatusByColumn() {
        let columns = this.columns;
        if (columns && columns.length) {
            let col = columns.find((p) => p.getColId() == 'InvoiceNr');
            this.invoiceChecked = col && col.isVisible();

            col = columns.find((p) => p.getColId() == 'OrderNr');
            this.orderChecked = col && col.isVisible();

            col = columns.find((p) => p.getColId() == 'OfferNr');
            this.offerChecked = col && col.isVisible();
        }
    }

    @Input() filterMode: FilterModeEnum;
    @Input() showCustomerInfo: boolean = false;
    @Input()
    groupFieldFilter: Array<GroupFieldFilter>;

    @Input() renderCallback: Function;
    @Input() dispatchData: Function;

    //------------ DISABLE STATUS ------------//
    private _invoiceDisabled = false;
    @Input() set invoiceDisabled(status: boolean) {
        this._invoiceDisabled = status;
        this.filterDoctypeMode();
    }
    get invoiceDisabled() {
        return this._invoiceDisabled;
    }

    public _orderDisabled: boolean = false;
    @Input() set orderDisabled(status: boolean) {
        this._orderDisabled = status;
        this.filterDoctypeMode();
    }
    get orderDisabled() {
        return this._orderDisabled;
    }

    public _offerDisabled: boolean = false;
    @Input() set offerDisabled(status: boolean) {
        this._offerDisabled = status;
        this.filterDoctypeMode();
    }
    get offerDisabled() {
        return this._offerDisabled;
    }
    //------------ DISABLE STATUS ------------//

    private _invoiceChecked = true;
    @Input() set invoiceChecked(status: boolean) {
        this._invoiceChecked = status;
        this.filterDoctypeMode();
    }

    get invoiceChecked() {
        return this._invoiceChecked;
    }

    private _orderChecked = true;
    @Input() set orderChecked(status: boolean) {
        this._orderChecked = status;
        this.filterDoctypeMode();
    }

    get orderChecked() {
        return this._orderChecked;
    }

    private _offerChecked = true;
    @Input() set offerChecked(status: boolean) {
        this._offerChecked = status;
        this.filterDoctypeMode();
    }

    get offerChecked() {
        return this._offerChecked;
    }

    @ViewChildren(forwardRef(() => OrderInfoComponent))
    private orderInfoComponents: QueryList<OrderInfoComponent>;

    @Output()
    onEditField: EventEmitter<any> = new EventEmitter();

    @Output()
    onRenderCompleted: EventEmitter<any> = new EventEmitter();

    constructor(
        private _eref: ElementRef,
        private documentService: DocumentService,
        private uti: Uti,
        private ref: ChangeDetectorRef,
    ) {}

    /**
     * ngOnInit
     */
    public ngOnInit() {}

    /**
     * ngOnDestroy
     */
    public ngOnDestroy() {}

    /**
     * ngAfterViewInit
     */
    public ngAfterViewInit() {}

    private processData() {
        if (this.data) {
            this.documentDetails = [];
            let doc: DocumentDetail;
            if (this.data.invoiceDataSource) {
                doc = new DocumentDetail({
                    dataSource: this.data.invoiceDataSource,
                    docType: DocType.Invoice,
                    docName: 'Invoice',
                    docIcon: 'fa-file-text-o',
                    createDate: this.getDateFromDataSource(this.data.invoiceDataSource, 'CreateDate'),
                    updateDate: this.getDateFromDataSource(this.data.invoiceDataSource, 'UpdateDate'),
                });
                this.documentDetails.push(doc);
            }
            if (this.data.orderDataSource) {
                doc = new DocumentDetail({
                    dataSource: this.data.orderDataSource,
                    docType: DocType.Order,
                    docName: 'Order',
                    docIcon: 'fa-cart-plus',
                    createDate: this.getDateFromDataSource(this.data.orderDataSource, 'CreateDate'),
                    updateDate: this.getDateFromDataSource(this.data.orderDataSource, 'UpdateDate'),
                });
                this.documentDetails.push(doc);
            }
            if (this.data.offerDataSource) {
                doc = new DocumentDetail({
                    dataSource: this.data.offerDataSource,
                    docType: DocType.Offer,
                    docName: 'Offer',
                    docIcon: 'fa-bookmark-o',
                    createDate: this.getDateFromDataSource(this.data.offerDataSource, 'CreateDate'),
                    updateDate: this.getDateFromDataSource(this.data.offerDataSource, 'UpdateDate'),
                });
                this.documentDetails.push(doc);
            }
            this.filterDoctypeMode();
        }
        this.numberDocTypeRendered = 0;
    }

    public getSavingData() {
        let result = {};
        if (this.orderInfoComponents) {
            this.orderInfoComponents.forEach((orderInfoComponent) => {
                if (orderInfoComponent.documentDetail.visible && !orderInfoComponent.documentDetail.disable) {
                    let data = orderInfoComponent.getSavingData();
                    result = Object.assign(result, data);
                }
            });
        }
        return result;
    }

    /**
     * Used for manual creating new document from other document
     **/
    private getSavingDataForSpecifiedDocument(docType: DocType) {
        let result = null;
        if (this.orderInfoComponents) {
            let docItem = this.orderInfoComponents.find((p) => p.documentDetail.docType == docType);
            if (docItem) {
                result = docItem.getSavingData();
            }
        }
        return result;
    }

    public getSavingDataForOfferDocument() {
        return this.getSavingDataForSpecifiedDocument(DocType.Offer);
    }

    public getSavingDataForOrderDocument() {
        return this.getSavingDataForSpecifiedDocument(DocType.Order);
    }

    public getSavingDataForInvoiceDocument() {
        return this.getSavingDataForSpecifiedDocument(DocType.Invoice);
    }

    private getControlListForSpecifiedDocument(docType: DocType): Array<ControlBase<any>> {
        let result = null;
        if (this.orderInfoComponents) {
            let docItem = this.orderInfoComponents.find((p) => p.documentDetail.docType == docType);
            if (docItem) {
                result = docItem.getControlList();
            }
        }
        return result;
    }

    public getControlListForOfferDocument() {
        return this.getControlListForSpecifiedDocument(DocType.Offer);
    }

    public getControlListForOrderDocument() {
        return this.getControlListForSpecifiedDocument(DocType.Order);
    }

    public getControlListForInvoiceDocument() {
        return this.getControlListForSpecifiedDocument(DocType.Invoice);
    }

    private processInvoiceInfo(item) {
        let invoiceDataSource: Array<any> = item;
        let doc: DocumentDetail;
        let historyFiles: Array<DocumentFile> = [];
        historyFiles = this.getHistoryFileList(
            invoiceDataSource,
            'B05OrderProcessingDocumentsLink_InvPDF',
            'MediaOriginalName',
            'InvoiceDocumentPDF',
        );
        let invoiceNrInfo = invoiceDataSource.find((p) => p.OriginalColumnName == 'B05Invoice_InvoiceNr');
        this._invoiceChecked = invoiceNrInfo && invoiceNrInfo.Value ? true : false;
        if (this._invoiceChecked && this.columns && this.columns.length) {
            let col = this.columns.find((p) => p.getColId() == 'InvoiceNr');
            this._invoiceChecked = col && col.isVisible();
        }
        let isActived = Uti.getFieldValue(invoiceDataSource, 'IsActive');
        doc = new DocumentDetail({
            dataSource: invoiceDataSource,
            docType: DocType.Invoice,
            docNr: invoiceNrInfo ? invoiceNrInfo.Value : null,
            docName: 'Invoice',
            docHistoryFiles: historyFiles,
            docIcon: 'fa-file-text-o',
            createDate: this.getDateFromDataSource(invoiceDataSource, 'CreateDate'),
            updateDate: this.getDateFromDataSource(invoiceDataSource, 'UpdateDate'),
            isActived: Uti.getBoolean(isActived),
            visible: true,
            isArchiveOP: this._itemData.IsActive,
        });
        return doc;
    }

    private processOrderInfo(item) {
        let orderDataSource: Array<any> = item;
        let doc: DocumentDetail;
        let historyFiles: Array<DocumentFile> = [];
        historyFiles = this.getHistoryFileList(
            orderDataSource,
            'B05OrderProcessingDocumentsLink_OrdPDF',
            'MediaOriginalName',
            'OrderDocumentPDF',
        );
        let orderNrInfo = orderDataSource.find((p) => p.OriginalColumnName == 'B05Order_OrderNr');
        this._orderChecked = orderNrInfo && orderNrInfo.Value ? true : false;
        if (this._orderChecked && this.columns && this.columns.length) {
            let col = this.columns.find((p) => p.getColId() == 'OrderNr');
            this._orderChecked = col && col.isVisible();
        }
        let isActived = Uti.getFieldValue(orderDataSource, 'IsActive');
        doc = new DocumentDetail({
            dataSource: orderDataSource,
            docType: DocType.Order,
            docNr: orderNrInfo ? orderNrInfo.Value : null,
            docName: 'Order',
            docHistoryFiles: historyFiles,
            docIcon: 'fa-cart-plus',
            createDate: this.getDateFromDataSource(orderDataSource, 'CreateDate'),
            updateDate: this.getDateFromDataSource(orderDataSource, 'UpdateDate'),
            isActived: Uti.getBoolean(isActived),
            visible: true,
            isArchiveOP: this._itemData.IsActive,
        });
        return doc;
    }

    private processOfferInfo(item) {
        let offerDataSource: Array<any> = item;
        let doc: DocumentDetail;
        let historyFiles: Array<DocumentFile> = [];
        historyFiles = this.getHistoryFileList(
            offerDataSource,
            'B05OrderProcessingDocumentsLink_OffPDF',
            'MediaOriginalName',
            'OfferDocumentPDF',
        );
        let offerNrInfo = offerDataSource.find((p) => p.OriginalColumnName == 'B05Offer_OfferNr');
        this._offerChecked = offerNrInfo && offerNrInfo.Value ? true : false;
        if (this._offerChecked && this.columns && this.columns.length) {
            let col = this.columns.find((p) => p.getColId() == 'OfferNr');
            this._offerChecked = col && col.isVisible();
        }
        let isActived = Uti.getFieldValue(offerDataSource, 'IsActive');
        doc = new DocumentDetail({
            dataSource: offerDataSource,
            docType: DocType.Offer,
            docNr: offerNrInfo ? offerNrInfo.Value : null,
            docName: 'Offer',
            docHistoryFiles: historyFiles,
            docIcon: 'fa-bookmark-o',
            createDate: this.getDateFromDataSource(offerDataSource, 'CreateDate'),
            updateDate: this.getDateFromDataSource(offerDataSource, 'UpdateDate'),
            isActived: Uti.getBoolean(isActived),
            visible: true,
            isArchiveOP: this._itemData.IsActive,
        });
        return doc;
    }

    private filterDoctypeFromDatasource(datasource: Array<any>) {
        this.documentDetailListGroup = [];
        let invoiceDataList: Array<any> = [];
        let orderDataList: Array<any> = [];
        let offerDataList: Array<any> = [];
        for (let i = 0; i < datasource.length; i++) {
            let items: Array<any> = datasource[i];
            let item = items.find(
                (p) => p.OriginalColumnName && p.OriginalColumnName == 'B05RepProcessingType_IdRepProcessingType',
            );
            if (item) {
                if (item.Value == '1') {
                    offerDataList.push(items);
                } else if (item.Value == '2') {
                    orderDataList.push(items);
                } else if (item.Value == '3') {
                    invoiceDataList.push(items);
                }
            }
        }

        let documentDetails: Array<DocumentDetail> = [];

        // var result = _.sortBy(data, function(item) { return _.find(item, { type: 'A' }).value; });
        if (invoiceDataList && invoiceDataList.length) {
            documentDetails = [];
            invoiceDataList.forEach((invoiceData) => {
                let doc = this.processInvoiceInfo(invoiceData);
                documentDetails.push(doc);
            });
            this.documentDetailListGroup.push({
                docType: DocType.Invoice,
                documentDetailList: documentDetails,
                visible: true,
                docIcon: 'fa-file-text-o',
                docName: 'Invoice',
            });
        }

        if (orderDataList && orderDataList.length) {
            documentDetails = [];
            orderDataList.forEach((orderData) => {
                let doc = this.processOrderInfo(orderData);
                documentDetails.push(doc);
            });
            this.documentDetailListGroup.push({
                docType: DocType.Order,
                documentDetailList: documentDetails,
                visible: true,
                docIcon: 'fa-cart-plus',
                docName: 'Order',
            });
        }

        if (offerDataList && offerDataList.length) {
            documentDetails = [];
            offerDataList.forEach((offerData) => {
                let doc = this.processOfferInfo(offerData);
                documentDetails.push(doc);
            });
            this.documentDetailListGroup.push({
                docType: DocType.Offer,
                documentDetailList: documentDetails,
                visible: true,
                docIcon: 'fa-bookmark-o',
                docName: 'Offer',
            });
        }
    }

    public getData(dataInfo) {
        if (!dataInfo) {
            return;
        }
        this.isLoading = true;
        this.documentService
            .getCustomerAssignmentsDetail(dataInfo.IdPerson, dataInfo.IdOrderProcessing)
            .pipe(
                finalize(() => {
                    this.isLoading = false;
                    if (this.renderCallback) {
                        setTimeout(() => {
                            this.renderCallback();
                        }, 350);
                    }
                    this.ref.detectChanges();
                }),
            )
            .subscribe((data) => {
                if (data && data.item) {
                    this.filterDoctypeFromDatasource(data.item);
                    this.filterDoctypeMode();
                }
            });
    }

    /**
     * getDateFromDataSource
     * @param dataSource
     * @param dateKey
     */
    private getDateFromDataSource(dataSource, dateKey) {
        let date = '';
        let dateItem = dataSource.find((p) => p.OriginalColumnName && p.OriginalColumnName.indexOf(dateKey) >= 0);
        if (dateItem) {
            if (dateItem.Value) {
                date = this.uti.formatLocale(new Date(Uti.parseDateFromDB(dateItem.Value)), 'MMMM d,yyyy');
            } else {
                date = this.uti.formatLocale(new Date(), 'MMMM d,yyyy');
            }
        }
        return date;
    }

    /**
     * getHistoryFileList
     * @param documentDataSource
     * @param originalColumn
     * @param mediaOriginalField
     * @param documentPDFField
     */
    private getHistoryFileList(
        documentDataSource: Array<any>,
        originalColumn: string,
        mediaOriginalField: string,
        documentPDFField: string,
    ) {
        let historyFiles: Array<DocumentFile> = [];
        let pdfItem = documentDataSource.find((p) => p.OriginalColumnName == originalColumn);
        if (pdfItem) {
            let pdfInfoList: Array<any> = Uti.parseJsonString(pdfItem.Value);
            if (pdfInfoList && pdfInfoList.length) {
                pdfInfoList.forEach((pdfInfo) => {
                    let docFile = new DocumentFile({
                        id: pdfInfo[mediaOriginalField],
                        name: pdfInfo[documentPDFField],
                        createdBy: pdfInfo['CreatedBy'],
                    });
                    historyFiles.push(docFile);
                });
            }
        }
        return historyFiles;
    }

    private filterDoctypeMode() {
        if (this.documentDetails && this.documentDetails.length) {
            let invoiceDoc = this.documentDetails.find((p) => p.docType == DocType.Invoice);
            let offerDoc = this.documentDetails.find((p) => p.docType == DocType.Offer);
            let orderDoc = this.documentDetails.find((p) => p.docType == DocType.Order);
            if (invoiceDoc) {
                invoiceDoc.visible = this.invoiceChecked;
                invoiceDoc.disable = this.invoiceDisabled;
            }
            if (offerDoc) {
                offerDoc.visible = this.offerChecked;
                offerDoc.disable = this.offerDisabled;
            }
            if (orderDoc) {
                orderDoc.visible = this.orderChecked;
                orderDoc.disable = this.orderDisabled;
            }
        }
        if (this.documentDetailListGroup && this.documentDetailListGroup.length) {
            let invoiceDocGroup = this.documentDetailListGroup.find((p) => p.docType == DocType.Invoice);
            let offerDocGroup = this.documentDetailListGroup.find((p) => p.docType == DocType.Offer);
            let orderDocGroup = this.documentDetailListGroup.find((p) => p.docType == DocType.Order);
            if (invoiceDocGroup) {
                invoiceDocGroup.visible = this.invoiceChecked;
            }
            if (offerDocGroup) {
                offerDocGroup.visible = this.offerChecked;
            }
            if (orderDocGroup) {
                orderDocGroup.visible = this.orderChecked;
            }
        }
    }

    /**
     * getCustomerInfo
     * @param customerInfo
     */
    private getCustomerInfo(customerInfo) {
        //
        if (customerInfo) {
            let address = JSON.parse(customerInfo.Address);
            let place = address[0].Place[0].Value;
            let street = address[0].Street[0].Value;

            let contact = JSON.parse(customerInfo.Contact);
            let contactName = contact[0].ContactName[0].Value;
            let phoneNr = contact[0].PhoneNr[0].Value;

            let customer = JSON.parse(customerInfo.Customer);
            let customerName = customer[0].CustommerName[0].Value;
            let customerNr = customer[0].CustommerNr[0].Value;

            this.documentCustomer = new DocumentCustomer({
                name: customerName,
                customerNr: customerNr,
                contact: contactName,
                phoneContact: phoneNr,
                address: place + ' ' + street,
            });
        }
    }

    public isValid() {
        let isValid: boolean = true;
        if (this.orderInfoComponents && this.orderInfoComponents.length) {
            let orderInfoComponents = this.orderInfoComponents.toArray();
            for (let i = 0; i < orderInfoComponents.length; i++) {
                isValid = orderInfoComponents[i].isValid();
                if (!isValid) {
                    break;
                }
            }
        }
        return isValid;
    }

    public activeDoc(item) {
        item.visible = item.visible ? false : true;
        item['toggle'] = item['toggle'] ? false : true;
        if (this.renderCallback) {
            setTimeout(() => {
                this.renderCallback();
            }, 350);
        }
    }

    public editField(data) {
        this.onEditField.emit(data);
    }

    public renderCompleted(data: DocumentDetail) {
        if (data) {
            this.numberDocTypeRendered += 1;
        }
        if (this.documentDetails && this.numberDocTypeRendered == this.documentDetails.length) {
            this.onRenderCompleted.emit(true);
        }
    }

    public reloadWidget() {
        this.documentDetails = [];
        this.getData(this.itemData);
    }

    public updateOrderDataSource(orderDataSource) {
        let orderItem = this.documentDetails.find((p) => p.docType == DocType.Order);
        if (orderItem) {
            orderItem.dataSource = orderDataSource;
        }
    }

    public selectDocument(item: DocumentDetail) {
        item.selected = true;
        this.documentDetailListGroup.forEach((documentDetailGroup) => {
            documentDetailGroup.documentDetailList.forEach((documentDetail) => {
                if (documentDetail != item) {
                    documentDetail.selected = false;
                }
            });
        });
        this.dispatchData(this.getDispatchData(item));
    }

    private getDispatchData(documentDetail: DocumentDetail) {
        const dataSource = documentDetail.dataSource;
        let idOrderProcessing = Uti.getFieldValue(dataSource, 'IdOrderProcessing');
        let idPerson = Uti.getFieldValue(dataSource, 'IdPerson');
        let idOrder = Uti.getFieldValue(dataSource, 'IdOrder');
        let idOffer = Uti.getFieldValue(dataSource, 'IdOffer');
        let idInvoice = Uti.getFieldValue(dataSource, 'IdInvoice');
        return [
            { key: 'IdOrderProcessing', value: idOrderProcessing },
            { key: 'IdPerson', value: idPerson },
            { key: 'IdOrder', value: idOrder },
            { key: 'IdOffer', value: idOffer },
            { key: 'IdInvoice', value: idInvoice },
        ];
    }
}
