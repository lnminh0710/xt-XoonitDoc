import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild } from "@angular/core";
import { MenuModuleId } from '@app/app.constants';
import { Module } from '@app/models';
import { GlobalSearchResultComponent } from '@app/shared/components/global-search/components/gs-result';

@Component({
    selector: 'module-search-dialog',
    templateUrl: './module-search-dialog.component.html',
    styleUrls: ['./module-search-dialog.component.scss']
})
export class ModuleSearchDialogComponent implements OnInit, OnDestroy, AfterViewInit {
    public allowDrag: any = {
        value: false
    };

    @Input() headerTitle: string;
    @Input() showDialog: boolean = false;
    @Input() module: Module;
    @Input() searchIndex: string;
    @Output() onItemSelect: EventEmitter<any> = new EventEmitter();
    @Output() onDialogClose: EventEmitter<any> = new EventEmitter();

    @Input() keyword: string = '*';

    perfectScrollbarConfig: any = {};

    private isSearching: boolean = false;
    private selectedData: any;
    public isWithStarStatus: boolean = false;

    @ViewChild('gsResult')
    gsResult: GlobalSearchResultComponent;

    constructor(private _eref: ElementRef) {

    }

    /**
     * ngOnInit
     */
    ngOnInit() {
        this.perfectScrollbarConfig = {
            suppressScrollX: false,
            suppressScrollY: false
        };
    }

    /**
     * ngOnDestroy
     */
    ngOnDestroy() {
    }

    /**
     * ngAfterViewInit
     */
    ngAfterViewInit() {
    }

    /**
     * open
     */
    open(keyword?: string) {
        this.showDialog = true;
        this.keyword = keyword || '*';
    }

    /**
     * ok
     */
    close() {
        this.showDialog = false;
        this.onDialogClose.emit();
        this.keyword = '*';
    }

    /**
     * ok
     */
    ok() {
        this.onItemSelect.emit(this.selectedData);
        this.close();
    }

    /**
     * search
     * @param value
     */
    search(value: string) {
        if (!value) {
            this.isSearching = false;
            return;
        }

        this.isSearching = true;
        this.keyword = value;
        // this.gsResult.search();
        // // if (value === this.keyword) {
        //     setTimeout(() => {
        //         this.isSearching = false;
        //     }, 1000);
        // }
    }

    rowClicked(data) {
        this.selectedData = data;
    }

    /**
     * rowDoubleClicked
     * @param data
     */
    rowDoubleClicked(data) {
        this.onItemSelect.emit(data);
        this.showDialog = false;
    }

    onSearchCompleted($event) {
        this.isSearching = false;
    }
}
