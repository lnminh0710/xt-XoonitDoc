import { Component, OnInit, Input, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { PageModel } from '@app/models/page.model';
import { Store } from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import { Observable, Subscription } from 'rxjs';
import { Module } from '@app/models';
import { MenuModuleId } from '@app/app.constants';
import { PerfectScrollbarDirective } from 'ngx-perfect-scrollbar';
import { SubLayoutInfoState } from '@app/state-management/store/reducer/layout-info';
import { BaseComponent } from '@app/pages/private/base';
import * as layoutInfoReducer from '@app/state-management/store/reducer/layout-info';
import { AppErrorHandler } from '../../../../services';
import { Uti } from '@app/utilities';

@Component({
    selector: 'app-xn-single-page-view',
    styleUrls: ['./xn-single-page-view.component.scss'],
    templateUrl: './xn-single-page-view.component.html'
})
export class XnSinglePageViewComponent extends BaseComponent implements OnInit, OnDestroy {
    public page: PageModel;
    public perfectScrollbarConfig: any = {};
    public ofModuleLocal: Module;
    public contentHeight = 0;
    public containerStyle: any = {};

    private layoutInfoModel: Observable<SubLayoutInfoState>;

    private layoutInfoModelSubscription: Subscription;

    @Input()
    set data(data: PageModel) {
        this.page = data;
    }

    @Input() isOrderDataEntry?: boolean;
    @Input() isActivated;
    @Input() tabID: string;
    @Input() isSplitterDragging;

    @ViewChild(PerfectScrollbarDirective) perfectScrollbarDirective: PerfectScrollbarDirective;

    constructor(
        private store: Store<AppState>,
        protected router: Router,
        private appErrorHandler: AppErrorHandler,
    ) {
        super(router);

        this.ofModuleLocal = this.ofModule;

        this.layoutInfoModel = this.store.select(state => layoutInfoReducer.getLayoutInfoState(state, this.ofModule.moduleNameTrim));
    }

    subscribeLayoutInfoModel() {
        this.layoutInfoModelSubscription = this.layoutInfoModel.subscribe((layoutInfo: SubLayoutInfoState) => {
            this.appErrorHandler.executeAction(() => {
                const tabHeaderHeight = this.isOrderDataEntry
                    ? layoutInfo.tabHeaderHeightOrderDataEntry
                    : (this.ofModule.idSettingsGUI != 43
                        ? layoutInfo.tabHeaderHeight
                        : layoutInfo.tabHeaderBigSizeHeight
                    );
                this.containerStyle = {
                    // 'height': `calc(100vh - ${layoutInfo.globalSearchHeight}px - ${layoutInfo.headerHeight}px - ${tabHeaderHeight}px - ${layoutInfo.smallHeaderLineHeight}px - ${layoutInfo.dashboardPaddingTop}px)`
                    'height': `calc(100vh - ${layoutInfo.headerHeight}px -
                                            ${tabHeaderHeight}px -
                                            ${layoutInfo.smallHeaderLineHeight}px -
                                            ${layoutInfo.dashboardPaddingTop}px)`
                };

                this.contentHeight = window.innerHeight -
                    parseInt(layoutInfo.headerHeight, null) -
                    parseInt(this.ofModule.idSettingsGUI != 43 ? layoutInfo.tabHeaderHeight : layoutInfo.tabHeaderBigSizeHeight, null) -
                    parseInt(layoutInfo.smallHeaderLineHeight, null) -
                    parseInt(layoutInfo.dashboardPaddingTop, null) - 1;
            });
        });
    }

    ngOnInit() {
        this.perfectScrollbarConfig = {
            suppressScrollX: true,
            suppressScrollY: true
        }
        this.subscribeLayoutInfoModel();
    }

    ngOnDestroy() {
        Uti.unsubscribe(this);
    }

    public refreshPerfectScrollbar(event) {
        if (event) {
            if (this.perfectScrollbarDirective) {
                setTimeout(() => {
                    this.perfectScrollbarDirective.update();
                });
            }
        }
    }

}
