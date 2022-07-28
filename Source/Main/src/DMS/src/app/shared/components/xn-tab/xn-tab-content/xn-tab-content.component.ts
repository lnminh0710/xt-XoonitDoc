import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { TabService, AppErrorHandler, PropertyPanelService } from '@app/services';
import { Configuration } from '@app/app.constants';
import {
    TabSummaryModel,
    TabSummaryInfoModel,
} from '@app/models';

import { SubLayoutInfoState } from '@app/state-management/store/reducer/layout-info';
import { Store, ReducerManagerDispatcher } from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import { Observable, Subscription } from 'rxjs';
import {
    TabSummaryActions,
    ModuleSettingActions,
    WidgetDetailActions,
    CustomAction
} from '@app/state-management/store/actions';
import * as tabSummaryReducer from '@app/state-management/store/reducer/tab-summary';
import * as layoutInfoReducer from '@app/state-management/store/reducer/layout-info';
import * as propertyPanelReducer from '@app/state-management/store/reducer/property-panel';
import { BaseComponent, ModuleList } from '@app/pages/private/base';
import { Uti } from '@app/utilities';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'xn-tab-content',
    styleUrls: ['./xn-tab-content.component.scss'],
    templateUrl: './xn-tab-content.component.html',
    host: {
        '(mouseenter)': 'onMouseEnter()'
    }
})

export class XnTabContentComponent extends BaseComponent implements OnInit, OnDestroy, OnChanges {
    public gradientBackgroundStatus: boolean;
    public mainTabContent: any = {};
    public otherTabsContent: Array<any> = [];
    public tabContentStyle: Object = {};
    private selectedTabHeader: TabSummaryModel;
    private layoutInfo: SubLayoutInfoState;

    private layoutInfoModelSubscription: Subscription;
    private selectedTabHeaderModelSubscription: Subscription;
    private globalPropertiesStateSubscription: Subscription;
    private initializedWidgetContainerSubscription: Subscription;

    private layoutInfoModel: Observable<SubLayoutInfoState>;
    private selectedTabHeaderModel: Observable<TabSummaryModel>;
    private globalPropertiesState: Observable<any>;
    public globalProperties: any;

    @Input() setting: any;
    @Input() hasSplitter: boolean;
    @Input() newTabConfig: any = {};
    @Input() tabSummaryModels: TabSummaryModel[];

    @Output() onMainFormChanged: EventEmitter<any> = new EventEmitter();
    @Output() onOtherFormChanged: EventEmitter<any> = new EventEmitter();

    constructor(
        private tabService: TabService,
        private store: Store<AppState>,
        private tabSummaryActions: TabSummaryActions,
        private configuration: Configuration,
        private moduleSettingActions: ModuleSettingActions,
        private appErrorHandler: AppErrorHandler,
        private propertyPanelService: PropertyPanelService,
        protected router: Router,
        private dispatcher: ReducerManagerDispatcher,
        protected ref: ChangeDetectorRef
    ) {
        super(router);

        this.layoutInfoModel = store.select(state => layoutInfoReducer.getLayoutInfoState(state, this.ofModule.moduleNameTrim));
        this.selectedTabHeaderModel = store.select(state => tabSummaryReducer.getTabSummaryState(state, this.ofModule.moduleNameTrim).selectedTab);
        this.globalPropertiesState = store.select(state => propertyPanelReducer.getPropertyPanelState(state, ModuleList.Base.moduleNameTrim).globalProperties);
    }

    ngOnInit() {
        this.subscribeLayoutInfoModel();
        this.subscribeSelectedTabHeaderModel();
        this.subscribeGlobalProperties();
        this.subscribeInitializedWidgetContainerState();
    }

    ngOnDestroy() {
        Uti.unsubscribe(this);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (!changes['setting']) { return; }
        const hasChanges = this.hasChanges(changes['setting']);
        if (hasChanges) {
            let setting = this.setting;
            if (setting && !$.isEmptyObject(setting)) {
                //this.mainTabContent = this.tabService.getMainTabContent(setting.Content.CustomTabs, this.tabSummaryModels);
                //if (this.mainTabContent.accessRight && this.mainTabContent.accessRight.read) {
                //    this.mainTabContent.active = true;
                //    this.mainTabContent.loaded = true;
                //    this.store.dispatch(this.moduleSettingActions.selectToolbarSetting(this.mainTabContent.Toolbar, this.ofModule));
                //}

                //this.otherTabsContent = this.tabService.getOtherTabsContent(setting.Content.CustomTabs, this.tabSummaryModels);
                //this.otherTabsContent = this.tabService.appendProp(this.otherTabsContent, 'active', false);

                //if (this.selectedTabHeader) {
                //    this.processToSelectTab();
                //}

                this.mainTabContent = this.tabService.getMainTabContentFixed(setting.Content.CustomTabs);
                this.ref.detectChanges();
            }
        }
    }

    private hasChanges(changes) {
        return changes && changes.hasOwnProperty('currentValue') && changes.hasOwnProperty('previousValue');
    }

    subscribeLayoutInfoModel() {
        this.layoutInfoModelSubscription = this.layoutInfoModel.subscribe((layoutInfo: SubLayoutInfoState) => {
            this.appErrorHandler.executeAction(() => {
                this.layoutInfo = layoutInfo;
                this.tabContentStyle = {
                    // 0001141: Fix small widget issue after opening GS first
                    // 'height': `calc(100vh - ${layoutInfo.globalSearchHeight}px - ${layoutInfo.headerHeight}px - ${layoutInfo.tabHeaderHeight}px - ${layoutInfo.smallHeaderLineHeight}px - ${layoutInfo.dashboardPaddingTop}px)`
                    //'height': `calc(100vh - ${layoutInfo.headerHeight}px -
                    //                        ${this.ofModule.idSettingsGUI == 43 ? this.layoutInfo.tabHeaderBigSizeHeight : this.layoutInfo.tabHeaderHeight}px -
                    //                        ${layoutInfo.smallHeaderLineHeight}px - ${layoutInfo.dashboardPaddingTop}px)`
                };
            });
        });
    }

    subscribeSelectedTabHeaderModel() {
        this.selectedTabHeaderModelSubscription = this.selectedTabHeaderModel.subscribe((selectedTabHeader: TabSummaryModel) => {
            this.appErrorHandler.executeAction(() => {
                this.selectedTabHeader = selectedTabHeader;

                if (this.selectedTabHeader && this.mainTabContent && this.otherTabsContent.length) {
                    this.processToSelectTab();
                }
            });
        });
    }

    subscribeGlobalProperties() {
        this.globalPropertiesStateSubscription = this.globalPropertiesState.subscribe((globalProperties: any) => {
            this.appErrorHandler.executeAction(() => {
                if (globalProperties) {
                    this.globalProperties = globalProperties;
                    this.updatePropertiesFromGlobalProperties(globalProperties);
                }
            });
        });
    }

    /**
     * subscribeInitializedWidgetContainerState
     */
    private subscribeInitializedWidgetContainerState() {
        this.initializedWidgetContainerSubscription = this.dispatcher.pipe(
            filter((action: CustomAction) => {
                return action.type === WidgetDetailActions.INITIALIZED_WIDGET_CONTAINER && action.module.idSettingsGUI == this.ofModule.idSettingsGUI;
            })
        ).subscribe(() => {
            this.appErrorHandler.executeAction(() => {
                setTimeout(() => {
                    // 0001141: Fix small widget issue after opening GS first
                    if (this.layoutInfo) {
                        this.tabContentStyle = {
                            // 'height': `calc(100vh - ${this.layoutInfo.globalSearchHeight}px - ${this.layoutInfo.headerHeight}px - ${this.layoutInfo.tabHeaderHeight}px - ${this.layoutInfo.smallHeaderLineHeight}px - ${this.layoutInfo.dashboardPaddingTop}px)`
                            //'height': `calc(100vh - ${this.layoutInfo.headerHeight}px -
                            //                        ${this.ofModule.idSettingsGUI == 43 ? this.layoutInfo.tabHeaderBigSizeHeight : this.layoutInfo.tabHeaderHeight}px -
                            //                        ${this.layoutInfo.smallHeaderLineHeight}px -
                            //                        ${this.layoutInfo.dashboardPaddingTop}px)`
                        };
                    }
                }, 200);
            });
        });
    }

    /**
      * updatePropertiesFromGlobalProperties
      * @param globalProperties
      */
    protected updatePropertiesFromGlobalProperties(globalProperties) {
        const gradientColor = this.propertyPanelService.getItemRecursive(globalProperties, 'GradientColor');
        this.gradientBackgroundStatus = gradientColor ? gradientColor.value : false;
    }

    processToSelectTab() {
        if (!this.mainTabContent) {
            return;
        }

        if (this.mainTabContent.TabID == this.selectedTabHeader.tabSummaryInfor.tabID ||
            this.selectedTabHeader.tabSummaryInfor.tabID == this.configuration.defaultMainTabId) {
            this.selectMainTabContent();
            if (this.mainTabContent.TabID != this.configuration.defaultMainTabId &&
                this.selectedTabHeader.tabSummaryInfor.tabID == this.configuration.defaultMainTabId) {
                this.selectedTabHeader = new TabSummaryModel({
                    tabSummaryInfor: new TabSummaryInfoModel({
                        lastUpdate: this.selectedTabHeader.tabSummaryInfor.lastUpdate,
                        tabID: this.mainTabContent.TabID,
                        tabName: this.selectedTabHeader.tabSummaryInfor.tabName,
                        tabType: this.selectedTabHeader.tabSummaryInfor.tabType,
                        isMainTab: this.selectedTabHeader.tabSummaryInfor.isMainTab
                    }),
                    tabSummaryData: this.selectedTabHeader.tabSummaryData,
                    tabSummaryMenu: this.selectedTabHeader.tabSummaryMenu,
                    active: this.selectedTabHeader.active,
                    disabled: this.selectedTabHeader.disabled,
                    visible: this.selectedTabHeader.visible,
                    accessRight: this.selectedTabHeader.accessRight
                });
                this.store.dispatch(this.tabSummaryActions.selectTab(this.selectedTabHeader, this.ofModule));
            }
        } else {
            this.selectOtherTabsContent(this.selectedTabHeader.tabSummaryInfor.tabID);
        }
    }

    selectMainTabContent() {
        this.mainTabContent.active = true;
        this.mainTabContent.loaded = true;
        this.tabService.unSelectTabs(this.otherTabsContent);
        this.store.dispatch(this.moduleSettingActions.selectToolbarSetting(this.mainTabContent.Toolbar, this.ofModule));
    }

    selectOtherTabsContent(otherTabId) {
        this.mainTabContent.active = false;

        if (this.otherTabsContent.length) {
            this.tabService.unSelectTabs(this.otherTabsContent);

            const clickedOtherTab = this.otherTabsContent.filter((otherTab) => {
                return otherTab.TabID == otherTabId;
            });

            if (clickedOtherTab.length) {
                clickedOtherTab[0].active = true;
                clickedOtherTab[0].loaded = true;
                this.store.dispatch(this.moduleSettingActions.selectToolbarSetting(clickedOtherTab[0].Toolbar, this.ofModule));
            }
        }
    }

    onMouseEnter() {
        this.store.dispatch(this.tabSummaryActions.toggleTabButton(true, this.ofModule));
    }

    onMainTabChanged(data) {
        if (data) {
            this.onMainFormChanged.emit(data);
        }
    }

    onOtherTabChanged(data) {
        if (data) {
            this.onOtherFormChanged.emit(data);
        }
    }
}
