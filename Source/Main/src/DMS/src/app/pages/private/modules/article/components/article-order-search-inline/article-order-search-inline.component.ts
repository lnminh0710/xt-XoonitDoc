import { TemplateRef, NgZone, ChangeDetectorRef, ViewChild, ElementRef, OnInit, OnDestroy, AfterViewInit, forwardRef, Component, Input } from "@angular/core";
import { Subscription, Observable, fromEvent } from 'rxjs';
import { Uti } from "@app/utilities";
import { DatatableService, PropertyPanelService, SearchService } from "@app/services";
import { BaseComponent } from "@app/pages/private/base";
import { Router } from "@angular/router";
import { XnAgGridComponent } from "@app/shared/components/xn-control/xn-ag-grid/pages/ag-grid-container/xn-ag-grid.component";
import { SearchType } from "@app/shared/components/xn-control/xn-ag-grid/shared/ag-grid-constant";
import { debounceTime, finalize } from "rxjs/operators";

@Component({
    selector: 'article-search-inline',
    templateUrl: './article-order-search-inline.html',
    styleUrls: ['./article-order-search-inline.scss']
})
export class ArticleOrderSearchInlineComponent extends BaseComponent implements OnInit, OnDestroy, AfterViewInit {

    @Input() globalProperties: any;
    @Input() componentParent: XnAgGridComponent;

    public value: any;
    public onTopChecked: boolean = true;
    public manualArticleNr: any;

    private COLUMN_SETTING_INDEX: number = 1;
    keyword = '';
    keyupSub: Subscription;

    public isLoading: boolean;
    public dataResult;

    @ViewChild('input') inputElRef: ElementRef;
    @ViewChild('popup') popup: any;
    @ViewChild('addButton') addButtonTemplateRef: TemplateRef<any>;
    @ViewChild(forwardRef(() => XnAgGridComponent)) widgetAgGridComponent: XnAgGridComponent;

    constructor(protected ngzone: NgZone, protected cdref: ChangeDetectorRef,
        protected datatableService: DatatableService, protected router: Router,
        private searchService: SearchService, private propertyPanelService: PropertyPanelService) {
        super(router);
    }

    ngOnInit(): void {
    }

    ngOnDestroy() {
        this.keyupSub.unsubscribe();
        Uti.unsubscribe(this);
    }

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

    getData(): Observable<any> {
        const searchWithStarProp = this.propertyPanelService.getItemRecursive(this.globalProperties, 'SearchWithStar');
        const manualArticleProp = this.propertyPanelService.getItemRecursive(this.globalProperties, 'ManualArticle');
        let isGetManualArticleNr;
        let keyword;
        if (manualArticleProp) {
            isGetManualArticleNr = manualArticleProp.value;
        }
        if (searchWithStarProp) {
            switch (searchWithStarProp.value) {
                case SearchType.Begin:
                    keyword = '*' + this.value;
                    break;
                case SearchType.End:
                    keyword = this.value + '*';
                    break;
                case SearchType.Both:
                    keyword = '*' + this.value + '*';
                    break;
            }
        }
        return this.searchService.searchArticle(keyword, 0, 100, isGetManualArticleNr);
    }

    processDataResponse(response) {
        if (!response.results || !response.results.length) {
            this.manualArticleNr = response.payload;
        }
    }

    selectItem() {
        if (!this.componentParent) return;

        this.componentParent.startEditingCellForFirstOrLastRow('Quantity', this.onTopChecked);

        setTimeout(() => {
            this.componentParent.startEditingCellForFirstOrLastRow('Quantity', this.onTopChecked);
        }, 1500);
    }

    /**
     * searchData
     **/
    public searchData() {
        if (!this.value || this.isLoading) {
            return;
        }

        this.isLoading = true;
        this.manualArticleNr = null;
        this.getData()
            .pipe(
                finalize(() => {
                    this.isLoading = false;
                    this.cdref.detectChanges();
                }),
            )
            .subscribe(response => {
            const item = response.item;
            this.processDataResponse(item);
            if (item.results && item.results.length) {
                this.dataResult = this.datatableService.buildDataSourceFromEsSearchResult(item, this.COLUMN_SETTING_INDEX);
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
        //this.cdref.detectChanges();
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
        if (!this.componentParent) return;

        this.popup.hide();

        data.selectAll = true;
        this.componentParent.addNewRow(data, this.getAddIndexForGrid(), false);
        setTimeout(() => {
            this.value = '';
            this.selectItem();
        }, 500);
    }

    public onRowClick(data) {
        if (this.componentParent)
            this.componentParent.rowClick.emit(data);
    }

    public popUpHidden() {
        if (this.componentParent)
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

    private getAddIndexForGrid() {
        return this.onTopChecked ? 0 : -1;
    }

    public addManualArticleNr() {
        if (!this.componentParent || !this.manualArticleNr || !this.value) return;

        this.componentParent.addNewRow({
            ArticleNr: this.manualArticleNr,
            ArticleNameShort: this.value,
            PriceExclVAT: 0,
            selectAll: true
        }, this.getAddIndexForGrid(), false);

        this.manualArticleNr = null;
        this.value = '';

        setTimeout(() => {
            this.selectItem();
        }, 500);
    }
}
