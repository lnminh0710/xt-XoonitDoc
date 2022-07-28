import {
    Component, Input, Output, ViewChild, OnInit, OnDestroy, EventEmitter, ChangeDetectorRef
} from '@angular/core';
import { Subscription } from 'rxjs';
import { ComboBoxTypeConstant, Configuration } from '@app/app.constants';
import { WjComboBox } from 'wijmo/wijmo.angular2.input';
import { ApiResultResponse } from '@app/models';
import { Uti } from '@app/utilities/uti';
import {
    ToolsService,
    AppErrorHandler,
    DatatableService,
    CommonService
} from '@app/services';
import { XnAgGridComponent } from '@app/shared/components/xn-control/xn-ag-grid/pages/ag-grid-container/xn-ag-grid.component';

@Component({
    selector: 'app-scan-assignment-step1',
    styleUrls: ['./scan-assignment.component.scss'],
    templateUrl: './scan-assignment-step1.component.html'
})
export class ScanAssignmentStep1Component implements OnInit, OnDestroy {
    public dataEntryCenters: any;
    public dataSourceTable: any;
    public isShowStep1 = false;

    private toolsServiceSubscription: Subscription;
    private commonServiceSubscription: Subscription;
    private currentGridItem: any = null;
    private idPerson: any;

    @ViewChild('cboDataEntry') cboDataEntry: WjComboBox;
    @ViewChild('wjgridAssigmentTable') wjgridAssigmentTable: XnAgGridComponent;

    @Input() globalProperties: any;
    @Input() wjgridAssigmentTableId: string;
    @Output() outputData: EventEmitter<any> = new EventEmitter();
    @Output() callToOpenStep2: EventEmitter<any> = new EventEmitter();    

    constructor(
        private consts: Configuration,
        private commonService: CommonService,
        private datatableService: DatatableService,
        private toolsService: ToolsService,
        private ref: ChangeDetectorRef,
        private appErrorHandler: AppErrorHandler
    ) {
    }

    public ngOnInit() {
        this.loadDataEntryCenters();
    }

    public ngOnDestroy() {
        Uti.unsubscribe(this);
    }
    public onRowDoubleClicked($event: any) {        
        this.currentGridItem = $event;
        this.setOutPutData();
        this.callToOpenStep2.emit();
    }

    public onRowClick($event) {
        this.currentGridItem = Uti.mapArrayToObject($event, true);
        this.setOutPutData();
    }

    public selectedDataEntryChanged(event) {
        if (!this.cboDataEntry) return;
        this.idPerson = this.cboDataEntry.selectedValue;
        this.setOutPutData();
        this.loadGridData(this.idPerson);
    }

    public handleDisplayStep1(isShown: boolean) {
        this.isShowStep1 = isShown;
    }

    public refreshData():void {
        this.loadGridData(this.idPerson);
        this.setOutPutData();
    }

    private setOutPutData() {
        if(this.idPerson && this.currentGridItem)
            this.outputData.emit({
                idPerson: this.idPerson,
                gridItemData: this.currentGridItem
            });
    }

    private loadGridData(idPerson: any) {
        this.toolsServiceSubscription = this.toolsService.getScanAssignmentPool(idPerson)
            .subscribe((response: any) => {
                this.appErrorHandler.executeAction(() => {
                    if (!response || !response.data) {
                        this.dataSourceTable = {
                            data: [],
                            columns: this.dataSourceTable.columns
                        }
                        return;
                    }
                    response = this.datatableService.formatDataTableFromRawData(response.data);
                    this.dataSourceTable = this.datatableService.buildDataSource(response);
                    if(this.currentGridItem) {
                        this.wjgridAssigmentTable.setSelectedRow(this.currentGridItem, 'IdScansContainerDispatchers');
                    }
                    this.reselectGridItem();
                    this.ref.detectChanges();
                });
            });
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

    private reselectGridItem() {
        if (!this.currentGridItem || !this.dataSourceTable || !this.dataSourceTable.data) return;
        for (let i = 0; i < this.dataSourceTable.data.length; i++) {
            if (this.dataSourceTable.data[i]['IdScansContainerDispatchers'] == this.currentGridItem.IdScansContainerDispatchers) {
                this.wjgridAssigmentTable.selectRowIndex(i);
                this.ref.detectChanges();
                return;        
            }
        }
        
    }
}
