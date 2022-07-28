import { Component, OnInit, Output, EventEmitter, Input, OnDestroy, ElementRef, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { BsDropdownConfig } from 'ngx-bootstrap/dropdown';
import isEqual from 'lodash-es/isEqual';
import isEmpty from 'lodash-es/isEmpty';
import cloneDeep from 'lodash-es/cloneDeep';
import { TabService, AppErrorHandler } from '@app/services';
import { Store } from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import { Observable, Subscription } from 'rxjs';
import { TabSummaryActions } from '@app/state-management/store/actions';
import { BaseComponent } from '@app/pages/private/base';
import * as tabSummaryReducer from '@app/state-management/store/reducer/tab-summary';
import { Uti } from '@app/utilities';

export function getDropdownConfig(): BsDropdownConfig {
    return Object.assign(new BsDropdownConfig(), { autoClose: false });
}

@Component({
    selector: 'xn-tab-header-menu',
    styleUrls: ['./xn-tab-header-menu.component.scss'],
    templateUrl: './xn-tab-header-menu.component.html',
    providers: [{ provide: BsDropdownConfig, useFactory: getDropdownConfig }],
})

export class XnTabHeaderMenuComponent extends BaseComponent implements OnInit, OnDestroy {

    public status: { isopen: boolean } = { isopen: false };
    public columnFilterList: Array<any> = [];

    private columnFilterListState: Observable<Array<any>>;

    private columnFilterListStateSubscription: Subscription;

    @Input()
    set data(data: any) {
        if (!this.columnFilterList.length) {
            const menuItems = this.initData(data);
            this.store.dispatch(this.tabSummaryActions.storeColumnFilterList(menuItems, this.ofModule));
        }
    }

    @Input() tabID: string;

    @Output() onApply: EventEmitter<boolean> = new EventEmitter();

    @HostListener('document:click.out-zone', ['$event']) onDocumentClick(event) {
        if (!this._eref.nativeElement.contains(event.target))
            this.toggled(false);
    }

    constructor(
        private _eref: ElementRef,
        private store: Store<AppState>,
        private tabService: TabService,
        private tabSummaryActions: TabSummaryActions,
        protected router: Router,
        private appErrorHandler: AppErrorHandler,
    ) {
        super(router);

        this.columnFilterListState = store.select(state => tabSummaryReducer.getTabSummaryState(state, this.ofModule.moduleNameTrim).columnFilterList);
    }

    ngOnInit(): void {
        this.subscribeColumnFilterListState();
    }

    ngOnDestroy() {
        Uti.unsubscribe(this);
    }

    private subscribeColumnFilterListState() {
        this.columnFilterListStateSubscription = this.columnFilterListState.subscribe((columnFilterListState: Array<any>) => {
            this.appErrorHandler.executeAction(() => {
                if (!isEmpty(columnFilterListState) && !isEqual(this.columnFilterList, columnFilterListState)) {
                    this.columnFilterList = cloneDeep(columnFilterListState);
                }
            });
        });
    }

    apply() {
        const menuItems = this.tabService.getActiveMenuItems(this.columnFilterList);

        if (!menuItems.length) {
            return;
        }

        const columnFilter = this.tabService.buildCoumnFilterFromList(menuItems);

        this.store.dispatch(this.tabSummaryActions.selectColumnFilter(columnFilter, this.ofModule));
        this.store.dispatch(this.tabSummaryActions.storeColumnFilterList(this.columnFilterList, this.ofModule));
        this.toggled(false);
        this.onApply.emit(true);
    }

    public toggled(open: boolean): void {
        this.status.isopen = open;
    }

    private initData(data) {
        const menuItems = [];

        for (const item of data) {
            menuItems.push({
                fieldName: item.toolTip,
                isChecked: false,
                iconName: item.iconName,
                textColor: item.textColor,
                httpLink: item.httpLink
            })
        }

        return menuItems;
    }
}
