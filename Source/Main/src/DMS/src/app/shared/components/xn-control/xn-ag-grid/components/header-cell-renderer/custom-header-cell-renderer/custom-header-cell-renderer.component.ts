import { Component, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { ICellRendererAngularComp, ICellEditorAngularComp, IHeaderAngularComp } from 'ag-grid-angular';
import { IHeaderParams } from 'ag-grid-community';
import { BaseAgGridCellComponent } from '../../../shared/base-ag-grid-cell-component';

@Component({
    selector: 'custom-header-cell-renderer',
    templateUrl: './custom-header-cell-renderer.html',
    styleUrls: ['./custom-header-cell-renderer.scss'],
})
export class CustomHeaderCellRenderer extends BaseAgGridCellComponent<string> implements IHeaderAngularComp {
    @ViewChild('menuButton', { read: ElementRef }) public menuButton;

    public ascSort: string;
    public descSort: string;
    public noSort: string;

    private currentSort = '';

    constructor() {
        super();
    }
    refresh(params: IHeaderParams): boolean {
        console.log('Method not implemented.');
        return false;
    }

    /**
     * onMenuClicked
     **/
    public onMenuClicked(event) {
        event.preventDefault();
        event.stopPropagation();
        this.params.showColumnMenu(this.menuButton.nativeElement);
    }

    protected getCustomParam(params: any) {
        this.params.column.addEventListener('sortChanged', this.onSortChanged.bind(this));
        this.onSortChanged();
    }

    /**
     * onSortChanged
     **/
    public onSortChanged() {
        this.ascSort = this.descSort = this.noSort = 'ag-hidden';
        if (this.params.column.isSortAscending()) {
            this.ascSort = 'active';
        } else if (this.params.column.isSortDescending()) {
            this.descSort = 'active';
        } else {
            this.noSort = 'active';
        }
    }

    /**
     * onSortRequested
     * @param order
     * @param event
     */
    public onSortRequested(event) {
        let sortMode = '';
        switch (this.currentSort) {
            case '':
                sortMode = 'asc';
                break;
            case 'asc':
                sortMode = 'desc';
                break;
            case 'desc':
                sortMode = '';
                break;
        }
        this.currentSort = sortMode;
        this.params.setSort(this.currentSort, event.shiftKey);
    }
}
