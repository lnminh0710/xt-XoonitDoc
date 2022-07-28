import { Component, OnInit, Output, EventEmitter, OnDestroy, HostListener, ElementRef, Input } from '@angular/core';
import { Subscription } from 'rxjs';

import { BaseWidget } from '@app/pages/private/base';

import upperCase from 'lodash-es/upperCase';
import includes from 'lodash-es/includes';

import { FileUploader } from '@app/shared/components/xn-file';
import { Uti } from '@app/utilities';
import { CellStyle, ColDef, GridOptions } from 'ag-grid-community';

@Component({
    selector: 'file-detail',
    templateUrl: './file-detail.component.html',
})
export class FileDetailComponent extends BaseWidget {
    //Input
    @Input() rowData: any;

    //Output
    @Output()
    public openItem: EventEmitter<any> = new EventEmitter();

    @Output()
    public updateItemValue: EventEmitter<any> = new EventEmitter();

    @Output() onSelect: EventEmitter<any> = new EventEmitter();

    public columnDefs: ColDef[] = [
        {
            headerName: 'Name',
            field: 'value',
            cellRenderer: this.nameRendering,
            editable: true,
            cellEditor: 'agLargeTextCellEditor',
        },

        { headerName: 'Date Modified', field: 'dateModified', editable: false },
        {
            headerName: 'Extension',
            field: 'extension',
            editable: false,
            width: 100,
            cellRenderer: (params: any) => (!params.value ? 'File folder' : upperCase(params.value) + ' File'),
        },
        {
            headerName: 'Size',
            field: 'size',
            editable: false,
            width: 100,
            cellStyle: <CellStyle>{ cssProperty: 'text-align : right' },
        },
    ];
    public defaultColDef: any = { editable: false };
    public gridOptions: GridOptions = {
        scrollbarWidth: 2,
        columnDefs: this.columnDefs,
        suppressClickEdit: true,
        editType: 'fullRow',
        onCellDoubleClicked: (params: any) => this.openItem.emit(params.data),
        onCellValueChanged: this.onCellValueChanged.bind(this),
        rowDeselection: true,
        defaultColDef: {
            sortable: true
        }
    };

    //file drop
    public uploader: FileUploader = null;
    public isFileOver: boolean = false;
    public acceptExtensionFiles: string;

    public gridApi: any;

    constructor(private element: ElementRef) {
        super();
    }

    @HostListener('document:click', ['$event'])
    clickout(event) {
        if (
            !this.element.nativeElement.contains(event.target) &&
            !includes(event.target.className, 'folder-toolbar') &&
            this.gridApi &&
            this.gridApi.getSelectedRows()
        ) {
            this.gridApi.deselectAll();
            this.onSelect.emit(null);
        }
    }

    onSelectionChanged() {
        const selectedRows = this.gridApi.getSelectedRows();
        this.onSelect.emit({ items: selectedRows });
    }

    private onCellValueChanged(params: any) {
        if (params.oldValue === params.value) return;

        const data = params.data;
        data.value = params.value;

        this.updateItemValue.emit({ item: data, value: params.value, callback: null });
    }

    private nameRendering(params: any) {
        const extension = params.data.extension;
        return `<div class="cell-name"><div class="icon-file-type ${extension || 'icon-folder'}"></div><span>${
            params.value
        }</span></div>`;
    }

    public onGridReady(params) {
        this.gridApi = params.api;
    }
}
