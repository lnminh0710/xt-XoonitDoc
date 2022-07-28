import { Input, Directive, EventEmitter, Output, OnDestroy, OnInit, ComponentRef, ComponentFactoryResolver, ViewContainerRef } from '@angular/core';
import { Store, ReducerManagerDispatcher } from "@ngrx/store";
import { Observable, Subscription } from 'rxjs';
import {
    TabButtonActions,
    OrderProcessingActions,
    ProcessDataActions,
    ModuleActions,
    CustomAction,
    PropertyPanelActions
} from '@app/state-management/store/actions';
import {
    DocumentService, ModuleService, LoadingService, AppErrorHandler, PropertyPanelService, ModalService
} from '@app/services';
import { Module, WidgetDetail, ApiResultResponse, WidgetPropertyModel, DeleteCancelModel, DeleteCancelActionType } from '@app/models';
import { MenuModuleId, RepWidgetAppIdEnum, MessageModal, RepProcessingTypeEnum } from '@app/app.constants';
import { Uti } from '@app/utilities';
import { XnAgGridComponent } from '@app/shared/components/xn-control/xn-ag-grid/pages/ag-grid-container/xn-ag-grid.component';
import { DocUpdateMode, DocType, OrderProcessingUpdateModel, DocumentGeneratePdf } from '../../../pages/private/modules/customer/models/document';
import ceil from 'lodash-es/ceil';
import { DocumentFileInfo } from '@app/pages/private/modules/customer/models/document/document-fileInfo.model';
import { WidgetModuleComponent, DialogDeleteCancelComponent } from '@app/shared/components/widget';
import { AgGridService } from '@app/shared/components/xn-control/xn-ag-grid/shared/ag-grid.service';
import { filter, map, finalize } from 'rxjs/operators';

@Directive({
    selector: '[orderProcessingProcess]',
    inputs: ['config: orderProcessingProcess'],
})

export class OrderProcessingProcessDirective implements OnDestroy, OnInit {
    private contextMenuSubscription: Subscription;
    private valueChangeSubscription: Subscription;
    private deleteOrderSubscription: Subscription;
    private archiveOrderSubscription: Subscription;
    private mainModules: Module[] = [];
    private mainModulesState: Observable<Module[]>;
    private mainModulesStateSubscription: Subscription;
    private dataSourceChangedSubscription: Subscription;
    private requestUpdatePropertiesStateSubscription: Subscription;
    private selectedHasDocumentType: any;

    @Input() currentModule: Module;

    private _config;
    set config(config: XnAgGridComponent) {
        if (config) {
            this._config = config;
            this.registerEventFromGrid();
        }
    }

    get config() {
        return this._config;
    }

    private _widgetDetail: WidgetDetail;
    @Input() set widgetDetail(data: WidgetDetail) {
        if (data) {
            this._widgetDetail = data;
            let isValidOrderWidget = this.isOrderProcessingWidget();
            if (isValidOrderWidget) {
                this.buildContextMenu();
                this.customEventForDocumentWidget();
            }
            if (this.widgetDetail.idRepWidgetApp == RepWidgetAppIdEnum.ArticleOrderDetail) {
                this.caculateAmount();
                this.mergeArticleData();
            }
        }
    }
    get widgetDetail() {
        return this._widgetDetail;
    }

    private _properties: any;
    @Input() set properties(properties: any[]) {
        this._properties = properties;

        this.propHasDocumentTypeChange(properties);
    }
    get properties() {
        return this._properties;
    }

    @Output() onReloadWidget: EventEmitter<any> = new EventEmitter();

    constructor(private store: Store<any>,
        private tabButtonActions: TabButtonActions,
        private orderProcessingActions: OrderProcessingActions,
        private documentService: DocumentService,
        private moduleService: ModuleService,
        private loadingService: LoadingService,
        private moduleActions: ModuleActions,
        private processDataActions: ProcessDataActions,
        private appErrorHandler: AppErrorHandler,
        private propertyPanelService: PropertyPanelService,
        private modalService: ModalService,
        private agGridService: AgGridService,
        private dispatcher: ReducerManagerDispatcher,
        protected componentFactoryResolver: ComponentFactoryResolver,
        protected containerRef: ViewContainerRef) {

        this.mainModulesState = store.select(state => state.mainModule.mainModules);
        this.subscribeData();
    }

    public ngOnInit() {
        this.subcribeHasDocumentType();
    }

    public ngOnDestroy() {
        Uti.unsubscribe(this);
    }

    private customEventForDocumentWidget() {
        this.config.onSelectionChanged = () => { };
        this.config.onCellFocused = this.onCellFocused.bind(this);
    }

    private onCellFocused($event) {
        if ($event && this.config) {
            const cell = this.config.getFocusedCell();
            if (!cell)
                return;
            const row = this.config.api.getDisplayedRowAtIndex(cell.rowIndex);
            if (!row || !row.data)
                return;
            const rowData = this.agGridService.buildRowClickData(row.data);
            if (rowData) {
                let focusedField = $event.column ? $event.column.colDef.field : '';
                if (focusedField == 'OfferNr') {
                    let item = rowData.find(p => p.key == 'IdOrder');
                    if (item) {
                        item.value = null;
                    }
                    item = rowData.find(p => p.key == 'IdInvoice');
                    if (item) {
                        item.value = null;
                    }
                }
                else if (focusedField == 'OrderNr') {
                    let item = rowData.find(p => p.key == 'IdOffer');
                    if (item) {
                        item.value = null;
                    }
                    item = rowData.find(p => p.key == 'IdInvoice');
                    if (item) {
                        item.value = null;
                    }
                }
                else if (focusedField == 'InvoiceNr') {
                    let item = rowData.find(p => p.key == 'IdOrder');
                    if (item) {
                        item.value = null;
                    }
                    item = rowData.find(p => p.key == 'IdOffer');
                    if (item) {
                        item.value = null;
                    }
                }
                this.config.rowClick.emit(rowData);
            }
        }
    }

    private registerEventFromGrid() {
        this.deleteOrderSubscription = this.config.deleteClick.subscribe(data => {
            if (data) {
                //console.log('deleteOP', data);
                this.openDialogDeleteCancel(new DeleteCancelModel({
                    title: 'Delete Reasons',
                    actionType: DeleteCancelActionType.OP_DeleteOP,
                    data: { idOrderProcessing: data.IdOrderProcessing }
                }));
            }
        });

        this.archiveOrderSubscription = this.config.archiveClick.subscribe(data => {
            if (data) {
                //console.log('archiveOP', data);
                this.archiveOP(data.IdOrderProcessing);
            }
        });
    }

    private mergeArticleData() {
        this.dataSourceChangedSubscription = this.config.dataSourceChanged.subscribe(data => {
            if (data) {
                const items = this.config.getCurrentNodeItems();
                let widgetModuleInfo = (this.config.parentInstance as WidgetModuleComponent);
                let allowMergeNewData: boolean = true;
                if (widgetModuleInfo) {
                    let listenKeyObject = widgetModuleInfo.data.widgetDataType.listenKeyRequest(this.currentModule.moduleNameTrim);
                    if (listenKeyObject && listenKeyObject['IdOrder']) {
                        let idOrders: Array<string> = listenKeyObject['IdOrder'].toString().split(',');
                        if (idOrders && idOrders.length > 1) {
                            allowMergeNewData = false;
                            this.config.readOnly = true;
                            widgetModuleInfo.menuStatusSettings.boxSearchArticle.enable = false;
                        }
                        else {
                            this.config.readOnly = false;
                        }
                        this.config.showHideColumn();
                    }
                }
                if (allowMergeNewData) {
                    // Find added new rows
                    let itemsAdded = items.filter(p => !p.IdOrderProcessingArticles);
                    if (itemsAdded && itemsAdded.length) {
                        // Merge to datasourcee
                        data.rowData = [...data.rowData, ...itemsAdded];
                        if (!this.config.itemsAdded) {
                            this.config.itemsAdded = [];
                        }
                        this.config.itemsAdded = [...this.config.itemsAdded, ...itemsAdded];
                    }
                }
            }
        });
    }

    private subscribeData() {
        this.mainModulesStateSubscription = this.mainModulesState.subscribe(data => {
            this.mainModules = data;
        });
    }

    private subcribeHasDocumentType() {
        if (this.requestUpdatePropertiesStateSubscription) this.requestUpdatePropertiesStateSubscription.unsubscribe();

        this.requestUpdatePropertiesStateSubscription = this.dispatcher.pipe(
            filter((action: CustomAction) => {
                return action.type === PropertyPanelActions.UPDATE_PROPERTIES && action.module.idSettingsGUI == this.currentModule.idSettingsGUI;
            }),
            map((action: CustomAction) => {
                return action.payload;
            })
        ).subscribe((actionData) => {
            this.appErrorHandler.executeAction(() => {
                if (actionData) {
                    const widgetData: WidgetDetail = actionData.widgetData;
                    const properties: any = actionData.widgetProperties;
                    if (widgetData && widgetData.id && this.widgetDetail.id && widgetData.id === this.widgetDetail.id && properties) {
                        this.propHasDocumentTypeChange(properties);
                    }
                }
            });
        });
    }

    private propHasDocumentTypeChange(properties) {
        if (!properties) return;

        const propHasDocumentType = this.propertyPanelService.getItemRecursive(properties, 'HasDocumentType');
        if (propHasDocumentType && propHasDocumentType.value) {
            if (this.selectedHasDocumentType != propHasDocumentType.value) {
                this.onReloadWidget.emit(null);
            }
            this.selectedHasDocumentType = propHasDocumentType.value;
        }
    }

    private caculateAmount() {
        if (this.valueChangeSubscription) this.valueChangeSubscription.unsubscribe();

        this.valueChangeSubscription = this.config.cellValueChanged.subscribe(data => {
            if (data) {
                let priceInclVAT;
                let amountIncVAT;
                if (data.PriceExclVAT) {
                    priceInclVAT = data.PriceExclVAT + (data.PriceExclVAT * (data.VatRate * 1.0) / 100.0);
                    amountIncVAT = ceil(priceInclVAT * data.Quantity, 2);
                }
                if (priceInclVAT && amountIncVAT) {
                    data.PriceInclVAT = priceInclVAT;
                    data.AmountIncVAT = amountIncVAT;
                    this.config.updateRowData([data]);
                }
            }
        });
    }

    /**
     * isOrderProcessingWidget
     **/
    private isOrderProcessingWidget() {
        let isValid = false;
        if (this.widgetDetail
            && this.widgetDetail.widgetDataType
            && this.widgetDetail.widgetDataType.editTableSetting) {
            isValid = this.widgetDetail.widgetDataType.editTableSetting.groupType == 'OrderProcessing';
        }
        return isValid;
    }

    /**
     * openEditFormForOrderProcessingModule
     * @param orderProcessingModule
     */
    private openEditFormForOrderProcessingModule(orderProcessingModule, data, docUpdateMode: DocUpdateMode, docType: DocType) {
        const status = this.moduleService.loadContentDetailBySelectedModule(orderProcessingModule, this.currentModule, null, this.mainModules);

        this.store.dispatch(this.orderProcessingActions.requestOrder({
            updateMode: docUpdateMode,
            data: new OrderProcessingUpdateModel({
                idOffer: data.idOffer,
                idOrder: data.idOrder,
                idInvoice: data.idInvoice,
                idOrderProcessing: data.idOrderProcessing,
                idPerson: data.idPerson
            }),
            documentType: docType
        }, orderProcessingModule));

        // True : Wait to change to other module/submodule
        if (status) {
            setTimeout(() => {
                this.store.dispatch(this.moduleActions.requestTriggerClickNewFromModule(orderProcessingModule));
            }, 1000);
        }
        // At the current module
        else {
            if (docUpdateMode == DocUpdateMode.Edit) {
                this.store.dispatch(this.tabButtonActions.requestEdit(this.currentModule));
            }
            else {
                if (docType == DocType.All) {
                    this.store.dispatch(this.tabButtonActions.requestNew(this.currentModule));
                }
                else {
                    this.store.dispatch(this.tabButtonActions.requestEdit(this.currentModule));
                }
            }
        }
    }

    private buildNewEditDeleteMenuItem(orderProcessingModule, data, contextMenu: Array<any>) {
        let menuNewOrderProcessing = null;
        let menuEditOrderProcessing = null;
        let menuDeleteOrderProcessing = null;

        //#region New
        const newKey = orderProcessingModule.moduleName + '_New';
        let index = contextMenu.findIndex(m => m.key == newKey);
        if (index > -1) {
            contextMenu.splice(index, 1);
            if (contextMenu[index + 1] == 'separator') {
                contextMenu.splice(index + 1, 1);
            }
        }

        menuNewOrderProcessing = {
            name: 'New ' + orderProcessingModule.moduleName,
            action: () => {
            },
            cssClasses: [''],
            icon: `<i class="fa fa-plus green-color  ag-context-icon"/>`,
            key: newKey,
            subMenu: []
        }

        let newSubMenuArray = [];
        newSubMenuArray.push({
            name: 'New All',
            action: () => {
                this.openEditFormForOrderProcessingModule(orderProcessingModule, data, DocUpdateMode.New, DocType.All);
            }
        });

        newSubMenuArray.push('separator');

        // Process For New Order
        newSubMenuArray.push({
            name: 'New Invoice',
            action: () => {
                this.openEditFormForOrderProcessingModule(orderProcessingModule, data, DocUpdateMode.New, DocType.Invoice);
            }
        });

        newSubMenuArray.push({
            name: 'New Order',
            action: () => {
                this.openEditFormForOrderProcessingModule(orderProcessingModule, data, DocUpdateMode.New, DocType.Order);
            }
        });

        newSubMenuArray.push({
            name: 'New Offer',
            action: () => {
                this.openEditFormForOrderProcessingModule(orderProcessingModule, data, DocUpdateMode.New, DocType.Offer);
            }
        });

        if (newSubMenuArray.length) {
            menuNewOrderProcessing.subMenu = newSubMenuArray;
        }
        //#endregion

        //#region Delete
        index = contextMenu.findIndex(m => m.key == 'OrderProcessing_Delete');
        if (index > -1) {
            contextMenu.splice(index, 1);
        }

        menuDeleteOrderProcessing = {
            name: 'Delete ' + orderProcessingModule.moduleName,
            action: () => {
                this.openDialogDeleteCancel(new DeleteCancelModel({
                    title: 'Delete Reasons',
                    actionType: DeleteCancelActionType.OP_DeleteOP,
                    data: data
                }));
            },
            cssClasses: [''],
            icon: `<i class="fa fa-remove red-color ag-context-icon"/>`,
            key: 'OrderProcessing_Delete',
            subMenu: null
        };
        //#endregion

        if (menuDeleteOrderProcessing)
            contextMenu.unshift(menuDeleteOrderProcessing);

        if (menuEditOrderProcessing)
            contextMenu.unshift(menuEditOrderProcessing);

        contextMenu.unshift(menuNewOrderProcessing);
    }

    private buildSpecificObjectMenuItem(orderProcessingModule, data, contextMenu: Array<any>, focusedCellColId) {
        if (!this.allowCreateSpecificMenu(focusedCellColId, data)) return;

        data.forcePrintOP = false;

        const dataForSubMenu = this.getDataForSubMenu(focusedCellColId, data);
        const idOrderProcessing = data.idOrderProcessing;
        const dataForPrintingPdf = this.getDataForPrintingPdf(focusedCellColId, data);
        let menu = null;

        const key = 'OrderProcessing_SpecificObject';
        let index = contextMenu.findIndex(m => m.key == key);
        if (index > -1) {
            contextMenu.splice(index, 1);
            if (contextMenu[index + 1] == 'separator') {
                contextMenu.splice(index + 1, 1);
            }
        }

        contextMenu.unshift('separator');

        let menuIcon = '';
        let menuClassForName = '';
        let docType: DocType;
        if (dataForSubMenu.allowMenuOffer) {
            menuIcon = `<i class="fa fa-bookmark color-offer ag-context-icon"/>`;
            menuClassForName = 'color-offer';
            docType = DocType.Offer;
        }
        else if (dataForSubMenu.allowMenuOrder) {
            menuIcon = `<i class="fa fa-cart-plus color-order ag-context-icon"/>`;
            menuClassForName = 'color-order';
            docType = DocType.Order;
        }
        else if (dataForSubMenu.allowMenuInvoice) {
            menuIcon = `<i class="fa fa-file-text color-invoice ag-context-icon"/>`;
            menuClassForName = 'color-invoice';
            docType = DocType.Invoice;
        }

        menu = {
            name: `<span class="` + menuClassForName + `" style="font-weight: bold;">` + dataForSubMenu.objectNumber + `</span>`,
            action: () => {
            },
            cssClasses: [''],
            icon: menuIcon,
            key: key,
            subMenu: null
        };
        let subMenuArray = [];

        //#region Create Menu
        if (dataForSubMenu.allowMenuOffer || dataForSubMenu.allowMenuOrder) {
            let createMenu = {
                name: 'Create',
                icon: `<i class="fa  fa-plus  green-color  ag-context-icon"/>`,
                action: () => {
                },
                subMenu: null
            };

            let createSubMenuArray = [];
            createSubMenuArray.push({
                name: 'New Order',
                icon: `<i class="fa fa-cart-plus color-order ag-context-icon"/>`,
                action: () => {
                    this.openEditFormForOrderProcessingModule(orderProcessingModule, data, DocUpdateMode.New, DocType.Order);
                }
            });
            createSubMenuArray.push({
                name: 'New Invoice',
                icon: `<i class="fa fa-file-text color-invoice ag-context-icon"/>`,
                action: () => {
                    this.openEditFormForOrderProcessingModule(orderProcessingModule, data, DocUpdateMode.New, DocType.Invoice);
                },
                disabled: !dataForSubMenu.allowMenuOffer && dataForSubMenu.allowMenuOrder && dataForSubMenu.orderHasInvoice
            });

            if (createSubMenuArray.length) {
                createMenu.subMenu = createSubMenuArray;
            }

            subMenuArray.push(createMenu);
            subMenuArray.push('separator');
        }
        //#endregion

        const isDisableUpdateDelete = (dataForSubMenu.allowMenuOrder && dataForSubMenu.orderHasInvoice) ||
            (dataForSubMenu.allowMenuInvoice &&
                (dataForSubMenu.invoiceIsCancelled || dataForSubMenu.invoiceHasPrintSentStatus));

        subMenuArray.push({
            name: 'Update ' + dataForSubMenu.objectName,
            icon: `<i class="fa  fa-pencil-square-o  orange-color  ag-context-icon"/>`,
            action: () => {
                this.openEditFormForOrderProcessingModule(orderProcessingModule, data, DocUpdateMode.Edit, docType);
            },
            disabled: isDisableUpdateDelete
        });

        if (dataForSubMenu.allowMenuInvoice) {
            subMenuArray.push({
                name: 'Cancel ' + dataForSubMenu.objectName,
                icon: `<i class="fa fa-window-close gray-color ag-context-icon"/>`,
                action: () => {
                    this.openDialogDeleteCancel(new DeleteCancelModel({
                        title: 'Cancel Reasons',
                        actionType: DeleteCancelActionType.OP_CancelInvoice,
                        data: data
                    }));
                },
                disabled: dataForSubMenu.invoiceHasPrintSentStatus && dataForSubMenu.invoiceIsCancelled
            });
        }

        if (!dataForSubMenu.allowMenuOffer) {
            subMenuArray.push({
                name: 'Delete ' + dataForSubMenu.objectName,
                icon: `<i class="fa fa-remove red-color ag-context-icon"/>`,
                action: () => {
                    this.openDialogDeleteCancel(new DeleteCancelModel({
                        title: 'Delete Reasons',
                        actionType: dataForSubMenu.allowMenuOrder ? DeleteCancelActionType.OP_DeleteOrder : DeleteCancelActionType.OP_DeleteInvoice,
                        data: data
                    }));
                },
                disabled: isDisableUpdateDelete
            });
        }

        subMenuArray.push({
            name: 'Print ' + dataForSubMenu.objectName,
            icon: `<i class="fa fa-print ag-context-icon"/>`,
            action: () => {
                this.documentService.generateDownloadPdfFileAnOpenPopup(
                    new DocumentGeneratePdf({
                        idRepProcessingTypes: dataForPrintingPdf.idRepProcessingTypes,
                        idOrderProcessing: idOrderProcessing,
                        fileInfos: dataForPrintingPdf.fileInfos,
                        allFileInfos: dataForPrintingPdf.allFileInfos,
                        callBack: this.printExportCallback.bind(this),
                        isPrint: true
                    }));
            }
        });

        subMenuArray.push({
            name: 'Send Mail ' + dataForSubMenu.objectName,
            icon: `<i class="fa fa-envelope-o blue-color ag-context-icon"/>`,
            action: () => {
                this.documentService.generateDownloadPdfFileAnOpenPopup(
                    new DocumentGeneratePdf({
                        idRepProcessingTypes: dataForPrintingPdf.idRepProcessingTypes,
                        idOrderProcessing: idOrderProcessing,
                        fileInfos: dataForPrintingPdf.fileInfos,
                        callBack: this.sendMailCallback.bind(this, idOrderProcessing)
                    }));
            }
        });

        subMenuArray.push({
            name: 'Export ' + dataForSubMenu.objectName,
            icon: `<i class="fa fa-file-pdf-o red-color ag-context-icon"/>`,
            action: () => {
                this.documentService.generateDownloadPdfFileAnOpenPopup(
                    new DocumentGeneratePdf({
                        idRepProcessingTypes: dataForPrintingPdf.idRepProcessingTypes,
                        idOrderProcessing: idOrderProcessing,
                        fileInfos: dataForPrintingPdf.fileInfos,
                        callBack: this.sendMailCallback.bind(this, idOrderProcessing),
                        isExport: true
                    }));
            }
        });

        if (subMenuArray.length) {
            menu.subMenu = subMenuArray;
        }

        contextMenu.unshift(menu);
    }

    /**
     * buildPrintExportSendEmail
     **/
    private buildPrintExportSendEmail(data, contextMenu) {
        let focusedCellColId = this.getFocusedCell();

        if (!focusedCellColId || (!data.idOffer && !data.idOrder && !data.idInvoice)) return;

        const objectName = 'Order Processing';
        const idOrderProcessing = data.idOrderProcessing;
        const dataForPrintingPdf = this.getDataForPrintingPdf(null, data);

        //Export
        let menuExportOrderProcessing = contextMenu.find(m => m.key == 'OrderProcessing_Export');
        if (!menuExportOrderProcessing) {
            contextMenu.unshift({
                name: `Export ` + objectName,
                action: () => {
                    this.documentService.generateDownloadPdfFileAnOpenPopup(
                        new DocumentGeneratePdf({
                            idRepProcessingTypes: dataForPrintingPdf.idRepProcessingTypes,
                            idOrderProcessing: idOrderProcessing,
                            fileInfos: dataForPrintingPdf.fileInfos,
                            callBack: this.printExportCallback.bind(this),
                            isExport: true
                        }));
                },
                cssClasses: [''],
                icon: `<i class="fa fa-file-pdf-o red-color ag-context-icon"/>`,
                key: 'OrderProcessing_Export'
            });
        }

        //SendMail
        let menuSendMailOrderProcessing = contextMenu.find(m => m.key == 'OrderProcessing_SendMail');
        if (!menuSendMailOrderProcessing) {
            contextMenu.unshift({
                name: `Send Mail ` + objectName,
                action: () => {
                    this.documentService.generateDownloadPdfFileAnOpenPopup(
                        new DocumentGeneratePdf({
                            idRepProcessingTypes: dataForPrintingPdf.idRepProcessingTypes,
                            idOrderProcessing: idOrderProcessing,
                            fileInfos: dataForPrintingPdf.fileInfos,
                            callBack: this.sendMailCallback.bind(this, idOrderProcessing)
                        }));
                },
                cssClasses: [''],
                icon: `<i class="fa fa-envelope-o blue-color ag-context-icon"/>`,
                key: 'OrderProcessing_SendMail'
            });
        }

        //Print
        let menuPrintOrderProcessing = contextMenu.find(m => m.key == 'OrderProcessing_Print');
        if (!menuPrintOrderProcessing) {
            contextMenu.unshift({
                name: 'Print ' + objectName,
                action: () => {
                    this.documentService.generateDownloadPdfFileAnOpenPopup(
                        new DocumentGeneratePdf({
                            idRepProcessingTypes: dataForPrintingPdf.idRepProcessingTypes,
                            idOrderProcessing: idOrderProcessing,
                            fileInfos: dataForPrintingPdf.fileInfos,
                            allFileInfos: dataForPrintingPdf.allFileInfos,
                            callBack: this.printExportCallback.bind(this),
                            isPrint: true
                        }));
                },
                cssClasses: [''],
                icon: `<i class="fa fa-print ag-context-icon"/>`,
                key: 'OrderProcessing_Print'
            });
        }
    }

    private buildContextMenu() {
        if (this.contextMenuSubscription)
            this.contextMenuSubscription.unsubscribe();

        this.contextMenuSubscription = this.config.contextMenuItemsSubject.subscribe(contextMenu => {
            if (contextMenu) {
                let data, focusedCellColId;
                let documentInfo = sessionStorage.getItem('documentInfo');
                if (documentInfo) {
                    data = Uti.parseJsonString(documentInfo);
                    sessionStorage.removeItem('documentInfo');
                    if (data) {
                        if (data.idInvoice) {
                            focusedCellColId = 'InvoiceNr';
                            data.isActiveInvoice = Uti.getBoolean(data.isActive);
                            data.invMediaOriginalName = data.rePrintPdf;
                        }
                        else if (data.idOrder) {
                            focusedCellColId = 'OrderNr';
                            data.ordMediaOriginalName = data.rePrintPdf;
                        }
                        else if (data.idOffer) {
                            focusedCellColId = 'OfferNr';
                            data.offMediaOriginalName = data.rePrintPdf;
                        }
                        const currentRowData = this.config.getRowDataByCellFocus();
                        if (!currentRowData.isActive) {
                            data.isActive = false;
                        }

                        var dataCellFocus = this.config.getRowDataByCellFocus();

                        if (!data.offMediaOriginalName) data.offMediaOriginalName = dataCellFocus.offMediaOriginalName;
                        if (!data.ordMediaOriginalName) data.ordMediaOriginalName = dataCellFocus.ordMediaOriginalName;
                        if (!data.invMediaOriginalName) data.invMediaOriginalName = dataCellFocus.invMediaOriginalName;

                        data.allDocumentMediaOriginalName = dataCellFocus.allDocumentMediaOriginalName;
                        data.forcePrintOP = true;
                    }
                }
                else {
                    data = this.config.getRowDataByCellFocus();
                }

                if (!data)
                    return;

                let isValidWidget = this.isOrderProcessingWidget();

                if (isValidWidget) {
                    let orderProcessingModule = this.mainModules.find(p => p.idSettingsGUI == MenuModuleId.orderProcessing);
                    if (!orderProcessingModule) return

                    contextMenu.unshift('separator');

                    // Build Print, Export, Send Email
                    this.buildPrintExportSendEmail(data, contextMenu);

                    if (Uti.getBoolean(data.isActive)) {
                        // Build New & Edit & Delete Menu
                        this.buildNewEditDeleteMenuItem(orderProcessingModule, data, contextMenu);
                        focusedCellColId = focusedCellColId || this.getFocusedCell();
                        // Build New & Edit Menu for specific Object : Offer, Order, Invoice
                        this.buildSpecificObjectMenuItem(orderProcessingModule, data, contextMenu, focusedCellColId);
                    }
                }
            }//contextMenu
        });
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

    private getFocusedCell() {
        const focusedCell = this.config.getFocusedCell();
        if (focusedCell && focusedCell.column) {
            return focusedCell.column['colId'];
        }
        return null;
    }

    private allowCreateSpecificMenu(colId, data) {
        if (!data) return false;

        switch (colId) {
            case 'OfferNr':
                if (data.idOffer) return true;
                break;
            case 'OrderNr':
                if (data.idOrder) return true;
                break;
            case 'InvoiceNr':
                if (data.idInvoice) return true;
                break;
        }//switch

        return false;
    }

    private getDataForPrintingPdf(colId, data) {
        let objectName = 'Order Processing';
        let fileInfos: Array<DocumentFileInfo> = [];
        let mediaJsonAll: any;
        let mediaJsonOffer: any;
        let mediaJsonOrder: any;
        let mediaJsonInvoice: any;
        let idRepProcessingTypes = [];
        let allFileInfos: Array<DocumentFileInfo> = [];

        let needToGenerateOffer: boolean = false;
        let needToGenerateOrder: boolean = false;
        let needToGenerateInvoice: boolean = false;
        let isSubmenu: boolean = true;

        switch (colId) {
            case 'OfferNr':
                if (data.idOffer) {
                    needToGenerateOffer = true;
                    objectName = 'Offer';
                }
                break;
            case 'OrderNr':
                if (data.idOrder) {
                    needToGenerateOrder = true;
                    objectName = 'Order';
                }
                break;
            case 'InvoiceNr':
                if (data.idInvoice) {
                    needToGenerateInvoice = true;
                    objectName = 'Invoice';
                }
                break;
            default:
                isSubmenu = false;

                if (data.idOffer)
                    needToGenerateOffer = true;

                if (data.idOrder)
                    needToGenerateOrder = true;

                if (data.idInvoice)
                    needToGenerateInvoice = true;
                break;
        }//switch        

        mediaJsonOffer = this.buildFileJson(data.offMediaOriginalName, RepProcessingTypeEnum.Offer, data.idOrderProcessing);
        mediaJsonOrder = this.buildFileJson(data.ordMediaOriginalName, RepProcessingTypeEnum.Order, data.idOrderProcessing);
        mediaJsonInvoice = this.buildFileJson(data.invMediaOriginalName, RepProcessingTypeEnum.Invoice, data.idOrderProcessing);
        mediaJsonAll = this.buildFileJson(data.allDocumentMediaOriginalName, RepProcessingTypeEnum.AllDocuments, data.idOrderProcessing);
        if (mediaJsonOffer) allFileInfos.push(mediaJsonOffer);
        if (mediaJsonOrder) allFileInfos.push(mediaJsonOrder);
        if (mediaJsonInvoice) allFileInfos.push(mediaJsonInvoice);
        if (mediaJsonAll) allFileInfos.push(mediaJsonAll);

        if (needToGenerateOffer || data.forcePrintOP) {
            if (mediaJsonOffer)
                fileInfos.push(mediaJsonOffer);
            else//Need to generate offer pdf
                idRepProcessingTypes.push(RepProcessingTypeEnum.Offer);
        }
        if (needToGenerateOrder || data.forcePrintOP) {
            if (mediaJsonOrder)
                fileInfos.push(mediaJsonOrder);
            else//Need to generate Order pdf
                idRepProcessingTypes.push(RepProcessingTypeEnum.Order);
        }
        if (needToGenerateInvoice || data.forcePrintOP) {
            if (mediaJsonInvoice)
                fileInfos.push(mediaJsonInvoice);
            else//Need to generate Invoice pdf
                idRepProcessingTypes.push(RepProcessingTypeEnum.Invoice);
        }

        if (!isSubmenu) {
            //All Documents
            if (idRepProcessingTypes.length) {
                //Need to generate All pdf
                idRepProcessingTypes.unshift(RepProcessingTypeEnum.AllDocuments);
            }
            else {
                if (mediaJsonAll) fileInfos.unshift(mediaJsonAll);
            }
        }

        return {
            idRepProcessingTypes: idRepProcessingTypes,
            objectName: objectName,
            fileInfos: fileInfos,
            allFileInfos: allFileInfos
        };
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

    private getOPNumber(jsonData) {
        if (!jsonData) return null;
        try {
            const json = Uti.parseJsonString(jsonData);
            if (json) {
                const item = json[0];
                return item.Text;
            }
            return jsonData;
        } catch{
        }
        return null;
    }

    private getDataForSubMenu(colId, data) {
        let objectName = 'Order Processing';
        let objectNumber = '';
        let allowMenuOffer: boolean = false;
        let allowMenuOrder: boolean = false;
        let allowMenuInvoice: boolean = false;
        let numOfSubmenu: number = 0;

        switch (colId) {
            case 'OfferNr':
                if (data.idOffer) {
                    allowMenuOffer = true;
                    objectName = 'Offer';
                    objectNumber = this.getOPNumber(data.offerNr);
                }
                break;
            case 'OrderNr':
                if (data.idOrder) {
                    allowMenuOrder = true;
                    objectName = 'Order';
                    objectNumber = this.getOPNumber(data.orderNr);
                }
                break;
            case 'InvoiceNr':
                if (data.idInvoice) {
                    allowMenuInvoice = true;
                    objectName = 'Invoice';
                    objectNumber = this.getOPNumber(data.invoiceNr);
                }
                break;
            default:
                if (data.idOffer) {
                    allowMenuOffer = true;
                    numOfSubmenu++;
                }

                if (data.idOrder) {
                    allowMenuOrder = true;
                    numOfSubmenu++;
                }

                if (data.idInvoice) {
                    allowMenuInvoice = true;
                    numOfSubmenu++;
                }
                break;
        }//switch

        return {
            objectName: objectName,
            objectNumber: objectNumber,
            allowMenuOffer: allowMenuOffer,
            allowMenuOrder: allowMenuOrder,
            allowMenuInvoice: allowMenuInvoice,
            allowSubMenu: numOfSubmenu > 1,

            orderHasInvoice: data.isHasInvoiceOrder,//disable menu Create -> New Invoice, Update / Delete Order
            invoiceHasPrintSentStatus: data.isHasPdfInvoice,//disable menu Update Invoice
            //disable all features of Invoice, excluded for Print/Sent/Export feature
            invoiceIsCancelled: data.isActiveInvoice != null && data.isActiveInvoice != undefined ? !Uti.getBoolean(data.isActiveInvoice) : false
        };
    }

    private deleteCancelDocument(model: DeleteCancelModel) {
        let saveData = {
            OrderProcessingData: null,
            OrderData: null,
            InvoiceData: null
        };
        switch (model.actionType) {
            case DeleteCancelActionType.OP_DeleteOP:
                saveData.OrderProcessingData = [
                    {
                        "B05OrderProcessing_IdOrderProcessing": model.data.idOrderProcessing,
                        "B05OrderProcessing_IsDeleted": 1,
                        "Reason": model.note
                    }
                ];
                break;
            case DeleteCancelActionType.OP_ArchiveOP:
                saveData.OrderProcessingData = [
                    {
                        "B05OrderProcessing_IdOrderProcessing": model.data.idOrderProcessing,
                        "B05OrderProcessing_IsActive": 0
                    }
                ];
                break;
            case DeleteCancelActionType.OP_DeleteOrder:
                saveData.OrderData = [
                    {
                        "B05OrderProcessing_IdOrderProcessing": model.data.idOrderProcessing,
                        "B05Order_IdOrder": model.data.idOrder,
                        "B05Order_IsDeleted": 1,
                        "Reason": model.note
                    }
                ];
                break;
            case DeleteCancelActionType.OP_DeleteInvoice:
                saveData.InvoiceData = [
                    {
                        "B05OrderProcessing_IdOrderProcessing": model.data.idOrderProcessing,
                        "B05Invoice_IdInvoice": model.data.idInvoice,
                        "B05Invoice_IsDeleted": 1,
                        "Reason": model.note
                    }
                ];
                break;
            case DeleteCancelActionType.OP_CancelInvoice:
                saveData.InvoiceData = [
                    {
                        "B05OrderProcessing_IdOrderProcessing": model.data.idOrderProcessing,
                        "B05Invoice_IdInvoice": model.data.idInvoice,
                        "B05Invoice_IsActive": 0,
                        "Reason": model.note
                    }
                ];
                break;
        }
        this.loadingService.showLoading();
        this.documentService.deleteCancelDocument(saveData)
            .pipe(
                finalize(() => {
                    this.loadingService.hideLoading();
                })
            )
            .subscribe((response) => {
                if (response.isSuccess) {
                    this.onReloadWidget.emit(null);
                }
            });
    }

    private openDialogDeleteCancel(model: DeleteCancelModel) {
        const factory = this.componentFactoryResolver.resolveComponentFactory(DialogDeleteCancelComponent);
        var componentRef: ComponentRef<DialogDeleteCancelComponent> = this.containerRef.createComponent(factory);
        const dialogComponent: DialogDeleteCancelComponent = componentRef.instance;
        dialogComponent.data = model;
        dialogComponent.open(() => {
            componentRef.destroy();
        }, (dataSave) => {
            //console.log('openDialogDeleteCancel_Save', dataSave);
            this.deleteCancelDocument(dataSave);
        });
    }

    private archiveOP(idOrderProcessing: number) {
        const model: DeleteCancelModel = new DeleteCancelModel({
            actionType: DeleteCancelActionType.OP_ArchiveOP,
            data: {
                idOrderProcessing: idOrderProcessing
            }
        });
        this.modalService.confirmMessage({
            headerText: 'Confirmation',
            message: [{ key: '<p>'}, { key: 'Modal_Message__DoYouWantToArchiveThisOrderProcessing' }, { key: '<p>' }],
            messageType: MessageModal.MessageType.confirm,
            buttonType1: MessageModal.ButtonType.primary,
            //OK
            callBack1: () => {
                this.deleteCancelDocument(model);
            },
            //Cancel
            callBack2: () => {
            }
        });
    }
}
