import {
    Component, Input, Output, ViewChild, OnInit, OnDestroy, EventEmitter, ChangeDetectorRef
} from '@angular/core';
import { XnAgGridComponent } from '@app/shared/components/xn-control/xn-ag-grid/pages/ag-grid-container/xn-ag-grid.component';
import {
    ToolsService,
    AppErrorHandler,
    DatatableService,
    ModalService
} from '@app/services';
import { Uti } from '@app/utilities/uti';
import { Subscription } from 'rxjs';
import { ToasterService } from 'angular2-toaster/angular2-toaster';
import { BaseComponent } from '@app/pages/private/base';
import { Router } from '@angular/router';

@Component({
    selector: 'app-scan-assignment-step3',
    styleUrls: ['./scan-assignment.component.scss'],
    templateUrl: './scan-assignment-step3.component.html'
})
export class ScanAssignmentStep3Component extends BaseComponent implements OnInit, OnDestroy {

    private DETERMINISTIC_QUEUE_MODE = 1;
    private RANDOM_QUEUE_MODE = 2;

    listComboBox: any;
    dataSourceTableForPoolsDetail: any;
    isShowStep3 = false;
    private selectedPoolItems: any = [];
    private selectedUserItems: any = [];
    private _dataStep1: any = {};
    private toolsServiceSubscription: Subscription;

    @ViewChild('wjgridPoolsDetailTable') wjgridPoolsDetailTable: XnAgGridComponent;

    @Input() globalProperties: any;
    @Input() wjgridPoolsDetailTableId: string;
    @Input() set dataStep1(data: any) {
        this._dataStep1 = data || {};
        this.loadGridData();
    }

    @Output() outputData: EventEmitter<any> = new EventEmitter();
    @Output() saved: EventEmitter<boolean> = new EventEmitter();
    @Output() moveToNextStep: EventEmitter<boolean> = new EventEmitter();

    constructor(
        private datatableService: DatatableService,
        private toolsService: ToolsService,
        private appErrorHandler: AppErrorHandler,
        private toasterService: ToasterService,
        private modalService: ModalService,
        private ref: ChangeDetectorRef,
        protected router: Router
    ) {
        super(router);
    }

    ngOnInit() {
    }

    ngOnDestroy() {
        Uti.unsubscribe(this);
    }

    private loadGridData() {
        this.toolsServiceSubscription = this.toolsService.getScanAssignedPool(this._dataStep1.idPerson || '')
            .subscribe((response: any) => {
                this.appErrorHandler.executeAction(() => {
                    if (!response || !response.data) {
                        this.dataSourceTableForPoolsDetail = {
                            data: [],
                            columns: this.dataSourceTableForPoolsDetail.columns
                        }
                        return;
                    }
                    response = this.datatableService.formatDataTableFromRawData(response.data);
                    response = this.datatableService.buildDataSource(response);
                    this.dataSourceTableForPoolsDetail = response;
                    this.ref.detectChanges();
                });
            });
    }

    handleDisplayStep2(isShown: boolean) {
        this.isShowStep3 = isShown;
    }

    public save() {
        this.saved.emit(true);
    }

    public unassign() {
        const selectData = this.wjgridPoolsDetailTable.gridOptions.rowData.filter((item) => item.selectAll);
        if (this.wjgridPoolsDetailTable) {
            this.outputData.emit(selectData);
        }
        if (!selectData || !selectData.length) {
            this.modalService.warningMessage({
                message: 'Please select at least one item to unassign'
            });
            return;
        }
        this.toolsService.scanAssignmentUnassignPoolsToUsers({ ScanAssignmentPools: this.getSaveData(selectData) })
            .subscribe((response: any) => {
                this.appErrorHandler.executeAction(() => {
                    if (!response || !response.eventType || response.eventType != 'Successfully') {
                        return;
                    }
                    this.loadGridData();
                    this.toasterService.pop('success', 'Success', 'Unassigned is successful');
                });
            });
    }

    private getSaveData(selectData): any {
        return selectData.map(x => {
            return {
                IdScansContainerAssignment: x.IdScansContainerAssignment
            };
        });
    }
}
