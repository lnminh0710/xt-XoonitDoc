import {
    Component, ViewChild, OnInit, OnDestroy, AfterViewInit,
    Input
} from '@angular/core';
import {
    ToolsService, ModalService,
    AppErrorHandler, DatatableService
} from '@app/services';
import { Uti } from '@app/utilities';
import { ControlGridModel } from '@app/models';
import { Subscription } from 'rxjs';
import { ToasterService } from 'angular2-toaster/angular2-toaster';
import { DispatcherMode } from '@app/app.constants';
import { BaseComponent } from '@app/pages/private/base';
import { Router } from '@angular/router';
import { XnAgGridComponent } from '@app/shared/components/xn-control/xn-ag-grid/pages/ag-grid-container/xn-ag-grid.component';

@Component({
    selector: 'dispatcher-form-step2',
    styleUrls: ['./dispatcher-form-step2.component.scss'],
    templateUrl: './dispatcher-form-step2.component.html'
})
export class DispatcherFromStep2Component extends BaseComponent implements OnInit, OnDestroy, AfterViewInit {
    private currentDataEntryCenterValue: any = {};
    private saveData: Array<any> = [];
    private currentScanCenter: any;
    private toolsServiceSubscription: Subscription;
    
    public poolLeftData = new ControlGridModel();
    public poolRightData = new ControlGridModel();

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
        private toasterService: ToasterService,
        protected router: Router
    ) {
        super(router);
    }

    public ngOnInit() {
        this.loadData();
    }

    public ngAfterViewInit() {
    }

    public ngOnDestroy() {
        Uti.unsubscribe(this);
    }

    public onSubmit() {
    }

    public step2Click() {
        this.resetDataPoolLeftGrid();
        this.resetDataPoolGrid();
        this.loadData();
    }

    public poolLeftGridItemClick($event: any) {
        if (!$event) return;
        const scanCenterId = Uti.getValueFromArrayByKey($event, 'IdPerson');
        this.reloadPoolData(scanCenterId);

        this.currentScanCenter = $event;
    }

    public unDispatch() {
        const unDispatchData = this.getUndispatchData();
        if (!unDispatchData || !unDispatchData.length) {
            this.toasterService.pop('warning', 'Validation Failed', 'Please select at least one item to undispatch!');
            return;
        }
        const saveData = {
            ScanUndispatcherPool: unDispatchData.map(x => {
                return {
                    IdScansContainerDispatchers: x.IdScansContainer
                };
            })
        }
        this.callSaveUndispatcherData(saveData);
    }
    /**
     * ***************************** PRIVATE METHODS
     */

    private loadData() {
        this.toolsServiceSubscription = this.toolsService.getAllScanCenters(DispatcherMode.Dispatcher)
            .subscribe((response: any) => {
                this.appErrorHandler.executeAction(() => {
                    if (!response || !response.data) {
                        this.resetDataPoolLeftGrid();
                        return;
                    }
                    response = this.datatableService.formatDataTableFromRawData(response.data);
                    this.poolLeftData = this.datatableService.buildDataSource(response);
                });
            });
    }

    private reloadPoolData(scanCenterId: any) {
        this.toolsServiceSubscription = this.toolsService.getScanCenterDispatcher(scanCenterId)
            .subscribe((response: any) => {
                this.appErrorHandler.executeAction(() => {
                    if (!response || !response.data) {
                        this.resetDataPoolGrid();
                        return;
                    }
                    response = this.datatableService.formatDataTableFromRawData(response.data);
                    response = this.datatableService.buildDataSource(response);
                    if (!response) {
                        this.resetDataPoolGrid()
                        return;
                    }
                    response.columns = this.remakePoolGridColumn(response.columns);
                    response.data = this.remakePoolGridData(response.data);
                    this.poolRightData = response;
                });
            });
    }

    private resetDataPoolGrid() {
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

    private callSaveUndispatcherData(saveData: any) {
        this.toolsServiceSubscription = this.toolsService.saveScanUndispatch(saveData)
            .subscribe((response: any) => {
                this.appErrorHandler.executeAction(() => {
                    this.poolLeftGridItemClick(this.currentScanCenter);
                    this.updateDataGridData();
                    this.toasterService.pop('success', 'Success', 'Dispatcher is successful');
                });
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
            title: 'Undispatch',
            data: 'select',
            dataType: 'Boolean',
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
            item['select'] = false;
        }
        return gridData;
    }

    private updateDataGridData() {
        const newData = this.poolRightData.data.filter(x => { return !x.select; });
        this.poolRightData = {
            data: newData,
            columns: this.poolRightData.columns
        };
    }

    private getUndispatchData() {
        return this.poolRightData.data.filter(x => {
            return x.select;
        });
    }
}
