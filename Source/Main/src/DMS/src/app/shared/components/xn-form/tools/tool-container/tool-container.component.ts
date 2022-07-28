import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, AfterViewInit, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { TabSummaryModel } from '@app/models/tab-summary/tab-summary.model';
import { Observable, Subscription } from 'rxjs';
import { AppState } from '@app/state-management/store';
import { Store } from '@ngrx/store';
import { AppErrorHandler } from '@app/services';
import * as tabSummaryReducer from '@app/state-management/store/reducer/tab-summary';
import { BaseComponent } from '@app/pages/private/base';
import { Uti } from '@app/utilities';
import { PageModel } from '@app/models';

@Component({
    selector: 'app-tool-container',
    templateUrl: './tool-container.component.html',
    styleUrls: ['./tool-container.component.scss']
})
export class ToolContainerComponent extends BaseComponent implements OnInit, OnDestroy, AfterViewInit {
    public tabId = 'ScanDispatcher';
    private selectedTabHeaderModel: Observable<TabSummaryModel>;
    private selectedTabHeaderModelSubscription: Subscription;

    @Input() pageId: string;
    @Input() isActivated;
    @Input() tabID: string;

    @Output() onWidgetDeleted = new EventEmitter<any>();

    constructor(
        private store: Store<AppState>,
        private appErrorHandler: AppErrorHandler,
        private _eref: ElementRef,
        protected router: Router
    ) {
        super(router)

        this.selectedTabHeaderModel = store.select(state => tabSummaryReducer.getTabSummaryState(state, this.ofModule.moduleNameTrim).selectedTab);
    }

    /**
     * ngOnInit
     */
    public ngOnInit() {
        this.subscribeSelectedTabHeaderModel();
    }

    /**
     * ngOnDestroy
     */
    public ngOnDestroy() {
        Uti.unsubscribe(this);
    }

    /**
     * ngAfterViewInit
     */
    ngAfterViewInit() {
    }

    private subscribeSelectedTabHeaderModel() {
        this.selectedTabHeaderModelSubscription = this.selectedTabHeaderModel.subscribe((selectedTabHeader: TabSummaryModel) => {
            this.appErrorHandler.executeAction(() => {
                if (!selectedTabHeader || !selectedTabHeader.tabSummaryInfor) {
                    return;
                }
                this.tabId = selectedTabHeader.tabSummaryInfor.tabID;
            });
        });
    }

    public widgetDeleted(event) {
        this.onWidgetDeleted.emit(event);
    }
}
