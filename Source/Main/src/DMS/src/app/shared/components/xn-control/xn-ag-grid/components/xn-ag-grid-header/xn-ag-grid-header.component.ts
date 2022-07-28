import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";

@Component({
    selector: 'xn-ag-grid-header',
    templateUrl: './xn-ag-grid-header.component.html',
    styleUrls: ['./xn-ag-grid-header.component.scss']
})
export class XnAgGridHeaderComponent implements OnInit {

    @Input() isShowedHeader = false;
    @Input() hasHeaderBorder = false;
    @Input() headerTitle: string;
    @Input() totalResults: number = 0;
    @Input() hasSearch = false;
    @Input() hasFilterBox = false;
    @Input() isShowedEditButtons = false;
    @Input() allowUploadFile = false;
    @Input() allowAddNew = false;
    @Input() allowDelete = false;
    @Input() hasValidationError = false;
    @Input() isMarkedAsDelete = false;
    @Input() searchText: string = '*';
    @Input() set isSearching(data: boolean) {
        this._isSearching = data;
    }
    get isSearching() {
        return this._isSearching;
    }

    @Output() onSearch = new EventEmitter<any>();
    @Output() onFilter = new EventEmitter<any>();
    @Output() onUpload = new EventEmitter<any>();
    @Output() onAdd = new EventEmitter<any>();
    @Output() onDeleteRows = new EventEmitter<any>();

    public filter = '';
    public readOnly = false;

    private _isSearching = false;

    constructor() {
    }

    ngOnInit() {

    }

    public doSearch(value: string) {
        if (!value) {
            this.isSearching = false;
            return;
        }

        if (this.searchText == value) return;

        this.isSearching = true;
        this.searchText = value;
        this.onSearch.emit(this.searchText);
    }

    public searchClicked($event) {
        if (!this.searchText) {
            this.isSearching = false;
            return;
        }

        this.isSearching = true;
        this.onSearch.emit(this.searchText);
    }

    public onFilterKeyup() {
        this.onFilter.emit(this.filter);
    }

    public uploadFile() {
        this.onUpload.emit(true);
    }

    public addNewRow() {
        this.onAdd.emit();
    }

    public deleteRows() {
        this.onDeleteRows.emit();
    }
}
