import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from "@angular/core";
import { BaseComponent } from "@app/pages/private/base";
import { Router } from "@angular/router";
import { Configuration } from "@app/app.constants";
import { IPageChangedEvent } from "@app/shared/components/xn-pager";
import { Store } from "@ngrx/store";
import { AppState } from "@app/state-management/store";
import { AdministrationDocumentActions, AdministrationDocumentActionNames, CustomAction } from "@app/state-management/store/actions";
import { AdministrationDocumentSelectors } from "@app/state-management/store/reducer";
import { HistoryResponse } from "@app/models/history-document.model";
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
    selector: 'widget-history',
    templateUrl: './widget-history.component.html',
    styleUrls: ['./widget-history.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidgetHistoryComponent extends BaseComponent implements OnInit, OnDestroy {

    private _localData: HistoryResponse;
    dataResult: HistoryResponse;
    public pageIndex: number = Configuration.pageIndex;
    public pageSize: number = 0; //Configuration.pageSize;

    gridId: string;
    keyword: string;
    allowDrag: any = {
        value: false
    };
    public customDragContent: any;
    public that: any;
    globalProperties: any;
    paginationFromPopup: any;
    globalNumberFormat = '';

    searchText = '';
    searchTextChanged: Subject<string> = new Subject<string>();

    constructor(
        protected router: Router,
        protected store: Store<AppState>,
        protected administrationActions: AdministrationDocumentActions,
        protected administrationSelectors: AdministrationDocumentSelectors,
        protected cdr: ChangeDetectorRef,
    ) {
        super(router);
        this.subscribeAction();
    }

    ngOnInit(): void {
        this.initAction();
    }
    ngOnDestroy(): void {
        super.onDestroy();
    }

    initAction() {
        this.store.dispatch(this.administrationActions.getHistoryDocumentAction());
    }

    subscribeAction() {
        this.administrationSelectors.actionSuccessOfSubtype$(AdministrationDocumentActionNames.GET_HISTORY_DOCUMENT)
            .pipe(
                takeUntil(super.getUnsubscriberNotifier())
            )
            .subscribe((action: CustomAction) => {
                this._localData = action.payload as HistoryResponse;
                this.dataResult = this._localData;
                this.cdr.detectChanges();
            });

        this.searchTextChanged.pipe(
            debounceTime(500),
            distinctUntilChanged(),
        ).subscribe(text => {
            this.searchText = text;

            if (!this.searchText) {
                this.dataResult = this._localData;
                this.cdr.detectChanges();
                return;
            }

            const searchTextLowerCase = this.searchText.toLowerCase();

            const data = this._localData.data.filter(x =>
                (x.FileName && x.FileName.toLowerCase().includes(searchTextLowerCase))
                || (x.DocType && x.DocType.toLowerCase().includes(searchTextLowerCase))
                || (x.TotalDocument && x.TotalDocument.toLowerCase().includes(searchTextLowerCase))
                || (x.ScanDate && x.ScanDate.toLowerCase().includes(searchTextLowerCase))
                || (x.ScanTime && x.ScanTime.toLowerCase().includes(searchTextLowerCase))
                || (x.Devices && x.Devices.toLowerCase().includes(searchTextLowerCase))
                || (x.SyncStatus && x.SyncStatus.toLowerCase().includes(searchTextLowerCase))
                || (x.Cloud && x.Cloud.toLowerCase().includes(searchTextLowerCase)));

            const dataSearch = { ...this._localData };
            dataSearch.data = data;
            this.dataResult = dataSearch;

            this.cdr.detectChanges();
        });
    }

    onSearch(text: string) {
        this.searchTextChanged.next(text);
    }

    onResultSelect(data: Array<any>) {
        // if (!this.isMouseDown) {
        //     let model: any = {};
        //     data.forEach(item => {
        //         model[camelCase(item.key)] = item.value;
        //     });
        //     this.onRowClicked.emit(model);
        // }
        // else {
        //     this.deferResultSelect = data;
        // }
    }

    onRowDoubleClick(data: any) {
        // if (!data) return;

        // let model: any = {};
        // Object.keys(data).forEach(key => {
        //     model[camelCase(key)] = data[key];
        // });
        // this.onRowClicked.emit(model);
        // this.onRowDoubleClicked.emit(model);
        // this.store.dispatch(this.globalSearchActions.updateTab(this.tabs));
    }

    onPageChanged(event: IPageChangedEvent) {
        // this.pageIndex = event.page;
        // this.pageSize = event.itemsPerPage;
        // this.search();
        // this.updateStateForTabData();
    }

    public onPageNumberChanged(pageNumber: number) {
        // this.pageSize = pageNumber ? pageNumber : Configuration.pageSize;
        // this.search();
        // this.updateStateForTabData();
    }

    public gridMouseDown($event) {
        // this.isMouseDown = true;
    }

    public gridMouseUp($event) {
        // if ((this.moduleLocal && this.activeModule) && this.moduleLocal.moduleNameTrim !== this.activeModule.moduleNameTrim) {
        //     return;
        // }
        // this.isMouseDown = false;
        // switch ($event.which) {
        //     // Left mouse click
        //     case 1:
        //     case 2:
        //         if (this.deferResultSelect) {
        //             this.onResultSelect(this.deferResultSelect);
        //             this.deferResultSelect = null;
        //         }
        //         break;
        //     // Right mouse click
        //     case 3:
        //         this.deferResultSelect = null;
        //         break;
        // }
    }
}