import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild } from "@angular/core";
import { Store } from "@ngrx/store";
import { AppState } from "@app/state-management/store";
import { DocumentDetail, DocumentFile, DocType, DocUpdateMode, OrderProcessingUpdateModel } from "@app/pages/private/modules/customer/models/document/document-detail.model";
import { FieldFilter, ControlBase, Module } from "@app/models";
import { FilterModeEnum, MenuModuleId, RepProcessingTypeEnum } from "@app/app.constants";
import { DynamicFormComponent } from "@app/pages/private/modules/customer/components/dynamic-form";
import { Uti } from "@app/utilities";
import { DownloadFileService, ModuleService, DocumentService, PdfService } from "@app/services";
import { XnCommonActions, OrderProcessingActions, ModuleActions, TabButtonActions, ProcessDataActions } from "@app/state-management/store/actions";
import { Observable, Subscription } from "rxjs";
import { DocumentFileInfo, DocumentGeneratePdf } from "../../../../models/document";

@Component({
    selector: 'order-info',
    templateUrl: './order-info.component.html',
    styleUrls: ['./order-info.component.scss']
})
export class OrderInfoComponent implements OnInit, OnDestroy, AfterViewInit {
    private mainModules: Module[] = [];
    private orderProcessingModule: Module;

    private mainModulesState: Observable<Module[]>;
    private mainModulesStateSubscription: Subscription;

    @Input() currentModule: Module;

    public DocType = DocType;
    @Input() filterMode: FilterModeEnum
    @Input() fieldFilters: Array<FieldFilter>;

    public docNr: string;
    public createDate: string;
    public updateDate: string;

    private _documentDetail;
    @Input() set documentDetail(data: DocumentDetail) {
        this._documentDetail = data;
        this.processData();
    }

    get documentDetail() {
        return this._documentDetail;
    }

    @Input() documentFiles: Array<DocumentFile>;
    @Input() showDownloadFile: boolean;
    @Input() disabled: boolean;

    @ViewChild(DynamicFormComponent) dynamicForm: DynamicFormComponent;

    @Output()
    onEditField: EventEmitter<any> = new EventEmitter();

    @Output()
    onRenderCompleted: EventEmitter<any> = new EventEmitter();

    @Output()
    onReloadWidget: EventEmitter<any> = new EventEmitter();

    constructor(private _eref: ElementRef,
        private uti: Uti,
        private downloadFileService: DownloadFileService,
        private store: Store<AppState>,
        private commonActions: XnCommonActions,
        private orderProcessingActions: OrderProcessingActions,
        private moduleActions: ModuleActions,
        private moduleService: ModuleService,
        private documentService: DocumentService,
        private tabButtonActions: TabButtonActions,
        private processDataActions: ProcessDataActions,
        private pdfService: PdfService) {

        this.mainModulesState = store.select(state => state.mainModule.mainModules);
        this.subscribeMainModule();

    }

    /**
     * ngOnInit
     */
    public ngOnInit() {
    }

    /**
     * ngOnDestroy
     */
    public ngOnDestroy() {
    }

    /**
     * ngAfterViewInit
     */
    public ngAfterViewInit() {
        setTimeout(() => {
            this.onRenderCompleted.emit(this.documentDetail);
        });
    }

    private subscribeMainModule() {
        this.mainModulesStateSubscription = this.mainModulesState.subscribe(data => {
            this.mainModules = data;

            if (data) {
                this.orderProcessingModule = this.mainModules.find(p => p.idSettingsGUI == MenuModuleId.orderProcessing);
            }
        });
    }

    public processData() {
        if (this.documentDetail && this.documentDetail.dataSource) {
            this.createDate = this.documentDetail.createDate;
            this.updateDate = this.documentDetail.updateDate;
            let docNrItem;
            let docNrName = '';
            switch (this.documentDetail.docType) {
                case DocType.Invoice:
                    docNrName = 'InvoiceNr';
                    break;
                case DocType.Order:
                    docNrName = 'OrderNr';
                    break;
                case DocType.Offer:
                    docNrName = 'OfferNr';
                    break;
            }
            docNrItem = this.documentDetail.dataSource.find(p => p.OriginalColumnName && p.OriginalColumnName.indexOf(docNrName) >= 0);
            if (docNrItem) {
                this.docNr = docNrItem.Value;
            }
            this.documentFiles = this.documentDetail.docHistoryFiles || [];

            this.buildDataModel();
        }
    }

    private dataModel = {
        idOrderProcessing: null,
        idRepProcessingType: null,
        idPerson: null,
        idOffer: null,
        idOrder: null,
        idInvoice: null,
        rePrintPDF: null,
        isHasInvoiceOrder: null,
        isHasPDFInvoice: null,
        isActiveOffer: null,
        isActiveOrder: null,
        isActiveInvoice: null,
        
        isDisableEditButton: false
    };

    private buildDataModel() {
        for (let i = 0, length = this.documentDetail.dataSource.length; i < length; i++) {
            const item = this.documentDetail.dataSource[i];

            switch (item['OriginalColumnName']) {
                case 'B05RepProcessingType_IdRepProcessingType':
                    this.dataModel.idRepProcessingType = item['Value'];
                    break;
                case 'B05OrderProcessing_IdOrderProcessing':
                    this.dataModel.idOrderProcessing = item['Value'];
                    break;
                case 'B00Person_IdPerson':
                    this.dataModel.idPerson = item['Value'];
                    break;
                case 'B05Offer_IdOffer':
                    this.dataModel.idOffer = item['Value'];
                    break;
                case 'B05Order_IdOrder':
                    this.dataModel.idOrder = item['Value'];
                    break;
                case 'B05Invoice_IdInvoice':
                    this.dataModel.idInvoice = item['Value'];
                    break;
                case 'B05OrderProcessingDocumentsLink_RePrintPDF':
                    this.dataModel.rePrintPDF = item['Value'];
                    break;
                case 'B05Order_IsHasInvoiceOrder':
                    this.dataModel.isHasInvoiceOrder = item['Value'] == 'true' || item['Value'] == '1';
                    break;
                case 'B05Order_IsActive':
                    this.dataModel.isActiveOrder = item['Value'] == 'true' || item['Value'] == '1';
                    break;
                case 'B05Invoice_IsHasPDFInvoice':
                    this.dataModel.isHasPDFInvoice = item['Value'] == 'true' || item['Value'] == '1';
                    break;
                case 'B05Invoice_IsActive':
                    this.dataModel.isActiveInvoice = item['Value'] == 'true' || item['Value'] == '1';
                    break;
                case 'B05Offer_IsActive':
                    this.dataModel.isActiveOffer = item['Value'] == 'true' || item['Value'] == '1';
                    break;
            }
        }//for

        if (this.dataModel.idRepProcessingType == RepProcessingTypeEnum.Offer) {
            this.dataModel.isDisableEditButton = !this.dataModel.isActiveOffer;
        }
        else if (this.dataModel.idRepProcessingType == RepProcessingTypeEnum.Order) {
            this.dataModel.isDisableEditButton = this.dataModel.isHasInvoiceOrder || !this.dataModel.isActiveOrder;
        }
        else if (this.dataModel.idRepProcessingType == RepProcessingTypeEnum.Invoice) {
            this.dataModel.isDisableEditButton = this.dataModel.isHasPDFInvoice || !this.dataModel.isActiveInvoice;
        }
    }

    /**
     * getSavingData
     **/
    public getSavingData() {
        let result;
        if (this.dynamicForm) {
            let data = this.dynamicForm.getSavingData();
            if (data) {
                switch (this.documentDetail.docType) {
                    case DocType.Invoice:
                        result = {
                            InvoiceData: data
                        };
                        break;
                    case DocType.Order:
                        result = {
                            OrderData: data
                        };
                        break;
                    case DocType.Offer:
                        result = {
                            OfferData: data
                        };
                        break;
                }
            }
        }
        return result;
    }

    public isValid() {
        let isValid: boolean = true;
        if (this.dynamicForm.form && this.documentDetail.visible && !this.documentDetail.disable) {
            isValid = this.dynamicForm.form.valid;
            if (!isValid) {
                this.dynamicForm.focusOnFirstFieldError();
            }
        }
        return isValid;
    }

    private isWidgetPdfAlive: boolean = false;
    public downloadFile(item) {
        this.isWidgetPdfAlive = this.pdfService.isWidgetPdfAlive;
        if (this.isWidgetPdfAlive) {
            this.store.dispatch(this.commonActions.loadPDF(item.name));
        }
        else {
            this.pdfService.isWidgetPdfAlive = false;
            this.store.dispatch(this.commonActions.loadPDF(item.name));

            //Wait to receive the signal from PDF Widget
            setTimeout(() => {
                this.isWidgetPdfAlive = this.pdfService.isWidgetPdfAlive;
                if (!this.isWidgetPdfAlive) {
                    const url = Uti.getFileUrl(item.name);
                    Uti.openPopupCenter(url, 'Order Processing Pdf', 800, 800);
                    //this.downloadFileService.downloadFileWithIframe(url);
                }
            }, 500);
        }
    }

    public getControlList(): Array<ControlBase<any>> {
        if (this.dynamicForm) {
            return this.dynamicForm.groupContentList;
        }
        return null;
    }

    public editField(data) {
        this.onEditField.emit(data);
    }

    public updateDocument() {
        this.openEditFormForOrderProcessingModule();
    }

    public printDocument() {
        const updateDataModel = this.buildUpdateDataModel();
        this.documentService.generateDownloadPdfFileAnOpenPopup(
            new DocumentGeneratePdf({
                idRepProcessingTypes: updateDataModel.idRepProcessingTypeForGeneratingPdf,
                idOrderProcessing: updateDataModel.idOrderProcessing,
                fileInfos: updateDataModel.fileInfos,
                callBack: this.printExportCallback.bind(this),
                isPrint: true,
                idOffer: updateDataModel.data.idOffer,
                idOrder: updateDataModel.data.idOrder,
                idInvoice: updateDataModel.data.idInvoice
            }));
    }

    public sendMailDocument() {
        const updateDataModel = this.buildUpdateDataModel();
        this.documentService.generateDownloadPdfFileAnOpenPopup(
            new DocumentGeneratePdf({
                idRepProcessingTypes: updateDataModel.idRepProcessingTypeForGeneratingPdf,
                idOrderProcessing: updateDataModel.idOrderProcessing,
                fileInfos: updateDataModel.fileInfos,
                callBack: this.sendMailCallback.bind(this, updateDataModel.idOrderProcessing),
                idOffer: updateDataModel.data.idOffer,
                idOrder: updateDataModel.data.idOrder,
                idInvoice: updateDataModel.data.idInvoice
            }));
    }

    private printExportCallback(fileInfos: Array<DocumentFileInfo>, needtoReloadWidget: boolean) {
        if (!fileInfos || !fileInfos.length) return;

        if (needtoReloadWidget)
            this.onReloadWidget.emit(null);
    }

    private sendMailCallback(idOrderProcessing: string, fileInfos: Array<DocumentFileInfo>, needtoReloadWidget: boolean) {
        if (!fileInfos || !fileInfos.length) return;

        if (needtoReloadWidget)
            this.onReloadWidget.emit(null);

        // Get list email here
        this.documentService.getOrderProcessingEmail(idOrderProcessing, '1').subscribe(data => {
            if (data && data[0]) {
                let emailInfos: Array<any> = data[0]; // Emails for order processing type
                let allEmailsOfCustomer: Array<any> = data[1]; // Emails of all contact of customers
                fileInfos.forEach(fileInfo => {
                    let emails = emailInfos.filter(p => p.IdRepProcessingType == fileInfo.idRepProcessingType);
                    if (emails && emails.length) {
                        fileInfo.emails = emails.map(p => p.Email);
                    }
                    if (allEmailsOfCustomer && allEmailsOfCustomer.length) {
                        fileInfo.allEmailsOfCustomer = allEmailsOfCustomer.map((p) => {
                            return {
                                value: p.Email,
                                display: '&lt;' + p.Email + '&gt; ' + p.DisplayName
                            }
                        });
                    }
                })
            }

            this.store.dispatch(this.processDataActions.requestSendOPEmail(fileInfos, this.currentModule));
        });
    }

    private _updateDataModel: any;
    private buildUpdateDataModel() {
        if (this._updateDataModel) return this._updateDataModel;

        let model = {
            updateMode: DocUpdateMode.Edit,
            documentType: this.documentDetail.docType,
            idRepProcessingType: this.dataModel.idRepProcessingType,
            idOrderProcessing: this.dataModel.idOrderProcessing,
            rePrintPDF: this.dataModel.rePrintPDF,

            data: new OrderProcessingUpdateModel(),
            fileInfos: new Array<DocumentFileInfo>(),
            idRepProcessingTypeForGeneratingPdf: [],
        };

        model.data.idOrderProcessing = this.dataModel.idOrderProcessing;
        model.data.idPerson = this.dataModel.idPerson;
        model.data.idOffer = this.dataModel.idOffer;
        model.data.idOrder = this.dataModel.idOrder;
        model.data.idInvoice = this.dataModel.idInvoice;

        //for (let i = 0, length = this.documentDetail.dataSource.length; i < length; i++) {
        //    const item = this.documentDetail.dataSource[i];

        //    switch (item['OriginalColumnName']) {
        //        case 'B05RepProcessingType_IdRepProcessingType':
        //            model.idRepProcessingType = item['Value'];
        //            break;
        //        case 'B05OrderProcessing_IdOrderProcessing':
        //            model.idOrderProcessing = model.data.idOrderProcessing;
        //            model.data.idOrderProcessing = item['Value'];
        //            break;
        //        case 'B00Person_IdPerson':
        //            model.data.idPerson = item['Value'];
        //            break;
        //        case 'B05Offer_IdOffer':
        //            model.data.idOffer = item['Value'];
        //            break;
        //        case 'B05Order_IdOrder':
        //            model.data.idOrder = item['Value'];
        //            break;
        //        case 'B05Invoice_IdInvoice':
        //            model.data.idInvoice = item['Value'];
        //            break;
        //        case 'B05OrderProcessingDocumentsLink_RePrintPDF':
        //            model.rePrintPDF = item['Value'];
        //            break;
        //    }
        //}//for

        const mediaJson = this.buildFileJson(model.rePrintPDF, model.idRepProcessingType, model.idOrderProcessing);
        if (mediaJson)
            model.fileInfos.push(mediaJson);
        else//Need to generate offer pdf
            model.idRepProcessingTypeForGeneratingPdf.push(model.idRepProcessingType);

        this._updateDataModel = model;

        return model;
    }

    private openEditFormForOrderProcessingModule() {
        const updateDataModel = this.buildUpdateDataModel();
        const status = this.moduleService.loadContentDetailBySelectedModule(this.orderProcessingModule, this.currentModule, null, this.mainModules);

        this.store.dispatch(this.orderProcessingActions.requestOrder(updateDataModel, this.orderProcessingModule));

        // True : Wait to change to other module/submodule
        if (status) {
            setTimeout(() => {
                this.store.dispatch(this.moduleActions.requestTriggerClickNewFromModule(this.orderProcessingModule));
            }, 1000);
        }
        // At the current module
        else {
            this.store.dispatch(this.tabButtonActions.requestEdit(this.currentModule));
        }
    }

    private buildFileJson(fileJson, idRepProcessingType, idOrderProcessing) {
        if (!fileJson) return null;
        try {
            const json = JSON.parse(fileJson);
            const item = json[0];
            return new DocumentFileInfo({
                idOrderProcessing: idOrderProcessing,
                idRepProcessingType: idRepProcessingType,
                fullFileName: item.FullPathFileName,
                originalFileName: item.MediaOriginalName
            });
        } catch{
        }
        return null;
    }

    public onRightClick() {
        const data = Uti.mapDataSourceToObject(this.documentDetail.dataSource);
        sessionStorage.setItem('documentInfo', JSON.stringify(data));
    }
}
