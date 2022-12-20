import {
    Component,
    OnInit,
    OnDestroy,
    ChangeDetectorRef,
    ViewChild,
    ElementRef,
    ChangeDetectionStrategy,
    HostListener,
    AfterViewInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import isEmpty from 'lodash-es/isEmpty';
import isEqual from 'lodash-es/isEqual';
import cloneDeep from 'lodash-es/cloneDeep';
import isNil from 'lodash-es/isNil';
import get from 'lodash-es/get';
import includes from 'lodash-es/includes';

import {
    AppErrorHandler,
    PropertyPanelService,
    DomHandler,
    GlobalSettingService,
    ModuleService,
    UserService,
    SignalRService,
    NotificationService,
} from '@app/services';
import {
    Module,
    TabSummaryModel,
    AdditionalInfromationTabModel,
    GlobalSettingModel,
    SignalRNotifyModel,
    User,
} from '@app/models';
import { Store, ReducerManagerDispatcher } from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import { combineLatest, forkJoin, Observable, Subject, Subscription } from 'rxjs';
import {
    ModuleActions,
    TabSummaryActions,
    ModuleSettingActions,
    ProcessDataActions,
    ParkedItemActions,
    SearchResultActions,
    PropertyPanelActions,
    AdditionalInformationActions,
    LayoutInfoActions,
    CustomAction,
    LayoutSettingActions,
    TabButtonActions,
    WidgetTemplateActions,
    GridActions,
    GlobalSearchActions,
    AdministrationDocumentActionNames,
} from '@app/state-management/store/actions';
import {
    MenuModuleId,
    GlobalSettingConstant,
    Configuration,
    LocalStorageKey,
    SignalRActionEnum,
    SignalRJobEnum,
    MainNotificationTypeEnum,
    NotificationStatusEnum,
} from '@app/app.constants';
import * as mainModuleReducer from '@app/state-management/store/reducer/main-module';
import * as tabSummaryReducer from '@app/state-management/store/reducer/tab-summary';
import * as processDataReducer from '@app/state-management/store/reducer/process-data';
import * as additionalInformationReducer from '@app/state-management/store/reducer/additional-information';
import * as propertyPanelReducer from '@app/state-management/store/reducer/property-panel';
import * as widgetTemplateReducer from '@app/state-management/store/reducer/widget-template';
import * as layoutSettingReducer from '@app/state-management/store/reducer/layout-setting';
import * as parkedItemReducer from '@app/state-management/store/reducer/parked-item';
import { BaseComponent, ModuleList } from '@app/pages/private/base';
import { Uti } from '@app/utilities';
import { UserBoxComponent } from '@app/shared/components/user-box';
import * as uti from '@app/utilities';
import { XnCommonActions } from '@app/state-management/store/actions';
import { filter, takeUntil, map } from 'rxjs/operators';
import { MatButton } from '@xn-control/light-material-ui/button';
import { CloudConnectionStatus } from '@app/models/cloud-connection.model';
import { CloudConfigurationService } from '@app/pages/private/modules/mydm/services';
import { EnableWidgetTemplateState } from '@app/models/widget-template/enable-widget-template.model';
import { UpdateUserProfileAction } from '../../../state-management/store/actions/app/app.actions';
import { FeedbackCombineComponent } from '../feedback/feedback-combine';
import { AdministrationDocumentSelectors } from '@app/state-management/store/reducer';

var cloudConnectionInterval = null;
const moduleExcludePopup = ['cloud', 'changepassword'];
@Component({
    selector: 'app-header',
    styleUrls: ['./app-header.component.scss'],
    templateUrl: './app-header.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppHeaderComponent extends BaseComponent implements OnInit, AfterViewInit, OnDestroy {
    public mainModules: Module[] = [];
    public subModules: Module[] = [];
    public activeModule: Module;
    public activeSubModule: Module;
    public isViewMode = true;
    private willChangeModule: Module;
    private willChangeSubModule: Module;
    private requestCreateNewFromModuleDropdown = false;
    public selectedEntity: any;
    private selectedTab: TabSummaryModel;
    private selectedAiTab: AdditionalInfromationTabModel;
    private requestChangeSubModule: any;
    public buildVersion = '';
    public gradientBackgroundStatus: boolean;
    private continueToSelectSubModule: string;
    public isFocus: boolean;
    public isHover: boolean;
    public searchText: string;
    public autoCloseDropdown = true;
    public checkedModuleIds: any[] = [];
    public isFeedbackLoading = false;
    public isSelectionProject = false;
    public isSignedIn = false;
    public isProUser = false;
    public moduleList = ModuleList;
    public isSubcribed: boolean;
    public allowShowPopupTestConnection: boolean;

    // Cloud connection
    public enableCloud = Configuration.PublicSettings.enableCloud;
    public cloudStatus = Configuration.PublicSettings.enableCloud
        ? CloudConnectionStatus.connecting
        : CloudConnectionStatus.connected;
    public isLockUI = Configuration.PublicSettings.enableCloud;
    public isHidePopup = false;
    public isCallAPI = false;
    public cloudConnectionStatus = CloudConnectionStatus;
    public countdown = 15;
    public enableNotificationPopup = Configuration.PublicSettings.enableNotificationPopup;
    private userData: User = new User();

    private companyName: string;
    private mainModulesStateSubscription: Subscription;
    private subModulesStateSubscription: Subscription;
    private activeModuleStateSubscription: Subscription;
    private activeSubModuleModelSubscription: Subscription;
    private selectedEntityStateSubscription: Subscription;
    private selectedTabStateSubscription: Subscription;
    private selectedAiTabStateSubscription: Subscription;
    private requestCreateNewModuleItemStateSubscription: Subscription;
    private isViewModeStateSubscription: Subscription;
    private widgetTemplateModeStateSubscription: Subscription;
    private layoutSettingModeStateSubscription: Subscription;
    private requestChangeModuleStateSubscription: Subscription;
    private requestChangeSubModuleStateSubscription: Subscription;
    private globalPropertiesStateSubscription: Subscription;
    private globalSettingSerSubscription: Subscription;
    private getGlobalSettingSubscription: Subscription;
    private okToCreateNewFromModuleDropdownSubscription: Subscription;
    private okToChangeModuleSubscription: Subscription;
    private requestClearPropertiesSuccessSubscription: Subscription;
    private okToChangeSubModuleSubscription: Subscription;
    private showFeedbackCompleteSubscription: Subscription;
    private triggerClickNewModuleSubscription: Subscription;
    private testConnectionSubscription: Subscription;
    private getCompanySubscription: Subscription;
    private aprrovalReceivedSubscription: Subscription;

    public isParkedItemCollapsedState: Observable<boolean>;
    public mainModulesState: Observable<Module[]>;
    public subModulesState: Observable<Module[]>;
    public activeModuleState: Observable<Module>;
    private activeSubModuleModel: Observable<Module>;
    private selectedEntityState: Observable<any>;
    private selectedTabState: Observable<TabSummaryModel>;
    private selectedAiTabState: Observable<AdditionalInfromationTabModel>;
    private requestCreateNewModuleItemState: Observable<any>;
    private isViewModeState: Observable<boolean>;
    private widgetTemplateModeState: Observable<EnableWidgetTemplateState>;
    private layoutSettingModeState: Observable<boolean>;
    private requestChangeModuleState: Observable<any>;
    private requestChangeSubModuleState: Observable<any>;
    private globalPropertiesState: Observable<any>;
    public notiListener: Subject<any> = new Subject();

    @ViewChild('clearSearchElm')
    clearSearchBtn: MatButton;

    @ViewChild('searchInputElm')
    searchInputElm: ElementRef;

    @ViewChild(UserBoxComponent)
    userBoxComponent: UserBoxComponent;

    @ViewChild('feedbackCombine') feedbackCombine: FeedbackCombineComponent;

    constructor(
        private store: Store<AppState>,
        private moduleActions: ModuleActions,
        private tabSummaryActions: TabSummaryActions,
        private moduleSettingActions: ModuleSettingActions,
        private processDataActions: ProcessDataActions,
        private parkedItemActions: ParkedItemActions,
        private searchResultActions: SearchResultActions,
        private appErrorHandler: AppErrorHandler,
        private propertyPanelActions: PropertyPanelActions,
        private additionalInformationActions: AdditionalInformationActions,
        private layoutInfoActions: LayoutInfoActions,
        private layoutSettingActions: LayoutSettingActions,
        private tabButtonActions: TabButtonActions,
        private globalSettingConstant: GlobalSettingConstant,
        private propertyPanelService: PropertyPanelService,
        private changeDetectorRef: ChangeDetectorRef,
        private domHandler: DomHandler,
        private dispatcher: ReducerManagerDispatcher,
        protected router: Router,
        private widgetTemplateActions: WidgetTemplateActions,
        private xnCommonActions: XnCommonActions,
        private globalSettingService: GlobalSettingService,
        private moduleService: ModuleService,
        private userService: UserService,
        private gridActions: GridActions,
        private uti: Uti,
        private consts: Configuration,
        private cloudServices: CloudConfigurationService,
        private signalRService: SignalRService,
        private notificationService: NotificationService,
        private activatedRoute: ActivatedRoute,
        private administrationDocumentSelectors: AdministrationDocumentSelectors,
    ) {
        super(router);

        this.userData = new Uti().getUserInfo();
        this.isSelectionProject = Configuration.PublicSettings.isSelectionProject;
        this.mainModulesState = store.select(mainModuleReducer.getMainModules);
        this.subModulesState = store.select((state) => state.mainModule.subModules);
        this.activeModuleState = store.select(mainModuleReducer.getActiveModule);
        this.activeSubModuleModel = store.select((state) => state.mainModule.activeSubModule);
        this.selectedEntityState = store.select(
            (state) => processDataReducer.getProcessDataState(state, this.ofModule.moduleNameTrim).selectedEntity,
        );
        this.selectedTabState = store.select(
            (state) => tabSummaryReducer.getTabSummaryState(state, this.ofModule.moduleNameTrim).selectedTab,
        );
        this.selectedAiTabState = store.select(
            (state) =>
                additionalInformationReducer.getAdditionalInformationState(state, this.ofModule.moduleNameTrim)
                    .additionalInfromationTabModel,
        );
        this.requestCreateNewModuleItemState = store.select((state) => state.mainModule.requestCreateNewModuleItem);
        this.isViewModeState = store.select(
            (state) => processDataReducer.getProcessDataState(state, this.ofModule.moduleNameTrim).isViewMode,
        );
        this.widgetTemplateModeState = store.select(
            (state) =>
                widgetTemplateReducer.getWidgetTemplateState(state, this.ofModule.moduleNameTrim).enableWidgetTemplate,
        );
        this.layoutSettingModeState = store.select(
            (state) =>
                layoutSettingReducer.getLayoutSettingState(state, this.ofModule.moduleNameTrim).enableLayoutSetting,
        );
        this.requestChangeModuleState = store.select((state) => state.mainModule.requestChangeModule);
        this.requestChangeSubModuleState = store.select((state) => state.mainModule.requestChangeSubModule);
        this.globalPropertiesState = store.select(
            (state) =>
                propertyPanelReducer.getPropertyPanelState(state, ModuleList.Base.moduleNameTrim).globalProperties,
        );
        this.isParkedItemCollapsedState = store.select(
            (state) => parkedItemReducer.getParkedItemState(state, this.ofModule.moduleNameTrim).isCollapsed,
        );
    }
    onRouteChanged() {
        this.buildModuleFromRoute();
        this.store.dispatch(this.gridActions.requestRefresh(this.ofModule));
    }

    ngOnInit(): void {
        const currentUser = this.userService.getCurrentUser();
        if (currentUser && currentUser.id && !location.pathname.startsWith('/auth/')) {
            // console.log('ngOnInit: checkLogin logged');
            this.subcribe();
            this.doWorkIfLogined();
        }

        this.userService.currentUser.pipe(takeUntil(this.getUnsubscriberNotifier())).subscribe((user) => {
            if (!user || !user.id) {
                this.isSignedIn = false;
                this.changeDetectorRef.detectChanges();
                this.clearCloudConnectionInterval();
            } else {
                // this.isProUser = user.encrypted !== UserRoles.PersonalUser;
                //Pro user
                this.isProUser = true;
            }
        });
        this.uti.setCustomObjectRotateControl();
        this.subscribeLoginSuccess();
    }

    ngAfterViewInit() {
        combineLatest([
            this.administrationDocumentSelectors.actionSuccessOfSubtype$(
                AdministrationDocumentActionNames.GET_DOCUMENT_TREE,
            ),
            this.activatedRoute.queryParamMap,
        ])
            .pipe(
                filter(() => this.ofModule.idSettingsGUI === ModuleList.Document.idSettingsGUI),
                map(([action, param]: [CustomAction, any]) => {
                    return {
                        documentTrees: action.payload || [],
                        param: param.params || {},
                    };
                }),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((dataMap) => {
                const item = dataMap.documentTrees.find((tree) => {
                    return dataMap.param.idTreeRoot == tree.data?.idDocumentTree;
                });
                this.activeModule.moduleName = item?.data.groupName;
                this.changeDetectorRef.detectChanges();
            });
    }

    ngOnDestroy() {
        Uti.unsubscribe(this);
        this.clearCloudConnectionInterval();
    }

    private subcribe() {
        if (this.isSubcribed) return;

        // console.log('Subcribe');

        this.isSubcribed = true;
        this.subscribeMainModulesState();
        this.subscribeSubModulesState();
        this.subscribeActiveModuleModel();
        this.subscribeActiveSubModuleModel();
        this.subcribeSelectedEntityState();
        this.subcribeSelectedTabState();
        this.subcribeSelectedAiTabState();
        this.subcribeRequestCreateNewModuleItemState();
        this.subscribeRequestClearPropertiesSuccessState();
        this.subscribeIsViewModeState();
        this.subscribeWidgetTemplateModeState();
        this.subscribeLayoutSettingModeState();
        this.subscribeOkToCreateNewFromModuleDropdownState();
        this.subscribeOkToChangeModuleState();
        this.subscribeOkToChangeSubModuleState();
        this.subscribeRequestChangeModuleState();
        this.subscribeRequestChangeSubModuleState();
        this.subscribeGlobalProperties();
        this.subscribeShowFeedbackCompleteState();
        this.subscribeTriggerClickNewModuleState();
        this.subscribeRequestToChangeActiveModuleName();
        this.subscribeTestConnection();
        this.subscribeGetCompany();
        this.subscribeListenSignalRMessage();
        this.subscribeCounterNotification();
        this.subscribeRecieveDataFromThumbnailList();
        this.subscribeShowFeedbackClickedState();
        this.getAppVersion();
    }

    private doWorkIfLogined() {
        // console.log('DoWork If logined');
        this.store.dispatch(this.moduleActions.loadMainModules());
        this.isSignedIn = true;
        if (Configuration.PublicSettings.enableCloud) {
            setTimeout(() => {
                this.allowShowPopupTestConnection = true;
                this.testCloudConnection();
            }, 3000);
        }

        this.userService.loginByUserId(null, () => {
            // console.log('LoginByUserId');
            this.store.dispatch(new UpdateUserProfileAction(this.userService.getCurrentUser()));
        });
    }

    public feedbackClicked() {
        this.isFeedbackLoading = true;
        this.changeDetectorRef.detectChanges();
        this.store.dispatch(this.xnCommonActions.showFeedbackClicked(true));
        this.store.dispatch(this.xnCommonActions.storeFeedbacData({ isSendToAdmin: false, tabID: null }));
    }

    private clearCloudConnectionInterval() {
        if (cloudConnectionInterval) clearInterval(cloudConnectionInterval);
    }

    private registerEventControlSidebar() {
        //console.log('RegisterEventControlSidebar');

        /*
         * Before apply preload modules: When user clicks on the icon setting -> open the right tab settings. --> the bellow  code is not necessary
         * After apply preload modules: must apply the bellow code
         */
        setTimeout(() => {
            const $controlSidebar = $('[data-toggle="control-sidebar"]');
            if (!$controlSidebar || !$controlSidebar.length) {
                this.registerEventControlSidebar();
                return;
            }
            $controlSidebar.off('click');
            $controlSidebar.on('click', function () {
                $('.control-sidebar.control-sidebar-dark').toggleClass('control-sidebar-open');
            });
        }, 500);
    }

    private subscribeLoginSuccess() {
        this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return action.type === ModuleActions.LOGIN_SUCCESS;
                }),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((action: CustomAction) => {
                const currentUser = this.uti.getUserInfo();
                if (!currentUser || !currentUser.id) {
                    location.href = this.consts.loginUrl;
                    location.reload();
                    return;
                }
                // console.log('SubscribeLoginSuccess');
                this.userData = new Uti().getUserInfo();
                this.subcribe();
                this.doWorkIfLogined();

                if (this.enableCloud && !currentUser.idCloudConnection) {
                    this.onSelectedModule(ModuleList.Cloud);
                } else {
                    this.router.navigate([Configuration.rootPrivateUrl]);
                }
                this.registerEventControlSidebar();
            });
    }

    private subscribeShowFeedbackClickedState() {
        this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return action.type === XnCommonActions.SHOW_FEEDBACK;
                }),
                map((action: CustomAction) => {
                    return action.payload;
                }),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((showFeedback) => {
                this.appErrorHandler.executeAction(() => {
                    if (showFeedback) {
                        this.feedbackCombine.showFeedback();
                    }
                });
            });

        this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return action.type === XnCommonActions.STORE_FEEDBACK_DATA;
                }),
                map((action: CustomAction) => {
                    return action.payload;
                }),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((feedbackData) => {
                this.appErrorHandler.executeAction(() => {
                    this.feedbackCombine.feedbackStoreData = feedbackData;
                });
            });
    }

    private subscribeGlobalProperties() {
        this.globalPropertiesStateSubscription = this.globalPropertiesState.subscribe((globalProperties: any) => {
            this.appErrorHandler.executeAction(() => {
                if (globalProperties) {
                    this.updatePropertiesFromGlobalProperties(globalProperties);
                }
            });
        });
    }

    private subscribeShowFeedbackCompleteState() {
        this.showFeedbackCompleteSubscription = this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return action.type === XnCommonActions.SHOW_FEEDBACK_COMPLETE;
                }),
            )
            .subscribe(() => {
                this.appErrorHandler.executeAction(() => {
                    this.isFeedbackLoading = false;

                    this.changeDetectorRef.markForCheck();
                });
            });
    }

    private subscribeTriggerClickNewModuleState() {
        this.triggerClickNewModuleSubscription = this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return action.type === ModuleActions.REQUEST_TRIGGER_CLICK_NEW_FROM_MODULE;
                }),
                map((action: CustomAction) => {
                    return action.payload;
                }),
            )
            .subscribe((data) => {
                this.appErrorHandler.executeAction(() => {
                    this.onClickNewModule(data);
                    this.changeDetectorRef.markForCheck();
                });
            });
    }

    private subscribeMainModulesState() {
        this.mainModulesStateSubscription = this.mainModulesState.subscribe((mainModulesState: Module[]) => {
            this.appErrorHandler.executeAction(() => {
                // if user is role normal user, will not show user management menu
                if (!this.isSignedIn) return;

                // console.log('MainModulesState');
                const currentUser = this.uti.getUserInfo();
                if (!currentUser.isSuperAdmin && !currentUser.isAdmin) {
                    mainModulesState = mainModulesState.filter((x) => x.idSettingsGUI !== MenuModuleId.userManagement);
                }

                this.mainModules = mainModulesState;

                if (this.mainModules.length) {
                    if (this.router) {
                        const moduleName: any = Uti.getModuleNamesFromUrl(window.location.pathname);
                        const module: Module = this.mainModules.find((m) => m.moduleNameTrim == moduleName[0]);
                        if (moduleName.length > 1) {
                            this.continueToSelectSubModule = moduleName[1];
                        }

                        if (module) {
                            this.store.dispatch(this.moduleActions.activeModule(module));
                        } else {
                            this.router.navigate([`${Configuration.rootPrivateUrl}`]);
                        }
                    } else {
                        this.getCheckedModules();
                    }
                }

                this.changeDetectorRef.markForCheck();
            });
        });
    }

    private subscribeSubModulesState() {
        this.subModulesStateSubscription = this.subModulesState.subscribe((subModulesState: Module[]) => {
            this.appErrorHandler.executeAction(() => {
                this.subModules = subModulesState;

                let requestedSubModule: Module;
                if (this.continueToSelectSubModule) {
                    requestedSubModule = this.subModules.find(
                        (m) => m.moduleNameTrim == this.continueToSelectSubModule,
                    );
                    if (!requestedSubModule) {
                        const logisticModules = this.subModules.find((m) => m.idSettingsGUI == MenuModuleId.logistic);
                        if (logisticModules && logisticModules.children) {
                            requestedSubModule = logisticModules.children.find(
                                (m) => m.moduleNameTrim == this.continueToSelectSubModule,
                            );
                        }
                    }
                } else if (this.requestChangeSubModule) {
                    requestedSubModule = this.subModules.find(
                        (m) => m.idSettingsGUI == this.requestChangeSubModule.requestedSubModuleId,
                    );
                }

                if (requestedSubModule) {
                    this.onSelectedSubModule(requestedSubModule);

                    this.store.dispatch(this.moduleActions.clearRequestChangeSubModule());
                    this.continueToSelectSubModule = null;
                }

                this.changeDetectorRef.markForCheck();
            });
        });
    }

    private subscribeActiveModuleModel() {
        this.activeModuleStateSubscription = this.activeModuleState.subscribe((activeModule: Module) => {
            this.appErrorHandler.executeAction(() => {
                if (isEmpty(activeModule)) {
                    this.activeModule = null;

                    this.changeDetectorRef.markForCheck();
                    return;
                }

                if (isEqual(this.activeModule, activeModule)) {
                    return;
                }

                this.activeModule = cloneDeep(activeModule);

                this.changeDetectorRef.markForCheck();
            });
        });
    }

    private subscribeActiveSubModuleModel() {
        this.activeSubModuleModelSubscription = this.activeSubModuleModel.subscribe((activeSubModuleModel: Module) => {
            this.appErrorHandler.executeAction(() => {
                if (isEmpty(activeSubModuleModel)) {
                    this.activeSubModule = null;
                    this.changeDetectorRef.markForCheck();
                    return;
                }

                this.activeSubModule = cloneDeep(activeSubModuleModel);

                this.changeDetectorRef.markForCheck();
            });
        });
    }

    private subcribeSelectedEntityState() {
        this.selectedEntityStateSubscription = this.selectedEntityState.subscribe((selectedEntityState: any) => {
            this.appErrorHandler.executeAction(() => {
                this.selectedEntity = selectedEntityState;
                this.changeDetectorRef.markForCheck();
            });
        });
    }

    private subcribeSelectedTabState() {
        this.selectedTabStateSubscription = this.selectedTabState.subscribe((selectedTabState: TabSummaryModel) => {
            this.appErrorHandler.executeAction(() => {
                this.selectedTab = selectedTabState;
                this.changeDetectorRef.markForCheck();
            });
        });
    }

    private subcribeSelectedAiTabState() {
        this.selectedAiTabStateSubscription = this.selectedAiTabState.subscribe(
            (selectedAiTabState: AdditionalInfromationTabModel) => {
                this.appErrorHandler.executeAction(() => {
                    this.selectedAiTab = selectedAiTabState;
                });
            },
        );
    }

    private subcribeRequestCreateNewModuleItemState() {
        this.requestCreateNewModuleItemStateSubscription = this.requestCreateNewModuleItemState.subscribe(
            (requestCreateNewModuleItemState: any) => {
                this.appErrorHandler.executeAction(() => {
                    if (requestCreateNewModuleItemState) {
                        this.onClickNewModule(requestCreateNewModuleItemState);
                    }
                });
            },
        );
    }

    private subscribeIsViewModeState() {
        this.isViewModeStateSubscription = this.isViewModeState.subscribe((isViewModeState: boolean) => {
            this.appErrorHandler.executeAction(() => {
                if (!isNil(isViewModeState)) this.isViewMode = isViewModeState;

                if (!isViewModeState) {
                    this.store.dispatch(this.searchResultActions.requestTogglePanel(false));
                    this.store.dispatch(this.additionalInformationActions.requestTogglePanel(false, this.ofModule));
                }

                this.registerEventControlSidebar();
                this.changeDetectorRef.markForCheck();
            });
        });
    }

    private subscribeWidgetTemplateModeState() {
        this.widgetTemplateModeStateSubscription = this.widgetTemplateModeState.subscribe(
            (widgetTemplateModeState: EnableWidgetTemplateState) => {
                this.appErrorHandler.executeAction(() => {
                    if (!isNil(widgetTemplateModeState.status)) {
                        this.isViewMode = !widgetTemplateModeState.status;

                        this.store.dispatch(
                            this.widgetTemplateActions.toggleWidgetTemplateSettingPanel(
                                !this.isViewMode,
                                this.ofModule,
                            ),
                        );
                    }

                    this.changeDetectorRef.markForCheck();
                });
            },
        );
    }

    private subscribeLayoutSettingModeState() {
        this.layoutSettingModeStateSubscription = this.layoutSettingModeState.subscribe(
            (enableLayoutSetting: boolean) => {
                this.appErrorHandler.executeAction(() => {
                    if (enableLayoutSetting == undefined) return;

                    this.isViewMode = enableLayoutSetting ? false : true;

                    if (enableLayoutSetting) {
                        this.store.dispatch(this.tabButtonActions.toggle(false, this.ofModule));
                        this.store.dispatch(this.layoutInfoActions.setRightMenuWidth('50', this.ofModule));
                        this.store.dispatch(this.layoutSettingActions.requestTogglePanel(true, this.ofModule));
                    } else {
                        this.store.dispatch(this.tabButtonActions.toggle(true, this.ofModule));
                        this.store.dispatch(this.layoutInfoActions.setRightMenuWidth('0', this.ofModule));
                        this.store.dispatch(this.layoutSettingActions.requestTogglePanel(false, this.ofModule));
                    }
                    this.changeDetectorRef.markForCheck();
                });
            },
        );
    }

    private subscribeRequestToChangeActiveModuleName() {
        this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return action.type === ModuleActions.REQUEST_CHANGE_ACTIVE_MODULE_NAME;
                }),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((action: CustomAction) => {
                this.appErrorHandler.executeAction(() => {
                    const payload = action.payload as { activeModule: Module; moduleName: string };
                    if (!this.activeModule && payload.activeModule) {
                        this.activeModule = cloneDeep(payload.activeModule);
                    }

                    // this.activeModule.moduleName = payload.moduleName;
                    ///reset Company Name
                    this.companyName = null;
                });
            });
    }

    private subscribeTestConnection() {
        this.testConnectionSubscription = this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return action.type === XnCommonActions.TEST_CLOUD_CONNECTION;
                }),
            )
            .subscribe(() => {
                this.appErrorHandler.executeAction(() => {
                    this.testCloudConnection();
                });
            });
    }
    private subscribeGetCompany() {
        this.getCompanySubscription = this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return action.type === ModuleActions.GET_COMPANY;
                }),
                map((action: CustomAction) => {
                    return action.payload;
                }),
            )
            .subscribe((data) => {
                this.appErrorHandler.executeAction(() => {
                    this.companyName = data;
                    this.changeDetectorRef.detectChanges();
                });
            });
    }

    private subscribeListenSignalRMessage() {
        if (!this.enableNotificationPopup) return;

        if (this.aprrovalReceivedSubscription) this.aprrovalReceivedSubscription.unsubscribe();

        this.aprrovalReceivedSubscription = this.signalRService.aprrovalReceived.subscribe(
            (message: SignalRNotifyModel) => {
                //not login
                if (!this.isSignedIn) return;

                this.appErrorHandler.executeAction(() => {
                    console.log(message);

                    //Only work for Approval_Invite
                    if (message.Job != SignalRJobEnum.Approval_Invite || !message.Data || !message.Data.length) return;

                    const currentUser = this.userService.getCurrentUser();
                    const idLogin = currentUser.id;

                    const findItem = message.Data.find((n) => n == idLogin);
                    //Not found
                    if (!findItem) return;

                    switch (message.Action) {
                        case SignalRActionEnum.Approval_Invite_Request:
                            //Increase the number
                            console.log('Increase the number');
                            this.notiListener.next(1);
                            break;
                        case SignalRActionEnum.Approval_Invite_Approve:
                            //Decrease the number
                            console.log('Decrease the number');
                            this.notiListener.next(-1);
                            break;
                        default:
                            break;
                    }
                });
            },
        );
    }

    private subscribeCounterNotification() {
        if (!this.enableNotificationPopup) return;
        forkJoin([
            this.notificationService.getApproveInvoiceCounter({}),
            this.notificationService.getNotifications({
                IdLoginNotification: this.userData.id,
                MainNotificationType: MainNotificationTypeEnum.Feedback,
                NotificationStatus: NotificationStatusEnum.New,
            }),
        ]).subscribe(([invoice, feeback]) => {
            const invoiceNotiNr = invoice?.TotalInvoice || 0;
            const feebackNr = feeback?.item?.data?.[1].length;
            this.notiListener && this.notiListener.next(invoiceNotiNr + feebackNr);
        });
    }

    private subscribeRecieveDataFromThumbnailList() {
        this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return action.type === AdministrationDocumentActionNames.GET_DOCUMENT_BY_ID_SCAN;
                }),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((action: CustomAction) => {
                this.appErrorHandler.executeAction(() => {
                    if (this.activeModule?.idSettingsGUI === MenuModuleId.invoiceApprovalProcessing) {
                        const data = action.payload;
                        delete data.firstInit;
                        this.onSelectedModule(ModuleList.ApprovalProcessing, false, data);
                    }
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

        this.changeDetectorRef.markForCheck();
    }

    public onMouseEnter() {
        this.store.dispatch(this.tabSummaryActions.toggleTabButton(false, this.ofModule));
    }

    public onSelectedModule(
        selectedModule: Module,
        isRoutingOnMenu?: boolean,
        paramsInvoiceApproval?: any,
        isMainMenu: boolean = false,
    ): void {
        this.companyName = null;
        if (!selectedModule) {
            this.changeDetectorRef.markForCheck();
            return;
        }

        const indexInMainModule = this.mainModules.findIndex((x) => x.idSettingsGUI === selectedModule.idSettingsGUI);
        if (indexInMainModule === -1) this.router.navigate([`${Configuration.rootPrivateUrl}`]);

        if (isMainMenu) {
            this.router.navigate([`/${selectedModule.moduleNameTrim}`]);
            this.store.dispatch(this.moduleActions.activeModule(selectedModule));
            return;
        }

        if (!isRoutingOnMenu) {
            if (this.isRoutingToDocumentFromGlobalSearch(selectedModule)) {
                this._routeToDocument(selectedModule);
                this.changeDetectorRef.markForCheck();
                return;
            }
            if (
                selectedModule.idSettingsGUI === MenuModuleId.invoiceApproval ||
                selectedModule.idSettingsGUI === MenuModuleId.invoiceApprovalProcessing ||
                selectedModule.idSettingsGUI === MenuModuleId.invoiceApprovalRejected
            ) {
                const activeModule =
                    selectedModule.idSettingsGUI === MenuModuleId.invoiceApproval ||
                    selectedModule.idSettingsGUI === MenuModuleId.invoiceApprovalRejected
                        ? ModuleList.Approval
                        : ModuleList.ApprovalProcessing;
                this._routeToInvoiceApproval(selectedModule, activeModule, paramsInvoiceApproval);
                this.changeDetectorRef.markForCheck();
                this.store.dispatch(this.moduleActions.activeModule(this.activeModule));
                return;
            }
            if (
                selectedModule.idSettingsGUI === MenuModuleId.indexing ||
                selectedModule.idSettingsGUI === MenuModuleId.email
            ) {
                const actions = JSON.parse(
                    window.localStorage.getItem(
                        LocalStorageKey.buildKey(LocalStorageKey.LocalStorageGSStepKey, Uti.defineBrowserTabId()),
                    ),
                ) as CustomAction[];
                const data = actions?.[0]?.payload?.data;
                if (!data) return;

                const tick = new Date().getTime();
                this.router.navigate([`${selectedModule.moduleNameTrim}`], {
                    queryParams: {
                        idDocumentTree: data.idDocumentTree || '',
                        idDocumentContainerScans: data.idDocumentContainerScans || '',
                        il: data.idLogin || '',
                        t: tick,
                    },
                });
                this.store.dispatch(this.moduleActions.activeModule(selectedModule));
                this.changeDetectorRef.markForCheck();
                return;
            }
            if (selectedModule.idSettingsGUI === MenuModuleId.preissChild) {
                const actions = JSON.parse(
                    window.localStorage.getItem(
                        LocalStorageKey.buildKey(LocalStorageKey.LocalStorageGSStepKey, Uti.defineBrowserTabId()),
                    ),
                ) as CustomAction[];
                const data = actions?.[0]?.payload?.data;
                if (!data) return;

                this.router.navigate([`${selectedModule.moduleNameTrim}`], {
                    queryParams: {
                        idPriceTag: data.idPriceTag || '',
                        isAdd: data.add ? '1' : '',
                        isDelete: data.delete ? '1' : '',
                        t: new Date().getTime(),
                    },
                });
                this.store.dispatch(this.moduleActions.activeModule(selectedModule));
                this.changeDetectorRef.markForCheck();
                return;
            }
        }

        // selected lazy module or switch from lazy module to another module
        if (selectedModule.idSettingsGUI === MenuModuleId.processing) {
            this._routeToCapture(selectedModule);
            this.store.dispatch(this.moduleActions.activeModule(selectedModule));
            this.changeDetectorRef.markForCheck();
            return;
        }

        if (
            selectedModule.idSettingsGUI === MenuModuleId.scanningInput ||
            selectedModule.idSettingsGUI === MenuModuleId.contact ||
            selectedModule.idSettingsGUI === MenuModuleId.document ||
            selectedModule.idSettingsGUI === MenuModuleId.importUpload ||
            selectedModule.idSettingsGUI === MenuModuleId.cloud ||
            selectedModule.idSettingsGUI === MenuModuleId.oneDrive ||
            selectedModule.idSettingsGUI === MenuModuleId.export ||
            selectedModule.idSettingsGUI === MenuModuleId.userGuide ||
            selectedModule.idSettingsGUI === MenuModuleId.history ||
            selectedModule.idSettingsGUI === MenuModuleId.changePassword ||
            selectedModule.idSettingsGUI === MenuModuleId.userManagement ||
            selectedModule.idSettingsGUI === MenuModuleId.email ||
            selectedModule.idSettingsGUI === MenuModuleId.invoiceApproval ||
            selectedModule.idSettingsGUI === MenuModuleId.invoiceApprovalProcessing ||
            selectedModule.idSettingsGUI === MenuModuleId.userV2 ||
            selectedModule.idSettingsGUI === MenuModuleId.company ||
            selectedModule.idSettingsGUI === MenuModuleId.indexing ||
            selectedModule.idSettingsGUI === MenuModuleId.preissChild
        ) {
            if (this.navigateSubModule(selectedModule)) return;

            this.router.navigate([`/${selectedModule.moduleNameTrim}`]);
            this.store.dispatch(this.moduleActions.activeModule(selectedModule));
            return;
        }

        if (this.activeModule) {
            if (
                this.activeModule.idSettingsGUI !== MenuModuleId.processing &&
                selectedModule.idSettingsGUI === MenuModuleId.processing
            ) {
                this._routeToCapture(selectedModule);
                this.store.dispatch(this.moduleActions.activeModule(selectedModule));
                this.changeDetectorRef.markForCheck();
                return;
            } else if (
                this.activeModule.idSettingsGUI === MenuModuleId.scanningInput ||
                this.activeModule.idSettingsGUI === MenuModuleId.contact ||
                this.activeModule.idSettingsGUI === MenuModuleId.document ||
                this.activeModule.idSettingsGUI === MenuModuleId.importUpload ||
                this.activeModule.idSettingsGUI === MenuModuleId.cloud ||
                this.activeModule.idSettingsGUI === MenuModuleId.oneDrive ||
                this.activeModule.idSettingsGUI === MenuModuleId.export ||
                this.activeModule.idSettingsGUI === MenuModuleId.userGuide ||
                this.activeModule.idSettingsGUI === MenuModuleId.history ||
                this.activeModule.idSettingsGUI === MenuModuleId.changePassword ||
                this.activeModule.idSettingsGUI === MenuModuleId.userManagement ||
                this.activeModule.idSettingsGUI === MenuModuleId.email ||
                this.activeModule.idSettingsGUI === MenuModuleId.invoiceApproval ||
                this.activeModule.idSettingsGUI === MenuModuleId.company ||
                this.activeModule.idSettingsGUI === MenuModuleId.invoiceApprovalProcessing ||
                this.activeModule.idSettingsGUI === MenuModuleId.preissChild
            ) {
                this.router.navigate([`${Configuration.rootPrivateUrl}/${selectedModule.moduleNameTrim}`]);
                this.activeModule = selectedModule;
                this.store.dispatch(this.moduleActions.activeModule(selectedModule));
                return;
            }

            if (isRoutingOnMenu && this.activeModule.idSettingsGUI === selectedModule.idSettingsGUI) {
                this.router.navigate([`${Configuration.rootPrivateUrl}/${selectedModule.moduleNameTrim}`]);
            }
        }

        if (
            !this.activeModule ||
            selectedModule.idSettingsGUI !== this.activeModule.idSettingsGUI ||
            selectedModule.idSettingsGUI == MenuModuleId.briefe ||
            selectedModule.idSettingsGUI == MenuModuleId.tools ||
            selectedModule.idSettingsGUI == MenuModuleId.statistic ||
            selectedModule.idSettingsGUI == MenuModuleId.selection
        ) {
            this.willChangeModule = selectedModule;

            if (this.ofModule.idSettingsGUI == -1) {
                this.okToChangeOrCreateNewModule();
            } else {
                this.store.dispatch(this.processDataActions.requestChangeModule(this.ofModule));
                // reset subModule
                this.store.dispatch(this.moduleActions.clearActiveSubModule());
            }
        }
        this.changeDetectorRef.markForCheck();
    }

    /**
     *
     * @param selectedSubModule
     */
    public onSelectedSubModule(selectedSubModule: Module): void {
        const okToChangeSubModule =
            selectedSubModule &&
            selectedSubModule.idSettingsGUI !== MenuModuleId.logistic &&
            (!this.activeSubModule || selectedSubModule.idSettingsGUI !== this.activeSubModule.idSettingsGUI);

        if (okToChangeSubModule) {
            this.willChangeSubModule = selectedSubModule;
            this.store.dispatch(this.processDataActions.requestChangeSubModule(this.ofModule));
            this.navigateSubModule(selectedSubModule);
        }

        this.changeDetectorRef.markForCheck();
    }

    private navigateSubModule(selectedModule: Module): boolean {
        const parentModule = this.mainModules.find((m) => m.idSettingsGUI === selectedModule.idSettingsGUIParent);
        if (!parentModule) return false;

        this.router.navigate([`/${parentModule.moduleNameTrim}/${selectedModule.moduleNameTrim}`]);
        this.activeModule = ModuleList[selectedModule.moduleNameTrim];
        // this.activeSubModule = ModuleList[selectedModule.moduleNameTrim];
        this.willChangeSubModule = null;
        return true;
    }

    private subscribeOkToCreateNewFromModuleDropdownState() {
        this.okToCreateNewFromModuleDropdownSubscription = this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return (
                        action.type === ProcessDataActions.OK_TO_CREATE_NEW_FROM_MODULE_DROPDOWN &&
                        action.module.idSettingsGUI == this.ofModule.idSettingsGUI
                    );
                }),
            )
            .subscribe(() => {
                this.appErrorHandler.executeAction(() => {
                    //if (!isEmpty(this.selectedEntity)) {
                    //    this.store.dispatch(this.propertyPanelActions.requestClearProperties(this.ofModule));
                    //} else {
                    //    this.okToChangeOrCreateNewModule();
                    //}

                    this.okToChangeOrCreateNewModule();

                    this.changeDetectorRef.markForCheck();
                });
            });
    }

    private subscribeOkToChangeModuleState() {
        this.okToChangeModuleSubscription = this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return (
                        action.type === ProcessDataActions.OK_TO_CHANGE_MODULE &&
                        action.module.idSettingsGUI == this.ofModule.idSettingsGUI
                    );
                }),
            )
            .subscribe(() => {
                this.appErrorHandler.executeAction(() => {
                    //if (!isEmpty(this.selectedEntity)) {
                    //    this.store.dispatch(this.propertyPanelActions.requestClearProperties(this.ofModule));
                    //} else {
                    //    this.okToChangeOrCreateNewModule();
                    //}

                    this.okToChangeOrCreateNewModule();

                    this.changeDetectorRef.markForCheck();
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
                    if (this.willChangeModule || this.requestCreateNewFromModuleDropdown) {
                        this.okToChangeOrCreateNewModule();
                    } else if (this.willChangeSubModule) {
                        this.okToChangeSubModule();
                    }

                    this.changeDetectorRef.markForCheck();
                });
            });
    }

    private subscribeOkToChangeSubModuleState() {
        this.okToChangeSubModuleSubscription = this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return (
                        action.type === ProcessDataActions.OK_TO_CHANGE_SUB_MODULE &&
                        action.module.idSettingsGUI == this.ofModule.idSettingsGUI
                    );
                }),
            )
            .subscribe(() => {
                this.appErrorHandler.executeAction(() => {
                    //if (!isEmpty(this.selectedEntity)) {
                    //    this.store.dispatch(this.propertyPanelActions.requestClearProperties(this.ofModule));
                    //} else {
                    //    this.okToChangeSubModule();
                    //}

                    this.okToChangeSubModule();

                    this.changeDetectorRef.markForCheck();
                });
            });
    }

    private subscribeRequestChangeModuleState() {
        this.requestChangeModuleState
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((requestChangeModuleState: any) => {
                this.appErrorHandler.executeAction(() => {
                    //this.requestChangeSubModule = requestChangeSubModuleState;

                    if (
                        requestChangeModuleState &&
                        document.querySelector('#main > div > app-root > main > div > gs-main')
                    ) {
                        this.onSelectedModule(requestChangeModuleState.requestedModule);
                        this.store.dispatch(this.moduleActions.clearRequestChangeModule());
                    }

                    this.changeDetectorRef.markForCheck();
                });
            });
    }

    private subscribeRequestChangeSubModuleState() {
        this.requestChangeSubModuleStateSubscription = this.requestChangeSubModuleState.subscribe(
            (requestChangeSubModuleState: any) => {
                this.appErrorHandler.executeAction(() => {
                    this.requestChangeSubModule = requestChangeSubModuleState;

                    if (requestChangeSubModuleState) {
                        const requestedModule = this.mainModules.find(
                            (m) => m.idSettingsGUI == requestChangeSubModuleState.requestedModuleId,
                        );
                        if (requestedModule && this.activeModule.idSettingsGUI == requestedModule.idSettingsGUI) {
                            let requestedSubModule = this.subModules.find(
                                (m) => m.idSettingsGUI == requestChangeSubModuleState.requestedSubModuleId,
                            );

                            if (!requestedSubModule && requestedModule.idSettingsGUI == MenuModuleId.briefe) {
                                const logisticModules = this.subModules.find(
                                    (m) => m.idSettingsGUI == MenuModuleId.logistic,
                                );
                                if (logisticModules && logisticModules.children) {
                                    requestedSubModule = logisticModules.children.find(
                                        (m) => m.idSettingsGUI == requestChangeSubModuleState.requestedSubModuleId,
                                    );
                                }
                            }

                            if (requestedSubModule) {
                                this.onSelectedSubModule(requestedSubModule);

                                this.store.dispatch(this.moduleActions.clearRequestChangeSubModule());
                            }
                        } else {
                            this.onSelectedModule(requestedModule);
                        }
                    }

                    this.changeDetectorRef.markForCheck();
                });
            },
        );
    }

    private okToChangeOrCreateNewModule() {
        if (this.willChangeModule) {
            //this.closeCurrentModule();

            if (this.selectedEntity && this.selectedEntity.hasOwnProperty('selectedParkedItem')) {
                this.store.dispatch(
                    this.moduleActions.storeModuleStates(
                        this.activeModule,
                        this.selectedEntity['selectedParkedItem'],
                        this.selectedTab,
                        this.selectedAiTab,
                    ),
                );
            }

            this.store.dispatch(this.moduleActions.addWorkingModule(this.willChangeModule, [], [], []));
            this.store.dispatch(this.moduleActions.activeModule(this.willChangeModule));
            this.store.dispatch(this.propertyPanelActions.clearProperties(this.ofModule));
            this.store.dispatch(this.layoutInfoActions.setRightPropertyPanelWidth('0', this.ofModule));
            this.store.dispatch(this.layoutSettingActions.updateEditModeStatus(false, this.ofModule));
            this.router.navigate([Uti.getPrivateUrlWithModuleName(this.willChangeModule.moduleNameTrim)]);

            this.willChangeModule = null;
        } else if (this.requestCreateNewFromModuleDropdown) {
            this.store.dispatch(this.processDataActions.requestCreateNewMainTab(this.ofModule));
            this.requestCreateNewFromModuleDropdown = false;
        }
        this.changeDetectorRef.markForCheck();
    }

    private okToChangeSubModule() {
        if (this.willChangeSubModule) {
            this.activeSubModule = this.willChangeSubModule;
            //this.closeCurrentSubModule();

            this.store.dispatch(this.moduleActions.activeSubModule(this.willChangeSubModule));
            this.store.dispatch(this.propertyPanelActions.clearProperties(this.ofModule));
            this.store.dispatch(this.layoutInfoActions.setRightPropertyPanelWidth('0', this.ofModule));
            this.store.dispatch(this.layoutSettingActions.updateEditModeStatus(false, this.ofModule));
            if (this.activeModule.idSettingsGUI != MenuModuleId.processing) {
                const newRoute = this.activeModule.moduleNameTrim + '/' + this.willChangeSubModule.moduleNameTrim;
                this.router.navigate([Uti.getPrivateUrlWithModuleName(newRoute)]);
            }

            this.willChangeSubModule = null;

            this.changeDetectorRef.markForCheck();

            if (this.requestCreateNewFromModuleDropdown) {
                setTimeout(() => {
                    this.store.dispatch(this.processDataActions.requestCreateNewFromModuleDropdown(this.ofModule));
                }, 500);
            }
        }
    }

    public onClickNewModule(selectedModule: Module) {
        this.requestCreateNewFromModuleDropdown = true;

        if (
            this.activeModule.idSettingsGUI == MenuModuleId.briefe &&
            (!this.activeSubModule || this.activeSubModule.idSettingsGUI != selectedModule.idSettingsGUIParent)
        ) {
            const subModule = this.moduleService.getModuleRecursive(
                this.subModules,
                selectedModule.idSettingsGUIParent,
            );
            if (subModule) {
                this.onSelectedSubModule(subModule);
                return;
            }
        }

        this.store.dispatch(this.processDataActions.requestCreateNewFromModuleDropdown(this.ofModule));
        this.store.dispatch(this.moduleActions.activeSubModule(selectedModule));
        this.changeDetectorRef.markForCheck();
    }

    /**
     * onSearchingModule
     * @param selectedModule
     */
    public onSearchingModule(selectedModule: Module) {
        this.store.dispatch(this.moduleActions.searchKeywordModule(selectedModule));
    }

    private closeCurrentModule() {
        this.store.dispatch(this.moduleActions.clearActiveModule());
        this.store.dispatch(this.moduleActions.clearActiveSubModule());
        this.store.dispatch(this.moduleSettingActions.clearModuleSetting(this.ofModule));
        this.store.dispatch(this.parkedItemActions.reset(this.ofModule));
        this.store.dispatch(this.tabSummaryActions.toggleTabButton(false, this.ofModule));
        this.store.dispatch(this.tabSummaryActions.removeAllTabs(this.ofModule));
        this.store.dispatch(this.processDataActions.clearSearchResult(this.ofModule));

        this.changeDetectorRef.markForCheck();
    }

    private closeCurrentSubModule() {
        if (
            this.activeSubModule.idSettingsGUIParent === MenuModuleId.briefe ||
            this.activeSubModule.idSettingsGUIParent === MenuModuleId.logistic
        ) {
            this.store.dispatch(this.moduleSettingActions.clearModuleSetting(this.ofModule));
            this.store.dispatch(this.parkedItemActions.reset(this.ofModule));
            this.store.dispatch(this.tabSummaryActions.toggleTabButton(false, this.ofModule));
            this.store.dispatch(this.processDataActions.clearSearchResult(this.ofModule));
            this.store.dispatch(this.tabSummaryActions.removeAllTabs(this.ofModule));
        }
        this.store.dispatch(this.moduleActions.clearActiveSubModule());

        this.changeDetectorRef.markForCheck();
    }

    focusSearchBox() {
        this.isFocus = true;
        this.changeDetectorRef.markForCheck();
    }

    focusOutSearchBox() {
        this.isFocus = false;
        this.changeDetectorRef.markForCheck();
    }

    search($event) {
        if (this.searchText) {
            this.store.dispatch(
                this.moduleActions.searchKeywordModule(
                    new Module({
                        searchKeyword: this.searchText,
                        idSettingsGUI: -1,
                        isCanSearch: true,
                    }),
                ),
            );
            if ($event) {
                $event.preventDefault();
            }
        }
    }

    clearSearchText() {
        this.searchText = '';
        this.searchInputElm.nativeElement.value = this.searchText;
        this.domHandler.addClass(this.clearSearchBtn._elementRef.nativeElement, 'hidden');
        this.changeDetectorRef.markForCheck();

        // reset global search '*'
        this.store.dispatch(
            this.moduleActions.searchKeywordModule(
                new Module({
                    searchKeyword: '*',
                    idSettingsGUI: -1,
                    isCanSearch: true,
                }),
            ),
        );
    }

    keypress($event) {
        if ($event.which === 13 || $event.keyCode === 13) {
            $event.preventDefault();
        } else {
            this.searchText = $event.target.value;
            this.changeDetectorRef.markForCheck();
        }
    }

    private getAppVersion() {
        this.buildVersion = Configuration.PublicSettings.appVersion;
        this.changeDetectorRef.markForCheck();
    }

    public onUserDropdownClosed() {
        if (this.userBoxComponent) {
            this.userBoxComponent.close();
        }
    }

    // dont remove
    public onMenuClosed() {}

    public updateDropdownAutoClose(autoClose: boolean) {
        this.autoCloseDropdown = autoClose;
    }

    private getCheckedModules() {
        this.getGlobalSettingSubscription = this.globalSettingService.getAllGlobalSettings().subscribe(
            (data) => this.getCheckedModulesSuccess(data),
            (error) => this.serviceError(error),
        );
    }

    private getCheckedModulesSuccess(data: GlobalSettingModel[]) {
        if (!data || !data.length) {
            return;
        }
        this.checkedModuleIds = this.getCurrentCheckedModules(data);
        for (let i = 0; i < this.checkedModuleIds.length; i++) {
            const moduleInfo = this.mainModules.find((md) => md.idSettingsGUI == this.checkedModuleIds[i]);

            if (moduleInfo && moduleInfo.accessRight && moduleInfo.accessRight.read) {
                this.store.dispatch(this.moduleActions.addWorkingModule(moduleInfo, [], [], [], true));

                if (i === 0 && this.router && uti.Uti.isRootUrl(this.router.url)) {
                    this.onSelectedModule(moduleInfo);
                }
            }
        }
    }

    private serviceError(error) {
        // console.log(error);
    }

    private getCurrentCheckedModules(data: GlobalSettingModel[]): any {
        const currentGlobalSettingModel = data.find((x) => x.globalName === this.getSettingName());
        if (!currentGlobalSettingModel || !currentGlobalSettingModel.idSettingsGlobal) {
            return this.checkedModuleIds;
        }
        const checkedModulesSetting = JSON.parse(currentGlobalSettingModel.jsonSettings);

        return checkedModulesSetting && checkedModulesSetting.CheckedModules;
    }

    private getSettingName() {
        return this.globalSettingConstant.settingCheckedModules;
    }

    private isRoutingToDocumentFromGlobalSearch(selectedModule: Module) {
        if (
            selectedModule.idSettingsGUI === MenuModuleId.invoice ||
            selectedModule.idSettingsGUI === MenuModuleId.contract ||
            selectedModule.idSettingsGUI === MenuModuleId.allDocuments ||
            selectedModule.idSettingsGUI === MenuModuleId.otherdocuments ||
            selectedModule.idSettingsGUI === MenuModuleId.toDoDocument
        ) {
            return true;
        }
        return false;
    }

    private _routeToDocument(selectedModule: Module) {
        if (!this.activeModule) {
            this.activeModule = cloneDeep(ModuleList.Document);
        }

        const actions = JSON.parse(
            window.localStorage.getItem(
                LocalStorageKey.buildKey(LocalStorageKey.LocalStorageGSStepKey, Uti.defineBrowserTabId()),
            ),
        ) as CustomAction[];

        // at the same page Capture
        // but not ROW_DOUBLE_CLICK on global search || actions is null when first load page
        if (
            this.activeModule.idSettingsGUI === selectedModule.idSettingsGUI &&
            (actions == null || actions[0].type !== GlobalSearchActions.ROW_DOUBLE_CLICK)
        ) {
            // if router is on Document page with queryParams then route back to Document without queryParams page
            if (this.router.url.indexOf('?') >= 0) {
                this.router.navigate([`/${ModuleList.Document.moduleNameTrim}`]);
            }
            return;
        }
        const data = actions[0].payload.data;
        if (!data) return;
        // if current is url with same param will not run func redirect
        if (this.checkParamInUrlSameNewParam(data)) return;

        this.activeModule = cloneDeep(ModuleList.Document);
        this.router.navigate([`${ModuleList.Document.moduleNameTrim}`], {
            queryParams: {
                idDocumentType: data.idRepDocumentGuiType || '',
                idDocument: data.idMainDocument || '',
                idTreeRoot: data.idTreeRoot || '',
            },
        });
        this.store.dispatch(this.moduleActions.activeModule(this.activeModule));
    }
    private checkParamInUrlSameNewParam(data: any): boolean {
        const currentUrl = new URL(window.location.href);
        const idDocumentType = currentUrl.searchParams.get('idDocumentType');
        const idDocument = currentUrl.searchParams.get('idDocument');
        const idTreeRoot = currentUrl.searchParams.get('idTreeRoot');

        return (
            idDocumentType &&
            Number(idDocumentType) === data.idRepDocumentGuiType &&
            idDocument &&
            Number(idDocument) === data.idMainDocument &&
            idTreeRoot &&
            Number(idTreeRoot) === data.idTreeRoot
        );
    }

    private _routeToInvoiceApproval(selectedModule: Module, activeModule: Module, paramsInvoiceApproval?: any) {
        if (!this.activeModule) {
            this.activeModule = cloneDeep(activeModule);
        }

        const actions = JSON.parse(
            window.localStorage.getItem(
                LocalStorageKey.buildKey(LocalStorageKey.LocalStorageGSStepKey, Uti.defineBrowserTabId()),
            ),
        ) as CustomAction[];

        // at the same page Capture
        // but not ROW_DOUBLE_CLICK on global search || actions is null when first load page
        if (
            this.activeModule.idSettingsGUI === selectedModule.idSettingsGUI &&
            (actions == null || actions[0].type !== GlobalSearchActions.ROW_DOUBLE_CLICK) &&
            !paramsInvoiceApproval
        ) {
            // if router is on Document page with queryParams then route back to Document without queryParams page
            if (this.router.url.indexOf('?') >= 0) {
                this.router.navigate([`/${activeModule.moduleNameTrim}`]);
            }
            return;
        }

        this.activeModule = cloneDeep(activeModule);

        const data = paramsInvoiceApproval || actions[0].payload.data;
        let params: any = paramsInvoiceApproval;
        if (!params) {
            params = {
                idDocumentType: data.idRepDocumentGuiType || '',
                idDocument: data.idMainDocument || '',
                idTreeRoot: data.idTreeRoot || '',
                idInvoiceMainApproval: data.idInvoiceMainApproval || '',
                idDocumentContainerScans: data.idDocumentContainerScans || '',
            };
        }

        this.router.navigate([`${activeModule.moduleNameTrim}`], {
            queryParams: params,
        });
    }

    public redirectInvoiceApprovalFromNotification = (item) => {
        this.onSelectedModule(item.module, false, item.data);
    };

    private _routeToCapture(selectedModule: Module) {
        const actions = JSON.parse(
            window.localStorage.getItem(
                LocalStorageKey.buildKey(LocalStorageKey.LocalStorageGSStepKey, Uti.defineBrowserTabId()),
            ),
        ) as CustomAction[];

        if (!actions || !actions[0] || !actions[0].payload || !actions[0].payload.data) {
            //this.router.navigate([`${Configuration.rootPrivateUrl}/${ModuleList.Processing.moduleNameTrim}`]);
            this.router.navigate([`/${ModuleList.Processing.moduleNameTrim}`]);
            return;
        }

        const data = actions[0].payload.data;
        if (!data) return;

        // espeacially, for index capture
        if (selectedModule.idSettingsGUI === MenuModuleId.processing) {
            //this.router.navigate([`${Configuration.rootPrivateUrl}/${ModuleList.Processing.moduleNameTrim}`], {
            //    queryParams: { idDocumentContainerScans: data.idDocumentContainerScans },
            //});
            this.router.navigate([`/${ModuleList.Processing.moduleNameTrim}`], {
                queryParams: { idDocumentContainerScans: data.idDocumentContainerScans },
            });
        }
    }
    // Cloud connection

    public gotoCloudConfig() {
        this.isLockUI = false;
        this.onSelectedModule(ModuleList.Cloud);
    }

    public testCloudConnection() {
        // console.log('TestCloudConnection');
        if (!Configuration.PublicSettings.enableCloud) {
            this.isLockUI = false;
            this.cloudStatus = CloudConnectionStatus.connected;
            return;
        }

        if (cloudConnectionInterval) clearInterval(cloudConnectionInterval);

        // this.cloudStatus = CloudConnectionStatus.connected;
        // this.isLockUI = false;
        // return;

        const currentUser = this.uti.getUserInfo();
        if (!currentUser || !currentUser.id) {
            location.href = this.consts.loginUrl;
            location.reload();
            return;
        }

        if (this.isCallAPI) {
            return;
        }

        this.isCallAPI = true;
        this.countdown = 15;
        this.changeDetectorRef.detectChanges();

        this.cloudServices.getStatusCloudConnection().subscribe(
            (response: any) => {
                this.isCallAPI = false;
                if (response.item !== CloudConnectionStatus.connected) {
                    this.countdown = 7;
                    this.isLockUI = true;
                } else {
                    this.isLockUI = false;
                    this.countdown = 15;
                }
                this.cloudStatus = response.item;
                if (this.checkModuleExclude(response.item)) {
                    this.isLockUI = false;
                }
                this.changeDetectorRef.detectChanges();
                this.setIntervalConnection();
            },
            (error: any) => {
                this.countdown = 7;
                if (get(error, 'name') === 'HttpErrorResponse') {
                    this.cloudStatus = CloudConnectionStatus.apiLostConnect;
                } else {
                    this.cloudStatus = CloudConnectionStatus.lostConnect;
                }
                this.isLockUI = true;
                if (this.checkModuleExclude()) {
                    this.isLockUI = false;
                }
                this.isCallAPI = false;
                this.changeDetectorRef.detectChanges();
                this.setIntervalConnection();
            },
        );
    }

    private setIntervalConnection() {
        if (cloudConnectionInterval) clearInterval(cloudConnectionInterval);

        cloudConnectionInterval = setInterval(() => {
            if (!this.countdown || this.countdown < 0) {
                this.testCloudConnection();
            } else {
                this.countdown = this.countdown - 1;
                this.changeDetectorRef.detectChanges();
            }
        }, 1200);
    }

    private checkModuleExclude(cloudStatus?: CloudConnectionStatus) {
        if (this.activeModule && includes(moduleExcludePopup, this.activeModule.moduleNameTrim?.toLowerCase())) {
            return true;
        }

        if (this.router.url === '/') {
            if (cloudStatus !== CloudConnectionStatus.connected) {
                this.cloudStatus = this.cloudConnectionStatus.connecting;
            }
            return false;
        }
        const urlSplit = this.router.url?.split('/') || [];
        const url = urlSplit[urlSplit.length - 1]?.toLowerCase();
        return includes(moduleExcludePopup, url);
    }

    public backToHome() {
        this.store.dispatch(this.moduleActions.requestChangeModule({}));
        this.router.navigate([Configuration.rootPrivateUrl]);
    }

    @HostListener('window:popstate', ['$event'])
    onPopState(event) {
        const url = window.location.pathname.split('/').pop();
        if (url === 'module') {
            this.activeModule.moduleName = '';
        }
        if (url === ModuleList[url]?.moduleNameTrim) {
            this.activeModule.moduleName = ModuleList[url].moduleName;
        }
    }
}
