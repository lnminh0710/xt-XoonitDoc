import { Component, TemplateRef, NgZone, ChangeDetectorRef, ViewChild, ElementRef, forwardRef } from '@angular/core';
import { ICellEditorAngularComp } from 'ag-grid-angular';
import { BaseAgGridCellComponent } from '../../shared/base-ag-grid-cell-component';
import { Subscription, fromEvent } from 'rxjs';
import { Observable } from 'rxjs';
import { GridApi, ColumnApi, GridOptions } from 'ag-grid-community';
import { TemplateCellRenderer } from '../template-cell-renderer/template-cell-renderer.component';
import { Uti } from '@app/utilities';
import { DatatableService } from '@app/services';
import { AgGridService, IAgGridData } from '../../shared/ag-grid.service';
import { XnAgGridComponent } from '@app/shared/components/xn-control/xn-ag-grid/pages/ag-grid-container/xn-ag-grid.component';
import { debounceTime, finalize } from 'rxjs/operators';

export abstract class SearchInlineCellRenderer extends BaseAgGridCellComponent<any> implements ICellEditorAngularComp {
    private COLUMN_SETTING_INDEX: number = 1;
    keyword = '';
    keyupSub: Subscription;

    public isLoading: boolean;
    public dataResult;

    @ViewChild('input') inputElRef: ElementRef;
    @ViewChild('popup') popup: any;
    @ViewChild('addButton') addButtonTemplateRef: TemplateRef<any>;
    @ViewChild(forwardRef(() => XnAgGridComponent)) widgetAgGridComponent: XnAgGridComponent;

    constructor(
        protected ngzone: NgZone,
        protected cdref: ChangeDetectorRef,
        protected datatableService: DatatableService,
    ) {
        super();
    }

    ngDoCheck() {}

    abstract getData(): Observable<any>;
    abstract processDataResponse(data);
    abstract selectItem(data);

    ngAfterViewInit() {
        setTimeout(() => {
            this.inputElRef.nativeElement.focus();
        });

        this.ngzone.runOutsideAngular(() => {
            // debounce keystroke events
            this.keyupSub = fromEvent(this.inputElRef.nativeElement, 'keyup')
                .pipe(
                    debounceTime(500)
                )
                .subscribe((keyboardEvent: any) => {
                    this.value = keyboardEvent.target.value;
                    this.searchData();
                });
        });
    }

    ngOnDestroy() {
        this.keyupSub.unsubscribe();
    }

    /**
     * searchData
     **/
    public searchData() {
        if (!this.value) {
            return;
        }
        if (this.getData) {
            this.isLoading = true;
            this.getData()
                .pipe(
                    finalize(() => {
                        this.cdref.detectChanges();
                    })
                )
                .subscribe((response) => {
                    const item = response.item;
                    this.processDataResponse(item);
                    if (item.results && item.results.length) {
                        this.dataResult = this.datatableService.buildDataSourceFromEsSearchResult(
                            item,
                            this.COLUMN_SETTING_INDEX,
                        );
                        this.popup.show(false);
                        setTimeout(() => {
                            if (this.widgetAgGridComponent) {
                                this.widgetAgGridComponent.selectRowIndex(0);
                            }
                            this.popup.focus();
                            // We need to focus a cell of grid to move up/down row by keyboard
                            let hostElement = this.popup.hostElement;
                            if (hostElement) {
                                let cell = hostElement.querySelector('ag-grid-angular .ag-row-selected .ag-cell');
                                if (cell) {
                                    cell.focus();
                                }
                            }
                        }, 500);
                    }
                    this.isLoading = false;
                });
            this.cdref.detectChanges();
        }
    }

    /**
     * getValue
     * */
    getValue(): any {
        return this.value;
    }

    public getCustomParam() {
        this.value = this.value ? this.value : '';
    }

    public onRowDoubleClickHandler(data) {
        this.selectDataItem(data);
    }

    private selectDataItem(data) {
        let item = this.params.node.data;
        item = Object.assign(item, data);
        if (this.params.column && this.params.column.colId) {
            this.value = data[this.params.column.colId];
        }
        this.params.api.updateRowData({ update: [item] });
        this.params.api.stopEditing();
        this.popup.hide();
        this.selectItem(data);
    }

    public onRowClick(data) {
        this.componentParent.rowClick.emit(data);
    }

    public popUpHidden() {
        this.componentParent.onSelectionChanged(null);
    }

    public openSearch() {
        this.searchData();
    }

    public onGridKeyDown(event) {
        if (event.key === 'Enter') {
            let node = this.widgetAgGridComponent.getSelectedNode();
            if (node) {
                this.selectDataItem(node.data);
            }
        }
    }

    public closePopover() {
        this.popup.hide();
    }
}
