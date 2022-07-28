import { Component, OnInit, OnDestroy, ElementRef, AfterViewInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ToasterService } from 'angular2-toaster/angular2-toaster';
import isEmpty from 'lodash-es/isEmpty';
import cloneDeep from 'lodash-es/cloneDeep';
import isEqual from 'lodash-es/isEqual';
import isNil from 'lodash-es/isNil';
import {
    RequestSavingMode,
    MenuModuleId,
    ModuleType,
    GlobalSettingConstant,
    AccessRightTypeEnum,
    Configuration,
    ComboBoxTypeConstant,
} from '@app/app.constants';
import { Uti, String } from '@app/utilities';
import { ModuleSettingService, SplitterService, AccessRightsService } from '@app/services';
import {
    TabService,
    ModalService,
    CommonService,
    AppErrorHandler,
    BackOfficeService,
    GlobalSettingService,
} from '@app/services';
import {
    ParkedItemModel,
    TabSummaryModel,
    TabSummaryInfoModel,
    SearchResultItemModel,
    Module,
    ModuleSettingModel,
    SimpleTabModel,
    ApiResultResponse,
    AccessRightModel,
    GlobalSettingModel,
} from '@app/models';
import { EditingWidget } from '@app/state-management/store/reducer/widget-content-detail';
import { Store, ReducerManagerDispatcher } from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import { Observable, Subscription } from 'rxjs';
import {
    ParkedItemActions,
    TabSummaryActions,
    ModuleSettingActions,
    ProcessDataActions,
    WidgetDetailActions,
    XnCommonActions,
    SearchResultActions,
    BackofficeActions,
    ModuleActions,
    CustomAction,
} from '@app/state-management/store/actions';
import * as parkedItemReducer from '@app/state-management/store/reducer/parked-item';
import * as tabSummaryReducer from '@app/state-management/store/reducer/tab-summary';
import * as moduleSettingReducer from '@app/state-management/store/reducer/module-setting';
import * as processDataReducer from '@app/state-management/store/reducer/process-data';
import * as backofficeReducer from '@app/state-management/store/reducer/backoffice';
import * as tabButtonReducer from '@app/state-management/store/reducer/tab-button';
import { BaseComponent, ModuleList } from '@app/pages/private/base';
import * as widgetContentReducer from '@app/state-management/store/reducer/widget-content-detail';
import { filter, map, delay } from 'rxjs/operators';
import { zip } from 'rxjs/observable/zip';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
})
export class DashboardComponent extends BaseComponent implements OnInit, OnDestroy, AfterViewInit {
    public menuModuleId = MenuModuleId;

    private isInit = false;
    private selectedParkedItem: ParkedItemModel = null;
    private selectedSearchResult: SearchResultItemModel = null;
    public selectedEntity: any;
    public subModules: Module[];
    private moduleSetting: ModuleSettingModel[];
    public tabSetting: any;
    private isViewMode = true;
    private formDirty: boolean;
    private selectedTab: TabSummaryModel;
    private selectedSimpleTab: SimpleTabModel;
    public tabList: TabSummaryModel[] = [];
    public newTabConfig: any = null;
    private uti: Uti;
    private requestSave: any;
    private modulePrimaryKey = '';
    private editingWidgets: Array<EditingWidget> = [];
    private isHiddenParkedItem = false;
    public activeModule: Module;
    public activeSubModule: Module;
    public subTabSetting: any;
    public ofModuleLocal: Module;
    public isDesignMode = false;

    private selectedParkedItemStateSubscription: Subscription;
    private selectedSearchResultStateSubscription: Subscription;
    private activeModuleStateSubscription: Subscription;
    private subModulesStateSubscription: Subscription;
    private activeSubModuleStateSubscription: Subscription;
    private moduleSettingStateSubscription: Subscription;
    private tabHeaderDataModelSubscription: Subscription;
    private selectedTabStateSubscription: Subscription;
    private selectedSimpleTabStateSubscription: Subscription;
    private viewModeStateSubscription: Subscription;
    private formDirtyStateSubscription: Subscription;
    private requestSaveStateSubscription: Subscription;
    private modulePrimaryKeyStateSubscription: Subscription;
    private isViewModeStateSubscription: Subscription;
    private editingWidgetsStateSubscription: Subscription;
    private requestDownloadPdfStateSubscription: Subscription;
    private requestGoToTrackingPageStateSubscription: Subscription;
    private requestOpenReturnRefundModuleStateSubscription: Subscription;
    private isHiddenParkedItemStateSubscription: Subscription;
    private formEditModeStateSubscription: Subscription;
    private userSubcribe: Subscription;
    private newMainTabSubscription: Subscription;
    private newOtherTabSubscription: Subscription;
    private newSimpleTabSubscription: Subscription;
    private updateMainTabSubscription: Subscription;
    private requestLoadTabsSubscription: Subscription;
    private isShowTabButtonStateSubscription: Subscription;
    //private requestOPSaveAndRunAsEmailSubscription: Subscription;

    private selectedParkedItemState: Observable<any>;
    private selectedSearchResultState: Observable<SearchResultItemModel>;
    private activeModuleState: Observable<Module>;
    private subModulesState: Observable<Module[]>;
    private activeSubModuleState: Observable<Module>;
    private moduleSettingState: Observable<ModuleSettingModel[]>;
    public tabHeaderDataModel: Observable<TabSummaryModel[]>;
    private selectedTabState: Observable<TabSummaryModel>;
    private selectedSimpleTabState: Observable<SimpleTabModel>;
    private viewModeState: Observable<boolean>;
    private formDirtyState: Observable<boolean>;
    private modulePrimaryKeyState: Observable<string>;
    private isViewModeState: Observable<boolean>;
    private editingWidgetsState: Observable<Array<EditingWidget>>;
    private requestDownloadPdfState: Observable<any>;
    private requestGoToTrackingPageState: Observable<any>;
    private requestOpenReturnRefundModuleState: Observable<any>;
    private isHiddenParkedItemState: Observable<boolean>;
    private formEditModeState: Observable<boolean>;
    private moduleToPersonTypeState: Observable<any>;
    private isShowTabButtonState: Observable<any>;

    constructor(
        private elementRef: ElementRef,
        protected router: Router,
        private moduleSettingService: ModuleSettingService,
        private tabService: TabService,
        private store: Store<AppState>,
        private parkedItemActions: ParkedItemActions,
        private tabSummaryActions: TabSummaryActions,
        private moduleSettingActions: ModuleSettingActions,
        private processDataActions: ProcessDataActions,
        private widgetDetailActions: WidgetDetailActions,
        private modalService: ModalService,
        private commonService: CommonService,
        private appErrorHandler: AppErrorHandler,
        private xnCommonActions: XnCommonActions,
        private searchResultActions: SearchResultActions,
        private backofficeActions: BackofficeActions,
        private moduleActions: ModuleActions,
        private splitter: SplitterService,
        private toasterService: ToasterService,
        private backOfficeService: BackOfficeService,
        protected ref: ChangeDetectorRef,
        private dispatcher: ReducerManagerDispatcher,
        private globalSettingService: GlobalSettingService,
        private globalSettingConstant: GlobalSettingConstant,
        private accessRightsService: AccessRightsService,
    ) {
        super(router);

        this.ofModuleLocal = this.ofModule;

        this.uti = new Uti();
        this.selectedParkedItemState = store.select(
            (state) => parkedItemReducer.getParkedItemState(state, this.ofModule.moduleNameTrim).selectedParkedItem,
        );
        this.tabHeaderDataModel = store.select(
            (state) => tabSummaryReducer.getTabSummaryState(state, this.ofModule.moduleNameTrim).tabs,
        );
        this.selectedSearchResultState = store.select(
            (state) => processDataReducer.getProcessDataState(state, this.ofModule.moduleNameTrim).selectedSearchResult,
        );
        this.activeModuleState = store.select((state) => state.mainModule.activeModule);
        this.subModulesState = store.select((state) => state.mainModule.subModules);
        this.activeSubModuleState = store.select((state) => state.mainModule.activeSubModule);
        this.moduleSettingState = store.select(
            (state) => moduleSettingReducer.getModuleSettingState(state, this.ofModule.moduleNameTrim).moduleSetting,
        );
        this.selectedTabState = store.select(
            (state) => tabSummaryReducer.getTabSummaryState(state, this.ofModule.moduleNameTrim).selectedTab,
        );
        this.selectedSimpleTabState = store.select(
            (state) => tabSummaryReducer.getTabSummaryState(state, this.ofModule.moduleNameTrim).selectedSimpleTab,
        );
        this.viewModeState = store.select(
            (state) => processDataReducer.getProcessDataState(state, this.ofModule.moduleNameTrim).viewMode,
        );
        this.formDirtyState = store.select(
            (state) => processDataReducer.getProcessDataState(state, this.ofModule.moduleNameTrim).formDirty,
        );
        this.modulePrimaryKeyState = store.select(
            (state) => moduleSettingReducer.getModuleSettingState(state, this.ofModule.moduleNameTrim).modulePrimaryKey,
        );
        this.isViewModeState = store.select(
            (state) => processDataReducer.getProcessDataState(state, this.ofModule.moduleNameTrim).isViewMode,
        );
        this.editingWidgetsState = store.select(
            (state) =>
                widgetContentReducer.getWidgetContentDetailState(state, this.ofModule.moduleNameTrim).editingWidgets,
        );
        this.requestDownloadPdfState = store.select(
            (state) => backofficeReducer.getBackofficeState(state, this.ofModule.moduleNameTrim).requestDownloadPdf,
        );
        this.requestGoToTrackingPageState = store.select(
            (state) =>
                backofficeReducer.getBackofficeState(state, this.ofModule.moduleNameTrim).requestGoToTrackingPage,
        );
        this.requestOpenReturnRefundModuleState = store.select(
            (state) =>
                backofficeReducer.getBackofficeState(state, this.ofModule.moduleNameTrim).requestOpenReturnRefundModule,
        );
        this.isHiddenParkedItemState = store.select(
            (state) =>
                moduleSettingReducer.getModuleSettingState(state, this.ofModule.moduleNameTrim).isHiddenParkedItem,
        );
        this.formEditModeState = store.select(
            (state) => processDataReducer.getProcessDataState(state, this.ofModule.moduleNameTrim).formEditMode,
        );
        this.isShowTabButtonState = store.select(
            (state) => tabButtonReducer.getTabButtonState(state, this.ofModule.moduleNameTrim).isShow,
        );

        this.initHotkeys();
    }

    private subscribe() {
        this.subcribeModulePrimaryKeyState();
        this.subcribeActiveModuleState();
        this.subcribeSubModulesState();
        this.subcribeActiveSubModuleState();
        this.subcribeSelectedParkedItemState();
        this.subcribeSelectedSearchResultState();
        this.subcribeTabHeaderDataModel();
        this.subcribeSelectedTabState();
        this.subscribeSelectedSimpleTabState();
        this.subcribeModuleSettingState();
        this.subcribeViewModeState();
        this.subcribeFormDirtyState();
        this.subscribeNewOtherTabState();
        this.subscribeNewSimpleTabState();
        this.subscribeRequestSaveState();
        this.subcribeIsViewModeState();
        this.subscribeEditingWidgetsState();
        this.subcribeUpdateMainTabState();
        this.subcribeRequestLoadTabsState();
        this.subcribeRequestDownloadPdfState();
        this.subcribeRequestGoToTrackingPageState();
        this.subcribeRequestOpenReturnRefundModuleState();
        this.subcribeNewMainTabState();
        this.subcribeIsHiddenParkedItemState();
        this.subscribeFormEditModeState();
        this.subscribeIsShowTabButtonState();
        //this.requestOPSaveAndRunAsEmailState();
    }

    public ngOnInit() {
        this.subscribe();
        this.getModuleSetting();

        //Fix bug: click create new in welcome screen, then missing other tabs
        this.loadUndergroundTabs(this.ofModule);

        if (this.ofModule && this.ofModule.idSettingsGUI === MenuModuleId.selectionCampaign) {
            this.getCampaign();
        }
        // this.hotkeysService.add(this.ctrlS);
    }

    ngAfterViewInit() {
        this.getModuleToPersonType();
    }

    private needToSaveCacheGlobalSetting: boolean = false;
    private getModuleSetting() {
        let isGetData = true;

        switch (this.ofModule.idSettingsGUIParent) {
            case MenuModuleId.tools:
            case MenuModuleId.statistic:
            case MenuModuleId.briefe:
            case MenuModuleId.logistic:
            case MenuModuleId.selection:
                break;
            default:
                switch (this.ofModule.idSettingsGUI) {
                    case MenuModuleId.briefe:
                    case MenuModuleId.logistic:
                        //do nothing
                        isGetData = false;
                        break;
                    default:
                        break;
                }
                break;
        } //switch

        if (!isGetData) return;
        zip(
            this.moduleSettingService.getModuleSetting(
                null,
                null,
                this.ofModule.idSettingsGUI.toString(),
                ModuleType.LAYOUT_SETTING,
            ),
            this.globalSettingService.getAllGlobalSettings(this.ofModule.idSettingsGUI).delay(500),
        ).subscribe(
            (response) => {
                this.appErrorHandler.executeAction(() => {
                    const moduleSettingDefault = response[0];
                    const allModuleSettings = response[1] as any;
                    let isLoadModuleSetting = true;
                    if (allModuleSettings && allModuleSettings.length > 0) {
                        const globalSettingName = String.Format(
                            '{0}_{1}',
                            this.globalSettingConstant.moduleLayoutSetting,
                            String.hardTrimBlank(this.ofModule.moduleName),
                        );
                        let moduleSettingItem = allModuleSettings.find(
                            (x) => x.globalName && x.idSettingsGlobal && x.globalName === globalSettingName,
                        );
                        if (moduleSettingItem && moduleSettingItem.idSettingsGlobal && moduleSettingItem.globalName) {
                            moduleSettingItem = JSON.parse(moduleSettingItem.jsonSettings);
                            if (moduleSettingItem) {
                                isLoadModuleSetting = false;
                                const afterMergeModule = Uti.mergeModuleSetting(
                                    moduleSettingDefault['item'],
                                    moduleSettingItem['item'],
                                );
                                this.store.dispatch(
                                    this.moduleSettingActions.loadModuleSettingSuccess(afterMergeModule, this.ofModule),
                                );
                            }
                        }
                    }
                    // If load from GlobalSettings no result -> get from ModuleSettings
                    if (isLoadModuleSetting) {
                        this.needToSaveCacheGlobalSetting = true;

                        this.store.dispatch(
                            this.moduleSettingActions.loadModuleSetting(
                                this.ofModule,
                                null,
                                null,
                                this.ofModule.idSettingsGUI.toString(),
                                ModuleType.LAYOUT_SETTING,
                            ),
                        );
                    }
                });
            },
            (error) => {
                Uti.logError(error);
            },
        );
    }

    private getModuleToPersonType() {
        this.commonService.getModuleToPersonType().subscribe((response: ApiResultResponse) => {
            this.appErrorHandler.executeAction(() => {
                if (!Uti.isResquestSuccess(response) || !response.item.length) {
                    return;
                }
                const result = {};
                for (const item of response.item) {
                    result[item.idSettingsGUI] = item.idRepPersonType;
                }
                this.store.dispatch(this.xnCommonActions.getModuleToPersonType(result, this.ofModule));
            });
        });
    }

    public ngOnDestroy() {
        // this.hotkeysService.remove(this.ctrlS);
        Uti.unsubscribe(this);
    }

    private initHotkeys() {
        //this.ctrlS = new Hotkey('ctrl+s', (event: KeyboardEvent): boolean => {
        //        // hack to click document to exit editing mode of table before saving
        //        $(document).click();
        //        if (!this.isViewMode) {
        //            this.store.dispatch(this.processDataActions.requestSave());
        //            this.modalService.hideModal();
        //        }
        //        if (this.editingWidgets.length) {
        //            this.store.dispatch(this.widgetDetailActions.requestSave());
        //        }
        //        return false; // Prevent bubbling
        //    },
        //        ['INPUT', 'SELECT', 'TEXTAREA']
        //    );
    }

    private subcribeSelectedParkedItemState() {
        this.selectedParkedItemStateSubscription = this.selectedParkedItemState.subscribe(
            (selectedParkedItemState: any) => {
                this.appErrorHandler.executeAction(() => {
                    if (isEmpty(selectedParkedItemState) && !isEmpty(this.selectedParkedItem)) {
                        // not remove tabs in SaveAndNext case
                        if (
                            this.requestSave &&
                            (this.requestSave.savingMode === RequestSavingMode.SaveAndNext ||
                                this.requestSave.savingMode === RequestSavingMode.SaveOnly)
                        ) {
                            return;
                        }

                        this.selectedParkedItem = null;
                        this.selectedEntity = null;

                        if (!this.selectedEntity && !this.selectedSearchResult) {
                            if (this.ofModule.idSettingsGUI != ModuleList.OrderDataEntry.idSettingsGUI) {
                                this.store.dispatch(this.tabSummaryActions.removeAllTabs(this.ofModule));
                            }

                            this.store.dispatch(this.processDataActions.setSelectedEntity(this.ofModule, null));
                        }

                        return;
                    }

                    if (isEqual(this.selectedParkedItem, selectedParkedItemState)) {
                        this.store.dispatch(
                            this.processDataActions.setSelectedEntity(
                                this.ofModule,
                                selectedParkedItemState,
                                true,
                                this.modulePrimaryKey,
                            ),
                        );
                        return;
                    }

                    if (!selectedParkedItemState) {
                        return;
                    }

                    this.selectedParkedItem = cloneDeep(selectedParkedItemState);

                    if (!isEmpty(this.selectedParkedItem)) {
                        if (this.selectedParkedItem.isNew) {
                            this.turnEditMode();
                            this.newMainTab();
                            this.newTabConfig = this.tabService.createNewTabConfig(
                                true,
                                this.ofModule,
                                this.selectedTab,
                            );
                        } else {
                            if (
                                this.selectedParkedItem &&
                                this.selectedParkedItem.id &&
                                this.selectedParkedItem.id.value
                            ) {
                                // not change to view mode in SaveAndNext case
                                if (
                                    this.requestSave &&
                                    (this.requestSave.savingMode === RequestSavingMode.SaveAndNext ||
                                        this.requestSave.savingMode === RequestSavingMode.SaveOnly)
                                ) {
                                    this.store.dispatch(
                                        this.parkedItemActions.requestSaveParkedItemList(this.ofModule),
                                    );
                                    this.requestSave = null;
                                    return;
                                }

                                this.selectedEntity = this.selectedParkedItem;

                                this.store.dispatch(
                                    this.processDataActions.setSelectedEntity(
                                        this.ofModule,
                                        this.selectedEntity,
                                        true,
                                        this.modulePrimaryKey,
                                    ),
                                );

                                this.loadTabs(this.ofModule, this.selectedEntity);

                                if (!this.isViewMode) {
                                    this.store.dispatch(this.processDataActions.viewMode(this.ofModule));
                                    this.store.dispatch(this.processDataActions.turnOffFormEditMode(this.ofModule));
                                }
                            } else if (
                                !(this.selectedSearchResult && this.selectedSearchResult[this.modulePrimaryKey])
                            ) {
                                this.store.dispatch(this.tabSummaryActions.removeAllTabs(this.ofModule));
                            }
                        }

                        this.store.dispatch(this.processDataActions.clearSearchResult(this.ofModule));
                    }
                });
            },
        );
    }

    private subcribeNewMainTabState() {
        this.newMainTabSubscription = this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return (
                        action.type === ProcessDataActions.NEW_MAIN_TAB &&
                        action.module.idSettingsGUI == this.ofModule.idSettingsGUI
                    );
                }),
            )
            .subscribe(() => {
                this.appErrorHandler.executeAction(() => {
                    if (!this.isHiddenParkedItem) {
                        const newParkedItem = new ParkedItemModel();
                        newParkedItem.isNew = true;
                        this.store.dispatch(this.parkedItemActions.addDraftItem(newParkedItem, this.ofModule));

                        newParkedItem[this.modulePrimaryKey] = '';
                        this.store.dispatch(
                            this.processDataActions.setSelectedEntity(
                                this.ofModule,
                                newParkedItem,
                                true,
                                this.modulePrimaryKey,
                            ),
                        );
                    } else {
                        this.turnEditMode();
                        this.newMainTab();
                        this.newTabConfig = this.tabService.createNewTabConfig(true, this.ofModule, this.selectedTab);
                    }
                });
            });
    }

    private subcribeIsHiddenParkedItemState() {
        this.isHiddenParkedItemStateSubscription = this.isHiddenParkedItemState.subscribe(
            (isHiddenParkedItemState: boolean) => {
                this.appErrorHandler.executeAction(() => {
                    this.isHiddenParkedItem = isHiddenParkedItemState;

                    if (this.isHiddenParkedItem) {
                        this.store.dispatch(this.parkedItemActions.removeAllParkedItem(this.ofModule));
                    }
                });
            },
        );
    }

    private subcribeSelectedSearchResultState() {
        this.selectedSearchResultStateSubscription = this.selectedSearchResultState.subscribe(
            (selectedSearchResultState: SearchResultItemModel) => {
                this.appErrorHandler.executeAction(() => {
                    if (isEmpty(selectedSearchResultState) && !isEmpty(this.selectedSearchResult)) {
                        this.selectedSearchResult = null;
                        this.selectedEntity = null;

                        if (!this.selectedEntity && !this.selectedParkedItem) {
                            this.store.dispatch(this.tabSummaryActions.removeAllTabs(this.ofModule));
                            this.store.dispatch(this.processDataActions.setSelectedEntity(this.ofModule, null));
                        }
                        return;
                    }

                    if (isEqual(this.selectedSearchResult, selectedSearchResultState)) {
                        this.store.dispatch(
                            this.processDataActions.setSelectedEntity(
                                this.ofModule,
                                selectedSearchResultState,
                                false,
                                this.modulePrimaryKey,
                            ),
                        );
                        return;
                    }

                    this.selectedSearchResult = cloneDeep(selectedSearchResultState);

                    if (!isEmpty(this.selectedSearchResult)) {
                        if (this.selectedSearchResult && this.selectedSearchResult[this.modulePrimaryKey]) {
                            this.selectedEntity = cloneDeep(this.selectedSearchResult);

                            this.store.dispatch(
                                this.processDataActions.setSelectedEntity(
                                    this.ofModule,
                                    this.selectedEntity,
                                    false,
                                    this.modulePrimaryKey,
                                ),
                            );

                            this.loadTabs(this.ofModule, this.selectedEntity);

                            if (!this.isViewMode) {
                                this.store.dispatch(this.processDataActions.viewMode(this.ofModule));
                                this.store.dispatch(this.processDataActions.turnOffFormEditMode(this.ofModule));
                            }
                        } else if (
                            this.selectedParkedItem &&
                            this.selectedParkedItem.id &&
                            this.selectedParkedItem.id.value
                        ) {
                            this.store.dispatch(this.tabSummaryActions.removeAllTabs(this.ofModule));
                        }

                        this.store.dispatch(this.parkedItemActions.unselectParkedItem(this.ofModule));
                    }
                });
            },
        );
    }

    private subcribeSubModulesState() {
        this.subModulesStateSubscription = this.subModulesState.subscribe((subModulesState: Module[]) => {
            this.appErrorHandler.executeAction(() => {
                if (!this.activeModule || this.router.url.indexOf(this.activeModule.moduleNameTrim) === -1) {
                    return;
                }

                if (
                    subModulesState.length &&
                    (subModulesState[0].idSettingsGUI == -1 ||
                        subModulesState[0].idSettingsGUIParent != this.activeModule.idSettingsGUI)
                ) {
                    return;
                }

                this.subModules = subModulesState;
            });
        });
    }

    private subcribeActiveModuleState() {
        this.activeModuleStateSubscription = this.activeModuleState.subscribe((activeModuleState: Module) => {
            this.appErrorHandler.executeAction(() => {
                if (isEmpty(activeModuleState)) {
                    this.activeModule = null;
                    this.store.dispatch(this.moduleActions.setUsingModule(null));
                    return;
                }

                if (this.ofModule && this.ofModule.moduleNameTrim !== 'Base') {
                    // Change other module, then detach the old module to disable detection changes check.
                    if (this.ofModule.moduleNameTrim != activeModuleState.moduleNameTrim) {
                        this.ref.detach();
                        return;
                    } else {
                        this.ref.reattach();
                    }

                    if (activeModuleState.idSettingsGUI != MenuModuleId.briefe) {
                        this.store.dispatch(this.moduleActions.setUsingModule(activeModuleState));

                        this.activeModule = activeModuleState;

                        if (
                            activeModuleState.idSettingsGUI == MenuModuleId.orderDataEntry ||
                            activeModuleState.idSettingsGUI == MenuModuleId.systemManagement
                        ) {
                            this.loadTabs(activeModuleState, this.selectedEntity);
                        } else {
                            switch (activeModuleState.idSettingsGUIParent) {
                                case MenuModuleId.tools:
                                case MenuModuleId.briefe:
                                case MenuModuleId.logistic:
                                case MenuModuleId.statistic:
                                    this.loadTabs(activeModuleState, this.selectedEntity);
                                    break;

                                default:
                                    break;
                            }
                        }
                    }
                }
            });
        });
    }

    private subcribeActiveSubModuleState() {
        this.activeSubModuleStateSubscription = this.activeSubModuleState.subscribe((activeSubModuleState: Module) => {
            this.appErrorHandler.executeAction(() => {
                if (isEmpty(activeSubModuleState)) {
                    return;
                }

                if (
                    this.ofModule.idSettingsGUI == activeSubModuleState.idSettingsGUIParent ||
                    this.ofModule.idSettingsGUI != activeSubModuleState.idSettingsGUI
                ) {
                    return;
                }

                // Change other module, then detach the old module to disable detection changes check.
                if (this.ofModule.moduleNameTrim != activeSubModuleState.moduleNameTrim) {
                    this.ref.detach();
                    return;
                } else {
                    this.ref.reattach();
                }

                this.activeSubModule = activeSubModuleState;

                switch (activeSubModuleState.idSettingsGUIParent) {
                    case MenuModuleId.tools:
                    case MenuModuleId.statistic:
                    case MenuModuleId.briefe:
                    case MenuModuleId.logistic:
                        this.store.dispatch(this.moduleActions.setUsingModule(activeSubModuleState));
                        this.loadTabs(activeSubModuleState, this.selectedEntity);
                        break;

                    case MenuModuleId.processing:
                        this.store.dispatch(this.moduleActions.setUsingModule(activeSubModuleState));
                        break;

                    default:
                        break;
                }
            });
        });
    }

    private subcribeTabHeaderDataModel() {
        this.tabHeaderDataModelSubscription = this.tabHeaderDataModel.subscribe(
            (tabHeaderDataModel: TabSummaryModel[]) => {
                this.appErrorHandler.executeAction(() => {
                    this.tabList = tabHeaderDataModel;
                });
            },
        );
    }

    private subcribeSelectedTabState() {
        this.selectedTabStateSubscription = this.selectedTabState.subscribe((selectedTabState: TabSummaryModel) => {
            this.appErrorHandler.executeAction(() => {
                this.selectedTab = selectedTabState;
            });
        });
    }

    private subscribeSelectedSimpleTabState() {
        this.selectedSimpleTabStateSubscription = this.selectedSimpleTabState.subscribe(
            (selectedSimpleTabState: SimpleTabModel) => {
                this.appErrorHandler.executeAction(() => {
                    this.selectedSimpleTab = selectedSimpleTabState;
                });
            },
        );
    }

    private subcribeModuleSettingState() {
        this.moduleSettingStateSubscription = this.moduleSettingState.subscribe(
            (moduleSettingState: ModuleSettingModel[]) => {
                this.appErrorHandler.executeAction(() => {
                    if (!isEmpty(moduleSettingState) && moduleSettingState.length) {
                        if (!isEqual(moduleSettingState, this.moduleSetting)) {
                            this.moduleSetting = cloneDeep(moduleSettingState);
                            const jsonSettingObj = this.moduleSettingService.getValidJsonSetting(this.moduleSetting);
                            if (jsonSettingObj) {
                                //If load from GlobalSettings no result -> get from ModuleSettings and save cache for GlobalSettings
                                this.updateCacheGlobalSetting(this.moduleSetting[0]);

                                this.tabSetting = Uti.tryParseJson(jsonSettingObj.jsonSettings);

                                if (
                                    this.tabSetting.hasOwnProperty('AdditionalInfo') &&
                                    this.tabSetting.AdditionalInfo
                                ) {
                                    this.tabSetting.AdditionalInfo.accessRight = this.accessRightsService.getAccessRight(
                                        AccessRightTypeEnum.AdditionalInfo,
                                        {
                                            idSettingsGUIParent: this.ofModule.idSettingsGUIParent,
                                            idSettingsGUI: this.ofModule.idSettingsGUI,
                                        },
                                    );
                                }

                                if (
                                    !isNil(this.tabSetting.IsHiddenParkedItem) &&
                                    this.tabSetting.IsHiddenParkedItem == 1
                                ) {
                                    this.store.dispatch(
                                        this.parkedItemActions.requestTogglePanel(false, this.ofModule),
                                    );
                                    this.store.dispatch(
                                        this.parkedItemActions.toggleDisabledPanel(true, this.ofModule),
                                    );
                                } else {
                                    this.store.dispatch(
                                        this.parkedItemActions.toggleDisabledPanel(false, this.ofModule),
                                    );
                                }
                            }
                        }
                    } else {
                        this.moduleSetting = [];
                        this.tabSetting = null;
                    }
                });
            },
        );
    }

    private updateCacheGlobalSetting(moduleSetting: any) {
        if (
            !this.needToSaveCacheGlobalSetting ||
            !moduleSetting ||
            moduleSetting.moduleType != ModuleType.LAYOUT_SETTING
        )
            return;
        this.needToSaveCacheGlobalSetting = false;

        /* moduleSetting:
            idSettingsModule: 159
            objectNr: "38"
            moduleName: "User Management Layout Setting"
            moduleType: "LayoutSetting"
            description: "User Management Layout Setting",
            jsonSettings: "..."
        */

        const globalSettingName = String.Format(
            '{0}_{1}',
            this.globalSettingConstant.moduleLayoutSetting,
            String.hardTrimBlank(this.ofModule.moduleName),
        );
        const globalSettingItem = new GlobalSettingModel({
            globalName: globalSettingName,
            description: 'Module Layout Setting',
            globalType: this.globalSettingConstant.moduleLayoutSetting,
            idSettingsGUI: this.ofModule.idSettingsGUI,
            isActive: true,
            objectNr: this.ofModule.idSettingsGUI.toString(),
            jsonSettings: JSON.stringify({ item: [moduleSetting] }),
        });
        this.globalSettingService.saveUpdateCache(this.ofModule.idSettingsGUI, globalSettingItem);
    }

    private subcribeViewModeState() {
        this.viewModeStateSubscription = this.viewModeState.subscribe((viewModeState: boolean) => {
            this.appErrorHandler.executeAction(() => {
                if (viewModeState) {
                    this.restoreOriginData();
                }
            });
        });
    }

    private subcribeFormDirtyState() {
        this.formDirtyStateSubscription = this.formDirtyState.subscribe((formDirtyState: boolean) => {
            this.appErrorHandler.executeAction(() => {
                if (!isEqual(this.formDirty, formDirtyState)) {
                    this.formDirty = formDirtyState;
                }
            });
        });
    }

    private subscribeRequestSaveState() {
        this.requestSaveStateSubscription = this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return (
                        action.type === ProcessDataActions.REQUEST_SAVE &&
                        action.module.idSettingsGUI == this.ofModule.idSettingsGUI
                    );
                }),
                map((action: CustomAction) => {
                    return {
                        savingMode: action.payload,
                    };
                }),
            )
            .subscribe((data: any) => {
                this.appErrorHandler.executeAction(() => {
                    this.requestSave = data;
                });
            });
    }

    private subcribeModulePrimaryKeyState() {
        this.modulePrimaryKeyStateSubscription = this.modulePrimaryKeyState.subscribe((key: string) => {
            this.appErrorHandler.executeAction(() => {
                this.modulePrimaryKey = key;
            });
        });
    }

    private subcribeIsViewModeState() {
        this.isViewModeStateSubscription = this.isViewModeState.subscribe((isViewModeState: boolean) => {
            this.appErrorHandler.executeAction(() => {
                this.isViewMode = isViewModeState;

                if (!isViewModeState) {
                    $(this.elementRef.nativeElement).addClass('edit-mode');
                } else {
                    $(this.elementRef.nativeElement).removeClass('edit-mode');
                }
            });
        });
    }

    private subscribeEditingWidgetsState() {
        this.editingWidgetsStateSubscription = this.editingWidgetsState.subscribe(
            (editingWidgets: Array<EditingWidget>) => {
                this.appErrorHandler.executeAction(() => {
                    this.editingWidgets = editingWidgets;
                });
            },
        );
    }

    private subscribeNewOtherTabState() {
        this.newOtherTabSubscription = this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return (
                        action.type === ProcessDataActions.NEW_OTHER_TAB &&
                        action.module.idSettingsGUI == this.ofModule.idSettingsGUI
                    );
                }),
            )
            .subscribe(() => {
                this.appErrorHandler.executeAction(() => {
                    this.turnEditMode();
                    this.newOtherTab();
                    this.newTabConfig = this.tabService.createNewTabConfig(false, this.ofModule, this.selectedTab);
                });
            });
    }

    private subscribeNewSimpleTabState() {
        this.newSimpleTabSubscription = this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return (
                        action.type === ProcessDataActions.NEW_SIMPLE_TAB &&
                        action.module.idSettingsGUI == this.ofModule.idSettingsGUI
                    );
                }),
            )
            .subscribe(() => {
                this.appErrorHandler.executeAction(() => {
                    this.turnEditMode();
                    this.newSimpleTab();
                    this.newTabConfig = this.tabService.createNewTabConfig(
                        false,
                        this.ofModule,
                        this.selectedTab,
                        this.selectedSimpleTab,
                        this.tabSetting,
                    );
                });
            });
    }

    /**
     * Edit mode
     */
    private subcribeUpdateMainTabState() {
        this.updateMainTabSubscription = this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return (
                        action.type === ProcessDataActions.UPDATE_MAIN_TAB &&
                        action.module.idSettingsGUI == this.ofModule.idSettingsGUI
                    );
                }),
            )
            .subscribe(() => {
                this.appErrorHandler.executeAction(() => {
                    this.turnEditMode();
                    this.newMainTab(this.selectedTab);
                    this.newTabConfig = this.tabService.createNewTabConfig(true, this.ofModule, this.selectedTab);
                });
            });
    }

    private subcribeRequestLoadTabsState() {
        this.requestLoadTabsSubscription = this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return (
                        action.type === TabSummaryActions.REQUEST_LOAD_TABS &&
                        action.module.idSettingsGUI == this.ofModule.idSettingsGUI
                    );
                }),
            )
            .subscribe(() => {
                this.appErrorHandler.executeAction(() => {
                    if (!isEmpty(this.selectedParkedItem) || !isEmpty(this.selectedSearchResult)) {
                        this.loadTabs(this.ofModule, this.selectedEntity);
                    }
                });
            });
    }

    private subcribeRequestDownloadPdfState() {
        this.requestDownloadPdfStateSubscription = this.requestDownloadPdfState.subscribe(
            (requestDownloadPdfState: any) => {
                this.appErrorHandler.executeAction(() => {
                    //if (requestDownloadPdfState) {
                    //    let selectedEntity: any = null;
                    //    if (requestDownloadPdfState.selectedEntity) {
                    //        selectedEntity = requestDownloadPdfState.selectedEntity;
                    //    } else {
                    //        selectedEntity = this.selectedParkedItem || this.selectedSearchResult;
                    //    }
                    //    if (isEmpty(selectedEntity)) {
                    //        this.toasterService.pop('warning', 'Warning', 'Please choose an order to export PDF');
                    //        return;
                    //    }
                    //    this.store.dispatch(this.backofficeActions.storeSelectedEntity(ModuleList.Backoffice, selectedEntity));
                    //    this.downloadPDF(selectedEntity);
                    //}
                });
            },
        );
    }

    private subcribeRequestGoToTrackingPageState() {
        this.requestGoToTrackingPageStateSubscription = this.requestGoToTrackingPageState.subscribe(
            (requestGoToTrackingPageState: any) => {
                this.appErrorHandler.executeAction(() => {
                    //if (requestGoToTrackingPageState) {
                    //    let selectedEntity: any = null;
                    //    if (requestGoToTrackingPageState.selectedEntity) {
                    //        selectedEntity = requestGoToTrackingPageState.selectedEntity;
                    //    } else {
                    //        selectedEntity = this.selectedParkedItem || this.selectedSearchResult;
                    //    }
                    //    if (isEmpty(selectedEntity)) {
                    //        this.toasterService.pop('warning', 'Warning', 'Please choose an order to get tracking information');
                    //        return;
                    //    }
                    //    this.store.dispatch(this.backofficeActions.storeSelectedEntity(ModuleList.Backoffice, selectedEntity));
                    //    this.gotoTrackingPage(selectedEntity);
                    //}
                });
            },
        );
    }

    private subcribeRequestOpenReturnRefundModuleState() {
        this.requestOpenReturnRefundModuleStateSubscription = this.requestOpenReturnRefundModuleState.subscribe(
            (requestOpenReturnRefundModuleState: any) => {
                this.appErrorHandler.executeAction(() => {
                    //if (requestOpenReturnRefundModuleState) {
                    //    let selectedEntity: any = null;
                    //    if (requestOpenReturnRefundModuleState.selectedEntity) {
                    //        selectedEntity = requestOpenReturnRefundModuleState.selectedEntity;
                    //    } else {
                    //        selectedEntity = this.selectedParkedItem || this.selectedSearchResult;
                    //    }
                    //    if (isEmpty(selectedEntity)) {
                    //        this.toasterService.pop('warning', 'Warning', 'Please choose an order to get return and refund information');
                    //        return;
                    //    }
                    //    this.gotoReturnRefundPage(selectedEntity);
                    //}
                });
            },
        );
    }

    private subscribeFormEditModeState() {
        this.formEditModeStateSubscription = this.formEditModeState.subscribe((formEditModeState: boolean) => {
            this.appErrorHandler.executeAction(() => {
                if (formEditModeState) {
                    $(this.elementRef.nativeElement).addClass('edit-form-mode');
                } else {
                    $(this.elementRef.nativeElement).removeClass('edit-form-mode');
                }
            });
        });
    }

    private subscribeIsShowTabButtonState() {
        this.isShowTabButtonStateSubscription = this.isShowTabButtonState.subscribe((isShowTabButtonState: boolean) => {
            this.appErrorHandler.executeAction(() => {
                this.isDesignMode = !isShowTabButtonState;
            });
        });
    }

    //private requestOPSaveAndRunAsEmailState() {
    //    this.requestOPSaveAndRunAsEmailSubscription = this.dispatcher.filter((action: CustomAction) => {
    //        return action.type === ProcessDataActions.REQUEST_SEND_OP_EMAIL && this.ofModule.idSettingsGUI == action.module.idSettingsGUI && this.ofModule.idSettingsGUI == MenuModuleId.orderProcessing;
    //    }).subscribe((action: CustomAction) => {
    //        this.appErrorHandler.executeAction(() => {
    //            this.showSendEmailDialog = true;

    //            setTimeout(() => {
    //                if (this.sendEmailDialog) {
    //                    this.sendEmailDialog.showDialog = true;
    //                    this.sendEmailDialog.pdfs = action.payload;
    //                }
    //            })
    //        });
    //    });
    //}

    //public onCloseSendEmailDialog() {
    //    this.showSendEmailDialog = false;
    //}

    private downloadPDF(selectedEntity) {
        let fileName =
            selectedEntity.InvoicePDF ||
            selectedEntity.PDF ||
            selectedEntity.invoicePDF ||
            selectedEntity.invoicePdf ||
            selectedEntity.pdf;
        let pdfUrl = '/api/FileManager/GetScanFile?name=';
        if (fileName && Configuration.PublicSettings.fileShareUrl) {
            if (fileName.indexOf(Configuration.PublicSettings.fileShareUrl) !== -1) {
                pdfUrl += fileName;
            } else {
                pdfUrl += Configuration.PublicSettings.fileShareUrl + fileName;
            }

            var a = document.createElement('a');
            a.href = pdfUrl;
            a.download = 'result';
            document.body.appendChild(a);
            a.click();

            setTimeout(() => {
                a.remove();
            }, 200);

            return;
        }

        this.toasterService.pop('error', 'Failed', 'No PDF file to export');
    }

    private gotoTrackingPage(selectedEntity: any) {
        let showError = false;
        if (!selectedEntity) {
            showError = true;
        } else {
            let trackingUrl = selectedEntity.Tracking || selectedEntity.track;
            if (!trackingUrl) {
                showError = true;
            }
        }

        if (showError) {
            this.toasterService.pop('error', 'Failed', 'No tracking information');
            return;
        }

        window.open(selectedEntity.Tracking);
    }

    private gotoReturnRefundPage(selectedEntity) {
        //this.modalService.confirmMessageHtmlContent(new MessageModel({
        //    headerText: 'Confirmation',
        //    message: `<p>Do you want to go to Return & Refund page?</p>`,
        //    callBack1: () => {
        //        this.store.dispatch(this.backofficeActions.storeSelectedEntity(ModuleList.Backoffice, selectedEntity));
        //        this.store.dispatch(this.moduleActions.requestChangeSubModule(MenuModuleId.backoffice, MenuModuleId.returnRefund));
        //    }
        //}));
    }

    private restoreOriginData() {
        this.store.dispatch(this.moduleSettingActions.loadOriginModuleSetting(this.ofModule));
        this.store.dispatch(this.tabSummaryActions.loadOriginTabs(this.ofModule));
        this.newTabConfig = null;
    }

    private turnEditMode() {
        this.storeCurrentData();
        this.store.dispatch(this.processDataActions.editMode(this.ofModule));
    }

    private newMainTab(tabData?) {
        const newTabs = [];
        const newMainTab = new TabSummaryModel({
            tabSummaryInfor: new TabSummaryInfoModel({
                tabID: !tabData ? this.uti.getDefaultMainTabId(this.ofModule) : tabData.tabSummaryInfor.tabID,
                tabName: !tabData ? this.uti.getDefaultMainTabName(this.ofModule) : tabData.tabSummaryInfor.tabName,
                tabType: !tabData ? '1' : tabData.tabSummaryInfor.tabType,
                lastUpdate: !tabData ? new Date() : tabData.tabSummaryInfor.lastUpdate,
                isMainTab: !tabData ? true : tabData.tabSummaryInfor.isMainTab,
            }),
            tabSummaryData: [],
            active: true,
            accessRight: new AccessRightModel({ read: true, new: true, edit: true, delete: true, export: true }),
        });
        newTabs.push(newMainTab);

        const newModuleSetting = cloneDeep(this.moduleSetting);
        if (!newModuleSetting.length || !this.moduleSettingService.isJson(newModuleSetting[0].jsonSettings)) {
            return;
        }

        if (this.ofModule.idSettingsGUI === MenuModuleId.businessCosts) {
            this.subTabSetting = JSON.parse(newModuleSetting[0].jsonSettings);
        } else {
            this.subTabSetting = null;
        }

        const newJsonSettings = JSON.parse(newModuleSetting[0].jsonSettings);
        newJsonSettings.AdditionalInfo = null;
        newJsonSettings.ModuleName = this.ofModule.moduleName;
        newJsonSettings.ModuleID = this.ofModule.idSettingsGUI;
        newJsonSettings.Content.CustomTabs = newJsonSettings.Content.CustomTabs.slice(0, 1);
        newJsonSettings.Content.CustomTabs[0].TabID = this.uti.getDefaultMainTabId(this.ofModule);
        if (newJsonSettings.Content.CustomTabs[0].Split) {
            delete newJsonSettings.Content.CustomTabs[0].Split;
        }
        newJsonSettings.Content.CustomTabs[0].Page = {};
        newJsonSettings.Content.CustomTabs[0].Page.PageId = this.uti.getEmptyGuid();
        newModuleSetting[0].jsonSettings = JSON.stringify(newJsonSettings);
        this.store.dispatch(this.tabSummaryActions.loadTabsForNew(newTabs, true, this.ofModule));
        this.store.dispatch(this.moduleSettingActions.loadModuleSettingForNew(newModuleSetting, this.ofModule));
    }

    private newOtherTab() {
        let newTabs = cloneDeep(this.tabList);

        if (this.ofModule.idSettingsGUI === MenuModuleId.businessCosts) {
            newTabs = [newTabs[1]];
        } else {
            newTabs = this.tabService.disabledTab(newTabs, this.selectedTab);
        }

        let newModuleSetting = cloneDeep(this.moduleSetting);
        let newJsonSettings = cloneDeep(this.tabSetting);

        if (this.ofModule.idSettingsGUI === MenuModuleId.businessCosts) {
            this.subTabSetting = JSON.parse(newModuleSetting[0].jsonSettings);
        } else {
            this.subTabSetting = null;
        }

        newJsonSettings = this.moduleSettingService.insertNewOtherTabSetting(newJsonSettings, this.selectedTab);
        newModuleSetting = this.moduleSettingService.insertNewJsonSetting(newModuleSetting, newJsonSettings);

        this.store.dispatch(
            this.tabSummaryActions.loadTabsForNew(
                newTabs,
                this.ofModule.idSettingsGUI === MenuModuleId.businessCosts ? true : false,
                this.ofModule,
            ),
        );
        this.store.dispatch(this.moduleSettingActions.loadModuleSettingForNew(newModuleSetting, this.ofModule));
    }

    private newSimpleTab() {
        let newTabs = cloneDeep(this.tabList);
        newTabs = this.tabService.disabledTab(newTabs, this.selectedTab);

        let newModuleSetting = cloneDeep(this.moduleSetting);
        let newJsonSettings = cloneDeep(this.tabSetting);
        newJsonSettings = this.moduleSettingService.insertNewSimpleTabSetting(
            newJsonSettings,
            this.selectedTab,
            this.selectedSimpleTab,
        );
        newModuleSetting = this.moduleSettingService.insertNewJsonSetting(newModuleSetting, newJsonSettings);

        this.store.dispatch(this.tabSummaryActions.loadTabsForNew(newTabs, false, this.ofModule));
        this.store.dispatch(this.moduleSettingActions.loadModuleSettingForNew(newModuleSetting, this.ofModule));
    }

    private storeCurrentData() {
        if (this.splitter.hasChanged) {
            this.globalSettingService
                .getModuleLayoutSetting(this.ofModule.idSettingsGUI, String.hardTrimBlank(this.ofModule.moduleName))
                .subscribe((data: any) => {
                    this.store.dispatch(this.moduleSettingActions.loadModuleSettingSuccess(data, this.ofModule));
                });
        }
        this.store.dispatch(this.moduleSettingActions.storeOriginModuleSetting(this.ofModule));
        this.store.dispatch(this.tabSummaryActions.storeOriginTabs(this.ofModule));
    }

    private loadTabs(moduleInfo: Module, selectedEntity: any) {
        if (!moduleInfo) {
            return;
        }

        let idObject = !selectedEntity
            ? moduleInfo.idSettingsGUI
            : typeof selectedEntity[this.modulePrimaryKey] === 'object'
            ? selectedEntity[this.modulePrimaryKey].value
            : selectedEntity[this.modulePrimaryKey];

        const param = {
            module: moduleInfo,
            idObject: idObject,
        };

        this.store.dispatch(this.tabSummaryActions.loadTabs(param));
    }

    private getCampaign() {
        this.commonService
            .getListComboBox(ComboBoxTypeConstant.campaign)
            .subscribe((response: ApiResultResponse) => {});
    }

    private loadUndergroundTabs(moduleInfo: Module) {
        const param = {
            module: moduleInfo,
            idObject: '',
        };

        this.tabService.getTabSummaryInfor(param).subscribe((response: ApiResultResponse) => {
            if (!Uti.isResquestSuccess(response)) {
                return;
            }
            this.store.dispatch(this.tabSummaryActions.storeUndergroundTabs(response.item, this.ofModule));
        });
    }
}
