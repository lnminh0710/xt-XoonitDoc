import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { ApiResultResponse } from '@app/models';
import { AppErrorHandler, CommonService, DatatableService, InvoiceAprrovalService } from '@app/services';
import { Uti } from '@app/utilities';
import { MatInput } from '@xn-control/light-material-ui/input';
import { BaseAgGridCellComponent } from '@xn-control/xn-ag-grid/shared/base-ag-grid-cell-component';
import { ICellEditorAngularComp, ICellRendererAngularComp } from 'ag-grid-angular';
import { IAfterGuiAttachedParams } from 'ag-grid-community';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
    selector: 'table-dropdown-cell-renderer',
    templateUrl: './table-dropdown-cell-renderer.component.html',
    styleUrls: ['./table-dropdown-cell-renderer.component.scss'],
})
export class TableDropdownCellRenderer
    extends BaseAgGridCellComponent<any>
    implements ICellRendererAngularComp, ICellEditorAngularComp {
    @ViewChild(MatInput) searchText: MatInput;
    public key: string;
    public displayValue: string;
    public tooltip: string;
    public dataSource;

    public searchTextChanged: Subject<string> = new Subject<string>();

    private comboboxType: any;

    constructor(
        private appErrorHandler: AppErrorHandler,
        private commonService: CommonService,
        private datatableService: DatatableService,
        private invoiceAprrovalService: InvoiceAprrovalService,
        private cdr: ChangeDetectorRef,
    ) {
        super();
        this.onSubscribeAction();
    }

    /**
     * DEFAULT function
     */
    getValue(): any {
        return {
            key: this.key,
            value: this.displayValue,
            options: [],
            tooltip: this.tooltip,
        };
    }
    refresh(params: any): boolean {
        return false;
    }

    private onSubscribeAction() {
        this.searchTextChanged.pipe(debounceTime(300), distinctUntilChanged()).subscribe((data: any) => {
            this.callServiceSearchBooking(data, this.comboboxType);
        });
    }

    // called on init
    agInit(params: any): void {
        this.params = params;
        this.value = this.params.value;
        this.cellStartedEdit = this.params.cellStartedEdit;
        // Edit mode
        if (this.cellStartedEdit) {
            this.buildComboboxData();
        }

        if (this.value && this.value.type === 'ocr' && this.value.valueOcr && this.value.comboboxType) {
            this.cellStartedEdit = true;
            this.buildComboboxData();

            this.comboboxType = this.value.comboboxType;
            this.onSearch(this.value.valueOcr.trim());

            this.value.type = '';
            this.value.comboboxType = '';
            this.value.valueOcr = '';

            this.cdr.detectChanges();
            return;
        }

        if (this.value) {
            if (typeof this.value === 'string') {
                const dataRaw = JSON.parse(this.value);
                if (!dataRaw || !dataRaw.length) return;
                const data = dataRaw[0];
                this.value = data;
            }

            this.key = this.value.key;
            this.displayValue = this.value.value;
            this.cdr.detectChanges();
        }
    }
    isCancelAfterEnd?(): any {
        this.implementWhenBlur();
    }
    /**
     * buildComboboxData
     **/
    public buildComboboxData() {
        const settingCol = this.params.column.colDef.refData;
        if (this.datatableService.hasControlType(settingCol, 'tabledropdown')) {
            let filterByValue = this.datatableService.getControlTypeFilterBy(settingCol);

            if (filterByValue) {
                const selectedRowData: any = this.params.node.data;
                let filterByFrom: string;
                if (selectedRowData[filterByValue]) {
                    filterByFrom =
                        typeof selectedRowData[filterByValue] === 'object'
                            ? selectedRowData[filterByValue]['key']
                            : selectedRowData[filterByValue];
                } else {
                    let ofModule = this.params.context.componentParent.currentModule;
                    filterByFrom = this.params.context.componentParent.parentInstance.data.widgetDataType.listenKeyRequest(
                        ofModule.moduleNameTrim,
                    )[filterByValue];
                }
            } else {
                const comboboxType = this.datatableService.getComboboxType(settingCol);
                this.comboboxType = comboboxType;
                this.callServiceSearchBooking('', comboboxType, false);
            }
        }
    }

    public onSearch(text: string) {
        this.searchTextChanged.next(text);
    }
    private callServiceSearchBooking(data: string, comboboxType: any, isDetectChange = true) {
        const key = comboboxType?.value ? comboboxType.value.toLowerCase().trim() : '';
        switch (key) {
            case 'approvalbooking':
                this.displayValue = data;
                this.invoiceAprrovalService
                    .searchBookingInfo(data)
                    .pipe()
                    .subscribe((res) => {
                        if (!res || res.statusCode !== 1) return;
                        this.dataSource = this.datatableService.buildEditableDataSource(res.item);

                        this.searchText?.focus();
                        if (isDetectChange) {
                            this.cdr.detectChanges();
                        }
                    });
                break;
            case 'approvalcosttype':
                this.displayValue = data;
                this.invoiceAprrovalService
                    .searchCostType(data)
                    .pipe()
                    .subscribe((res) => {
                        if (!res || res.statusCode !== 1) return;
                        this.dataSource = this.datatableService.buildEditableDataSource(res.item);

                        this.searchText?.focus();
                        if (isDetectChange) {
                            this.cdr.detectChanges();
                        }
                    });
                break;
            case 'approvalcostcentre':
                this.displayValue = data;
                this.invoiceAprrovalService
                    .searchCostCentre(data)
                    .pipe()
                    .subscribe((res) => {
                        if (!res || res.statusCode !== 1) return;
                        this.dataSource = this.datatableService.buildEditableDataSource(res.item);

                        this.searchText?.focus();
                        if (isDetectChange) {
                            this.cdr.detectChanges();
                        }
                    });
                break;
            case 'approvalprojectnumber':
                this.displayValue = data;
                this.invoiceAprrovalService
                    .searchProjectNumber(data)
                    .pipe()
                    .subscribe((res) => {
                        if (!res || res.statusCode !== 1) return;
                        this.dataSource = this.datatableService.buildEditableDataSource(res.item);

                        this.searchText?.focus();
                        if (isDetectChange) {
                            this.cdr.detectChanges();
                        }
                    });
                break;
            default:
                break;
        }
    }

    public choose(event) {
        if (!event || !event.length) return;

        this.key = event.find(
            (x) =>
                x['key'] === 'IdChartOfAccounts' ||
                x['key'] === 'IdRepCostCentre' ||
                x['key'] === 'IdRepCostType' ||
                x['key'] === 'IdRepProjectNumber',
        )?.value;
        const value = event.find(
            (x) =>
                x['key'] === 'AccountMainNumber' ||
                x['key'] === 'CostCentre' ||
                x['key'] === 'CostType' ||
                x['key'] === 'ProjectNumber',
        )?.value;
        this.displayValue = value;
        const title = event.find((x) => x['key'] === 'Title' || x['key'] === 'Description')?.value;
        this.tooltip = `${value} - ${title}`;

        this.setValue({
            key: this.key,
            value: value,
            options: [],
            tooltip: this.tooltip,
        });
        this.params.node.setDataValue(this.params.column.colId, this.value);
        this.cdr.detectChanges();

        if (typeof this.params.stopEditing === 'function') {
            this.params.stopEditing();
        } else {
            // ocr should params.stopEditing undefine and dont call to isCancelAfterEnd
            this.implementWhenBlur();
            this.cellStartedEdit = false;
        }
    }

    update1ForAll() {
        const data = this.datatableService.buildObjUpdate1ForAll(
            this.params.column.colDef.refData?.setting?.Setting,
            this.value,
            this.key,
            this.displayValue,
            this.params?.column?.colId,
        );
        if (!data) return;

        this.componentParent.update1ForAll.emit(data);
    }

    isPopup?(): any {
        // throw new Error('Method not implemented.');
    }
    isCancelBeforeStart?(): any {
        // throw new Error('Method not implemented.');
    }

    focusIn?(): void {
        // throw new Error('Method not implemented.');
    }
    focusOut?(): void {
        // throw new Error('Method not implemented.');
    }
    afterGuiAttached?(params?: IAfterGuiAttachedParams): void {
        // throw new Error('Method not implemented.');
    }
    private isOcr(): boolean {
        return this.value && this.value.type === 'ocr' && this.value.valueOcr && this.value.comboboxType;
    }
    private implementWhenBlur() {
        if (this.isOcr()) return;

        this.update1ForAll();

        // check if not yet select, will remove
        const currentValue = this.value && typeof this.value === 'object' ? this.value.value : this.value;
        if (this.key && this.displayValue === currentValue) return;
        this.key = '';
        this.value = {};
        this.displayValue = '';
        this.cdr.detectChanges();
    }
}
