import { Component, ViewEncapsulation, ViewChild, ElementRef, Input} from "@angular/core";
import { ICellRendererAngularComp, ICellEditorAngularComp, IHeaderAngularComp } from "ag-grid-angular";

@Component({
    selector: 'base-header-cell-renderer',
    templateUrl: './base-header-cell-renderer.component.html',
    styleUrls: ['./base-header-cell-renderer.component.scss']
})
export class BaseHeaderCellRenderer  {   

    private _params: any;
    @Input() set params(data: any) {
        this._params = data;
        this.params?.column?.addEventListener('sortChanged', this.onSortChanged.bind(this));
        this.onSortChanged();
    }

    get params() {
        return this._params;
    }

    @Input() template;
    @Input() contentStyle;

    public templateContext: { $implicit: any, params: any };
    @ViewChild('menuButton', { read: ElementRef }) public menuButton;

    public ascSort: string;
    public descSort: string;
    public noSort: string;
    public menuStatus: string = 'hidden';

    private currentSort = '';

    constructor() {
    }

    /**
     * onMenuClicked
     **/
    public onMenuClicked(event) {
        event.preventDefault();
        event.stopPropagation();
        this.params.showColumnMenu(this.menuButton.nativeElement);
    };

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

    /**
     * mouseEnter
     * @param event
     */
    public mouseEnter(event) {
        this.menuStatus = '';
    }

    /**
     * mouseLeave
     * @param event
     */
    public mouseLeave(event) {
        this.menuStatus = 'hidden';
    }

}
