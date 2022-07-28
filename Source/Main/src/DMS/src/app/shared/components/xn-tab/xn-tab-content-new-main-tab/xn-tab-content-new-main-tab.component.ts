import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, ViewChild } from '@angular/core';

import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { AppState } from '@app/state-management/store';
import { SubLayoutInfoState } from '@app/state-management/store/reducer/layout-info';
import isEmpty from 'lodash-es/isEmpty';
import { MenuModuleId } from '@app/app.constants';
import { ModuleState } from '@app/state-management/store/reducer/main-module';
import { Module } from '@app/models/module';
import * as layoutInfoReducer from '@app/state-management/store/reducer/layout-info';
import { BaseComponent } from '@app/pages/private/base';
import { Router } from '@angular/router';
import { AppErrorHandler } from '../../../../services';
import { Uti } from '@app/utilities';
import { WidgetContainerComponent } from '../../widget';

@Component({
    selector: 'app-xn-tab-content-new-main-tab',
    templateUrl: './xn-tab-content-new-main-tab.component.html',
})

export class XnTabContentNewMainTabComponent extends BaseComponent implements OnInit, OnDestroy {

    public perfectScrollbarConfig: Object = {};
    public contentStyle: Object = {};
    public administrtionConfig: any = {};
    public isRenderAdmin = false;
    public searchIndexKey: string;

    private layoutInfoModelSubscription: Subscription;
    private activeSubModuleModelSubscription: Subscription;
    private moduleStateSubscription: Subscription;

    private layoutInfoModel: Observable<SubLayoutInfoState>;
    private moduleModel: Observable<ModuleState>;
    private activeSubModuleModel: Observable<Module>;

    private _tabContent: any;
    @Input() set tabContent(data: any) {
        this._tabContent = data;
    }

    get tabContent() {
        return this._tabContent;
    }

    @Input() config: any;
    @Input() globalProperties: any[] = [];

    @Output() onFormChanged: EventEmitter<any> = new EventEmitter();

    @ViewChild(WidgetContainerComponent) widgetContainerComponent: WidgetContainerComponent;

    constructor(
        private store: Store<AppState>,
        protected router: Router,
        private appErrorHandler: AppErrorHandler
    ) {
        super(router);

        this.layoutInfoModel = store.select(state => layoutInfoReducer.getLayoutInfoState(state, this.ofModule.moduleNameTrim));
        this.moduleModel = store.select(state => state.mainModule);
        this.activeSubModuleModel = store.select(state => state.mainModule.activeSubModule);
    }

    ngOnInit() {
        this.perfectScrollbarConfig = {
            suppressScrollX: false,
            suppressScrollY: false
        };

        this.subscribeLayoutInfoModel();
        this.activeSubModuleModelSubscription = this.activeSubModuleModel.subscribe((activeSubModule: Module) => {
            this.appErrorHandler.executeAction(() => {
                this.isRenderAdmin = true;
                if (isEmpty(activeSubModule)) { return; }
                this.administrtionConfig = { principal: (activeSubModule.idSettingsGUI === MenuModuleId.mandant) };
            });
        });

        this.moduleStateSubscription = this.moduleModel.subscribe((moduleState: ModuleState) => {
            this.appErrorHandler.executeAction(() => {
                if (moduleState.activeModule && !isEmpty(moduleState.activeModule)) {
                    this.searchIndexKey = moduleState.activeModule.searchIndexKey;
                }
                if (moduleState.activeSubModule && !isEmpty(moduleState.activeSubModule)) {
                    this.searchIndexKey = moduleState.activeSubModule.searchIndexKey;
                }
            });
        });
    }

    ngOnDestroy() {
        Uti.unsubscribe(this);
    }

    subscribeLayoutInfoModel() {
        this.layoutInfoModelSubscription = this.layoutInfoModel.subscribe((layoutInfo: SubLayoutInfoState) => {
            this.appErrorHandler.executeAction(() => {
                this.contentStyle = {
                    // 'height': `calc(100vh - ${layoutInfo.globalSearchHeight}px - ${layoutInfo.headerHeight}px - ${layoutInfo.tabHeaderHeight}px - ${layoutInfo.formPadding}px)`
                    'height': `calc(100vh - ${layoutInfo.headerHeight}px -
                                            ${this.ofModule.idSettingsGUI != 43 ? layoutInfo.tabHeaderHeight : layoutInfo.tabHeaderBigSizeHeight}px -
                                            ${layoutInfo.formPadding}px)`
                };
            });
        });
    }

    onChanged(data) {
        if (data) {
            this.onFormChanged.emit(data);
        }
    }

}
