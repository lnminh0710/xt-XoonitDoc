import {
    Component,
    OnInit,
    Input,
    Output,
    EventEmitter,
    ViewChild,
    OnDestroy,
    ElementRef,
    ChangeDetectorRef
} from '@angular/core';
import {
    Router
} from '@angular/router';
import {
    DatatableService,
    CampaignService,
    AppErrorHandler,
    BusinessCostService,
    CommonService,
    DomHandler,
    ModalService,
    PropertyPanelService
} from '@app/services';
import {
    CommunicationModel,
    WidgetDetail,
    ApiResultResponse,
    SimpleTabModel,
    FieldFilter
} from '@app/models';
import {
    XnTableUploadedFilesComponent
} from '../xn-table-of-uploaded-files';
import isNil from 'lodash-es/isNil';
import isNumber from 'lodash-es/isNumber';
import isObject from 'lodash-es/isObject';
import isString from 'lodash-es/isString';
import cloneDeep from 'lodash-es/cloneDeep';
import {
    ComboBoxTypeConstant,
    FileUploadModuleType,
    FilterModeEnum,
    UploadFileMode,
    Configuration
} from '@app/app.constants';
import {
    FileUploadComponent
} from '../file-upload';
import {
    Uti
} from '@app/utilities';
import { Observable, Subscription } from 'rxjs';
import {
    Store
} from '@ngrx/store';
import {
    AppState
} from '@app/state-management/store';
import {
    BaseComponent
} from '@app/pages/private/base';
import {
    ListTemplateOfFileComponent
} from '../list-template-of-file';
import * as tabSummaryReducer from '@app/state-management/store/reducer/tab-summary';
import { ToasterService } from 'angular2-toaster/angular2-toaster';
import { MessageModal } from '@app/app.constants';
import { GuidHelper } from '@app/utilities/guild.helper';
import isEmpty from 'lodash-es/isEmpty';

@Component({
    selector: 'xn-file-explorer',
    styleUrls: ['./xn-file-explorer.component.scss'],
    templateUrl: './xn-file-explorer.component.html'
})
export class XnFileExplorerComponent extends BaseComponent implements OnInit, OnDestroy {
    public dataFileTree: any;
    public dataSourceTable: any;
    public dropFiles: File[];
    public randonNr = (new Date()).getTime();
    public showDialog = false;
    public fileUploadModuleTypeView = FileUploadModuleType;
    public templateId: any;
    public isShowTemplateList = false;
    public showFileUploadGird = false;
    public isEditing: any = false;
    public UploadFileModeView = UploadFileMode;
    public parkedItemId = 0;
    public const = new Configuration();
    public waitDataLoadingWhenDownload = false;
    public hasBaseDropZoneOver = false;
    public isHideTreeView = false;
    public isEnableDeleteButton = false;
    public campaignEditingData: Array<any> = [];
    public allowUploadeExtension = '*';
    public showArrowText = true;
    public uploadFileMode = this.UploadFileModeView.Printing;
    public that: any;

    private _fieldFilters: Array<FieldFilter>;
    private _selectedFilter: FilterModeEnum;
    private _currentItem: any = {};
    private _template: any = {};
    private _templateFile: any;
    private _inputData: any;
    private _treeViewFileExtention: any = [];
    private _isDataChanged = false;
    private _leftSplitAreaW = '';
    private _rightSplitAreaW = '';
    private _selectedSimpleTabState: Observable<SimpleTabModel>;
    private _selectedSimpleTabStateSubscription: Subscription;
    private _templates: any = [];
    private _contentDetail: any = {
        collectionData: [],
        columnSettings: []
    };
    private _idSharingTreeGroupRootName = null;
    private _hasDeleteFile = false;

    @Input() parentInstance: any = null;
    @Input() columnsLayoutSettings;
    @Input() allowEdit;
    @Input() isShowToolPanels;
    @Input() disabled = false;
    @Input() globalProperties;
    @Input() properties;
    @Input() gridStyle: any;
    @Input() isShowHeader = true;
    @Input() fileUploadModuleType: FileUploadModuleType = FileUploadModuleType.BusinessCost;
    @Input() showTotalRow: boolean = false;
    @Input() rowGrouping = false;
    @Input() pivoting = false;
    @Input() columnFilter = false;
    @Input() listenKeyRequestItem: any;
    @Input() set data(data: any) { this.processData(data); }
    @Input() set fieldFilters(data: Array<FieldFilter>) { this.fieldFiltersProcess(data); }
    @Input() set filterMode(data: FilterModeEnum) { this.filterModeProcess(data); }
    @Input() sheetName: string;
    @Input() xnTableUploadedFilesGridId: string;

    @Output() outputData = new EventEmitter<CommunicationModel[]>();
    @Output() onUpdateFilesCompleted = new EventEmitter<boolean>();
    @Output() onDeletedFiles = new EventEmitter<boolean>();
    @Output() onRowMarkedAsDeleted = new EventEmitter<boolean>();
    @Output() callRefreshWidgetDataAction = new EventEmitter<any>();
    @Output() onFileExplorerEditingAction = new EventEmitter<any>();
    @Output() onHeaderColsUpdated = new EventEmitter<Array<any>>();
    @Output() changeColumnLayout = new EventEmitter<any>();
    @Output() toggleFileEditModeAction = new EventEmitter<any>();

    @ViewChild('xnTableUploadedFilesComponent') xnTableUploadedFilesComponent: XnTableUploadedFilesComponent;
    @ViewChild('listTemplateOfFile') listTemplateOfFile: ListTemplateOfFileComponent;
    @ViewChild('fileUpload') fileUpload: FileUploadComponent;
    constructor(private _eref: ElementRef,
        private store: Store<AppState>,
        private datatableService: DatatableService,
        private campaignService: CampaignService,
        private appErrorHandler: AppErrorHandler,
        private businessCostService: BusinessCostService,
        private commonService: CommonService,
        private elementRef: ElementRef,
        private domHandler: DomHandler,
        private changeDetectorRef: ChangeDetectorRef,
        private modalService: ModalService,
        private toasterService: ToasterService,
        private propertyPanelService: PropertyPanelService,
        protected router: Router) {
        super(router);
        this._selectedSimpleTabState = store.select(state => tabSummaryReducer.getTabSummaryState(state, this.ofModule.moduleNameTrim).selectedSimpleTab);
        this.checkFileCorrect = this.checkFileCorrect.bind(this);
        this.that = this;
    }
    public ngOnInit() {
        this.buildDatatable(this._inputData);
        this.loadTreeViewFileExtention();
        this.subscribeSelectedSimpleTabState();
        this.setShowFileUploadGrid();
        this.bindEventForSplitterBar();
        this.setUploadFileMode();
    }
    public makeContextMenu(data?: any) {
        if (!this.parentInstance || !this.parentInstance.makeContextMenu) {
            return [];
        }
        return this.parentInstance.makeContextMenu(data);
    }
    public refreshData(data?: any, isOnlyReloadGrid?: boolean) {
        if (!isNil(data)) {
            if (isNumber(data)) {
                this.callRefreshData(isOnlyReloadGrid);
            }
        } else {
            if (this.xnTableUploadedFilesComponent) this.xnTableUploadedFilesComponent.refresh();
            this.buildDatatable(this._inputData);
        }
        if (this.listTemplateOfFile)
            this.listTemplateOfFile.resetData();
    }
    public saveUpdateData() {
        if (this.xnTableUploadedFilesComponent) {
            this.xnTableUploadedFilesComponent.saveUpdateFiles();
        }
    }
    public deleteFiles() {
        if (this.xnTableUploadedFilesComponent) this.xnTableUploadedFilesComponent.deleteFiles();
    }
    public templateOutputData($event) {
        $event = $event || { data: {}, dirty: false };
        if (!isEmpty($event.data)
            && this._template.idValue !== $event.data.idValue
            && this._currentItem.IdRepAppSystemColumnNameTemplate != $event.data.idValue
            && this._currentItem.IdSalesCampaignAddOnDocTemplate) {

            this._currentItem.IdRepAppSystemColumnNameTemplate = $event.data.idValue;
            if (this._currentItem.IdSalesCampaignAddOnDocTemplate) {
                Uti.removeItemInArray(this.campaignEditingData, this._currentItem, 'IdSalesCampaignAddOnDocTemplate');
                this.campaignEditingData.push({
                    IdRepAppSystemColumnNameTemplate: this._currentItem.IdRepAppSystemColumnNameTemplate,
                    IdSharingTreeGroups: 1, // Hard code from rocco
                    IdRepTreeMediaType: this._currentItem.IdRepTreeMediaType,
                    // MediaName: this._currentItem.MediaName,
                    // MediaOriginalName: this._currentItem.MediaOriginalName,
                    IdSalesCampaignWizardItems: this._currentItem.IdSalesCampaignWizardItems,
                    IdSalesCampaignAddOnDocTemplate: this._currentItem.IdSalesCampaignAddOnDocTemplate,
                    IdSalesCampaignAddOn: this._currentItem.IdSalesCampaignAddOn,
                    IdSharingTreeMedia: this._currentItem.IdSharingTreeMedia,
                    IsActive: 1
                });
            }
        }
        if (this.campaignEditingData && this.campaignEditingData.length && $event.dirty) {
            this.onFileExplorerEditingAction.emit();
        }
        this._template = $event.data;
        this.xnTableUploadedFilesComponent.refresh();
    }
    public toggleEditingFileExplorer(isEditing: boolean) {
        this.isEditing = isEditing;
    }
    public resetData(isKeepEditing: boolean) {
        if (!isKeepEditing)
            this.isEditing = false;
        this.showArrowText = true;
        this.refreshData();
    }
    public onRowClickHandler($event) {
        this.showArrowText = false;
        this.waitDataLoadingWhenDownload = true;
        const deleted = Uti.getValueFromArrayByKey($event, 'deleted');
        if (deleted) {
            this.waitDataLoadingWhenDownload = false;
            return;
        }
        const idSalesCampaignAddOnDocTemplate = Uti.getValueFromArrayByKey($event, 'IdSalesCampaignAddOnDocTemplate');
        this._currentItem = this.dataSourceTable.data.data.find(x => x.IdSalesCampaignAddOnDocTemplate === idSalesCampaignAddOnDocTemplate);
        if (!this._currentItem || !this._currentItem.IdRepAppSystemColumnNameTemplate) {
            if (!this.isEditing) {
                this._template.idValue = this.templateId = null;
            }
            return;
        }
        setTimeout(() => {
            if (this._template.idValue == this._currentItem.IdRepAppSystemColumnNameTemplate) {
                this.waitDataLoadingWhenDownload = false;
            }
            this._template.idValue = this._currentItem.IdRepAppSystemColumnNameTemplate + '';
            this.templateId = { templateId: this._currentItem.IdRepAppSystemColumnNameTemplate + '' };
            this.changeDetectorRef.detectChanges();
        });
    }
    public onChangeSelectedFileTree(event) {
        if (event) {
            this.parkedItemId = event.id;
            if (this._hasDeleteFile) {
                this.modalService.confirmMessage({
                    headerText: 'Confirmation',
                    message: [{ key: 'Modal_Message__DoYouWantToDeleteFileSelected' }],
                    messageType: MessageModal.MessageType.error,
                    buttonType1: MessageModal.ButtonType.danger,
                    callBack1: () => {
                        this.saveUpdateData()
                        setTimeout(() => {
                            this.listFilesByIdSharingTreeGroups(this.parkedItemId);
                        }, 500);
                    },
                    callBack2: () => {
                        this.listFilesByIdSharingTreeGroups(this.parkedItemId);
                    }
                });
            } else {
                this.listFilesByIdSharingTreeGroups(this.parkedItemId);
            }
        }
    }
    public ngOnDestroy() {
        Uti.unsubscribe(this);
    }
    public onCompleteUploadItem(event) {
        const response = event.response;
        if (!response || !response.fileName) return;
        const idRepTreeMediaType = this.getIdRepTreeMediaType(response.fileName);
        switch (this.fileUploadModuleType) {
            case FileUploadModuleType.BusinessCost:
                this.saveFileForBusiness(idRepTreeMediaType, response);
                break;
            case FileUploadModuleType.Campaign:
                this.saveFileForCampaign(idRepTreeMediaType, response);
                break
            case FileUploadModuleType.ToolsFileTemplate:
                this.saveFileForToolsFileTemplate(idRepTreeMediaType, response);
        }
    }
    private downloadTimesWaiting = 0;
    public onDownloadCampaignFileHandler($event) {
        // waiting the row click go first, because in grid this action sets timeout 300 then emits to outside
        setTimeout(() => {
            // Maximum time waiting
            if (this.downloadTimesWaiting > 20) {
                this.downloadTimesWaiting = 0;
                return;
            }
            if (this.waitDataLoadingWhenDownload) {
                this.downloadTimesWaiting += 1;
                this.onDownloadCampaignFileHandler($event);
                return;
            }
            this.downloadTimesWaiting = 0;
            let downloadData = this.buildDownloadFile($event);
            this.commonService.downloadTemplates(downloadData).subscribe((response: any) => {
                this.appErrorHandler.executeAction(() => {
                    const file = this.base64ToArrayBuffer(response);
                    this.saveByteArray(this.buildZipFileName(this._templateFile.MediaOriginalName, this._currentItem.MediaOriginalName) || Uti.guid(), file);
                });
            });
        }, 500);
    }
    private buildZipFileName(name1: any, name2: any) {
        let result = '';
        let arr: any;
        if (name1) {
            arr = name1.split('.');
            if (arr && arr.length) {
                result = arr[0];
            }
        }
        if (name2) {
            arr = name2.split('.');
            if (arr && arr.length) {
                result += (result) ? '_' + arr[0] : arr[0];
            }
        }
        return result;
    }
    public onTemplateFileChangeHandler($event) {
        this._templateFile = $event || {};
    }
    public checkFileCorrect(file: any): boolean {
        if (!file) return false;
        if (!this.dataSourceTable || !this.dataSourceTable.data || !this.dataSourceTable.data.data || !this.dataSourceTable.data.data.length) {
            return true;
        }
        for (let item of this.dataSourceTable.data.data) {
            if (item.MediaOriginalName && file.name && file.name.toLowerCase() == item.MediaOriginalName.toLowerCase()) {
                return false;
            }
        }
        return true;
    }
    public fileDuplicateHandler(file: any) {
        this.modalService.warningHTMLText(`
            <p>This file is already uploaded:</p>
            <p>` + file.name + `</p>
            `);
    }
    public fileDuplicateOnQueueHandler(file: any) {
        this.modalService.warningHTMLText(`
            <p>This file is already selected:</p>
            <p>` + file.name + `</p>
            `);
    }

    public dontAllowFileExtensionHander() {
        this.modalService.warningHTMLText(`
            <p>You should upload file that has extensions:</p>
            <p>` + this.allowUploadeExtension + `</p>
            `);
    }
    public onDataLoadedHandler() {
        this.waitDataLoadingWhenDownload = false;
    }
    public outTemplatesHandle(data: any) {
        this._templates = data || [];
    }
    public changeColumnLayoutHandler($event) {
        this.changeColumnLayout.emit($event);
    }
    /*************************************************************************************************/
    /***************************************PRIVATE METHOD********************************************/
    private base64ToArrayBuffer(base64) {
        let binaryString = window.atob(base64);
        let binaryLen = binaryString.length;
        let bytes = new Uint8Array(binaryLen);
        for (let i = 0; i < binaryLen; i++) {
            let ascii = binaryString.charCodeAt(i);
            bytes[i] = ascii;
        }
        return bytes;
    }
    private saveByteArray(reportName, byte) {
        let blob = new Blob([byte], { type: "application/zip" });
        let link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = reportName;
        link.click();
        setTimeout(() => {
            link.remove();
        }, 500);
    };
    private buildDownloadFile(itemFile: any) {
        let result = [];
        if (itemFile.MediaName && this._templateFile.MediaOriginalName) {
            result.push({
                Filename: itemFile.MediaName,
                Mode: this.uploadFileMode,
                Id: this.parkedItemId,
                OriginalFilename: itemFile.MediaOriginalName
            });
            result.push({
                Filename: GuidHelper.generateGUID() + '.txt',
                Mode: this.uploadFileMode,
                Id: this.const.printingUploadTemplateFolderName,
                OriginalFilename: this._templateFile.MediaOriginalName,
                Content: this._templateFile.Content
            });
        } else if (itemFile.MediaName && !this._templateFile.MediaName) {
            result.push({
                Filename: itemFile.MediaName,
                Mode: this.uploadFileMode,
                Id: this.parkedItemId,
                OriginalFilename: itemFile.MediaOriginalName
            });
        } else if (!itemFile.MediaName && this._templateFile.MediaOriginalName) {
            result.push({
                Filename: GuidHelper.generateGUID() + '.txt',
                Mode: this.uploadFileMode,
                Id: this.const.printingUploadTemplateFolderName,
                OriginalFilename: this._templateFile.MediaOriginalName,
                Content: this._templateFile.Content
            });
        }

        // ////Append more one file
        // result.push({
        //    Filename: GuidHelper.generateGUID() + '.txt',
        //    Mode: this.uploadFileMode,
        //    Id: this.const.printingUploadTemplateFolderName,
        //    OriginalFilename: 'trungtest.txt',
        //    Content: "Nội dung file ở đây nha Trung ơi Trung à"
        // });

        return {
            ZipFileName: this._template.textValue,
            Templates: result
        };
    }
    private callRefreshData(isOnlyReloadGrid?: boolean) {
        switch (this.fileUploadModuleType) {
            case FileUploadModuleType.BusinessCost:
                this.listFilesByBusinessCostId(this.parkedItemId);
                this.listTreeItemByBusinessCostId(this.parkedItemId);
                break;
            case FileUploadModuleType.Campaign:
                this._currentItem = {};
                this.campaignEditingData = [];
                this.templateId = null;
                this._template = {};
                this.callRefreshWidgetDataAction.emit();
                break;
            case FileUploadModuleType.ToolsFileTemplate:
                if (!isOnlyReloadGrid) {
                    this._idSharingTreeGroupRootName = 6; // for Tools
                    this.listTreeItemByIdSharingTreeGroupsRootname(this._idSharingTreeGroupRootName);
                } else {
                    this.listFilesByIdSharingTreeGroups(this.parkedItemId);
                }
        }
        this.changeDetectorRef.detectChanges();
    }
    private getDataForFileGrid(idSharingTreeGroup: number) {
        this.campaignService.listDocumentTemplatesBySharingTreeGroup(idSharingTreeGroup)
            .subscribe((response: ApiResultResponse) => {
                this.appErrorHandler.executeAction(() => {
                    if (!Uti.isResquestSuccess(response)) {
                        return;
                    }
                    this.dataFileTree = this.buildRawTreeViewData(response.item);
                });
            });
    }
    private setShowFileUploadGrid() {
        switch (this.fileUploadModuleType) {
            case FileUploadModuleType.BusinessCost:
            case FileUploadModuleType.ToolsFileTemplate:
                setTimeout(() => {
                    this.showFileUploadGird = true;
                }, 300);
                break;
            case FileUploadModuleType.Campaign:
                this.showFileUploadGird = true;
                this.allowUploadeExtension = this.const.wordExtesion;
                setTimeout(() => {
                    this.isShowTemplateList = true;
                }, 100);
        }
    }
    private loadTreeViewFileExtention() {
        this.commonService.getListComboBox(ComboBoxTypeConstant.treeMediaType).subscribe((response: ApiResultResponse) => {
            this.appErrorHandler.executeAction(() => {
                if (!Uti.isResquestSuccess(response) || !response.item.treeMediaType) {
                    return;
                }
                this._treeViewFileExtention = response.item.treeMediaType;
            });
        });
    }
    private listTreeItemByBusinessCostId(businessCostsId: number) {
        this.campaignService.getCampaignCostsTreeView(businessCostsId).subscribe((response: ApiResultResponse) => {
            this.appErrorHandler.executeAction(() => {
                if (!Uti.isResquestSuccess(response)) {
                    return;
                }
                this.dataFileTree = this.buildRawTreeViewData(response.item);
            });
        });
    }
    private listTreeItemByIdSharingTreeGroupsRootname(_idSharingTreeGroupRootName: any) {
        this.campaignService.listTreeItemByIdSharingTreeGroupsRootname(_idSharingTreeGroupRootName).subscribe((response: ApiResultResponse) => {
            this.appErrorHandler.executeAction(() => {
                if (!Uti.isResquestSuccess(response)) {
                    return;
                }
                this.dataFileTree = this.buildRawTreeViewData(response.item);
            });
        });
    }
    private processData(data: any) {
        if (isNil(data)) {
            return;
        }
        if (isNumber(data)) {
            this.parkedItemId = data;
            this.callRefreshData();
        } else if (isObject(data) && !isString(data)) {
            if (this.listTemplateOfFile) this.listTemplateOfFile.resetData(true);
            const listenKeyRequest = (data as WidgetDetail).widgetDataType.listenKeyRequest(this.ofModule.moduleNameTrim);
            if (listenKeyRequest) {
                const value = listenKeyRequest[Object.keys(listenKeyRequest)[0]];
                if (isNaN(value) || isNil(value) || !value) this.parkedItemId = 0;
                else this.parkedItemId = parseInt(value, 10);
            }
            this.buildDatatable(data.contentDetail.data);
        }
        if (this.parkedItemId != this.parkedItemId) {
            this.parkedItemId = this.parkedItemId;
            this._isDataChanged = true;
        } else this._isDataChanged = false;
        this.listTreeViewItems();
    }
    private listTreeViewItems() {
        switch (this.fileUploadModuleType) {
            case FileUploadModuleType.BusinessCost:
                this.listTreeItemByBusinessCostId(this.parkedItemId);
                break;
            case FileUploadModuleType.ToolsFileTemplate:
                this._idSharingTreeGroupRootName = 6;
                this.listTreeItemByIdSharingTreeGroupsRootname(this._idSharingTreeGroupRootName);
        }
    }
    private fieldFiltersProcess(data: any) {
        if (!data || !data.length) {
            return;
        }
        this._fieldFilters = data;
        this.rebuildColumnsSettingFromFilter();
    }
    private filterModeProcess(data: any) {
        this._selectedFilter = data;
        this.rebuildColumnsSettingFromFilter();
    }
    private buildRawTreeViewData(responseData: any) {
        if (!responseData || !responseData.data || !responseData.data[1] || !responseData.data[1].length) {
            return [];
        }
        return responseData.data[1].map(x => {
            return {
                id: x.IdSharingTreeGroups,
                text: x.GroupName,
                parentId: 0
            };
        });
    }
    private buildDatatable(data?: any) {
        if (!data) return;
        if (this._inputData != data) this._inputData = cloneDeep(data);
        const _data = {};

        const tableData = this.datatableService.formatDataTableFromRawData(this._inputData);
        this._contentDetail = cloneDeep(tableData);
        this.onHeaderColsUpdated.emit(Object['values'](this._contentDetail.columnSettings).map((x: any) => {
            return {
                fieldName: x.OriginalColumnName,
                fieldDisplayName: x.ColumnHeader,
                setting: x.Setting || []
            };
        }));
        this.rebuildColumnsSettingFromFilter();
        this._currentItem = {};
        this.campaignEditingData = [];
        this.changeDetectorRef.detectChanges();
        this.isEnableDeleteButton = false;
    }

    private rebuildColumnsSettingFromFilter() {
        if (!this._contentDetail || !this._contentDetail.columnSettings) return;
        let contentDetail = cloneDeep(this._contentDetail);
        if (this._fieldFilters && this._fieldFilters.length) {
            contentDetail.columnSettings = this.datatableService.updateTableColumnSettings(
                this._selectedFilter,
                this._fieldFilters,
                contentDetail.columnSettings,
                contentDetail.collectionData);
        }
        const tableData: any = {};
        tableData['data'] = this.datatableService.buildDataSource(cloneDeep(contentDetail));
        tableData['data'] = this.datatableService.buildWijmoDataSource(tableData['data']);
        tableData['isDataChanged'] = this._isDataChanged;
        this.dataSourceTable = tableData;
        if (!tableData || !tableData.data || !tableData.data.length) {
            if (!this.isEditing) {
                this.templateId = null;
            }
            this.showArrowText = true;
            this.changeDetectorRef.detectChanges();
        }
    }
    private saveFileForBusiness(idRepTreeMediaType: any, response: any) {
        this.businessCostService.saveFilesByBusinessCostsId({
            CampaignCostFiles: [{
                IdBusinessCosts: this.parkedItemId,
                IdSharingTreeMedia: 1, // don't have this value so don't transfer
                IdRepTreeMediaType: idRepTreeMediaType ? idRepTreeMediaType : 1,
                IdSharingTreeGroups: 1, // Hard code from rocco
                MediaRelativePath: response.path,
                MediaName: response.fileName,
                MediaOriginalName: response.originalFileName,
                MediaNotes: '',
                MediaTitle: '',
                MediaDescription: 'Insert new file',
                MediaSize: response.size,
                MediaHight: 1,
                MediaWidth: 1,
                MediaPassword: null,
                IsBlocked: false,
                IsActive: true
            }]
        }).subscribe(() => {
            this.appErrorHandler.executeAction(() => {
                this.refreshData(this.parkedItemId);
                this.toasterService.pop('success', 'Success', 'File uploaded successfully');
            });
        });
    }
    private saveFileForCampaign(idRepTreeMediaType: any, response: any) {
        let savingData: any = {
            IdSharingTreeGroups: 1, // Hard code from rocco
            IdRepTreeMediaType: idRepTreeMediaType,
            MediaName: response.fileName,
            MediaOriginalName: response.originalFileName,
            IdSalesCampaignWizardItems: this.parkedItemId,
            MediaSize: response.size,
            MediaRelativePath: response.path,
            IsActive: 1
        };
        const externalParamProp = this.propertyPanelService.getItemRecursive(this.properties, 'ExternalParam');
        let externalParam;
        if (externalParamProp) {
            externalParam = externalParamProp.value;
        }
        this.campaignService.saveSalesCampaignAddOn([this.appendTemplateId(savingData)], this.deleteFiles, externalParam)
            .subscribe(() => {
                this.appErrorHandler.executeAction(() => {
                    this.toasterService.pop('success', 'Success', 'File uploaded successfully');
                });
            });
    }
    private saveFileForToolsFileTemplate(idRepTreeMediaType: any, response: any) {
        let savingData: any = {
            CampaignCostFiles: [{
                IdSharingTreeGroups: this.parkedItemId,
                IdRepTreeMediaType: idRepTreeMediaType,
                MediaName: response.fileName,
                MediaOriginalName: response.originalFileName,
                MediaSize: response.size,
                MediaRelativePath: response.path,
                IsActive: 1
            }]
        };

        this.campaignService.saveFilesByIdSharingTreeGroups(savingData)
            .subscribe(() => {
                this.appErrorHandler.executeAction(() => {
                    this.refreshData(this.parkedItemId, true);
                    this.toasterService.pop('success', 'Success', 'File uploaded successfully');
                });
            });
    }
    private appendTemplateId(savingData: any): any {
        if (this._template.idValue) {
            savingData.IdRepAppSystemColumnNameTemplate = this._template.idValue;
            return savingData;
        }
        if (!this._templates || !this._templates.length) {
            return savingData;
        }
        savingData.IdRepAppSystemColumnNameTemplate = this._templates[0].idValue;
        return savingData;
    }
    private subscribeSelectedSimpleTabState() {
        this._selectedSimpleTabStateSubscription = this._selectedSimpleTabState.subscribe((selectedSimpleTabState: SimpleTabModel) => {
            this.appErrorHandler.executeAction(() => {
                if (!selectedSimpleTabState) {
                    return;
                }
                setTimeout(() => {
                    const parent = this.domHandler.findParent(this._eref.nativeElement, '#' + selectedSimpleTabState.TabID);
                });
            });
        });
    }
    private getIdRepTreeMediaType(fileName): any {
        if (!fileName || !this._treeViewFileExtention || !this._treeViewFileExtention.length) return '';
        const arr = fileName.split('.');
        if (!arr || !arr.length) return '-1';
        const ext = arr[arr.length - 1];
        const extItem = this._treeViewFileExtention.find(x => x.textValue.toLowerCase() === ext.toLowerCase());
        if (!extItem) return '-1';
        return extItem.idValue;
    }
    public showFileUploadDialog($event: any) {
        if ($event) {
            switch (this.fileUploadModuleType) {
                case FileUploadModuleType.Campaign:
                    if (!this._templates || !this._templates.length || !this._template || !this._template.idValue) {
                        this.modalService.warningText('Please select a template to upload file.');
                        return;
                    }
                    break;
                case FileUploadModuleType.ToolsFileTemplate:
                    if (isNil(this.parkedItemId) || this.parkedItemId == 0) {
                        this.modalService.warningText('Please select a folder tree item to upload file.');
                        return;
                    }
            }
        }

        this.showDialog = $event;
    }
    public close() {
        this.showDialog = false;
        if (this.fileUpload) this.fileUpload.clearItem();
        this.refreshDataWhenClose();
    }
    public rowMarkedAsDeleted(eventData) {
        if (eventData) {
            this.isEnableDeleteButton = !eventData.disabledDeleteButton;
            this.onRowMarkedAsDeleted.emit(eventData);
        }
    }
    public onDeleteFiles(event) {
        this.onDeletedFiles.emit(event);
        this._hasDeleteFile = true;
    }
    public onDeleteFilesCompleted(event) {
        if (event) {
            this.onUpdateFilesCompleted.emit(true);
            this.callRefreshData(this.fileUploadModuleType === FileUploadModuleType.ToolsFileTemplate);
            this.toasterService.pop('success', 'Success', 'Data saved successfully');
            this.refreshData();
            this._hasDeleteFile = false;
        } else this.buildDatatable(this._inputData);
    }
    private refreshDataWhenClose() {
        switch (this.fileUploadModuleType) {
            case FileUploadModuleType.Campaign:
                this.refreshData(this.parkedItemId);
        }
    }
    private listFilesByBusinessCostId(businessCostId) {
        this.businessCostService.getFilesByBusinessCostsId(businessCostId).subscribe((response: ApiResultResponse) => {
            this.appErrorHandler.executeAction(() => {
                if (!Uti.isResquestSuccess(response)) {
                    return;
                }
                this.buildDatatable(response.item.data);
            });
        });
    }
    private listFilesByIdSharingTreeGroups(idSharingTreeGroups: any) {
        if (this.fileUploadModuleType == FileUploadModuleType.BusinessCost) return;
        this.campaignService.listDocumentTemplatesBySharingTreeGroup(idSharingTreeGroups).subscribe((response: ApiResultResponse) => {
            this.appErrorHandler.executeAction(() => {
                if (!Uti.isResquestSuccess(response)) {
                    return;
                }
                this.buildDatatable(response.item.data);
            });
        });
    }
    public fileOverBase(e: any): void {
        this.hasBaseDropZoneOver = e;
        this.changeDetectorRef.detectChanges();
    }
    public onFileDrop(event) {
        if (!this.checkShowUploadDialog()) return;
        if (event && event.length) {
            this.showDialog = true;
            this.dropFiles = event;
        }
        return false;
    }
    public onClickDeleteFiles() {
        this.deleteFiles();
    }
    public onClickUploadFiles() {
        this.showDialog = true;
    }
    public dragStart() {
        Uti.handleWhenSpliterResize();
    }
    public dragSplitterEnd(event) {
    }
    private checkShowUploadDialog(): boolean {
        switch (this.fileUploadModuleType) {
            case FileUploadModuleType.BusinessCost:
                return true;
            case FileUploadModuleType.Campaign:
                if (!this.parkedItemId) {
                    this.modalService.warningText('Please select a campaign country item.');
                    return false;
                }
                if (!this._templates || !this._templates.length || !this._template || !this._template.idValue) {
                    this.modalService.warningText('Please select a template to upload file.');
                    this.toggleFileEditModeAction.emit(true);
                    return false;
                }
            case FileUploadModuleType.ToolsFileTemplate:
                if (isNil(this.parkedItemId) || this.parkedItemId === 0) {
                    this.modalService.warningText('Please select a folder tree item to upload file.');
                    return false;
                }
        }
        return true;

    }
    private setUploadFileMode() {
        switch (this.fileUploadModuleType) {
            case FileUploadModuleType.ToolsFileTemplate:
                this.uploadFileMode = this.UploadFileModeView.General
        }
    }
    public bindEventForSplitterBar(event?: any) {
        if ($('split', $(this.elementRef.nativeElement))) {
            const areas = $('split split-area', $(this.elementRef.nativeElement));
            const disabledGutter = $('split div.gutter-horizontal-disabled', $(this.elementRef.nativeElement));
            $('split div.gutter, split div.gutter-horizontal-disabled', $(this.elementRef.nativeElement)).unbind('dblclick').bind('dblclick', () => {
                this.isHideTreeView = !this.isHideTreeView;
                if (this.isHideTreeView) {
                    disabledGutter.show();
                    this._leftSplitAreaW = $(areas[0]).attr('style').split('width:')[1].split(';')[0];
                    this._rightSplitAreaW = $(areas[1]).attr('style').split('width:')[1].split(';')[0];
                } else {
                    disabledGutter.hide();
                    $(areas[0]).css({
                        'width': this._leftSplitAreaW
                    });
                    $(areas[1]).css({
                        'width': this._rightSplitAreaW
                    });
                    this._leftSplitAreaW = '';
                    this._rightSplitAreaW = '';
                }
            });
        }
    }
}
