import { Component, OnInit, Input, OnDestroy, AfterViewInit, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { Router } from '@angular/router';
import isEqual from 'lodash-es/isEqual';
import isEmpty from 'lodash-es/isEmpty';

import {
    Module,
    SearchResultItemModel,
    ParkedItemModel,
    WidgetDetail,
    IDragDropCommunicationData,
    DragMode,
    TabSummaryModel,
    ApiResultResponse,
} from '@app/models';
import { EditingWidget, RelatingWidget } from '@app/state-management/store/reducer/widget-content-detail';
import { Store, ReducerManagerDispatcher } from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import { Observable, Subscription } from 'rxjs';
import {
    TabSummaryActions,
    ProcessDataActions,
    PropertyPanelActions,
    LayoutInfoActions,
    TabButtonActions,
    ModuleSettingActions,
    CustomAction,
    GridActions,
} from '@app/state-management/store/actions';
import { MenuModuleId, ArticleTabFieldMapping, Configuration } from '@app/app.constants';
import {
    TabService,
    AppErrorHandler,
    PropertyPanelService,
    SplitterService,
    GlobalSettingService,
} from '@app/services';
import { Uti } from '@app/utilities';
import * as parkedItemReducer from '@app/state-management/store/reducer/parked-item';
import * as tabSummaryReducer from '@app/state-management/store/reducer/tab-summary';
import * as moduleSettingReducer from '@app/state-management/store/reducer/module-setting';
import * as processDataReducer from '@app/state-management/store/reducer/process-data';
import * as propertyPanelReducer from '@app/state-management/store/reducer/property-panel';
import { BaseComponent, ModuleList } from '@app/pages/private/base';
import * as widgetContentReducer from '@app/state-management/store/reducer/widget-content-detail';
import { filter } from 'rxjs/operators';
import { String } from '@app/utilities/string';

@Component({
    selector: 'xn-tab-header',
    styleUrls: ['./xn-tab-header.component.scss'],
    templateUrl: './xn-tab-header.component.html',
    host: {
        '(mouseenter)': 'onMouseEnter()',
        '(window:resize)': 'onWindowResize($event)',
    },
})
export class XnTabHeaderComponent extends BaseComponent implements OnInit, OnDestroy, AfterViewInit {
    public globalDateFormat = '';
    public globalNumberFormat = '';
    public otherTabsHeader: TabSummaryModel[] = [];
    public mainTabHeader: TabSummaryModel;
    private selectedTabHeader: TabSummaryModel;
    public editingData: string = null;
    // private singleChoiceFilter: any = {};
    private willChangeTab: any = null;
    private editingWidgets: Array<EditingWidget> = [];
    private modulePrimaryKey = '';
    public isViewMode: boolean;
    private scrollNo = 0;
    public isMainTabSelected = true;
    public isTabCollapsed = false;
    private selectedParkedItem: ParkedItemModel;
    private selectedSearchResult: SearchResultItemModel;
    private linkableWidget = false;
    public isConnectedToMain = false;
    public isSelectionProject = false;
    private widgetListenKey = '';
    private activeSubModule: Module;
    public ofModuleLocal: Module;

    private selectedTabHeaderModel: Observable<TabSummaryModel>;
    // private singleChoiceFilterState: Observable<any>;
    private activeSubModuleState: Observable<Module>;
    private editingWidgetsState: Observable<Array<EditingWidget>>;
    private selectedSearchResultState: Observable<SearchResultItemModel>;
    private selectedParkedItemState: Observable<ParkedItemModel>;
    private modulePrimaryKeyState: Observable<string>;
    private isViewModeState: Observable<boolean>;
    private requestSelectTabState: Observable<any>;
    private isTabCollapsedState: Observable<boolean>;
    private widgetListenKeyState: Observable<string>;
    private requestUpdateTabHeaderState: Observable<any>;
    private globalPropertiesState: Observable<any>;
    private setDisableTabHeaderState: Observable<any>;
    private relatingWidgetState: Observable<RelatingWidget>;

    private selectedTabHeaderModelSubscription: Subscription;
    // private singleChoiceFilterStateSubscription: Subscription;
    private activeSubModuleStateSubscription: Subscription;
    private editingWidgetsStateSubscription: Subscription;
    private selectedSearchResultStateSubscription: Subscription;
    private selectedParkedItemStateSubscription: Subscription;
    private modulePrimaryKeyStateSubscription: Subscription;
    private isViewModeStateSubscription: Subscription;
    private requestSelectTabStateSubscription: Subscription;
    private isTabCollapsedStateSubscription: Subscription;
    private widgetListenKeyStateSubscription: Subscription;
    private globalPropertiesStateSubscription: Subscription;
    private requestUpdateTabHeaderSubscription: Subscription;
    private okToChangeTabSubscription: Subscription;
    private requestClearPropertiesSuccessSubscription: Subscription;
    private setDisableTabHeaderStateSubscription: Subscription;
    private relatingWidgetSubscription: Subscription;

    @Input() set data(data: Array<any>) {
        this.initHeaderData(data);

        this.processDisabledTab();
    }
    @Input() selectedEntity: any;
    @Input() set editingTabData(editingTabData: any) {
        this.editingData = this.tabService.buildEditingData(
            editingTabData,
            this.ofModule ? this.ofModule.moduleName : '',
        );
    }
    @Input() setting: any;
    @Input() subTabSetting: any;

    @ViewChildren('headerIconContainer') headerIconContainerList: QueryList<ElementRef>;

    constructor(
        protected router: Router,
        private propertyPanelService: PropertyPanelService,
        private store: Store<AppState>,
        private tabService: TabService,
        private tabSummaryActions: TabSummaryActions,
        private processDataActions: ProcessDataActions,
        private appErrorHandler: AppErrorHandler,
        private propertyPanelActions: PropertyPanelActions,
        private elmRef: ElementRef,
        private layoutInfoActions: LayoutInfoActions,
        private tabButtonActions: TabButtonActions,
        private splitter: SplitterService,
        private moduleSettingActions: ModuleSettingActions,
        private dispatcher: ReducerManagerDispatcher,
        private gridActions: GridActions,
        private uti: Uti,
        private globalSettingService: GlobalSettingService,
    ) {
        super(router);

        this.ofModuleLocal = this.ofModule;

        this.modulePrimaryKeyState = store.select(
            (state) => moduleSettingReducer.getModuleSettingState(state, this.ofModule.moduleNameTrim).modulePrimaryKey,
        );
        this.selectedTabHeaderModel = store.select(
            (state) => tabSummaryReducer.getTabSummaryState(state, this.ofModule.moduleNameTrim).selectedTab,
        );
        this.activeSubModuleState = store.select((state) => state.mainModule.activeSubModule);
        this.editingWidgetsState = store.select(
            (state) =>
                widgetContentReducer.getWidgetContentDetailState(state, this.ofModule.moduleNameTrim).editingWidgets,
        );
        this.selectedSearchResultState = store.select(
            (state) => processDataReducer.getProcessDataState(state, this.ofModule.moduleNameTrim).selectedSearchResult,
        );
        this.selectedParkedItemState = store.select(
            (state) => parkedItemReducer.getParkedItemState(state, this.ofModule.moduleNameTrim).selectedParkedItem,
        );
        this.isViewModeState = store.select(
            (state) => processDataReducer.getProcessDataState(state, this.ofModule.moduleNameTrim).isViewMode,
        );
        this.requestSelectTabState = store.select(
            (state) => tabSummaryReducer.getTabSummaryState(state, this.ofModule.moduleNameTrim).requestSelectTab,
        );
        this.isTabCollapsedState = store.select(
            (state) => tabSummaryReducer.getTabSummaryState(state, this.ofModule.moduleNameTrim).isTabCollapsed,
        );
        this.widgetListenKeyState = store.select(
            (state) => moduleSettingReducer.getModuleSettingState(state, this.ofModule.moduleNameTrim).widgetListenKey,
        );
        this.globalPropertiesState = store.select(
            (state) =>
                propertyPanelReducer.getPropertyPanelState(state, ModuleList.Base.moduleNameTrim).globalProperties,
        );
        this.requestUpdateTabHeaderState = store.select(
            (state) => tabSummaryReducer.getTabSummaryState(state, this.ofModule.moduleNameTrim).requestUpdateTabHeader,
        );
        this.setDisableTabHeaderState = store.select(
            (state) =>
                processDataReducer.getProcessDataState(state, this.ofModule.moduleNameTrim).disableTabHeaderFormData,
        );
        this.relatingWidgetState = store.select(
            (state) =>
                widgetContentReducer.getWidgetContentDetailState(state, this.ofModule.moduleNameTrim).relatingWidget,
        );

        this.isSelectionProject = Configuration.PublicSettings.isSelectionProject;
    }

    ngOnInit() {
        this.subcribeModulePrimaryKeyState();
        this.subscribeSelectedTabHeaderModel();
        // this.subscribeSingleChoiceFilterState();
        this.subscribeActiveSubModuleState();
        this.subscribeEditingWidgetsState();
        this.subcribeSelectedSearchResultState();
        this.subcribeSelectedParkedItemState();
        this.subscribeIsViewModeState();
        this.subscribeRequestSelectTabState();
        this.subscribeRequestClearPropertiesSuccessState();
        this.subcribeOkToChangeTabState();
        this.subcribeIsTabCollapsedState();
        this.subscribeWidgetListenKeyState();
        this.subscribeGlobalProperties();
        this.subscribeRequestUpdateTabHeader();
        this.subcribeSetDisableTabHeader();
        this.subscribeRelatingWidget();
    }

    ngAfterViewInit() {
        this.adjustScrollingArea();
    }

    ngOnDestroy() {
        if (this.headerIconContainerList) {
            this.headerIconContainerList.forEach((item, index) => {
                item.nativeElement.removeEventListener('mouseenter', this.onTabIconMouseenter.bind(this), false);
                item.nativeElement.removeEventListener('mouseleave', this.onTabIconMouseleave.bind(this), false);
            });
        }

        Uti.unsubscribe(this);
    }

    onRouteChanged() {
        // Now we need to keep state -> don't clear empty
        // WidgetUtils.widgetDataTypeValues = {};
    }

    private subscribeGlobalProperties() {
        this.globalPropertiesStateSubscription = this.globalPropertiesState.subscribe((globalProperties: any) => {
            this.appErrorHandler.executeAction(() => {
                if (globalProperties) {
                    this.globalDateFormat = this.propertyPanelService.buildGlobalDateFormatFromProperties(
                        globalProperties,
                    );
                    this.globalNumberFormat = this.propertyPanelService.buildGlobalNumberFormatFromProperties(
                        globalProperties,
                    );
                }
            });
        });
    }

    private subscribeRequestUpdateTabHeader() {
        this.requestUpdateTabHeaderSubscription = this.requestUpdateTabHeaderState.subscribe(
            (requestUpdateTabHeaderState: any) => {
                this.appErrorHandler.executeAction(() => {
                    if (
                        requestUpdateTabHeaderState &&
                        this.ofModule &&
                        this.ofModule.idSettingsGUI == MenuModuleId.warehouseMovement &&
                        this.tabService.isMainTabSelected(this.selectedTabHeader) &&
                        this.otherTabsHeader.length
                    ) {
                        this.otherTabsHeader[0].tabSummaryInfor.tabName =
                            'Movement Id: ' + requestUpdateTabHeaderState.tabHeader;

                        this.store.dispatch(this.tabSummaryActions.clearRequestUpdateTabHeader(this.ofModule));
                    }
                });
            },
        );
    }

    private subscribeSelectedTabHeaderModel() {
        this.selectedTabHeaderModelSubscription = this.selectedTabHeaderModel.subscribe(
            (selectedTabHeader: TabSummaryModel) => {
                this.appErrorHandler.executeAction(() => {
                    if (!isEqual(this.selectedTabHeader, selectedTabHeader)) {
                        this.resetColumnFilter();
                    }

                    this.selectedTabHeader = selectedTabHeader;

                    if (this.selectedTabHeader) {
                        this.processToSelectTabHeader();
                    }
                });
            },
        );
    }

    // private subscribeSingleChoiceFilterState() {
    //     this.singleChoiceFilterStateSubscription = this.singleChoiceFilterState.subscribe((singleChoiceFilterState: any) => {
    //         this.appErrorHandler.executeAction(() => {
    //             this.singleChoiceFilter = singleChoiceFilterState;
    //         });
    //     });
    // }

    private subscribeActiveSubModuleState() {
        this.activeSubModuleStateSubscription = this.activeSubModuleState.subscribe((activeSubModuleState: Module) => {
            this.appErrorHandler.executeAction(() => {
                if (
                    isEmpty(activeSubModuleState) ||
                    activeSubModuleState.idSettingsGUIParent != this.ofModule.idSettingsGUI
                ) {
                    return;
                }

                this.activeSubModule = activeSubModuleState;

                if (
                    this.ofModule &&
                    this.ofModule.idSettingsGUI == MenuModuleId.processing &&
                    activeSubModuleState &&
                    activeSubModuleState.idSettingsGUI != MenuModuleId.cashProvider
                ) {
                    this.hideTabs(this.otherTabsHeader, this.mainTabHeader);
                } else {
                    this.tabService.resetVisible(this.otherTabsHeader);
                }
            });
        });
    }

    private subscribeEditingWidgetsState() {
        this.editingWidgetsStateSubscription = this.editingWidgetsState.subscribe(
            (editingWidgets: Array<EditingWidget>) => {
                this.appErrorHandler.executeAction(() => {
                    this.editingWidgets = editingWidgets;

                    if (!this.editingWidgets.length && this.willChangeTab) {
                        this.processChangeTab();
                        this.store.dispatch(this.propertyPanelActions.clearProperties(this.ofModule));
                        this.store.dispatch(this.layoutInfoActions.setRightPropertyPanelWidth('0', this.ofModule));
                    }
                });
            },
        );
    }

    private subcribeOkToChangeTabState() {
        this.okToChangeTabSubscription = this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return (
                        action.type === ProcessDataActions.OK_TO_CHANGE_TAB &&
                        action.module.idSettingsGUI == this.ofModule.idSettingsGUI
                    );
                }),
            )
            .subscribe(() => {
                this.appErrorHandler.executeAction(() => {
                    if (this.willChangeTab) {
                        //this.store.dispatch(this.propertyPanelActions.requestClearProperties(this.ofModule));
                        this.processChangeTab();
                    }
                });
            });
    }

    private subcribeIsTabCollapsedState() {
        this.isTabCollapsedStateSubscription = this.isTabCollapsedState.subscribe((isTabCollapsedState: boolean) => {
            this.appErrorHandler.executeAction(() => {
                this.isTabCollapsed = isTabCollapsedState;

                this.store.dispatch(
                    this.layoutInfoActions.setTabHeaderHeight(
                        this.isTabCollapsed ? '30' : this.ofModule.idSettingsGUI != 43 ? '130' : '160',
                        this.ofModule,
                    ),
                );
            });
        });
    }

    private subscribeRequestClearPropertiesSuccessState() {
        this.requestClearPropertiesSuccessSubscription = this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return (
                        action.type === PropertyPanelActions.REQUEST_CLEAR_PROPERTIES_SUCCESS &&
                        action.module.idSettingsGUI == this.ofModule.idSettingsGUI
                    );
                }),
            )
            .subscribe(() => {
                this.appErrorHandler.executeAction(() => {
                    if (this.willChangeTab) {
                        this.processChangeTab();
                    }

                    this.store.dispatch(this.propertyPanelActions.clearProperties(this.ofModule));
                    this.store.dispatch(this.layoutInfoActions.setRightPropertyPanelWidth('0', this.ofModule));
                });
            });
    }

    private subcribeSelectedSearchResultState() {
        this.selectedSearchResultStateSubscription = this.selectedSearchResultState.subscribe(
            (selectedSearchResultState: SearchResultItemModel) => {
                this.appErrorHandler.executeAction(() => {
                    this.selectedSearchResult = selectedSearchResultState;
                });
            },
        );
    }

    private subcribeSelectedParkedItemState() {
        this.selectedParkedItemStateSubscription = this.selectedParkedItemState.subscribe(
            (selectedParkedItemState: ParkedItemModel) => {
                this.appErrorHandler.executeAction(() => {
                    this.selectedParkedItem = selectedParkedItemState;
                });
            },
        );
    }

    private subscribeIsViewModeState() {
        this.isViewModeStateSubscription = this.isViewModeState.subscribe((isViewModeState: boolean) => {
            this.appErrorHandler.executeAction(() => {
                this.isViewMode = isViewModeState;
            });
        });
    }

    private subscribeRequestSelectTabState() {
        this.requestSelectTabStateSubscription = this.requestSelectTabState.subscribe((requestSelectTabState: any) => {
            this.appErrorHandler.executeAction(() => {
                if (requestSelectTabState) {
                    if (this.mainTabHeader.tabSummaryInfor.tabID == requestSelectTabState.tabId) {
                        this.willChangeTab = {
                            tab: this.mainTabHeader,
                            isMainTab: true,
                        };

                        if (this.setting.Content) {
                            let tabSetting = this.setting.Content.CustomTabs.find(
                                (t) => t.TabID == this.selectedTabHeader.tabSummaryInfor.tabID,
                            );
                            this.store.dispatch(this.processDataActions.requestChangeTab(tabSetting, this.ofModule));
                        }
                    } else {
                        const otherTab = this.otherTabsHeader.find(
                            (ot) => ot.tabSummaryInfor.tabID == requestSelectTabState.tabId,
                        );
                        if (otherTab && otherTab.visible && !otherTab.disabled) {
                            this.willChangeTab = {
                                tab: otherTab,
                                isMainTab: false,
                            };

                            if (this.setting.Content) {
                                let tabSetting = this.setting.Content.CustomTabs.find(
                                    (t) => t.TabID == this.selectedTabHeader.tabSummaryInfor.tabID,
                                );
                                this.store.dispatch(
                                    this.processDataActions.requestChangeTab(tabSetting, this.ofModule),
                                );
                            }
                        } else {
                            this.store.dispatch(this.tabSummaryActions.tabChangedFailed(this.ofModule));
                        }
                    }
                }
            });
        });
    }

    private subcribeModulePrimaryKeyState() {
        this.modulePrimaryKeyStateSubscription = this.modulePrimaryKeyState.subscribe(
            (modulePrimaryKeyState: string) => {
                this.appErrorHandler.executeAction(() => {
                    this.modulePrimaryKey = modulePrimaryKeyState;
                });
            },
        );
    }

    private subscribeWidgetListenKeyState() {
        this.widgetListenKeyStateSubscription = this.widgetListenKeyState.subscribe((widgetListenKeyState: string) => {
            this.appErrorHandler.executeAction(() => {
                this.widgetListenKey = widgetListenKeyState;
            });
        });
    }

    private subcribeSetDisableTabHeader() {
        this.setDisableTabHeaderStateSubscription = this.setDisableTabHeaderState.subscribe((formData: any) => {
            this.appErrorHandler.executeAction(() => {
                if (isEmpty(formData)) return;
                this.disableTabs(formData, MenuModuleId.invoice);
            });
        });
    }

    private disableTabs(entity, moduleId) {
        const searchResultKeys = Object.keys(entity);

        switch (moduleId) {
            case MenuModuleId.invoice:
                for (const mappingKey in ArticleTabFieldMapping) {
                    if (ArticleTabFieldMapping.hasOwnProperty(mappingKey)) {
                        for (const key of searchResultKeys) {
                            if (mappingKey.toLowerCase() == key.toLowerCase()) {
                                const thisTab = this.otherTabsHeader.find(
                                    (tab) => tab.tabSummaryInfor.tabID == ArticleTabFieldMapping[mappingKey],
                                );
                                if (thisTab) {
                                    if (typeof entity[key] == 'object') {
                                        thisTab.disabled = entity[key].value == 'false' || entity[key].value == false;
                                    } else {
                                        thisTab.disabled = entity[key] == false;
                                    }

                                    if (thisTab.active == true && thisTab.disabled == true) {
                                        this.mainTabHeader.active = false;
                                        this.tabService.unSelectCurentActiveTab(this.otherTabsHeader);
                                        this.store.dispatch(
                                            this.tabSummaryActions.selectTab(this.mainTabHeader, this.ofModule),
                                        );
                                    }
                                }
                            }
                        }
                    }
                }
                break;

            case MenuModuleId.campaign:
                let isWithAsile = entity['isWithAsile'].value === 'True';
                let isWithInter = entity['isWithInter'].value === 'True';
                let isWithTrack = entity['isWithTrack'].value === 'True';
                const t6Tab = this.otherTabsHeader.find((tab) => tab.tabSummaryInfor.tabID == 'T6');
                if (t6Tab) {
                    t6Tab.disabled = !(isWithAsile || isWithInter || isWithTrack);

                    if (t6Tab.active == true && t6Tab.disabled == true) {
                        this.mainTabHeader.active = false;
                        this.tabService.unSelectCurentActiveTab(this.otherTabsHeader);
                        this.store.dispatch(this.tabSummaryActions.selectTab(this.mainTabHeader, this.ofModule));
                    }
                }

                break;

            default:
                break;
        }
    }

    private processChangeTab() {
        if (this.willChangeTab.isMainTab) {
            this.tabService.unSelectTabs(this.otherTabsHeader);
            this.isMainTabSelected = true;
        } else {
            this.mainTabHeader.active = false;
            this.tabService.unSelectCurentActiveTab(this.otherTabsHeader);
            this.isMainTabSelected = false;
        }
        this.willChangeTab.tab.active = true;

        if (this.splitter.hasChanged) {
            this.globalSettingService
                .getModuleLayoutSetting(this.ofModule.idSettingsGUI, String.hardTrimBlank(this.ofModule.moduleName))
                .subscribe((data: any) => {
                    this.store.dispatch(this.moduleSettingActions.loadModuleSettingSuccess(data, this.ofModule));
                });
        }

        this.store.dispatch(this.tabSummaryActions.selectTab(this.willChangeTab.tab, this.ofModule));
        this.store.dispatch(this.layoutInfoActions.setRightPropertyPanelWidth('0', this.ofModule));

        this.willChangeTab = null;

        this.store.dispatch(this.tabSummaryActions.tabChangedSuccess(this.ofModule));

        if (this.isSelectionProject) {
            this.store.dispatch(this.gridActions.requestInvalidate(this.ofModule));
        }
    }

    private hideTabs(otherTabsHeader, mainTabHeader) {
        const invisibleTabIdList = ['CCPRN', 'ProviderCost'];

        for (const tab of otherTabsHeader) {
            for (const tabId of invisibleTabIdList) {
                if (tab.tabSummaryInfor.tabID == tabId) {
                    tab.visible = false;

                    if (tab.active) {
                        this.store.dispatch(this.tabSummaryActions.selectTab(mainTabHeader, this.ofModule));
                    }
                }
            }
        }
    }

    private processDisabledTab() {
        setTimeout(() => {
            let selectedEntity = this.selectedParkedItem || this.selectedSearchResult;
            if (
                ((this.selectedParkedItem && this.selectedParkedItem.isNew != true) || this.selectedSearchResult) &&
                selectedEntity[this.modulePrimaryKey]
            ) {
                let entityId =
                    typeof selectedEntity[this.modulePrimaryKey] == 'object'
                        ? selectedEntity[this.modulePrimaryKey].value
                        : selectedEntity[this.modulePrimaryKey];
                switch (this.ofModule.idSettingsGUI) {
                    case MenuModuleId.invoice:
                        //this.articleService.getArticleById(entityId).subscribe((response: ApiResultResponse) => {
                        //    if (!Uti.isResquestSuccess(response)) {
                        //        return;
                        //    }
                        //    this.disableTabs(response.item, MenuModuleId.article);
                        //});
                        break;

                    case MenuModuleId.campaign:
                        //this.campaignService.getCampaignWizardT1(entityId).subscribe((response: ApiResultResponse) => {
                        //    if (!Uti.isResquestSuccess(response)) {
                        //        return;
                        //    }

                        //    if (response.item && response.item.collectionData && response.item.collectionData.length)
                        //        this.disableTabs(response.item.collectionData[0], MenuModuleId.campaign);
                        //});
                        break;

                    default:
                        break;
                }
            }
        }, 200);
    }

    private getLeftPos() {
        return $('.tab-summary-list', this.elmRef.nativeElement).position().left;
    }

    private widthOfHidden() {
        return (
            $('.tab-summary-wrapper', this.elmRef.nativeElement).outerWidth() - this.widthOfList() - this.getLeftPos()
        );
    }

    private widthOfList() {
        let itemsWidth = 0;
        $('.tab-summary-list li', this.elmRef.nativeElement).each(function () {
            const itemWidth = $(this).outerWidth();
            itemsWidth += itemWidth;
        });
        return itemsWidth;
    }

    private widthOfVisible() {
        return this.widthOfList() - this.numberOfHiddenItems() * this.widthOfItem();
    }

    private numberOfHiddenItems() {
        if (parseInt($('.tab-summary-list').get(0).style.left) < 0) {
            return (parseInt($('.tab-summary-list').get(0).style.left) * -1) / this.widthOfItem();
        }

        return parseInt($('.tab-summary-list').get(0).style.left) / this.widthOfItem();
    }

    private adjustScrollingArea() {
        if (!$('.tab-summary-wrapper', this.elmRef.nativeElement).length) {
            return;
        }

        if ($('.tab-summary-wrapper', this.elmRef.nativeElement).outerWidth() < this.widthOfList()) {
            $('.scroller-right', this.elmRef.nativeElement).show();
            $('.scroller-right', this.elmRef.nativeElement).removeClass('scroller-disabled');
            this.store.dispatch(this.tabButtonActions.tabHeaderHasScroller('right', true, this.ofModule));
        } else {
            $('.scroller-right', this.elmRef.nativeElement).hide();
            this.store.dispatch(this.tabButtonActions.tabHeaderHasScroller('right', false, this.ofModule));
        }

        if (this.getLeftPos() < 0) {
            $('.scroller-left', this.elmRef.nativeElement).show();
            $('.scroller-left', this.elmRef.nativeElement).removeClass('scroller-disabled');
        } else {
            $('.tab-summary-list', this.elmRef.nativeElement).animate(
                { left: '-=' + this.getLeftPos() + 'px' },
                'fast',
            );
            $('.scroller-left', this.elmRef.nativeElement).hide();
        }
    }

    private widthOfItem() {
        return $('.tab-summary-list li', this.elmRef.nativeElement).outerWidth();
    }

    private widthOfMainContainer() {
        return $('xn-tab-header div.tab-header-container').width();
    }

    private maxScrollLeftItems() {
        return (
            $('.tab-summary-list li', this.elmRef.nativeElement).length -
            Math.floor(this.widthOfMainContainer() / this.widthOfItem())
        );
    }

    public scrollerLeftClick(event) {
        if ($(event.target).hasClass('disabled')) {
            return;
        }

        $('.scroller-right', this.elmRef.nativeElement).fadeIn('slow');
        this.store.dispatch(this.tabButtonActions.tabHeaderHasScroller('right', true, this.ofModule));

        if (this.scrollNo >= 0) return;

        this.scrollNo++;
        $('.tab-summary-list', this.elmRef.nativeElement).animate(
            { left: '+=' + this.widthOfItem() + 'px' },
            'fast',
            function () {},
        );

        setTimeout(() => {
            if (this.getLeftPos() == 0) {
                $('.scroller-left', this.elmRef.nativeElement).addClass('scroller-disabled');

                if ($('.tab-summary-wrapper', this.elmRef.nativeElement).outerWidth() < this.widthOfList()) {
                    $('.scroller-right', this.elmRef.nativeElement).show();
                    $('.scroller-right', this.elmRef.nativeElement).removeClass('scroller-disabled');
                    this.store.dispatch(this.tabButtonActions.tabHeaderHasScroller('right', true, this.ofModule));
                } else {
                    $('.scroller-right', this.elmRef.nativeElement).addClass('scroller-disabled');
                }
            }
        }, 300);
    }

    public scrollerRightClick(event) {
        if ($(event.target).hasClass('disabled')) {
            return;
        }

        $('.scroller-left', this.elmRef.nativeElement).fadeIn('slow');
        $('.scroller-left', this.elmRef.nativeElement).removeClass('scroller-disabled');

        if (Math.abs(this.scrollNo) >= this.maxScrollLeftItems()) return;

        this.scrollNo--;
        $('.tab-summary-list', this.elmRef.nativeElement).animate(
            { left: '-=' + this.widthOfItem() + 'px' },
            'fast',
            function () {},
        );

        setTimeout(() => {
            if (this.getLeftPos() < 0) {
                if (
                    $('.tab-summary-wrapper', this.elmRef.nativeElement).outerWidth() +
                        $('.tab-summary-list', this.elmRef.nativeElement).position().left * -1 >
                    this.widthOfList()
                ) {
                    $('.scroller-right', this.elmRef.nativeElement).addClass('scroller-disabled');
                } else {
                    $('.scroller-right', this.elmRef.nativeElement).show();
                    $('.scroller-right', this.elmRef.nativeElement).removeClass('scroller-disabled');
                    this.store.dispatch(this.tabButtonActions.tabHeaderHasScroller('right', true, this.ofModule));
                }
            }
        }, 300);
    }

    private onWindowResize(event) {
        setTimeout(() => {
            if (
                $('.scroller-left', this.elmRef.nativeElement).is(':visible') &&
                this.widthOfMainContainer() - this.widthOfVisible() >= this.widthOfItem()
            ) {
                if (this.numberOfHiddenItems() > 1) {
                    for (let i = 0; i < this.numberOfHiddenItems(); i++) {
                        ((index, numberOfHiddenItems) => {
                            $('.scroller-left', this.elmRef.nativeElement).click();

                            if (index == numberOfHiddenItems - 1) {
                                setTimeout(() => {
                                    this.adjustScrollingArea();
                                }, 1500);
                            }
                        })(i, this.numberOfHiddenItems());
                    }
                } else {
                    $('.scroller-left', this.elmRef.nativeElement).click();
                    setTimeout(() => {
                        this.adjustScrollingArea();
                    }, 300);
                }
            } else {
                this.adjustScrollingArea();
            }
        }, 300);
    }

    private initHeaderData(data) {
        if (!data || !data.length) {
            return;
        }

        if (this.tabService.isTabStructureChanged(this.mainTabHeader, this.otherTabsHeader, data)) {
            this.mainTabHeader = this.tabService.getMainTabHeader(data);

            if (this.mainTabHeader && this.ofModule.idSettingsGUI === MenuModuleId.selectionCampaign) {
                this.mainTabHeader.showAsOtherTab = true;
            }

            this.otherTabsHeader = this.tabService.getOtherTabsHeader(data);
            this.otherTabsHeader = this.tabService.appendProp(this.otherTabsHeader, 'active', false);
            this.otherTabsHeader = this.tabService.appendProp(this.otherTabsHeader, 'visible', true);
            this.otherTabsHeader = this.tabService.appendProp(this.otherTabsHeader, 'disabled', false);

            if (this.selectedTabHeader) {
                this.processToSelectTabHeader();
            } else if (
                this.mainTabHeader.visible &&
                this.mainTabHeader.accessRight &&
                this.mainTabHeader.accessRight.read
            ) {
                this.mainTabHeader.active = true;
            } else if (this.otherTabsHeader.length) {
                let visibleOtherTab = this.otherTabsHeader.find(
                    (t) => t.visible && t.accessRight && t.accessRight.read,
                );
                if (visibleOtherTab) {
                    visibleOtherTab.active = true;
                }
            }
        } else {
            this.mainTabHeader = this.tabService.appendMainTabData(this.mainTabHeader, data);
            this.otherTabsHeader = this.tabService.appendOtherTabsData(this.otherTabsHeader, data);
        }

        if (
            this.ofModule &&
            this.ofModule.idSettingsGUI == MenuModuleId.processing &&
            this.activeSubModule &&
            this.activeSubModule.idSettingsGUI != MenuModuleId.cashProvider
        ) {
            this.hideTabs(this.otherTabsHeader, this.mainTabHeader);
        } else {
            this.tabService.resetVisible(this.otherTabsHeader);
        }

        this.tabService.setLogoForMainTabHeader(this.mainTabHeader);

        setTimeout(() => {
            if (this.headerIconContainerList) {
                this.headerIconContainerList.forEach((item, index) => {
                    item.nativeElement.addEventListener('mouseenter', this.onTabIconMouseenter.bind(this));
                    item.nativeElement.addEventListener('mouseleave', this.onTabIconMouseleave.bind(this));
                });
            }
        }, 200);
    }

    private clickMainTabHeader(mainTabHeader: TabSummaryModel, event?) {
        if (
            !this.selectedTabHeader ||
            (this.selectedTabHeader &&
                this.selectedTabHeader.tabSummaryInfor.tabID != mainTabHeader.tabSummaryInfor.tabID)
        ) {
            if (
                typeof mainTabHeader.disabled != 'undefined' &&
                mainTabHeader.disabled != undefined &&
                mainTabHeader.disabled == true
            ) {
                event.preventDefault();
                $(event.currentTarget).removeAttr('data-toggle');
                return false;
            }

            this.willChangeTab = {
                tab: mainTabHeader,
                isMainTab: true,
            };

            if (this.setting.Content) {
                let tabSetting = this.setting.Content.CustomTabs.find(
                    (t) => t.TabID == mainTabHeader.tabSummaryInfor.tabID,
                );
                this.store.dispatch(this.processDataActions.requestChangeTab(tabSetting, this.ofModule));
            }
        }

        if (event && event.type == 'dblclick') {
            this.store.dispatch(this.tabButtonActions.dblClickTabHeader(this.ofModule));
        }
    }

    private clickOtherTabsHeader(otherTabHeader, event?) {
        if (
            !this.selectedTabHeader ||
            (this.selectedTabHeader &&
                this.selectedTabHeader.tabSummaryInfor.tabID != otherTabHeader.tabSummaryInfor.tabID)
        ) {
            if (
                typeof otherTabHeader.disabled != 'undefined' &&
                otherTabHeader.disabled != undefined &&
                otherTabHeader.disabled == true
            ) {
                event.preventDefault();
                $(event.currentTarget).removeAttr('data-toggle');
                return false;
            }

            this.willChangeTab = {
                tab: otherTabHeader,
                isMainTab: false,
            };

            if (this.setting && this.setting.Content) {
                let tabSetting = this.setting.Content.CustomTabs.find(
                    (t) => t.TabID == otherTabHeader.tabSummaryInfor.tabID,
                );
                this.store.dispatch(this.processDataActions.requestChangeTab(tabSetting, this.ofModule));
            }
        }

        if (event && event.type == 'dblclick') {
            this.store.dispatch(this.tabButtonActions.dblClickTabHeader(this.ofModule));
        }
    }

    private processToSelectTabHeader() {
        if (!this.mainTabHeader) {
            return;
        }

        if (this.mainTabHeader.tabSummaryInfor.tabID == this.selectedTabHeader.tabSummaryInfor.tabID) {
            this.mainTabHeader.active = true;
            this.tabService.unSelectTabs(this.otherTabsHeader);
        } else {
            const clickedTabHeader = this.otherTabsHeader.filter((tab) => {
                return tab.tabSummaryInfor.tabID == this.selectedTabHeader.tabSummaryInfor.tabID;
            });
            if (clickedTabHeader.length) {
                this.mainTabHeader.active = false;
                this.tabService.unSelectCurentActiveTab(this.otherTabsHeader);
                clickedTabHeader[0].active = true;
            }
        }

        this.store.dispatch(this.tabSummaryActions.toggleTabButton(true, this.ofModule));
    }

    private onMouseEnter() {
        this.store.dispatch(this.tabSummaryActions.toggleTabButton(true, this.ofModule));
    }

    private changeIconColor(event, color) {
        if ($(event.target)) {
            $(event.target).find('h3').css('color', color);
        }
    }

    private onTabIconClick(otherTabHeader, sumData) {
        if (!otherTabHeader.active) return;
        sumData.active = !sumData.active;
        // this.store.dispatch(this.tabSummaryActions.storeSingleChoiceFilter(sumData, this.ofModule));

        const activeList = otherTabHeader.tabSummaryData.filter((x) => x.active);

        const columnFilter = this.tabService.buildCoumnFilterFromList(activeList);
        this.store.dispatch(this.tabSummaryActions.selectColumnFilter(columnFilter, this.ofModule));
        this.store.dispatch(this.tabSummaryActions.uncheckColumnFilterList(this.ofModule));
    }

    private onTabIconMouseenter(event) {
        if (event && event.target && event.target.dataset && event.target.dataset.isParentActive) {
            this.changeIconColor(event, event.target.dataset.textColor);
        }
    }

    private onTabIconMouseleave(event) {
        if (event && event.target && event.target.dataset && event.target.dataset.isParentActive) {
            // && this.singleChoiceFilter.httpLink != event.target.dataset.httpLink) {
            this.changeIconColor(event, '');
        }
    }

    private onTabHeaderMenuApply(eventData) {
        // if (eventData) {
        //     this.store.dispatch(this.tabSummaryActions.clearSingleChoiceFilter(this.ofModule));
        // }
    }

    private resetColumnFilter() {
        // this.store.dispatch(this.tabSummaryActions.clearSingleChoiceFilter(this.ofModule));
        this.store.dispatch(this.tabSummaryActions.unselectColumnFilter(this.ofModule));
        this.store.dispatch(this.tabSummaryActions.uncheckColumnFilterList(this.ofModule));
    }

    /**
     * onConnectWidget (onDrop)
     * @param srcWidgetDetail
     */
    private onConnectWidget(dropResultData: any) {
        this.linkableWidget = false;
        if (this.widgetListenKey && dropResultData && dropResultData.data) {
            const dragDropCommunicationData: IDragDropCommunicationData = dropResultData.data;
            const srcWidgetDetail = dragDropCommunicationData.srcWidgetDetail;
            const status = this.isValidToConnect(srcWidgetDetail);
            if (status) {
                srcWidgetDetail.widgetDataType.parentWidgetIds = null;
                srcWidgetDetail.widgetDataType.listenKey.sub = null;
                let listenkeyArr = srcWidgetDetail.widgetDataType.listenKey.key.split(',');
                let filterKeyArr = srcWidgetDetail.widgetDataType.filterKey
                    ? srcWidgetDetail.widgetDataType.filterKey.split(',')
                    : [''];
                srcWidgetDetail.widgetDataType.listenKey.main = [];
                listenkeyArr.forEach((key, index) => {
                    srcWidgetDetail.widgetDataType.listenKey.main.push({
                        key: key,
                        filterKey: filterKeyArr[index] || '',
                    });
                });
                if (dropResultData.callBack) {
                    dropResultData.callBack(srcWidgetDetail);
                }
            }
        }
    }

    /**
     * onDragOverWidget
     * @param srcWidgetDetail
     */
    private onDragOverWidget(dragDropCommunicationData: IDragDropCommunicationData) {
        if (dragDropCommunicationData && dragDropCommunicationData.mode == DragMode.Default) {
            const status = this.isValidToConnect(dragDropCommunicationData.srcWidgetDetail);
            if (status) {
                this.linkableWidget = true;
            }
        }
    }

    /**
     * onDragLeaveWidget
     */
    private onDragLeaveWidget() {
        this.linkableWidget = false;
    }

    /**
     * isValidToConnect
     * @param srcWidgetDetail
     */
    private isValidToConnect(srcWidgetDetail: WidgetDetail) {
        let isValid = false;
        do {
            if (!srcWidgetDetail || !this.widgetListenKey) {
                break;
            }
            if (!srcWidgetDetail.widgetDataType.listenKey) {
                break;
            }
            if (!srcWidgetDetail.widgetDataType.listenKey.key) {
                break;
            }
            let count = 0;
            const listenkeyArr = srcWidgetDetail.widgetDataType.listenKey.key.split(',');
            const parkedItemKeyArr = this.widgetListenKey.split(',');
            for (const listenkey of listenkeyArr) {
                for (const parkedItemKey of parkedItemKeyArr) {
                    if (listenkey.toLowerCase() == parkedItemKey.toLowerCase()) {
                        count += 1;
                        break;
                    }
                }
            }
            if (count == listenkeyArr.length) {
                isValid = true;
            }
            break;
        } while (true);
        return isValid;
    }

    /**
     * isConnectedToMainItem
     * @param srcWidgetDetail
     */
    private isConnectedToMainItem(srcWidgetDetail: WidgetDetail) {
        let isConnected = false;
        do {
            if (!srcWidgetDetail) {
                break;
            }
            if (!srcWidgetDetail.widgetDataType.listenKey) {
                break;
            }
            if (!srcWidgetDetail.widgetDataType.listenKey.key) {
                break;
            }
            if (srcWidgetDetail.widgetDataType.listenKey.main && srcWidgetDetail.widgetDataType.listenKey.main.length) {
                isConnected = true;
            }
            break;
        } while (true);
        return isConnected;
    }

    /**
     * subscribeRelatingWidget
     */
    private subscribeRelatingWidget() {
        if (this.relatingWidgetSubscription) {
            this.relatingWidgetSubscription.unsubscribe();
        }
        this.relatingWidgetSubscription = this.relatingWidgetState.subscribe((relatingWidget: RelatingWidget) => {
            this.appErrorHandler.executeAction(() => {
                if (relatingWidget) {
                    if (relatingWidget.mode == 'hover') {
                        this.linkableWidget = this.isValidToConnect(relatingWidget.scrWidgetDetail);
                        if (this.linkableWidget) {
                            this.isConnectedToMain = this.isConnectedToMainItem(relatingWidget.scrWidgetDetail);
                        }
                    } else {
                        this.linkableWidget = false;
                        this.isConnectedToMain = false;
                    }
                }
            });
        });
    }

    formatDate(data: any, formatPattern: string) {
        const result = !data ? '' : this.uti.formatLocale(new Date(data), formatPattern);
        return result;
    }
}
