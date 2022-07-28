import {
    Component,
    OnInit,
    Input,
    Output,
    EventEmitter,
    ViewChild,
    OnDestroy,
    ChangeDetectorRef
} from '@angular/core';
import {
    BusinessCostService,
    CampaignService,
    AppErrorHandler,
    ModalService,
    DownloadFileService
} from '@app/services';
import cloneDeep from 'lodash-es/cloneDeep';
import 'rxjs/Rx';
//import { WijmoGridComponent } from '@app/shared/components/wijmo';
import {
    ApiResultResponse
} from '@app/models';
import {
    Uti
} from '@app/utilities';
import {
    ApiMethodResultId
} from '@app/app.constants';
import {
    FileUploadModuleType
} from '@app/app.constants';
import { XnAgGridComponent } from '@app/shared/components/xn-control/xn-ag-grid/pages/ag-grid-container/xn-ag-grid.component';

@Component({
    selector: 'xn-table-uploaded-files',
    styleUrls: ['./xn-table-of-uploaded-files.component.scss'],
    templateUrl: './xn-table-of-uploaded-files.component.html'
})
export class XnTableUploadedFilesComponent implements OnInit, OnDestroy {
    public dataSourceTable: any;
    public that: any;
    private inputData: any;
    private _campaginEditingData: any = [];
    @Input() set dataSource(data: any) {
        this.inputData = data.data;
        this.buildDatatable();
    }
    @Input() gridId: string;
    @Input() columnsLayoutSettings;
    @Input() parentInstance: any = null;
    @Input() isShowToolPanels;
    @Input() globalProperties;
    @Input() gridStyle: any;
    @Input() set campaignEditingData(data) {
        this._campaginEditingData = data || [];
    }
    get campaignEditingData() {
        return this._campaginEditingData;
    }
    @Input() allowEdit = true;
    @Input() uploadFileMode;
    @Input() idFolder;
    @Input() showTotalRow = false;
    @Input() rowGrouping = false;
    @Input() pivoting = false;
    @Input() columnFilter = false;
    @Input() fileUploadModuleType: FileUploadModuleType = FileUploadModuleType.BusinessCost;
    @Input() sheetName: string;

    @Output()
    onDeleteFilesCompleted = new EventEmitter<boolean>();
    @Output()
    onDeleteFiles = new EventEmitter<boolean>();
    @Output()
    onRowMarkedAsDeleted = new EventEmitter<boolean>();
    @Output()
    onUploadFileClick = new EventEmitter<boolean>();
    @Output()
    onRowClickAction = new EventEmitter<any>();
    @Output()
    onDownloadCampaignFileAction = new EventEmitter<any>();
    @Output() changeColumnLayout = new EventEmitter<any>();
    //@ViewChild(WijmoGridComponent) public wijmoGridComponent: WijmoGridComponent;
    @ViewChild(XnAgGridComponent)
    public xnAgGridComponent: XnAgGridComponent;
    private deletedFiles: Array<any> = [];
    constructor(private businessService: BusinessCostService,
        private appErrorHandler: AppErrorHandler,
        private modalService: ModalService,
        private campaignService: CampaignService,
        private downloadFileService: DownloadFileService,
        private _changeDetectorRef: ChangeDetectorRef) {
        this.that = this;
    }
    public ngOnInit() {
        this.buildDatatable();
    }
    public ngOnDestroy() {
        Uti.unsubscribe(this);
    }
    public makeContextMenu(data?: any) {
        if (!this.parentInstance || !this.parentInstance.makeContextMenu) {
            return [];
        }
        return this.parentInstance.makeContextMenu(data);
    }
    public onRowClickHandler($event) {
        this.onRowClickAction.emit($event);
    }
    public rowMarkedAsDeleted(eventData) {
        if (!this.allowEdit) return;
        this.onRowMarkedAsDeleted.emit(eventData);
    }
    public onDeletedRows(event) {
        if (event && this.xnAgGridComponent) {
            const willDeletedItems = this.xnAgGridComponent.getEditedItems()
            if (!willDeletedItems || !willDeletedItems.itemsRemoved || !willDeletedItems.itemsRemoved.length) {
                this.deletedFiles = [];
                return;
            }
            this.makeDeleteData(willDeletedItems.itemsRemoved);
            if (this.deletedFiles && this.deletedFiles.length) this.onDeleteFiles.emit(true);
        }
    }
    public refresh() {
        this.deletedFiles = [];
        if (this.xnAgGridComponent) this.xnAgGridComponent.refresh();
    }
    public deleteFiles() {
        if (this.xnAgGridComponent) {
            this.xnAgGridComponent.deleteRows();
        }
    }
    public saveUpdateFiles() {
        switch (this.fileUploadModuleType) {
            case FileUploadModuleType.BusinessCost:
                this.saveDelteForBusinessCost();
                break;
            case FileUploadModuleType.ToolsFileTemplate:
                this.saveDelteForToolFileTemplate();
                break;
            case FileUploadModuleType.Campaign:
                this.saveDelteForCampaign();
        }
    }
    public onDownloadFile(event) {
        if (!event || !event['MediaName']) return;
        switch (this.fileUploadModuleType) {
            case FileUploadModuleType.BusinessCost:
            case FileUploadModuleType.ToolsFileTemplate:
                this.downloadFileService.makeDownloadFile(event['MediaName'],
                    event['MediaOriginalName'],
                    this.modalService,
                    this.uploadFileMode,
                    this.idFolder);
                break;
            case FileUploadModuleType.Campaign:
                this.onDownloadCampaignFileAction.emit(event);
        }
    }
    public uploadFileClick(event) {
        this.onUploadFileClick.emit(true);
    }
    public changeColumnLayoutHandler($event) {
        this.changeColumnLayout.emit($event);
    }
    /*************************************************************************************************/
    /***************************************PRIVATE METHOD********************************************/
    private saveDelteForBusinessCost() {
        if (this.deletedFiles && this.deletedFiles.length) {
            this.businessService.saveFilesByBusinessCostsId({
                'CampaignCostFiles': this.deletedFiles,
                'DeleteFiles': this.deletedFiles
            }).subscribe((response: ApiResultResponse) => {
                this.appErrorHandler.executeAction(() => {
                    if (response && response.statusCode === ApiMethodResultId.Success && response.item && response.item.returnID) {
                        this.deletedFiles = [];
                        this.onDeleteFilesCompleted.emit(true);
                    } else this.onDeleteFilesCompleted.emit(false);
                });
            });
        } else {
            this.onDeleteFilesCompleted.emit(true);
        }
    }
    private saveDelteForToolFileTemplate() {
        if (this.deletedFiles && this.deletedFiles.length) {
            this.campaignService.saveFilesByIdSharingTreeGroups({
                'CampaignCostFiles': this.deletedFiles,
                'DeleteFiles': this.deletedFiles
            }).subscribe((response: ApiResultResponse) => {
                this.appErrorHandler.executeAction(() => {
                    if (response && response.statusCode === ApiMethodResultId.Success && response.item && response.item.returnID) {
                        this.deletedFiles = [];
                        this.onDeleteFilesCompleted.emit(true);
                    } else this.onDeleteFilesCompleted.emit(false);
                });
            });
        } else {
            this.onDeleteFilesCompleted.emit(true);
        }
    }
    private saveDelteForCampaign() {
        if (this.campaignEditingData && this.campaignEditingData.length) {
            this.campaignService.saveSalesCampaignAddOn(this.campaignEditingData, this.deletedFiles)
                .subscribe((response: ApiResultResponse) => {
                    this.appErrorHandler.executeAction(() => {
                        if (response && response.statusCode === ApiMethodResultId.Success && response.item && response.item.returnID) {
                            this.deletedFiles = [];
                            this.onDeleteFilesCompleted.emit(true);
                        } else this.onDeleteFilesCompleted.emit(false);
                    });
                });
        } else {
            this.onDeleteFilesCompleted.emit(true);
        }
    }
    private makeDeleteData(willDeletedItems: Array<any>) {
        for (let item of willDeletedItems) {
            const filter = this.deletedFiles.find(x => x[this.getRightIdName()] == item[this.getRightIdName()]);
            if (filter && filter[this.getRightIdName()]) continue;
            switch (this.fileUploadModuleType) {
                case FileUploadModuleType.Campaign:
                    this.makeCampaignSavingData(item);
                    this.deletedFiles.push({
                        'IdSalesCampaignAddOnDocTemplate': item[this.getRightIdName()],
                        'IsDeleted': '1',
                        'MediaName': item['MediaName'],
                        'SubFolder': this.idFolder,
                        'UploadFileMode': this.uploadFileMode
                    });
                    break;
                case FileUploadModuleType.BusinessCost:
                    this.deletedFiles.push({
                        'IdBusinessCostsFileAttach': item[this.getRightIdName()],
                        'IsDeleted': '1',
                        'MediaName': item['MediaName'],
                        'SubFolder': this.idFolder,
                        'UploadFileMode': this.uploadFileMode
                    });
                    break;
                case FileUploadModuleType.ToolsFileTemplate:
                    this.deletedFiles.push({
                        'IdSharingTreeMedia': item[this.getRightIdName()],
                        'IsDeleted': '1',
                        'MediaName': item['MediaName'],
                        'SubFolder': this.idFolder,
                        'UploadFileMode': this.uploadFileMode
                    });
            }
        }
    }
    private makeCampaignSavingData(item: any) {
        Uti.removeItemInArray(this.campaignEditingData, item, this.getRightIdName());
        this.campaignEditingData.push({
            'IdSalesCampaignAddOnDocTemplate': item[this.getRightIdName()],
            'IsDeleted': '1'
        });
    }
    private buildDatatable() {
        if (!this.inputData) return;
        this.dataSourceTable = this.filterDataSourceWithDeletedFiles(this.inputData);
        this._changeDetectorRef.detectChanges();
    }
    private filterDataSourceWithDeletedFiles(data: any): any {
        if (!(data && data.data && data.data.length)) {
            this.deletedFiles = [];
            return data;
        }
        if (this.deletedFiles && this.deletedFiles.length) {
            let isSthRemoved = false;
            for (let i = 0; i < data.data.length; i++) {
                const filter = this.deletedFiles.filter((item) => item[this.getRightIdName()] == data.data[i][this.getRightIdName()]);
                if (filter && filter.length) {
                    isSthRemoved = true;
                    data.data[i]['deleted'] = true;
                }
            }
            if (!isSthRemoved) this.deletedFiles = [];
        }
        return data;
    }
    private getRightIdName(): string {
        let idName = '';
        switch (this.fileUploadModuleType) {
            case FileUploadModuleType.Campaign:
                idName = 'IdSalesCampaignAddOnDocTemplate';
                break;
            case FileUploadModuleType.BusinessCost:
                idName = 'IdBusinessCostsFileAttach';
                break;
            case FileUploadModuleType.ToolsFileTemplate:
                idName = 'IdSharingTreeMedia';
        }
        return idName;
    }
}
