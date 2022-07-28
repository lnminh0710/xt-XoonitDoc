import {
    Component, ViewChild, Input,
    OnInit, OnDestroy, AfterViewInit
} from '@angular/core';
import {
    ToolsService, ModalService,
    AppErrorHandler, DatatableService,
    CommonService
} from '@app/services';
import { Uti } from '@app/utilities';
import { ControlGridModel, ApiResultResponse } from '@app/models';
import { ComboBoxTypeConstant } from '@app/app.constants';
import { Subscription } from 'rxjs';
import { ToasterService } from 'angular2-toaster/angular2-toaster';
import { DispatcherMode } from '@app/app.constants';
import { BaseComponent } from '@app/pages/private/base';
import { Router } from '@angular/router';
import { XnAgGridComponent } from '@app/shared/components/xn-control/xn-ag-grid/pages/ag-grid-container/xn-ag-grid.component';

@Component({
    selector: 'dispatcher-form-step1',
    styleUrls: ['./dispatcher-form-step1.component.scss'],
    templateUrl: './dispatcher-form-step1.component.html'
})
export class DispatcherFromStep1Component extends BaseComponent implements OnInit, OnDestroy, AfterViewInit {
    public poolLeftData = new ControlGridModel();
    public poolRightData = new ControlGridModel();
    public dataEntryCenters = [];
    public perfectScrollbarConfig: any;
    public isRenderCompleted: boolean = false;

    private toolsServiceSubscription: Subscription;
    private commonServiceSubscription: Subscription;
    private cachedPoolDataValues: Array<ChangingModel> = [];
    private dataEntryCenter = 0;
    private currentDataEntryCenterValue: any = {};
    private saveData: Array<any> = [];

    @Input() globalProperties: any;
    @Input() poolLeftGridId: string;
    @Input() poolRightGridId: string;

    @ViewChild('poolLeftGrid') poolLeftGrid: XnAgGridComponent;
    @ViewChild('poolRightGrid') poolRightGrid: XnAgGridComponent;

    constructor(
        private modalService: ModalService,
        private toolsService: ToolsService,
        private datatableService: DatatableService,
        private appErrorHandler: AppErrorHandler,
        private commonService: CommonService,
        private toasterService: ToasterService,
        protected router: Router
    ) {
        super(router);
    }

    public ngOnInit() {
        this.initPerfectScroll();
        this.loadLeftGridData();
        this.loadDataEntryCenters();
    }

    public ngAfterViewInit() {
    }

    public ngOnDestroy() {
        Uti.unsubscribe(this);
    }

    public step1Click() {
        this.clearData();
        this.loadLeftGridData();
        this.loadDataEntryCenters();
        // this.resizeGrid();
    }

    public poolLeftGridRowClick($event: any) {
        if (!$event) return;
        this.loadRightGridData(this.currentSelectedItemLeft()['IdPerson']);
        setTimeout(() => {
            this.dataEntryCenter = 0;
            this.currentDataEntryCenterValue = {};
        }, 200);
    }

    public onPoolRightGridRowClick($event: any) {
        setTimeout(() => {
            this.updateDataEntryCenterToGrid();
        }, 200);
    }

    public onPoolRightGridRowEditEnded($event: any) {
        this.updateDataEntryCenterToGrid();
    }

    public onDispatchClick() {
        if (!this.checkDirtyAndMakeSaveData()) {
            this.toasterService.pop('warning', 'Validation Failed', 'No entry data for saving!');
            return;
        }
        if (!this.currentDataEntryCenterValue || !this.currentDataEntryCenterValue.idValue) {
            this.toasterService.pop('warning', 'Validation Failed', 'Please select Data entry center!');
            return;   
        }
        this.callSaveDispatcherData();
    }

    public dataEntryCenterClicked(item: any) {
        this.currentDataEntryCenterValue = item;
        this.updateDataEntryCenterToGrid();
    }

    /**
     * ***************************** PRIVATE METHODS
     */

    private currentSelectedItemLeft(): any {
        return Uti.mapArrayToObject((this.poolLeftGrid.selectedItem() || []), true);
    }

    // private resizeGrid() {
    //     // setTimeout(() => {
    //     //     if (this.poolLeftGrid)
    //     //         this.poolLeftGrid.turnOnStarResizeMode();
    //     //     if (this.poolRightGrid)
    //     //         this.poolRightGrid.turnOnStarResizeMode();
    //     // }, 500);
    // }

    private initPerfectScroll() {
        this.perfectScrollbarConfig = {
            suppressScrollX: false,
            suppressScrollY: false
        };
    }

    private callSaveDispatcherData() {
        this.toolsServiceSubscription = this.toolsService.saveScanDispatcherPool({ScanDispatcherPools: this.saveData})
            .subscribe((response: any) => {
                this.appErrorHandler.executeAction(() => {
                    this.cachedPoolDataValues = [];
                    this.poolLeftData = {
                        data: [],
                        columns: this.poolLeftData.columns
                    };
                    this.loadLeftGridData();
                    this.toasterService.pop('success', 'Success', 'Dispatcher is successful');
                });
            });
    }

    private clearData() {
        this.resetDataPoolLeftGrid();
        this.resetDataPoolRightGrid();
        this.cachedPoolDataValues = [];
        this.dataEntryCenters = [];
        this.dataEntryCenter = 0;
        this.currentDataEntryCenterValue = {};
    }

    private checkDirtyAndMakeSaveData(): any {
        let resultData: Array<any> = [];
        for (let item of this.cachedPoolDataValues) {
            for (let subItem of item.detailData.data) {
                if (subItem.select && subItem.IsActive) {
                    resultData.push({
                        IdScansContainer: subItem.IdScansContainer,
                        IdPerson: subItem.dataEntryCenterId,
                        DoneDate: new Date(),
                        Notes: null,
                        IsActive: '1'
                    });
                }
            }
        }
        this.saveData = resultData;
        return !!this.saveData && !!this.saveData.length;
    }

    private loadLeftGridData() {
        this.toolsServiceSubscription = this.toolsService.getAllScanCenters(DispatcherMode.Pool)
            .subscribe((response: any) => {
                this.appErrorHandler.executeAction(() => {
                    if (!response || !response.data) {
                        this.resetDataPoolLeftGrid();
                        this.resetDataPoolRightGrid();
                        return;
                    }
                    response = this.datatableService.formatDataTableFromRawData(response.data);
                    this.poolLeftData = this.datatableService.buildDataSource(response);
                    this.isRenderCompleted = !!this.poolLeftData.columns.length;
                    if (!response.data || !response.data.length) {
                        this.resetDataPoolRightGrid();
                    }
                    // this.resizeGrid();
                });
            });
    }

    private loadRightGridData(scanCenterId: any) {
        this.isRenderCompleted = false;
        if (this.isDataCachedAndReGetCachedData()) {
            setTimeout(() => {
                this.isRenderCompleted = true;
            }, 200);
            return;
        }
        this.toolsServiceSubscription = this.toolsService.getScanCenterPools(scanCenterId)
            .subscribe((response: any) => {
                this.appErrorHandler.executeAction(() => {
                    if (!response || !response.data) {
                        this.resetDataPoolRightGrid();
                        return;
                    }
                    response = this.datatableService.formatDataTableFromRawData(response.data);
                    response = this.datatableService.buildDataSource(response);
                    if (!response) {
                        this.resetDataPoolRightGrid();
                        return;
                    }
                    response.columns = this.remakePoolGridColumn(response.columns);
                    response.data = this.remakePoolGridData(response.data);
                    this.isRenderCompleted = !!response.columns.length;
                    this.poolRightData = response;
                    this.addCachedItem();
                });
            });
    }

    private addCachedItem() {
        this.cachedPoolDataValues.push({
            itemData: this.currentSelectedItemLeft(),
            detailData: this.poolRightData
        });
    }

    private isDataCachedAndReGetCachedData(): boolean {
        let currentItem = this.cachedPoolDataValues.find(x => x.itemData && x.itemData.IdPerson === this.currentSelectedItemLeft()['IdPerson']);
        if (currentItem && currentItem.itemData && currentItem.itemData.IdPerson) {
            this.poolRightData = currentItem.detailData;
            return true;
        }
        return false;
    }

    private resetDataPoolRightGrid() {
        this.poolRightData = new ControlGridModel({
            data: [],
            columns: this.poolRightData.columns
        });
    }

    private resetDataPoolLeftGrid() {
        this.poolLeftData = new ControlGridModel({
            data: [],
            columns: this.poolLeftData.columns
        });
    }

    private remakePoolGridColumn(gridColumn: any): any {
        if (!gridColumn || !gridColumn.length) return gridColumn;
        for (let item of gridColumn) {
            if (item.data === 'IsActive') {
                item.setting.Setting = [
                    {
                        DisplayField: {
                            Hidden: '1'
                        }
                    }
                ];
                break;
            }
        }
        gridColumn.push({
            title: 'Select',
            data: 'select',
            setting: {
                Setting: [{
                    DisplayField: {
                        ReadOnly: '0'
                    },
                    ControlType: {
                        Type: 'Checkbox'
                    }
                }]
            },
            visible: true
        });
        gridColumn.push({
            title: 'Is active',
            data: 'IsActive',
            setting: {
                Setting: [{
                    DisplayField: {
                        ReadOnly: '0'
                    },
                    ControlType: {
                        Type: 'Checkbox'
                    }
                }]
            },
            visible: true
        });
        return gridColumn;
    }

    private remakePoolGridData(gridData: any): any {
        if (!gridData || !gridData.length) return gridData;
        for (let item of gridData) {
            item['IsActive'] = item.IsActive;
            item['select'] = false;
        }
        return gridData;
    }

    private loadDataEntryCenters() {
        this.commonServiceSubscription = this.commonService.getListComboBox(ComboBoxTypeConstant.scanDispatcherDataEntryCenter)
            .subscribe((response: ApiResultResponse) => {
                this.appErrorHandler.executeAction(() => {
                    if (!Uti.isResquestSuccess(response) || !response.item.scanDispatcherDataEntryCenter) {
                        this.dataEntryCenters = [];
                        return;
                    }
                    this.dataEntryCenters = response.item.scanDispatcherDataEntryCenter;
                });
            });
    }

    private updateDataEntryCenterToGrid() {
        if (!this.poolRightData.data || !this.poolRightData.data.length) return;
        for (let item of this.poolRightData.data) {
            if (item.select && item.IsActive) {
                item.dataEntryCenterId = this.currentDataEntryCenterValue.idValue;
                item.dataEntryCenter = this.currentDataEntryCenterValue.textValue;
            } else {
                item.dataEntryCenterId = '';
                item.dataEntryCenter = '';
            }
        }
    }
}


class ChangingModel {
    itemData: any = {};
    detailData: {
        columns: Array<any>,
        data: Array<any>
    };
    constructor(init?: Partial<ChangingModel>) {
        Object.assign(this, init);
    }
}
