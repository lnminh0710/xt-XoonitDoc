import {
    Component,
    OnInit,
    Input,
    Output,
    OnChanges,
    SimpleChanges,
    EventEmitter,
    ViewChild,
    OnDestroy,
    ElementRef,
    ComponentFactoryResolver,
    ViewContainerRef,
    ChangeDetectorRef,
    AfterViewInit,
    TemplateRef,
} from '@angular/core';
import {
    FilterModeEnum,
    SavingWidgetType,
    Configuration,
    WidgetFormTypeEnum,
    MessageModal,
    EditWidgetTypeEnum,
    ModuleType,
    MenuModuleId,
    RepWidgetAppIdEnum,
    AccessRightTypeEnum,
    AccessRightWidgetCommandButtonEnum,
    ComboBoxTypeConstant,
    PropertyNameOfWidgetProperty,
} from '@app/app.constants';
import { Uti } from '@app/utilities/uti';
import { Store, ReducerManagerDispatcher } from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import {
    WidgetPropertyModel,
    WidgetPropertiesStateModel,
    FieldFilter,
    ColumnLayoutSetting,
    Country,
    WidgetDetail,
    FilterData,
    WidgetItemSize,
    WidgetType,
    MessageModel,
    ApiResultResponse,
    RowSetting,
    SignalRNotifyModel,
    WidgetMenuStatusModel,
    WidgetApp,
    IWidgetCommonAction,
} from '@app/models';
import {
    PropertyPanelActions,
    AdditionalInformationActions,
    BackofficeActions,
    TabButtonActions,
    LayoutInfoActions,
    TabSummaryActions,
    CustomAction,
    WidgetDetailActions,
    ProcessDataActions,
    FilterActions,
} from '@app/state-management/store/actions';
import {
    WidgetTemplateSettingService,
    DatatableService,
    ModalService,
    TreeViewService,
    PropertyPanelService,
    DomHandler,
    AppErrorHandler,
    BackOfficeService,
    GlobalSettingService,
    ArticleService,
    ToolsService,
    DownloadFileService,
    AccessRightsService,
    PersonService,
    ProjectService,
    SignalRService,
    MenuStatusService,
} from '@app/services';
import { Observable, Subscription, Subject } from 'rxjs';
import { WidgetUtils } from '../../utils';
import isNil from 'lodash-es/isNil';
import isEmpty from 'lodash-es/isEmpty';
import cloneDeep from 'lodash-es/cloneDeep';
import isNull from 'lodash-es/isNull';
import { XnFileExplorerComponent, XnUploadTemplateFileComponent } from '@app/shared/components/xn-file';
import { WidgetModuleInfoTranslationComponent } from '../widget-module-info-translation';
import { BaseWidgetModuleInfo } from './base.widget-module-info';
import { NgGridItemConfig } from '@app/shared/components/grid-stack';
import { XnWidgetMenuStatusComponent } from '@app/shared/components/widget/components/xn-widget-menu-status';
import * as propertyPanelReducer from '@app/state-management/store/reducer/property-panel';
import { ModuleList } from '@app/pages/private/base';
import * as widgetContentReducer from '@app/state-management/store/reducer/widget-content-detail';
import * as processDataReducer from '@app/state-management/store/reducer/process-data';
import { EditingWidget } from '@app/state-management/store/reducer/widget-content-detail';
import { ToasterService } from 'angular2-toaster/angular2-toaster';
import { FileUploadModuleType } from '@app/app.constants';
import { ScheduleSettingComponent, ScheduleSettingRunImmediatelyComponent } from '@app/shared/components/xn-control/';
import { NewLotDialogComponent } from '../new-lot-dialog';
import { WidgetProfileSavingComponent, WidgetProfileSelectComponent } from '../widget-profile';
import { WidgetChartComponent } from '../widget-chart';
import { WidgetPdfComponent } from '../widget-pdf/widget-pdf.component';
import { map, filter } from 'rxjs/operators';
import { ContextMenuService } from 'ngx-contextmenu';
import { WidgetContextMenuComponent } from '../../../widget-context-menu';

@Component({
    selector: 'widget-module-info',
    styleUrls: ['./widget-module-info.component.scss'],
    templateUrl: './widget-module-info.component.html',
    providers: [WidgetUtils],
    host: {
        '(mouseleave)': 'mouseout($event)',
        '(mouseenter)': 'mouseenter($event)',
        '(click)': 'mouseenter($event)',
        '(dblclick)': 'mouseDblClick($event)',
        '(contextmenu)': 'onRightClick($event)',
    },
})
export class WidgetModuleComponent extends BaseWidgetModuleInfo implements OnInit, OnChanges, OnDestroy, AfterViewInit {
    @Input() gridItemConfig: NgGridItemConfig;
    @Input() columnsLayoutSettings: any = {};
    @Input() payload: any = {};
    @Input() isSplitterDragging;
    @Input() rowDataChange: any = {};

    @Input() set widgetProperties(properties: any) {
        if (!properties) {
            return;
        }
        if (isNil(properties.properties)) {
            this.properties = properties;
            this.propertiesForSaving.properties = cloneDeep(properties);
        } else {
            this.properties = properties.properties;
            this.propertiesForSaving = cloneDeep(properties);
        }

        this.changeProperties();
    }

    public isOpenUserEditingList: boolean = false;
    public preventRenderDataMode: boolean;
    public showMediacodeDialog = false;
    public menuStatusOpacity = 1;
    public layoutPageInfoWidget: any;
    public boxHeaderTemplate: TemplateRef<any>;

    @Input() set isDesignUpdatingStatus(status: boolean) {
        this.preventRenderDataMode = false;
        if (status && this.domHandler.isIE()) {
            this.preventRenderDataMode = true;
        }
    }

    @Input() set resized(resized: string) {
        this.resizedLocal = resized;

        if (!this.showInDialog) {
            if (this.resizedLocal.indexOf('start') !== -1) {
                this.removeHorizontalPerfectScrollEvent();
                this.removeVerticalPerfectScrollEvent();
            } else if (this.resizedLocal.indexOf('stop') !== -1) {
                this.checkWidgetFormHasScrollbars();
            }
        }
    }

    @Input() set layoutPageInfo(layoutPageInfo: any) {
        this.layoutPageInfoWidget = layoutPageInfo;
        if (layoutPageInfo && this.data && this.data.syncWidgetIds && this.data.syncWidgetIds.length) {
            let parentWidgetId = this.data.syncWidgetIds[0];
            let parentWidgetDetail: WidgetDetail;

            for (let i = 0; i < layoutPageInfo.length; i++) {
                let parentWidget = layoutPageInfo[i].widgetboxesTitle.find((x) => x.id == parentWidgetId);
                if (parentWidget) {
                    parentWidgetDetail = parentWidget.widgetDetail;
                    break;
                }
            }

            if (parentWidgetDetail && this.widgetMenuStatusComponent) {
                this.initwidgetMenuStatusData = {
                    widgetDetail: {
                        ...this.data,
                        contentDetail: parentWidgetDetail.contentDetail,
                    },
                    selectedFilter: this.selectedFilter,
                    selectedSubFilter: this.selectedSubFilter,
                    fieldFilters: this.fieldFilters,
                    columnLayoutsetting: this.columnLayoutsetting,
                    rowSetting: this.rowSetting,
                    selectedWidgetFormType: this.widgetFormType,
                    widgetProperties: this.properties,
                    gridLayoutSettings: this.columnsLayoutSettings,
                    isForAllCountryCheckbox: false,
                    isForAllCountryButton: false,
                };
            }
        }
    }

    // -----------------------
    @Output() onRemoveWidget = new EventEmitter<WidgetDetail>();
    @Output() onRowTableClick = new EventEmitter<any>();
    @Output() onChangeFieldFilter = new EventEmitter<any>();
    @Output() onUpdateTitle = new EventEmitter<WidgetDetail>();
    @Output() onResetWidgetTranslation = new EventEmitter<any>();
    @Output() onEditWidgetInPopup = new EventEmitter<any>();
    @Output() onOpenTranslateWidget = new EventEmitter<any>();
    @Output() onShowEmailPopup = new EventEmitter<any>();
    @Output() onOpenPropertyPanel = new EventEmitter<any>();
    @Output() onResetWidget = new EventEmitter<WidgetDetail>();
    @Output() onMaximizeWidget = new EventEmitter<any>(); //Toggle: true: maximize, false: restore

    // -----------------------
    @ViewChild('xnFileExplorerComponentCtrl') xnFileExplorerComponentCtrl: XnFileExplorerComponent;
    //@ViewChild('xnMediacodeDialog') xnMediacodeDialog: XnMediacodeDialogComponent;
    @ViewChild('widgetInfoTranslation') widgetModuleInfoTranslationComponent: WidgetModuleInfoTranslationComponent;
    @ViewChild('uploadTemplateFileComponent') uploadTemplateFileComponent: XnUploadTemplateFileComponent;
    @ViewChild(XnWidgetMenuStatusComponent) widgetMenuStatusComponent: XnWidgetMenuStatusComponent;
    @ViewChild('scheduleSetting') private scheduleSetting: ScheduleSettingComponent;
    @ViewChild('scheduleSettingRunImmediately')
    private scheduleSettingRunImmediately: ScheduleSettingRunImmediatelyComponent;
    @ViewChild('widgetProfileSaving') widgetProfileSaving: WidgetProfileSavingComponent;
    @ViewChild('widgetProfileSelect') widgetProfileSelect: WidgetProfileSelectComponent;
    @ViewChild('newLotDialog') newLotDialogComponent: NewLotDialogComponent;
    @ViewChild('signalRPopover') signalRPopover: any;
    @ViewChild('chartWidget') chartWidget: WidgetChartComponent;
    @ViewChild('pdfWidget') pdfWidget: WidgetPdfComponent;
    @ViewChild('widgetDynamicItem') widgetDynamicItem: IWidgetCommonAction;
    // ------------------------

    public menuStatusConfig: any = {
        isForAllCountryCheckbox: false,
        isForAllCountryButton: false,
    };

    public isShowScheduleSetting: boolean = false;
    public isShowScheduleSettingRunImmediately: boolean = false;
    public WidgetTypeView = WidgetType;
    public WidgetAppView = WidgetApp;
    public RepWidgetApp = RepWidgetAppIdEnum;
    public widgetInstance: WidgetModuleComponent;
    public perfectScrollbarConfig: any = {};
    private creditCardSelected: any;
    public countryCheckListData: Country[] = [];
    public fileUploadModuleTypeView = FileUploadModuleType;
    public isShowToolPanelSetting: boolean = false;
    public accessRight: any = {
        read: false,
        edit: false,
        delete: false,
        export: false,
    };
    public accessRightForCommandButton: any = this.initAccessRightDataForCommandButton();
    public accessRightAll: any = {};
    public isCampaignCountrySelection = 0;
    private outputDataCountries: Country[];
    private savingWidgetType: SavingWidgetType;
    public contextMenuData: Array<any> = [];
    private listenKeyValue: string;

    public readonlyGridFormData: WidgetDetail;
    private readonlyGridAutoSwitchToDetailProp = false;
    private readonlyGridMultipleRowDisplayProp = false;
    public resizedLocal: string;
    public isSelectedCountryActive = false;
    private widgetToolbarSetting: any[] = [];
    private requestChangeTab: any = null;
    private currentGridRowItem: any;
    public profileSelectedData: any = {};

    private requestSavePropertiesStateSubscription: Subscription;
    private requestUpdatePropertiesStateSubscription: Subscription;
    private requestApplyPropertiesStateSubscription: Subscription;
    private globalPropertiesStateSubscription: Subscription;
    private requestRollbackPropertiesStateSubscription: Subscription;
    private widgetTemplateSettingServiceSubscription: Subscription;
    private backOfficeServiceSubscription: Subscription;
    private editingWidgetsStateSubscription: Subscription;
    private rowsDataStateSubscription: Subscription;
    private tabChangedSuccessSubscription: Subscription;
    private tabChangedFailedSubscription: Subscription;
    private requestRemoveConnectionFromParentWidgetSubscription: Subscription;
    private requestRemoveConnectionFromChildWidgetSubscription: Subscription;
    private isEditAllWidgetModeStateSubscription: Subscription;
    private isTabViewModeStateSubscription: Subscription;
    private requestFullScreenSubscription: Subscription;

    private requestSavePropertiesState: Observable<any>;
    private requestUpdatePropertiesState: Observable<any>;
    private requestApplyPropertiesState: Observable<any>;
    private globalPropertiesState: Observable<any>;
    private requestRollbackPropertiesState: Observable<any>;
    private editingWidgetsState: Observable<Array<EditingWidget>>;
    private rowsDataState: Observable<any>;
    private isEditAllWidgetModeState: Observable<boolean>;
    private isTabViewModeState: Observable<boolean>;

    private isTabViewMode: boolean;
    public activeRowIndex;

    public widgetFormType: WidgetFormTypeEnum = null;

    // True:  mouse hover in widget box
    // False: mouse hover out widget box
    public hoverBox = false;

    private originalTitle = '';
    public editingTitle: boolean;

    public widgetBackgroundColor = '';

    public isHideWidetToolbarSpecialCase = false;

    public isTranslateDataTextOnly = false;
    public translationDataKeyword: string;

    public noEntryData: boolean = false;
    public noEntryDataIncludeIds: Array<any> = [9, 10, 11];

    public disableButtonEditWidget: boolean;
    public listenKeyRequestItem: any;
    public menuStatusSettings: WidgetMenuStatusModel = new WidgetMenuStatusModel();
    public isHideToolbar: boolean;
    public isSelectingTextContextMenu = false;
    public textFieldContextMenu: any = null;

    constructor(
        public _eref: ElementRef,
        public store: Store<AppState>,
        public widgetTemplateSettingService: WidgetTemplateSettingService,
        public widgetUtils: WidgetUtils,
        public datatableService: DatatableService,
        public modalService: ModalService,
        public treeViewService: TreeViewService,
        protected domHandler: DomHandler,
        public propertyPanelActions: PropertyPanelActions,
        public propertyPanelService: PropertyPanelService,
        private additionalInformationActions: AdditionalInformationActions,
        private appErrorHandler: AppErrorHandler,
        protected componentFactoryResolver: ComponentFactoryResolver,
        private backOfficeService: BackOfficeService,
        protected containerRef: ViewContainerRef,
        private backofficeActions: BackofficeActions,
        private tabButtonActions: TabButtonActions,
        public globalSettingService: GlobalSettingService,
        public articleService: ArticleService,
        public ref: ChangeDetectorRef,
        private layoutInfoActions: LayoutInfoActions,
        private tabSummaryActions: TabSummaryActions,
        private dispatcher: ReducerManagerDispatcher,
        protected widgetDetailActions: WidgetDetailActions,
        private toasterService: ToasterService,
        private processDataActions: ProcessDataActions,
        private _toolsService: ToolsService,
        private _downloadFileService: DownloadFileService,
        private _accessRightsService: AccessRightsService,
        private filterActions: FilterActions,
        private projectService: ProjectService,
        private signalRService: SignalRService,
        public personService: PersonService,
        public menuStatusService: MenuStatusService,
        private contextMenuService: ContextMenuService,
    ) {
        super(
            _eref,
            store,
            modalService,
            propertyPanelService,
            widgetUtils,
            treeViewService,
            widgetTemplateSettingService,
            componentFactoryResolver,
            containerRef,
            domHandler,
            datatableService,
            globalSettingService,
            articleService,
            personService,
            ref,
            widgetDetailActions,
            propertyPanelActions,
        );
        this.widgetInstance = this;

        this.requestSavePropertiesState = this.store.select(
            (state) => propertyPanelReducer.getPropertyPanelState(state, this.currentModule.moduleNameTrim).requestSave,
        );
        this.requestApplyPropertiesState = this.store.select(
            (state) =>
                propertyPanelReducer.getPropertyPanelState(state, this.currentModule.moduleNameTrim).requestApply,
        );
        this.requestUpdatePropertiesState = this.store.select(
            (state) =>
                propertyPanelReducer.getPropertyPanelState(state, this.currentModule.moduleNameTrim)
                    .requestUpdateProperties,
        );
        this.requestRollbackPropertiesState = this.store.select(
            (state) =>
                propertyPanelReducer.getPropertyPanelState(state, this.currentModule.moduleNameTrim)
                    .requestRollbackProperties,
        );
        this.globalPropertiesState = store.select(
            (state) =>
                propertyPanelReducer.getPropertyPanelState(state, ModuleList.Base.moduleNameTrim).globalProperties,
        );
        this.editingWidgetsState = store.select(
            (state) =>
                widgetContentReducer.getWidgetContentDetailState(state, this.currentModule.moduleNameTrim)
                    .editingWidgets,
        );
        this.rowsDataState = this.store.select(
            (state) =>
                widgetContentReducer.getWidgetContentDetailState(state, this.currentModule.moduleNameTrim).rowsData,
        );
        this.isEditAllWidgetModeState = store.select(
            (state) =>
                widgetContentReducer.getWidgetContentDetailState(state, this.currentModule.moduleNameTrim)
                    .isEditAllWidgetMode,
        );
        this.isTabViewModeState = store.select(
            (state) => processDataReducer.getProcessDataState(state, this.currentModule.moduleNameTrim).isViewMode,
        );
    }

    ngOnChanges(changes: SimpleChanges) {
        this.reattach();

        this.listenKeyRequestItem = this.getListenKeyRequestItem();
        this.disableButtonEditWidget = this.listenKeyRequestItem && !this.listenKeyRequestItem.value;

        if (!changes['widgetStates'] && !changes['columnFilter']) {
            return;
        }
        const hasChanges = this.hasChanges(changes['widgetStates']) || this.hasChanges(changes['columnFilter']);

        if (this.payload && this.payload.idRepWidgetApp) {
            this.buildAccessRight();
        }

        if (hasChanges && this.widgetStates.length) {
            this.processData();
        }

        if (this.hasChanges(changes['widgetStates'])) {
            this.showEditingNotification();
            this.checkToHideWidgetToolbarForSpecialCases();

            if (this.isOnEditFileExplorer) {
                this.isOnEditFileExplorer = false;
            }

            if (this.isDeletedFiles) {
                this.isDeletedFiles = false;
            }

            this.intSavingWidgetType();
            // this.waitingWidgetDataLoadedToSetMenu();

            if (this.data.idRepWidgetApp) {
                this.initContextMenu();
            }

            // Check linked widget status at desgin mode
            this.checkLinkedWidgetStatus();
            this.buildIsShowToolPanelSetting();
            this.resetSomeKeyOfSignalR();
        }

        if (this.hasChanges(changes['currentModule'])) {
            this.isCampaignCountrySelection = changes['currentModule'].currentValue.idSettingsGUI;
        }

        this.detach(2000);
    }

    ngOnInit() {
        this.perfectScrollbarConfig = {
            suppressScrollX: false,
            suppressScrollY: false,
        };

        this.menuStatusSettings = this.menuStatusService.createMenuSettings();

        this.accessRightAll = { ...this.accessRight, ...this.accessRightForCommandButton };
        this.menuStatusSettings.accessRight = this.accessRightAll;

        this.isHideToolbar = true;
        this.subscribe();
    }

    ngAfterViewInit() {
        this.signalRRegisterEvent();
    }

    private subscribe() {
        if (this.editingWidgetsStateSubscription) {
            this.editingWidgetsStateSubscription.unsubscribe();
        }

        this.editingWidgetsStateSubscription = this.editingWidgetsState.subscribe(
            (editingWidgets: Array<EditingWidget>) => {
                this.appErrorHandler.executeAction(() => {
                    this.editingWidgets = editingWidgets;
                });
            },
        );

        this.requestSavePropertiesStateSubscription = this.requestSavePropertiesState.subscribe(
            (requestSavePropertiesState: any) => {
                this.appErrorHandler.executeAction(() => {
                    if (
                        requestSavePropertiesState &&
                        JSON.stringify(this.propertiesForSaving) !== JSON.stringify(this.properties)
                    ) {
                        const widgetData: WidgetDetail = requestSavePropertiesState.propertiesParentData;
                        if (widgetData && widgetData.id === this.data.id) {
                            this.changeProperties();
                            this.propertiesForSaving.properties = cloneDeep(this.properties);
                            this._saveMenuChanges();
                        }
                    }
                });
            },
        );

        this.requestApplyPropertiesStateSubscription = this.requestApplyPropertiesState.subscribe(
            (requestApplyPropertiesState: any) => {
                this.appErrorHandler.executeAction(() => {
                    if (requestApplyPropertiesState) {
                        const widgetData: WidgetDetail = requestApplyPropertiesState.propertiesParentData;
                        if (widgetData && widgetData.id === this.data.id) {
                            this.changeProperties();
                            this.saveChangeOfPropDisplayFields();
                            this.saveChangeOfPropImportantDisplayFields();
                            this.saveChangeOfPropFieldFormat();
                        }
                    }
                });
            },
        );

        this.requestUpdatePropertiesStateSubscription = this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return (
                        action.type === PropertyPanelActions.UPDATE_PROPERTIES &&
                        action.module.idSettingsGUI == this.currentModule.idSettingsGUI
                    );
                }),
                map((action: CustomAction) => {
                    return action.payload;
                }),
            )
            .subscribe((actionData) => {
                this.appErrorHandler.executeAction(() => {
                    if (actionData) {
                        const widgetData: WidgetDetail = actionData.widgetData;
                        const properties: any = actionData.widgetProperties;
                        if (
                            widgetData &&
                            widgetData.id &&
                            this.data.id &&
                            widgetData.id === this.data.id &&
                            properties
                        ) {
                            this.changeProperties();
                            this.requestDataWhenChangePropety(actionData);
                            this.reattach();
                            this.detach(2000);
                        }
                    }
                });
            });

        this.requestRollbackPropertiesStateSubscription = this.requestRollbackPropertiesState.subscribe(
            (requestRollbackPropertiesState: any) => {
                this.appErrorHandler.executeAction(() => {
                    if (
                        requestRollbackPropertiesState &&
                        requestRollbackPropertiesState.data &&
                        !requestRollbackPropertiesState.isGlobal
                    ) {
                        const widgetData: WidgetDetail = requestRollbackPropertiesState.data;
                        if (widgetData && widgetData.id && this.data.id && widgetData.id === this.data.id) {
                            // update original properties for saving before assign it to the properties
                            this.updateOrgPropertiesBeforeRollback();
                            if (isNil(this.propertiesForSaving.properties)) {
                                this.properties = cloneDeep(this.propertiesForSaving);
                            } else {
                                this.properties = cloneDeep(this.propertiesForSaving.properties);
                            }
                            const propTitleText: WidgetPropertyModel = this.propertyPanelService.getItemRecursive(
                                this.properties,
                                'TitleText',
                            );
                            propTitleText.translatedValue = this.title.value;
                            this.updatePropertiesFromGlobalProperties(this.globalProperties);
                            const widgetPropertiesStateModel: WidgetPropertiesStateModel =
                                new WidgetPropertiesStateModel({
                                    widgetData: this.data,
                                    widgetProperties: this.properties,
                                });
                            this.store.dispatch(
                                this.propertyPanelActions.updateProperties(
                                    widgetPropertiesStateModel,
                                    this.currentModule,
                                ),
                            );
                        }
                    }
                });
            },
        );

        this.globalPropertiesStateSubscription = this.globalPropertiesState.subscribe((globalProperties: any) => {
            this.appErrorHandler.executeAction(() => {
                if (globalProperties) {
                    this.globalProperties = globalProperties;
                    this.updatePropertiesFromGlobalProperties(globalProperties);
                }
            });
        });

        if (this.rowsDataStateSubscription) this.rowsDataStateSubscription.unsubscribe();
        this.rowsDataStateSubscription = this.rowsDataState.subscribe((rowsData: any) => {
            this.appErrorHandler.executeAction(() => {
                this.selectedRowsData = rowsData;
            });
        });

        this.tabChangedSuccessSubscription = this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return (
                        action.type === TabSummaryActions.TAB_CHANGED_SUCCESS &&
                        action.module.idSettingsGUI == this.currentModule.idSettingsGUI
                    );
                }),
            )
            .subscribe(() => {
                this.appErrorHandler.executeAction(() => {
                    if (this.requestChangeTab) {
                        if (this.requestChangeTab.nextEvent == 'new') {
                            setTimeout(() => {
                                this.store.dispatch(this.widgetDetailActions.canceAllWidgetEditing(this.currentModule));
                                this.store.dispatch(this.tabButtonActions.requestNew(this.currentModule));
                                this.requestChangeTab = null;
                            }, 100);
                        } else if (this.requestChangeTab.nextEvent == 'edit') {
                            setTimeout(() => {
                                this.store.dispatch(this.widgetDetailActions.canceAllWidgetEditing(this.currentModule));
                                this.store.dispatch(this.tabButtonActions.requestEdit(this.currentModule));
                                this.requestChangeTab = null;
                            }, 100);
                        }
                    }
                });
            });

        this.tabChangedFailedSubscription = this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return (
                        action.type === TabSummaryActions.TAB_CHANGED_FAILED &&
                        action.module.idSettingsGUI == this.currentModule.idSettingsGUI
                    );
                }),
            )
            .subscribe(() => {
                this.appErrorHandler.executeAction(() => {
                    if (this.requestChangeTab) {
                        if (this.requestChangeTab.nextEvent == 'new') {
                            this.toasterService.pop('warning', 'Add Failed', 'Cannot add new data');
                        } else if (this.requestChangeTab.nextEvent == 'edit') {
                            this.toasterService.pop('warning', 'Edit Failed', 'Cannot edit this data');
                        }

                        this.requestChangeTab = null;
                    }
                });
            });

        this.requestRemoveConnectionFromParentWidgetSubscription = this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return (
                        action.type === WidgetDetailActions.REQUEST_REMOVE_CONNECTION_FROM_PARENT_WIDGET &&
                        action.module.idSettingsGUI == this.currentModule.idSettingsGUI
                    );
                }),
                map((action: CustomAction) => {
                    return action.payload;
                }),
            )
            .subscribe((parentWidgetId) => {
                this.appErrorHandler.executeAction(() => {
                    if (
                        parentWidgetId &&
                        ((this.data.widgetDataType.parentWidgetIds &&
                            this.data.widgetDataType.parentWidgetIds.indexOf(parentWidgetId) !== -1) ||
                            (this.data.syncWidgetIds && this.data.syncWidgetIds.indexOf(parentWidgetId) !== -1))
                    ) {
                        this.removeLinkWidgetSuccess(true);
                        this.linkedSuccessWidget = false;
                    }
                });
            });

        this.requestRemoveConnectionFromChildWidgetSubscription = this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return (
                        action.type === WidgetDetailActions.REQUEST_REMOVE_CONNECTION_FROM_CHILD_WIDGET &&
                        action.module.idSettingsGUI == this.currentModule.idSettingsGUI
                    );
                }),
                map((action: CustomAction) => {
                    return action.payload;
                }),
            )
            .subscribe((parentWidgetIds: Array<string>) => {
                this.appErrorHandler.executeAction(() => {
                    if (parentWidgetIds && parentWidgetIds.length) {
                        parentWidgetIds.forEach((parentWidgetId) => {
                            if (parentWidgetId == this.data.id) {
                                this.linkedSuccessWidget = false;
                                this.checkLinkedWidgetStatus();
                            }
                        });
                    }
                });
            });

        this.isEditAllWidgetModeStateSubscription = this.isEditAllWidgetModeState.subscribe(
            (isEditAllWidgetModeState: boolean) => {
                this.appErrorHandler.executeAction(() => {
                    if (this.isEditAllWidgetMode !== isEditAllWidgetModeState) {
                        this.isEditAllWidgetMode = isEditAllWidgetModeState;
                    }
                });
            },
        );

        this.subcribeIsViewModeState();

        this.requestFullScreenSubscription = this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return (
                        action.type === LayoutInfoActions.REQUEST_FULLSCREEN &&
                        action.module.idSettingsGUI == this.currentModule.idSettingsGUI
                    );
                }),
            )
            .subscribe((data: any) => {
                this.appErrorHandler.executeAction(() => {
                    if (data && data.payload) {
                        if (data.payload.tabID) {
                            if (data.payload.tabID == this.tabID) {
                                this.maximizeWidget({ isMaximized: data.payload.isMaximized });
                            }
                        } else {
                            if (!data.payload.isMaximized) {
                                this.maximizeWidget({ isMaximized: data.payload.isMaximized });
                            }
                        }
                    }
                });
            });
    } //subscribe

    public onChangeColumnLayoutHandler($event) {
        this.widgetMenuStatusComponent.onColumnsLayoutSettingsChanged();
        if ($event && $event.type == 'columnResized' && $event.source == 'autosizeColumns') {
            this.allowFitColumn = false;
            if (this.columnLayoutsetting) {
                this.columnLayoutsetting.isFitWidthColumn = false;
                this.updateFitWidthColumnProperty(this.columnLayoutsetting);
            }
        }
        setTimeout(() => {
            this.reattach();
            this.ref.detectChanges();
        }, 250);
    }

    private subcribeIsViewModeState() {
        this.isTabViewModeStateSubscription = this.isTabViewModeState.subscribe((isViewModeState: boolean) => {
            this.appErrorHandler.executeAction(() => {
                this.isTabViewMode = isViewModeState;
            });
        });
    }

    private checkToHideWidgetToolbarForSpecialCases() {
        if (this.isHideWidetToolbarSpecialCase) return;

        if (this.data) {
            // is return-refund module and is
            // new-invoice/return-payment/refund-payment/invoice-number
            this.isHideWidetToolbarSpecialCase =
                this.data.idRepWidgetType === WidgetType.ReturnRefund &&
                (this.data.idRepWidgetApp == 78 ||
                    this.data.idRepWidgetApp == 85 ||
                    this.data.idRepWidgetApp == 77 ||
                    this.data.idRepWidgetApp == 74);
        }
    }

    public controlMenuStatusToolButtons(value: boolean) {
        if (this.widgetMenuStatusComponent) {
            this.widgetMenuStatusComponent.toggleToolButtonsWithoutClick(value);

            //this.onToolbarButtonsToggleHandler(value);
        }
    }

    private updateOrgPropertiesBeforeRollback() {
        // display fields
        this.updateChangeOfPropDisplayFields();

        // important fields
        this.updateChangeOfPropImportantDisplayFields();

        // Field Format (Label + Data)
        if (
            this.data.idRepWidgetType === WidgetType.FieldSet ||
            this.data.idRepWidgetType === WidgetType.Combination ||
            this.data.idRepWidgetType === WidgetType.CombinationCreditCard ||
            this.data.idRepWidgetType === WidgetType.FieldSetReadonly
        ) {
            this.updateChangeOfPropLabelFieldFormat();
            this.updateChangeOfPropDataFieldFormat();
        }
    }

    private saveChangeOfPropDisplayFields() {
        if (this.updateChangeOfPropDisplayFields()) {
            this._saveMenuChanges(false);
        }
    }

    private updateChangeOfPropDisplayFields(): boolean {
        // get from properties
        const propDisplayField: WidgetPropertyModel = this.propertyPanelService.getItemRecursive(
            this.properties,
            'DisplayField',
        );
        const propDisplayColumn: WidgetPropertyModel = this.propertyPanelService.getItemRecursive(
            this.properties,
            'DisplayColumn',
        );
        // get from propertiesForSaving
        const propDisplayField_ForSaving: WidgetPropertyModel = this.propertyPanelService.getItemRecursive(
            this.propertiesForSaving.properties,
            'DisplayField',
        );
        const propDisplayColumn_ForSaving: WidgetPropertyModel = this.propertyPanelService.getItemRecursive(
            this.propertiesForSaving.properties,
            'DisplayColumn',
        );
        // update
        if (
            (propDisplayField &&
                JSON.stringify(propDisplayField.options) !== JSON.stringify(propDisplayField_ForSaving.options)) ||
            (propDisplayColumn &&
                JSON.stringify(propDisplayColumn.options) !== JSON.stringify(propDisplayColumn_ForSaving.options))
        ) {
            if (propDisplayField) propDisplayField_ForSaving.options = cloneDeep(propDisplayField.options);
            if (propDisplayColumn) propDisplayColumn_ForSaving.options = cloneDeep(propDisplayColumn.options);
            return true;
        }
        return false;
    }

    private saveChangeOfPropImportantDisplayFields() {
        if (this.updateChangeOfPropImportantDisplayFields()) {
            // Reset widget properties dirty
            this.properties = this.propertyPanelService.resetDirty(this.properties);
            this.propertiesForSaving.properties = this.propertyPanelService.resetDirty(
                this.propertiesForSaving.properties,
            );

            // Save setting here
            this.onChangeFieldFilter.emit({
                widgetDetail: this.data,
            });
        }
    }

    private updateChangeOfPropImportantDisplayFields(): boolean {
        if (
            !(
                this.data.idRepWidgetType === WidgetType.FieldSet ||
                this.data.idRepWidgetType === WidgetType.DataGrid ||
                this.data.idRepWidgetType === WidgetType.Combination ||
                this.data.idRepWidgetType === WidgetType.CombinationCreditCard ||
                this.data.idRepWidgetType === WidgetType.FieldSetReadonly
            )
        )
            return false;

        // get from properties
        const propDisplayField: WidgetPropertyModel = this.propertyPanelService.getItemRecursive(
            this.properties,
            'ImportantDisplayFields',
        );
        // get from propertiesForSaving
        const propDisplayField_ForSaving: WidgetPropertyModel = this.propertyPanelService.getItemRecursive(
            this.propertiesForSaving.properties,
            'ImportantDisplayFields',
        );
        // update
        if (
            propDisplayField &&
            JSON.stringify(propDisplayField.options) !== JSON.stringify(propDisplayField_ForSaving.options)
        ) {
            if (propDisplayField) propDisplayField_ForSaving.options = cloneDeep(propDisplayField.options);
            return true;
        }
        return false;
    }

    /**
     * saveChangeOfPropFieldFormat
     */
    private saveChangeOfPropFieldFormat() {
        if (
            !(
                this.data.idRepWidgetType === WidgetType.FieldSet ||
                this.data.idRepWidgetType === WidgetType.Combination ||
                this.data.idRepWidgetType === WidgetType.CombinationCreditCard ||
                this.data.idRepWidgetType === WidgetType.FieldSetReadonly
            )
        )
            return;

        let isUpdated: boolean = false;
        // update Prop Label Field Format
        if (this.updateChangeOfPropLabelFieldFormat()) {
            // Reset widget properties dirty
            this.properties = this.propertyPanelService.resetDirty(this.properties);
            this.propertiesForSaving.properties = this.propertyPanelService.resetDirty(
                this.propertiesForSaving.properties,
            );
            isUpdated = true;
        }
        // update Prop Data Field Format
        if (this.updateChangeOfPropDataFieldFormat()) {
            // Reset widget properties dirty
            this.properties = this.propertyPanelService.resetDirty(this.properties);
            this.propertiesForSaving.properties = this.propertyPanelService.resetDirty(
                this.propertiesForSaving.properties,
            );
            isUpdated = true;
        }

        if (isUpdated) {
            // Save setting here
            this.onChangeFieldFilter.emit({
                widgetDetail: this.data,
            });
        }
    }

    private updateChangeOfPropLabelFieldFormat(): boolean {
        const labelDisplayProp: WidgetPropertyModel = this.propertyPanelService.getItemRecursive(
            this.properties,
            'LabelDisplay',
        );
        const labelDisplayProp_ForSaving: WidgetPropertyModel = this.propertyPanelService.getItemRecursive(
            this.propertiesForSaving.properties,
            'LabelDisplay',
        );
        // update
        if (
            labelDisplayProp &&
            labelDisplayProp_ForSaving &&
            JSON.stringify(labelDisplayProp.value) !== JSON.stringify(labelDisplayProp_ForSaving.value)
        ) {
            labelDisplayProp_ForSaving.value = cloneDeep(labelDisplayProp.value);
            return true;
        }
        return false;
    }

    private updateChangeOfPropDataFieldFormat(): boolean {
        const dataDisplayProp: WidgetPropertyModel = this.propertyPanelService.getItemRecursive(
            this.properties,
            'DataDisplay',
        );
        const dataDisplayProp_ForSaving: WidgetPropertyModel = this.propertyPanelService.getItemRecursive(
            this.propertiesForSaving.properties,
            'DataDisplay',
        );
        // update
        if (
            dataDisplayProp &&
            dataDisplayProp_ForSaving &&
            JSON.stringify(dataDisplayProp.value) !== JSON.stringify(dataDisplayProp_ForSaving.value)
        ) {
            dataDisplayProp_ForSaving.value = cloneDeep(dataDisplayProp.value);
            return true;
        }
        return false;
    }

    /**
     * ngOnDestroy
     */
    ngOnDestroy() {
        this.removeHorizontalPerfectScrollEvent();
        this.removeVerticalPerfectScrollEvent();
        Uti.unsubscribe(this);
        this.runImmediatelyRowDatas.length = 0;
    }

    saveWidget(event): void {
        switch (this.data.idRepWidgetType) {
            case WidgetType.FieldSet:
                this.saveFormWidget();
                break;
            case WidgetType.Combination:
                this.saveCombinationWidget();
                break;

            case WidgetType.CombinationCreditCard:
                this.saveFormCreditCardCombinationWidget();
                break;

            case WidgetType.EditableTable:
            case WidgetType.EditableGrid:
            case WidgetType.EditableRoleTreeGrid:
                this.saveEditableTableWidget();
                break;

            case WidgetType.FileExplorer:
            case WidgetType.ToolFileTemplate:
                this.saveFileExplorerWidget();
                break;
            case WidgetType.FileExplorerWithLabel:
                if (this.xnFileExplorerComponentCtrl) {
                    this.xnFileExplorerComponentCtrl.saveUpdateData();
                }
                break;
            case WidgetType.FileTemplate:
                this.saveFileManagement();
                break;

            case WidgetType.TreeView:
                this.saveTreeView();
                break;

            case WidgetType.Translation: {
                this.widgetTranslationComponent.submit(() => {
                    this.onSaveSuccessWidget.emit(this.data);
                    this.reloadWidgets.emit([
                        this.widgetTranslationComponent.translateCommunicationData.srcWidgetDetail,
                    ]);
                });
                break;
            }

            case WidgetType.DocumentProcessing:
                if (this.widgetDocumentFormComponent) {
                    this.widgetDocumentFormComponent.save();
                }
                break;
        }

        this.buildContextMenu(
            this.contextMenuData,
            this.data.idRepWidgetType,
            this.currentModule,
            this.toolbarSetting,
            this.selectedTabHeader,
            this.activeSubModule,
        );
    }

    /**
     * resetWidget
     */
    public resetWidget(callback?: Function): void {
        if (this.agGridComponent) {
            this.agGridComponent.stopEditing();
        }
        // show message modal in case of widget edited
        setTimeout(() => {
            if (this.isWidgetDataEdited) {
                setTimeout(() => {
                    // this.initForMessageModal(MessageModal.MessageType.warning);
                    this.modalService.unsavedWarningMessage({
                        headerText: 'Reset Widget',
                        message: [
                            { key: '<p>' },
                            { key: 'Modal_Message__DoYouWantToSaveTheseChanges' },
                            { key: '<p>' },
                        ],
                        onModalSaveAndExit: this.onModalSaveAndExit.bind(this),
                        onModalExit: this.onModalExit.bind(this),
                        onModalCancel: this.onModalCancel.bind(this),
                    });
                });
                return;
            }
            this.resetEditingWidget(callback);
        });
    }

    private cancelEditing() {
        this.resetWidget();
    }

    /**
     * resetWidgetToViewMode
     **/
    public resetWidgetToViewMode(fromWidgetContainer?: boolean, callback?: Function) {
        switch (this.data.idRepWidgetType) {
            case WidgetType.FieldSet:
            case WidgetType.FieldSetReadonly:
                this.resetForm();
                break;
            case WidgetType.CombinationCreditCard:
                this.resetForm();
                this.resetValueForCreditCard();
                break;
            case WidgetType.EditableTable:
            case WidgetType.EditableGrid:
            case WidgetType.EditableRoleTreeGrid:
                this.changeDisplayTable(true);
                this.manageEditableTableStatusButtonsAfterSaving();
                this.isOnEditingTable = false;
                this.isTableEdited = false;
                this.templateId = null;
                if (this.agGridComponent) {
                    // this.agGridComponent.isSelectDeletedAll = false;
                    this.agGridComponent.toggleDeleteColumn(false);
                }

                if (!fromWidgetContainer && (this.data.idRepWidgetApp == 116 || this.data.idRepWidgetApp == 117)) {
                    this.isCustomerStatusWidgetEdit = false;
                }
                this.changeToEditModeDefault();
                break;
            case WidgetType.Combination:
                this.changeDisplayTable(true);
                this.manageEditableTableStatusButtonsAfterSaving();
                this.isOnEditingTable = false;
                this.isTableEdited = false;
                this.widgetFormComponent.resetValue();
                if (!this.showInDialog) {
                    this.widgetFormComponent.editFormMode = false;
                    this.widgetFormComponent.resetToViewMode();
                }

                if (this.agGridComponent) {
                    // this.agGridComponent.isSelectDeletedAll = false;
                }
                break;
            case WidgetType.TreeView:
                this.resetTreeView();
                break;
            case WidgetType.Upload:
                //this.articleMediaManagerComponent.uploadMode = false;
                break;
            case WidgetType.FileExplorer:
            case WidgetType.ToolFileTemplate:
                this.resetFileExplorer();
                break;
            case WidgetType.FileExplorerWithLabel:
                this.xnFileExplorerComponentCtrl.resetData(true);
                if (callback) callback();
                break;
            case WidgetType.FileTemplate:
                this.resetFileManagement();
                break;
            case WidgetType.Translation:
                if (this.widgetTranslationComponent) {
                    this.widgetTranslationComponent.reload();
                }
                break;

            default:
                break;
        }
    }

    /**
     * resetEditingWidget
     */
    public resetEditingWidget(callback?: Function) {
        this.menuStatusOpacity = 0;
        this.resetWidgetToViewMode(null, callback);
        if (!this.showInDialog) {
            this.onCancelEditingWidget.emit(this.data);
        }
        this.onResetWidget.emit(this.data);
        this.buildContextMenu(
            this.contextMenuData,
            this.data.idRepWidgetType,
            this.currentModule,
            this.toolbarSetting,
            this.selectedTabHeader,
            this.activeSubModule,
        );
        this.reattach();
        this.reEditWhenInPopup();
        this.runImmediatelyRowDatas.length = 0;
    }

    public reEditWhenInPopup() {
        // re-open the edit button command of menu status when edit in popup
        this.menuStatusOpacity = 0;
        if (this.showInDialog) {
            setTimeout(() => {
                this.editWidget();
                this.menuStatusOpacity = 1;
            }, 200);
        } else {
            this.menuStatusOpacity = 1;
        }
    }

    editWidget(widgetType?: any) {
        if (widgetType != EditWidgetTypeEnum.InPopup) {
            switch (widgetType) {
                case EditWidgetTypeEnum.EditableDeleteRow:
                    this.deleteRowEditableTable();
                    break;

                case EditWidgetTypeEnum.EditableAddNewRow:
                    this.addRowEditableTable();
                    break;

                default:
                    switch (this.data.idRepWidgetType) {
                        case WidgetType.FieldSet:
                        case WidgetType.Combination:
                        case WidgetType.CombinationCreditCard:
                        case WidgetType.Translation:
                            this.editFormWidget(widgetType);
                            this.contextMenuData = this.widgetUtils.contextMenuInEditMode(
                                this.contextMenuData,
                                this.getAccessRightAll(),
                            );
                            break;
                        case WidgetType.EditableTable:
                        case WidgetType.EditableGrid:
                        case WidgetType.EditableRoleTreeGrid:
                        case WidgetType.FileExplorer:
                        case WidgetType.ToolFileTemplate:
                        case WidgetType.ToolFileTemplate:
                        case WidgetType.FileExplorerWithLabel:
                        case WidgetType.FileTemplate:
                            this.editEditableTableWidget(widgetType);
                            break;
                        case WidgetType.TreeView: {
                            this.editTreeView();
                            this.contextMenuData = this.widgetUtils.contextMenuInEditMode(
                                this.contextMenuData,
                                this.getAccessRightAll(),
                            );
                            break;
                        }
                    }
            }
        } else {
            this.onEditWidgetInPopup.emit(this.data);
        }
    }

    /**
     * hasChanges
     * @param changes
     */
    private hasChanges(changes) {
        return changes && changes.hasOwnProperty('currentValue') && changes.hasOwnProperty('previousValue');
    }

    private intSavingWidgetType(): void {
        if (!this.savingWidgetType && this.data.idRepWidgetType) {
            switch (this.data.idRepWidgetType) {
                case WidgetType.Combination:
                    this.savingWidgetType = SavingWidgetType.Combination;
                    break;
                case WidgetType.CombinationCreditCard:
                    this.savingWidgetType = SavingWidgetType.CombinationCreditCard;
                    break;
                case WidgetType.Country:
                    this.savingWidgetType = SavingWidgetType.Country;
                    break;
                case WidgetType.FieldSet:
                    this.savingWidgetType = SavingWidgetType.Form;
                    break;
                case WidgetType.TreeView:
                    this.savingWidgetType = SavingWidgetType.TreeView;
                    break;
                case WidgetType.FileTemplate:
                    this.savingWidgetType = SavingWidgetType.FileTemplate;
                default:
                    this.savingWidgetType = SavingWidgetType.EditableTable;
                    break;
            }
        }
    }

    private initContextMenu() {
        this.widgetTemplateSettingService
            .getWidgetToolbar(null, null, this.currentModule.idSettingsGUI, ModuleType.WIDGET_TOOLBAR)
            .subscribe((response: ApiResultResponse) => {
                if (!Uti.isResquestSuccess(response)) {
                    return;
                }

                let contextMenuText: any = {
                    name: this.currentModule.moduleName,
                    id: this.currentModule.moduleName,
                };

                //let moduleNameText = this.currentModule.moduleName;
                if (response.item.length && response.item[0].jsonSettings) {
                    let widgetToolbarJson = Uti.tryParseJson(response.item[0].jsonSettings);
                    if (widgetToolbarJson && widgetToolbarJson.length) {
                        this.widgetToolbarSetting = widgetToolbarJson;
                        contextMenuText = this.widgetUtils.getTabIDFromWidgetToolbar(
                            contextMenuText,
                            this.data.idRepWidgetApp,
                            this.widgetToolbarSetting,
                        );
                    }
                }

                this.contextMenuData = [
                    {
                        id: 'widget-new-entity-menu-context',
                        title: 'New ' + contextMenuText.name,
                        iconName: 'fa-plus  green-color',
                        key: this.currentModule.moduleName + '_New',
                        callback: (event) => {
                            if (contextMenuText.name != this.currentModule.moduleName) {
                                this.requestChangeTab = {
                                    nextEvent: 'new',
                                };
                                this.store.dispatch(
                                    this.tabSummaryActions.requestSelectTab(contextMenuText.id, this.currentModule),
                                );
                            } else {
                                this.store.dispatch(this.tabButtonActions.requestNew(this.currentModule));
                            }
                        },
                        subject: new Subject(),
                        disabled: false,
                        children: [],
                        hidden: true,
                    },
                    {
                        id: 'widget-edit-entity-menu-context',
                        title: 'Edit ' + contextMenuText.name,
                        iconName: 'fa-pencil-square-o  orange-color',
                        key: this.currentModule.moduleName + '_Edit',
                        callback: (event) => {
                            if (contextMenuText.name != this.currentModule.moduleName) {
                                this.requestChangeTab = {
                                    nextEvent: 'edit',
                                };
                                this.store.dispatch(
                                    this.tabSummaryActions.requestSelectTab(contextMenuText.id, this.currentModule),
                                );
                            } else {
                                this.store.dispatch(this.tabButtonActions.requestEdit(this.currentModule));
                            }
                        },
                        subject: new Subject(),
                        disabled: false,
                        children: [],
                        hidden: true,
                    },
                    {
                        id: 'widget-clone-entity-menu-context',
                        title: 'Clone ' + contextMenuText.name,
                        iconName: 'fa-copy',
                        callback: (event) => {
                            if (contextMenuText.name != this.currentModule.moduleName) {
                                this.requestChangeTab = {
                                    nextEvent: 'clone',
                                };
                                this.store.dispatch(
                                    this.tabSummaryActions.requestSelectTab(contextMenuText.id, this.currentModule),
                                );
                            } else {
                                this.store.dispatch(this.tabButtonActions.requestClone(this.currentModule));
                            }
                        },
                        subject: new Subject(),
                        disabled: false,
                        children: [],
                        hidden: true,
                    },
                    {
                        id: 'widget-separator-menu-context',
                        title: '',
                        iconName: '',
                        callback: (event) => {},
                        subject: new Subject(),
                        disabled: false,
                        children: [],
                        hidden: false,
                        isSeparator: true,
                    },
                    {
                        id: 'widget-edit-menu-context',
                        title: 'Edit Widget',
                        iconName: 'fa-pencil-square-o  orange-color',
                        callback: (event) => {
                            if (this.widgetMenuStatusComponent) {
                                this.controlMenuStatusToolButtons(true);

                                switch (this.data.idRepWidgetType) {
                                    case WidgetType.FieldSet:
                                    case WidgetType.Combination:
                                    case WidgetType.CombinationCreditCard:
                                        this.widgetMenuStatusComponent.editWidget('form');
                                        break;
                                    case WidgetType.EditableTable:
                                    case WidgetType.EditableGrid:
                                    case WidgetType.ToolFileTemplate:
                                    case WidgetType.FileExplorer:
                                    case WidgetType.ToolFileTemplate:
                                        this.widgetMenuStatusComponent.editWidget('table');
                                        break;
                                    case WidgetType.FileExplorerWithLabel:
                                        this.widgetMenuStatusComponent.toggleToolButtons(true);
                                        break;
                                    case WidgetType.Country:
                                        this.widgetMenuStatusComponent.editWidget('country');
                                        break;
                                    case WidgetType.TreeView: {
                                        this.widgetMenuStatusComponent.editWidget('treeview');
                                        break;
                                    }
                                }
                            }
                        },
                        subject: new Subject(),
                        disabled: false,
                        children: [],
                        hidden: true,
                    },
                    {
                        id: 'widget-save-menu-context',
                        title: 'Save Widget',
                        iconName: 'fa-floppy-o  orange-color',
                        callback: (event) => {
                            this.saveWidget(this.savingWidgetType);
                        },
                        subject: new Subject(),
                        disabled: false,
                        children: [],
                        hotkey: 'Ctrl + S',
                        // hidden: !this.getAccessRightForCommandButton('ToolbarButton') || !this.getAccessRightForCommandButton('ToolbarButton__EditButton')
                        hidden: !this.accessRight['edit'] || !this.getAccessRightForCommandButton('ToolbarButton'),
                    },
                    {
                        id: 'widget-add-row-menu-context',
                        title: 'Add Row',
                        iconName: 'fa-plus  green-color',
                        callback: (event) => {
                            this.addRowEditableTable();
                        },
                        subject: new Subject(),
                        disabled: false,
                        children: [],
                        // hidden: !this.getAccessRightForCommandButton('ToolbarButton') || !this.getAccessRightForCommandButton('ToolbarButton__EditButton')
                        hidden: !this.accessRight['edit'] || !this.getAccessRightForCommandButton('ToolbarButton'),
                    },
                    {
                        id: 'widget-upload-file-menu-context',
                        title: 'Upload File',
                        iconName: 'fa-cloud-upload  green-color',
                        callback: (event) => {
                            this.onUploadFileClick();
                        },
                        subject: new Subject(),
                        disabled: false,
                        children: [],
                        hotkey: '',
                        // hidden: !this.getAccessRightForCommandButton('ToolbarButton') || !this.getAccessRightForCommandButton('ToolbarButton__EditButton')
                        hidden: !this.accessRight['edit'] || !this.getAccessRightForCommandButton('ToolbarButton'),
                    },
                    {
                        id: 'widget-delete-file-menu-context',
                        title: 'Delete File',
                        iconName: 'fa-trash-o  red-color',
                        callback: (event) => {
                            this.onClickDeleteFiles();
                        },
                        subject: new Subject(),
                        disabled: false,
                        children: [],
                        hotkey: '',
                        // hidden: !this.getAccessRightForCommandButton('ToolbarButton') || !this.getAccessRightForCommandButton('ToolbarButton__EditButton')
                        hidden: !this.accessRight['delete'] || !this.getAccessRightForCommandButton('ToolbarButton'),
                    },
                    {
                        id: 'widget-cancel-menu-context',
                        title: 'Cancel Edit Widget',
                        iconName: 'fa-undo  red-color',
                        callback: (event) => {
                            this.cancelEditing();
                        },
                        subject: new Subject(),
                        disabled: false,
                        children: [],
                        // hidden: !this.getAccessRightForCommandButton('ToolbarButton') || !this.getAccessRightForCommandButton('ToolbarButton__EditButton')
                        hidden: !this.accessRight['edit'] || !this.getAccessRightForCommandButton('ToolbarButton'),
                    },
                    {
                        id: 'widget-translate-menu-context',
                        title: 'Translate',
                        iconName: 'fa-language  blue-color',
                        callback: (event) => {
                            // this.translateWidget(event);
                            this.openTranslateWidget(event);
                        },
                        subject: new Subject(),
                        disabled: false,
                        children: [],
                        hidden:
                            !this.getAccessRightForCommandButton('ToolbarButton') ||
                            !this.getAccessRightForCommandButton('ToolbarButton__TranslateButton'),
                    },
                    {
                        id: 'widget-translate-fields-menu-context',
                        title: 'Translate Fields',
                        iconName: 'fa-tasks',
                        callback: (event) => {
                            this.onOpenFieldTranslateWidget(event);
                        },
                        subject: new Subject(),
                        disabled: false,
                        children: [],
                        hidden:
                            !(this.data.idRepWidgetApp == 106) ||
                            !this.getAccessRightForCommandButton('ToolbarButton') ||
                            !this.getAccessRightForCommandButton('ToolbarButton__TranslateButton'),
                    },
                    {
                        id: 'widget-print-menu-context',
                        title: 'Print',
                        iconName: 'fa-print',
                        callback: (event) => {
                            this.printWidget();
                        },
                        subject: new Subject(),
                        disabled: false,
                        children: [],
                        hidden:
                            !this.getAccessRightForCommandButton('ToolbarButton') ||
                            !this.getAccessRightForCommandButton('ToolbarButton__PrintButton'),
                    },
                    {
                        id: 'widget-refresh-menu-context',
                        title: 'Refresh',
                        iconName: 'fa-undo  green-color',
                        callback: (event) => {
                            this.onRefreshWidget();
                        },
                        subject: new Subject(),
                        disabled: false,
                        children: [],
                        hidden: false,
                    },
                ];

                this.buildContextMenu(
                    this.contextMenuData,
                    this.data.idRepWidgetType,
                    this.currentModule,
                    this.toolbarSetting,
                    this.selectedTabHeader,
                    this.activeSubModule,
                );
                this.rebuildContextMenuForToggleEditForm();
            });
    }

    private rebuildContextMenuForToggleEditForm() {
        if (this.data.idRepWidgetType == WidgetType.FileExplorerWithLabel) {
            this.makeEditingContextMenuForFileExplorerComponent(this.xnFileExplorerComponentCtrl.isEditing);
        }
    }

    private timesLoopSetRightMenu = 0;
    private waitingWidgetDataLoadedToSetMenu() {
        setTimeout(() => {
            if (this.timesLoopSetRightMenu > 50) {
                return;
            }
            if (!this.data.idRepWidgetType) {
                this.waitingWidgetDataLoadedToSetMenu();
                this.timesLoopSetRightMenu++;
                return;
            }
            this.buildContextMenu(
                this.contextMenuData,
                this.data.idRepWidgetType,
                this.currentModule,
                this.toolbarSetting,
                this.selectedTabHeader,
                this.activeSubModule,
            );
        }, 300);
    }

    private translateWidget(event) {
        if (this.widgetFormComponent && this.widgetFormComponent.editLanguageMode !== undefined) {
            this.widgetFormComponent.editLanguageMode = true;
            this.contextMenuData = this.widgetUtils.contextMenuInTranslateMode(
                this.contextMenuData,
                this.data.idRepWidgetType,
                this.getAccessRightAll(),
                this.data.idRepWidgetApp,
            );
        }
    }

    private processData(): void {
        if (isEmpty(this.data)) {
            return;
        }
        if (!isNil(this.data.idRepWidgetType) && this.data.idRepWidgetType !== WidgetType.Combination)
            this.selectedSubFilter = null;

        this.updateDataForWidgetMenuStatus();

        if (this.columnLayoutsetting) this.columnLayout = this.columnLayoutsetting.columnLayout;

        if (this.data.widgetDataType && this.data.widgetDataType.listenKey && this.data.widgetDataType.listenKey.main) {
            const key = this.data.widgetDataType.listenKey.main[0].key;
            this.listenKeyValue = this.data.widgetDataType.listenKeyRequest(this.currentModule.moduleNameTrim)[key];
        }

        if (this.widgetUtils.isTableWidgetDataType(this.data)) {
            if (!this.isWidgetDataEdited && !this.checkCurrentWidgetHasChildrenInEditMode()) {
                this.formatTableSetting();
                // Build datatable
                this.changeDisplayTable(true);
                this.manageEditableTableStatusButtonsAfterSaving();
            }
        }

        if (
            this.data.idRepWidgetType === WidgetType.FieldSet ||
            this.data.idRepWidgetType === WidgetType.DataGrid ||
            this.data.idRepWidgetType === WidgetType.EditableGrid ||
            this.data.idRepWidgetType === WidgetType.EditableTable ||
            this.data.idRepWidgetType === WidgetType.TableWithFilter ||
            this.data.idRepWidgetType === WidgetType.Combination ||
            this.data.idRepWidgetType === WidgetType.FileExplorer ||
            this.data.idRepWidgetType === WidgetType.ToolFileTemplate ||
            this.data.idRepWidgetType === WidgetType.FileExplorerWithLabel ||
            this.data.idRepWidgetType === WidgetType.EditableRoleTreeGrid ||
            this.data.idRepWidgetType === WidgetType.CombinationCreditCard
        ) {
            this.allowWidgetInfoTranslation = true;
        }
        if (this.widgetMenuStatusComponent && this.showInDialog) {
            this.widgetMenuStatusComponent.isShowProperties = false;
            this.widgetMenuStatusComponent.isShowWidgetSetting = false;
        }

        if (this.isCustomerStatusWidgetEdit && (this.data.idRepWidgetApp == 116 || this.data.idRepWidgetApp == 117)) {
            this.onTableEditStart(null);
        }

        this.changeProperties();
        this.initConfig();
        this.updateChartData();
    }

    private updateDataForWidgetMenuStatus() {
        let isForAllCountryCheckbox = false;
        let isForAllCountryButton = false;
        this.initwidgetMenuStatusData = {
            widgetDetail: this.data,
            selectedFilter: this.selectedFilter,
            selectedSubFilter: this.selectedSubFilter,
            fieldFilters: this.fieldFilters,
            groupFieldFilters: this.groupFieldFilter,
            columnLayoutsetting: this.columnLayoutsetting,
            rowSetting: this.rowSetting,
            selectedWidgetFormType: this.widgetFormType,
            widgetProperties: this.properties,
            gridLayoutSettings: this.columnsLayoutSettings,
            isForAllCountryCheckbox: isForAllCountryCheckbox,
            isForAllCountryButton: isForAllCountryButton,
        };
    }

    private changeProperties() {
        this.updateConnectedWidgetStatusProperty(this.data);
        this.updateWidgetTitle();
        this.updateWidgetWidgetBehavior();
        this.updateDataForWidgetMenuStatus();
        // 0001151: The widget is not effect immediately when user change something in properties panel
        this.updateWidgetStyle();
        //this.updateWidgetToolbarStyle();
        const isNotWidgetTable =
            this.data.idRepWidgetType &&
            (this.data.idRepWidgetType === WidgetType.FieldSet ||
                this.data.idRepWidgetType === WidgetType.FieldSetReadonly ||
                this.data.idRepWidgetType === WidgetType.Combination ||
                this.data.idRepWidgetType === WidgetType.CombinationCreditCard);
        const isReport = this.data.idRepWidgetType === WidgetType.Report;
        if (isReport) {
            this.updateTemplateColor();
            this.updateReportFont();
            this.updateReportBehavior();
        }

        const isChart = this.data.idRepWidgetType === WidgetType.Chart;

        if (isChart) {
            this.updateChartType();
            this.updateChartColorScheme();
            this.updateOptionsPieChart();
            this.updateOptionsBarChart();
            this.updateOptionsAreaLineChart();
            this.updateDataForWidgetMenuStatus();
            this.updateSeries();
        }

        if (isNotWidgetTable) {
            this.updateForEachFieldStyle();
            this.updateWidgetFormLabelStyle();
            this.updateWidgetFormDataStyle();
            this.updateWidgetFormImportantLabelStyle();
            this.updateWidgetFormImportantDataStyle();
        }
        const isReadonlyWidgetTable = this.data.idRepWidgetType === WidgetType.DataGrid;
        if (isNotWidgetTable || isReadonlyWidgetTable) {
            this.updateImportantDisplayFields();
        }

        if (
            this.data.idRepWidgetType &&
            (this.data.idRepWidgetType === WidgetType.Combination ||
                this.data.idRepWidgetType === WidgetType.CombinationCreditCard ||
                this.data.idRepWidgetType === WidgetType.EditableTable ||
                this.data.idRepWidgetType === WidgetType.EditableGrid ||
                this.data.idRepWidgetType === WidgetType.TableWithFilter ||
                this.data.idRepWidgetType === WidgetType.FileExplorer ||
                this.data.idRepWidgetType === WidgetType.ToolFileTemplate ||
                this.data.idRepWidgetType === WidgetType.FileExplorerWithLabel ||
                this.data.idRepWidgetType === WidgetType.EditableRoleTreeGrid ||
                this.data.idRepWidgetType === WidgetType.Translation ||
                this.data.idRepWidgetType === WidgetType.CustomerHistory)
        ) {
            this.updateWidgetGridHeaderStyle();
            this.updateWidgetGridRowStyle();

            setTimeout(() => {
                this.updateRowDisplayMode();
            }, 200);
        }

        if (this.data.idRepWidgetType && this.data.idRepWidgetType === WidgetType.DataGrid) {
            this.updateForEachFieldStyle();
            this.updateWidgetFormLabelStyle();
            this.updateWidgetFormDataStyle();
            this.updateWidgetFormImportantLabelStyle();
            this.updateWidgetFormImportantDataStyle();
            this.updateImportantDisplayFields();
            this.updateWidgetGridHeaderStyle();
            this.updateWidgetGridRowStyle();

            setTimeout(() => {
                this.updateRowDisplayMode();
                this.readonlyGridAutoSwitchToDetailProp = this.checkForReadonlyGridAutoSwitchToDetail();
                this.readonlyGridMultipleRowDisplayProp = this.checkForReadonlyGridMultipleRowDisplay();
                this.buildFormDataForReadonlyGrid();
            }, 200);
        }
    }

    /**
     * updateWidgetWidgetBehavior
     */
    private updateWidgetWidgetBehavior() {
        this.updateWidgetFormTypeProperty();
        this.updateFitWidthColumnProperty();
        this.updateShowTotalRowProperty();
        this.updateAgGridProperty('rowGrouping');
        this.updateAgGridProperty('pivoting');
        this.updateAgGridProperty('columnFilter');
        this.updateDisplayFieldsProperty(null);
        this.updateDisplayModeProperty();
        this.updateDOBFormat();
    }

    /**
     * updateDisplayModeProperty
     * @param filterModeEnum
     * @param isSubDisplayMode
     */
    private updateDisplayModeProperty(filterModeEnum?: FilterModeEnum, isSubDisplayMode?: boolean) {
        if (!this.data && !this.properties) return;

        const isFireEventUpdateData = false;
        const isNotWidgetTable =
            this.data &&
            (this.data.idRepWidgetType === WidgetType.FieldSet ||
                this.data.idRepWidgetType === WidgetType.FieldSetReadonly ||
                this.data.idRepWidgetType === WidgetType.OrderDataEntry);
        const isWidgetCombination = this.data && this.data.idRepWidgetType === WidgetType.Combination;
        const propDisplayField: WidgetPropertyModel = this.propertyPanelService.getItemRecursive(
            this.properties,
            'DisplayField',
        );
        const propDisplayColumn: WidgetPropertyModel = this.propertyPanelService.getItemRecursive(
            this.properties,
            'DisplayColumn',
        );

        if (propDisplayField || propDisplayColumn) {
            let isChangeDisplayMode = false;
            // ShowData of DisplayColumn
            if (propDisplayColumn && propDisplayColumn.children && propDisplayColumn.children.length) {
                const propDisplayColumn_ShowData: WidgetPropertyModel = this.propertyPanelService.getItemRecursive(
                    propDisplayColumn.children,
                    'ShowData',
                );
                //// clear value of propDisplayColumn_ShowData in case no options
                //// (mean this gets default setting from DB)
                //if (!propDisplayColumn_ShowData.options || !propDisplayColumn_ShowData.options.length)
                //    propDisplayColumn_ShowData.value = null;

                if (
                    propDisplayColumn_ShowData &&
                    !isNil(filterModeEnum) &&
                    propDisplayColumn_ShowData.value !== filterModeEnum
                ) {
                    if (filterModeEnum !== FilterModeEnum.ShowAllWithoutFilter) {
                        if (isSubDisplayMode || !propDisplayField) {
                            propDisplayColumn_ShowData.value = filterModeEnum;
                            propDisplayColumn.disabled = false;
                        }
                    } else propDisplayColumn.disabled = true;
                }

                if (
                    !isSubDisplayMode &&
                    propDisplayColumn_ShowData &&
                    this.selectedFilter !== filterModeEnum &&
                    !isNil(propDisplayColumn_ShowData.value) &&
                    this.selectedFilter !== propDisplayColumn_ShowData.value
                ) {
                    this.selectedFilter = propDisplayColumn_ShowData.value;
                    isChangeDisplayMode = true;
                }

                if (
                    (isSubDisplayMode && this.selectedSubFilter !== filterModeEnum) ||
                    (propDisplayColumn_ShowData &&
                        propDisplayField &&
                        !isNil(propDisplayColumn_ShowData.value) &&
                        this.selectedSubFilter !== propDisplayColumn_ShowData.value)
                ) {
                    this.selectedSubFilter = propDisplayColumn_ShowData.value;
                    isChangeDisplayMode = true;
                }
            }

            // ShowData of DisplayField
            if (propDisplayField && propDisplayField.children && propDisplayField.children.length) {
                const propDisplayField_ShowData: WidgetPropertyModel = this.propertyPanelService.getItemRecursive(
                    propDisplayField.children,
                    'ShowData',
                );
                //// clear value of propDisplayColumn_ShowData in case no options
                //// (mean this gets default setting from DB)
                //if (!propDisplayField_ShowData.options || !propDisplayField_ShowData.options.length)
                //    propDisplayField_ShowData.value = null;

                if (
                    propDisplayField_ShowData &&
                    !isNil(filterModeEnum) &&
                    propDisplayField_ShowData.value !== filterModeEnum &&
                    !isSubDisplayMode
                ) {
                    if (filterModeEnum !== FilterModeEnum.ShowAllWithoutFilter) {
                        propDisplayField_ShowData.value = filterModeEnum;
                        propDisplayField.disabled = false;
                    } else propDisplayField.disabled = true;
                }

                if (
                    propDisplayField_ShowData &&
                    this.selectedFilter !== filterModeEnum &&
                    !isNil(propDisplayField_ShowData.value) &&
                    this.selectedFilter !== propDisplayField_ShowData.value
                ) {
                    this.selectedFilter = propDisplayField_ShowData.value;
                    isChangeDisplayMode = true;
                }
            }

            if (isChangeDisplayMode) {
                // init if fieldFilters is empty
                if (!this.fieldFilters || !this.fieldFilters.length) {
                    this.fieldFilters = [];
                    // from DisplayField
                    if (propDisplayField && propDisplayField.options && propDisplayField.options.length) {
                        const displayFields: Array<any> = cloneDeep(propDisplayField.options);
                        displayFields.forEach((item) => {
                            this.fieldFilters.push(
                                new FieldFilter({
                                    fieldDisplayName: item.value,
                                    fieldName: item.key,
                                    selected: item.selected,
                                    isHidden: item.isHidden,
                                    isEditable: item.isEditable,
                                }),
                            );
                        });
                    }

                    // from DisplayColumn
                    if (propDisplayColumn && propDisplayColumn.options && propDisplayColumn.options.length) {
                        const displayFields: Array<any> = cloneDeep(propDisplayColumn.options);
                        displayFields.forEach((item) => {
                            this.fieldFilters.push(
                                new FieldFilter({
                                    fieldDisplayName: item.value,
                                    fieldName: item.key,
                                    selected: item.selected,
                                    isHidden: item.isHidden,
                                    isEditable: item.isEditable,
                                }),
                            );
                        });
                    }
                }
                if (this.fieldFilters && this.fieldFilters.length) this.changeDisplayTable();
            }
        }
    }

    private updateDisplayFieldsProperty(fieldFilters?: FieldFilter[]) {
        const isUpdateProperties = fieldFilters && fieldFilters.length;
        let _fieldFilters: FieldFilter[] = [];
        const propDisplayFields: WidgetPropertyModel =
            this.propertyPanelService.getAndCreateDisplayFieldFromPropertyIfEmpty(this.properties);
        const propDisplayColumns: WidgetPropertyModel = this.propertyPanelService.getItemRecursive(
            this.properties,
            'DisplayColumn',
        );
        if (propDisplayFields && fieldFilters?.length) {
            if (propDisplayFields.options && propDisplayFields.options.length) {
                fieldFilters.forEach((fieldFilter) => {
                    const foundFilter = propDisplayFields.options.find(
                        (propDisplayField) => propDisplayField.key === fieldFilter.fieldName,
                    );
                    if (!foundFilter) {
                        propDisplayFields.options.push({
                            isEditable: fieldFilter.isEditable,
                            isHidden: fieldFilter.isHidden,
                            key: fieldFilter.fieldName,
                            selected: fieldFilter.selected,
                            value: fieldFilter.fieldDisplayName,
                        });
                    }
                });
                propDisplayFields.options.forEach((item) => {
                    if (isUpdateProperties) {
                        const fItem = fieldFilters.find((_item) => _item.fieldName === item.key);
                        if (fItem) item.selected = fItem.selected;
                    }
                    _fieldFilters.push(
                        new FieldFilter({
                            fieldDisplayName: item.value,
                            fieldName: item.key,
                            selected: item.selected,
                            isHidden: item.isHidden,
                            isEditable: item.isEditable,
                        }),
                    );
                });
            } else {
                propDisplayFields.options = fieldFilters.map((x) => {
                    return {
                        isEditable: x.isEditable,
                        isHidden: x.isHidden,
                        key: x.fieldName,
                        selected: x.selected,
                        value: x.fieldDisplayName,
                    };
                });
                _fieldFilters = cloneDeep(fieldFilters);
            }
        }

        if (propDisplayColumns && propDisplayColumns.options && propDisplayColumns.options.length) {
            propDisplayColumns.options.forEach((item) => {
                if (isUpdateProperties) {
                    const fItem = fieldFilters.find((_item) => _item.fieldName === item.key);
                    if (fItem) item.selected = fItem.selected;
                }
                _fieldFilters.push(
                    new FieldFilter({
                        fieldDisplayName: item.value,
                        fieldName: item.key,
                        selected: item.selected,
                        isHidden: item.isHidden,
                        isEditable: item.isEditable,
                        isTableField: item.isTableField,
                    }),
                );
            });
        }

        if (_fieldFilters !== this.fieldFilters) {
            this.fieldFilters = cloneDeep(_fieldFilters);
        }
    }

    /**
     * updateWidgetFormTypeProperty
     * @param widgetFormType
     */
    private updateWidgetFormTypeProperty(widgetFormType?: WidgetFormTypeEnum) {
        if (!this.data && !this.properties) return;

        if (this.showInDialog) {
            this.widgetFormType = WidgetFormTypeEnum.List;
            return;
        }

        const propWidgetType = this.propertyPanelService.getItemRecursive(this.properties, 'WidgetType');
        if (propWidgetType && !isNil(widgetFormType) && propWidgetType.value !== widgetFormType)
            propWidgetType.value = widgetFormType;

        if (propWidgetType && !isNil(propWidgetType.value) && this.widgetFormType !== propWidgetType.value) {
            this.widgetFormType = propWidgetType.value;
        }
    }

    /**
     * updateFitWidthColumnProperty
     * @param columnLayoutSetting
     */
    private updateFitWidthColumnProperty(columnLayoutSetting?: ColumnLayoutSetting) {
        if (!this.data && !this.properties) return;

        const propFitWidthColumn = this.propertyPanelService.getItemRecursive(this.properties, 'IsFitWidthColumn');
        if (
            propFitWidthColumn &&
            columnLayoutSetting &&
            propFitWidthColumn.value !== columnLayoutSetting.isFitWidthColumn
        ) {
            propFitWidthColumn.value = columnLayoutSetting.isFitWidthColumn;
        }

        const hasDifference =
            this.columnLayoutsetting &&
            propFitWidthColumn &&
            !isNil(propFitWidthColumn.value) &&
            this.columnLayoutsetting.isFitWidthColumn !== propFitWidthColumn.value;
        const isEmpty = !this.columnLayoutsetting && propFitWidthColumn && !isNil(propFitWidthColumn.value);
        if (isEmpty || hasDifference) {
            this.changeColumnLayoutsetting(
                new ColumnLayoutSetting({
                    isFitWidthColumn: propFitWidthColumn.value,
                    columnLayout: null,
                }),
            );
        }
    }

    private updateShowTotalRowProperty(rowSetting?: RowSetting) {
        if (!this.data && !this.properties) return;

        const propShowTotalRow = this.propertyPanelService.getItemRecursive(this.properties, 'ShowTotalRow');
        if (propShowTotalRow && rowSetting && propShowTotalRow.value !== rowSetting.showTotalRow)
            propShowTotalRow.value = rowSetting.showTotalRow;

        const hasDifference =
            this.rowSetting &&
            propShowTotalRow &&
            !isNil(propShowTotalRow.value) &&
            this.rowSetting.showTotalRow !== propShowTotalRow.value;
        const isEmpty = !this.rowSetting && propShowTotalRow && !isNil(propShowTotalRow.value);
        if (isEmpty || hasDifference) {
            this.changeRowSetting(
                new RowSetting({
                    showTotalRow: propShowTotalRow.value,
                }),
            );
        }
    }

    private updateAgGridProperty(propName) {
        if (!this.data && !this.properties) return;

        const prop = this.propertyPanelService.getItemRecursive(this.properties, this.upperFirstChar(propName));
        if (prop) this[propName] = prop.value;
    }

    private upperFirstChar(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    public onResizeStop() {
        this.checkToShowScrollbars();
        this.resizeWijmoGrid();
    }

    public removeWidget(): void {
        this.modalService.confirmMessageHtmlContent(
            new MessageModel({
                messageType: MessageModal.MessageType.error,
                headerText: 'Remove Widget',
                message: [{ key: '<p>' }, { key: 'Modal_Message__RemoveThisWidget' }, { key: '</p>' }],
                buttonType1: MessageModal.ButtonType.danger,
                callBack1: () => {
                    this.onRemoveWidget.emit(Object.assign({}, this.data, { id: this.payload.id }));

                    this.store.dispatch(this.propertyPanelActions.clearProperties(this.currentModule));
                    this.store.dispatch(this.layoutInfoActions.setRightPropertyPanelWidth('0', this.currentModule));
                },
            }),
        );
    }

    private saveFormWidget(updateRequest?: string) {
        if (this.isWidgetDataEdited) {
            if (this.widgetFormComponent.form.valid) {
                let formValues = this.widgetFormComponent.filterValidFormField();
                //Remove to fix bug 2976
                //formValues = Uti.convertDataEmptyToNull(formValues);
                const updateKeyValue = Uti.getUpdateKeyValue(
                    formValues,
                    this.data.widgetDataType.listenKeyRequest(this.currentModule.moduleNameTrim),
                );

                let updatedModule = this.currentModule;

                if (this.currentModule) {
                    if (
                        this.currentModule.idSettingsGUI == MenuModuleId.processing ||
                        this.currentModule.idSettingsGUI == MenuModuleId.contact
                    ) {
                        if (this.currentModule.idSettingsGUI == MenuModuleId.processing) {
                            updatedModule = this.activeSubModule;
                        }

                        if (
                            this.data.idRepWidgetApp == RepWidgetAppIdEnum.CustomerContactDetail ||
                            this.data.idRepWidgetApp == RepWidgetAppIdEnum.AdministrationContactDetail
                        ) {
                            updatedModule = null;
                        }
                    }
                }

                this.widgetTemplateSettingServiceSubscription = this.widgetTemplateSettingService
                    .updateWidgetInfo(
                        formValues,
                        updateRequest ? updateRequest : this.data.updateRequest,
                        updatedModule,
                        updateKeyValue,
                        null,
                        this.data.widgetDataType.jsonTextUpdate,
                    )
                    .subscribe(() => {
                        this.appErrorHandler.executeAction(() => {
                            this.isWidgetDataEdited = false;
                            this.widgetFormComponent.syncFormDataToDataSource();
                            this.widgetFormComponent.updatePreValue();
                            this.manageEditableTableStatusButtonsAfterSaving();
                            this.copiedData = null;
                            this.onCancelEditingWidget.emit(this.data);
                            this.onSaveSuccessWidget.emit(this.data);
                            // set credit card to read mode
                            if (this.creditCardComponent) {
                                // this.isOnEditCreditCard = false;
                                this.creditCardComponent.editMode = false;
                            }

                            if (!this.showInDialog) {
                                this.widgetFormComponent.editFormMode = false;
                                this.widgetFormComponent.resetToViewMode();
                            } else {
                                this.widgetFormComponent.updateOriginalFormValues();
                                setTimeout(() => {
                                    this.widgetFormComponent.editFormMode = true;
                                });
                            }
                            this.widgetFormComponent.invokeSaveWidgetSuccess();
                        });
                    });
                this.afterWidgetGetData(formValues);
            } else {
                this.widgetFormComponent.focusOnFirstFieldError();
            }
        } else {
            this.resetForm();
        }
    }

    private afterWidgetGetData(formValues: any) {
        if (this.data.idRepWidgetApp != RepWidgetAppIdEnum.MainArticleDetail) return;
        // call to set disable for Tab header for Article set when save an Article
        this.store.dispatch(
            this.processDataActions.setDisableTabHeader(
                Uti.makeWidgetDataToFormData(this.data.contentDetail.data[1], {
                    isSetArticle: formValues.B00Article_IsSetArticle,
                }),
                this.currentModule,
            ),
        );
    }

    private saveFormCreditCardCombinationWidget() {
        setTimeout(() => {
            let updateData = this.updateDataForCreditCard();
            if (!updateData) {
                updateData = [];
            }
            const updateRequest = this.widgetUtils.updateCustomData(
                this.data.updateRequest,
                updateData,
                this.creditCardComponent.isFormChanged,
            );
            this.saveFormWidget(updateRequest);
        });
    }

    private updateDataForCreditCard() {
        if (!this.widgetUtils.checkHasSubCollectionData(this.data)) {
            return;
        }
        if (!this.creditCardSelected || !this.creditCardSelected.length) {
            return [];
        }
        return this.updateEditingDataForCreditCard();
    }

    private updateEditingDataForCreditCard(): any {
        const result: any = [];
        let editItem: any;
        let updateItem: any;
        this.creditCardSelected.forEach((item) => {
            editItem = this.getCreditCardItemByIcon(item.iconFileName);
            if (!!item.select !== !!Uti.strValObj(editItem.IsActive)) {
                // update credit card Item
                if (!!item.id) {
                    updateItem = {
                        IdCashProviderContractCreditcardTypeContainer: item.id,
                        IsActive: item.select ? '1' : '0',
                    };
                    if (!item.select) {
                        updateItem.IsDeleted = '1';
                    }
                    result.push(updateItem);
                } else if (!!item.select) {
                    // insert credit card Item
                    result.push({
                        IdCashProviderContract: Uti.strValObj(editItem.IdCashProviderContract),
                        IdRepCreditCardType: Uti.strValObj(editItem.IdRepCreditCardType),
                        IsActive: 1,
                    });
                }
            }
        });
        return result;
    }

    private getCreditCardItemByIcon(icon: string) {
        return this.data.contentDetail.data[3].find((x) => Uti.strValObj(x.IconFileName) === icon);
    }

    private resetForm() {
        if (this.widgetFormComponent) {
            this.widgetFormComponent.resetValue(!this.showInDialog);
            this.widgetFormComponent.editFormMode = false;
            this.widgetFormComponent.editLanguageMode = false;
            this.widgetFormComponent.resetToViewMode();
        }
    }

    private editFormWidget(event): void {
        if (this.widgetFormComponent) {
            this.widgetFormComponent.editFormMode = true;
        }
        //if (this.articleMediaManagerComponent) {
        //    this.articleMediaManagerComponent.uploadMode = true;
        //    return;
        //}
        if (this.widgetTranslationComponent) {
            this.widgetTranslationComponent.editMode = true;
            this.controlMenuStatusToolButtons(true);
        }
        if (this.isWidgetDataEdited) {
            this.onEditingWidget.emit(this.data);
        }
        switch (this.data.idRepWidgetType) {
            case WidgetType.Combination: {
                this.isOnEditingTable = true;
                break;
            }
            case WidgetType.CombinationCreditCard: {
                this.editCreditCard();
                break;
            }
            case WidgetType.TreeView: {
                this.editTreeView();
                break;
            }
            case WidgetType.FileTemplate: {
                this.editFileManagement();
                break;
            }
            default:
                break;
        }
    }

    public changeDisplayMode(dataFilter: any) {
        if (dataFilter) {
            if (!dataFilter.isSub) this.selectedFilter = dataFilter.selectedFilter;
            else this.selectedSubFilter = dataFilter.selectedFilter;
            this.fieldFilters = dataFilter.fieldFilters;

            this.changeDisplayTable();

            this.checkToShowScrollbars();
            if (!dataFilter.isSub) this.updateDisplayModeProperty(this.selectedFilter, false);
            else this.updateDisplayModeProperty(this.selectedSubFilter, true);
        }
    }

    public onRowClick($event) {
        this.currentGridRowItem = $event;
        this.onRowTableClick.emit({
            cellInfos: $event,
            widgetDetail: this.data,
        });
        this.checkSelectedNodes();
    }

    public makeContextMenu(data?: any) {
        this.onRowClick(Uti.mapObjectGeneralObjectToKeyValueArray(data, true));

        let context: Array<any> = [];
        if (!data) {
            this.contextMenuData[1].disabled = true;
        }
        for (let item of this.contextMenuData) {
            if (item.hidden) continue;
            if (item.id === 'widget-separator-menu-context') {
                context.push('separator');
                continue;
            }
            context.push({
                name: item.title,
                action: (event) => {
                    item.callback(event);
                },
                cssClasses: [''],
                icon: `<i class="fa  ` + item.iconName + `  ag-context-icon"/>`,
                key: item.key,
            });
        }
        context.push('separator');
        return context;
    }

    public onStartStopClickHandler(data) {
        data.Status = data.StartStop == '1' ? 'Stopped' : 'Running';
        this.agGridComponent.updateRowData([data]);
        // update start/stop for this schedule setting
        this._toolsService
            .saveStatusSystemSchedule(this.buildScheduleSettingSavingData(data))
            .subscribe((response: any) => {
                this.appErrorHandler.executeAction(() => {
                    if (!Uti.isResquestSuccess(response)) return;
                    this.toasterService.pop(
                        'success',
                        'Success',
                        'Schedule is ' + (data.StartStop == '1' ? 'stop' : 'start') + ' now',
                    );
                });
            });
    }

    private buildScheduleSettingSavingData(data: any) {
        return {
            ScheduleStatus: [
                {
                    IdRepAppSystemScheduleServiceName: data.IdRepAppSystemScheduleServiceName,
                    IsDeleted: data.StartStop,
                },
            ],
        };
    }

    private counterWaitingScheduleSettingRunImmediatelyDialog = 0;
    public onRunClickHandler(data) {
        this.isShowScheduleSettingRunImmediately = true;
        this.counterWaitingScheduleSettingRunImmediatelyDialog = 0;
        this.showcounterWaitingScheduleSettingRunImmediatelyDialog(data);
    }
    private showcounterWaitingScheduleSettingRunImmediatelyDialog(data) {
        if (this.counterWaitingScheduleSettingRunImmediatelyDialog > 100) return;
        setTimeout(() => {
            this.counterWaitingScheduleSettingRunImmediatelyDialog++;
            if (!this.scheduleSettingRunImmediately) {
                this.showcounterWaitingScheduleSettingRunImmediatelyDialog(data);
                return;
            }
            this.scheduleSettingRunImmediately.callShowDiaglog(data);
        });
    }

    private runImmediatelyRowDatas: Array<any> = [];
    // private isRequestingStatus: boolean = false;
    public runScheduleHandle(currentItem: any) {
        if (currentItem) {
            // Disable Run button
            this.setDataForRunButton(currentItem.rowData, '2');
            this.runImmediatelyRowDatas.push(currentItem);
        }
        // if (this.isRequestingStatus) return;
        // this.isRequestingStatus = true;
        this.refreshScheduleWidgetData();
    }
    public closedScheduleSettingRunImmediatelyHandle() {
        this.isShowScheduleSettingRunImmediately = false;
    }
    private setDataForRunButton(rowData: any, data: any) {
        for (let row of this.dataSourceTable.data) {
            if (row.DT_RowId != rowData['dtRowId']) {
                continue;
            }
            row['Run'] = data;
            this.agGridComponent.updateRowData([row]);
            break;
        }
    }
    private refreshScheduleWidgetData() {
        if (!this.runImmediatelyRowDatas.length) {
            return;
        }
        setTimeout(() => {
            this.refreshScheduleWidgetData();
        }, 2000);
        for (let item of this.runImmediatelyRowDatas) {
            setTimeout(() => {
                this.callRefreshScheduleWidgetData(item);
            }, 500);
        }
    }
    private callRefreshScheduleWidgetData(currentItem: any) {
        if (!currentItem) {
            return;
        }
        this._toolsService
            .getScheduleServiceStatusByQueueId(currentItem.idAppSystemScheduleQueue)
            .subscribe((response: any) => {
                this.appErrorHandler.executeAction(() => {
                    if (
                        !Uti.isResquestSuccess(response) ||
                        !response.item.data ||
                        !response.item.data.length ||
                        !response.item.data[0] ||
                        !response.item.data[0].length ||
                        !response.item.data[0][0]
                    ) {
                        return;
                    }
                    if (response.item.data[0][0].StatusID == '1') {
                        // Enable Run button
                        this.setDataForRunButton(currentItem.rowData, true);
                        Uti.removeItemInArray(this.runImmediatelyRowDatas, currentItem, 'idScheduleQueue');
                        this.onRowClick(this.currentGridRowItem);
                        // this.isRequestingStatus = !!this.runImmediatelyRowDatas.length;
                    }
                    if (response.item.data[0][0].StatusID == '3') {
                        // Enable Run button
                        this.setDataForRunButton(currentItem.rowData, true);
                        // Show no data message
                        this.toasterService.pop('error', 'Notification', 'No data exported');
                    }
                });
            });
    }

    private counterWaitingScheduleSettingDialog = 0;
    public onSettingClickHandler(data) {
        this.isShowScheduleSetting = true;
        this.counterWaitingScheduleSettingDialog = 0;
        this.showScheduleSettingDialog(data);
    }
    private showScheduleSettingDialog(data) {
        if (this.counterWaitingScheduleSettingDialog > 100) return;
        setTimeout(() => {
            this.counterWaitingScheduleSettingDialog++;
            if (!this.scheduleSetting) {
                this.showScheduleSettingDialog(data);
                return;
            }
            this.scheduleSetting.callShowDialog(data);
        });
    }
    public closedScheduleSettingHandle(isReload?: boolean) {
        this.isShowScheduleSetting = false;
        if (isReload) this.reloadWidgets.emit([this.data]);
    }

    public dateFilterOutputHandle($event) {
        this.onRowTableClick.emit({
            cellInfos: Uti.buildKeyValueArrayForObject($event),
            widgetDetail: this.data,
        });
    }

    public changeFieldFilter($event: FilterData) {
        if ($event) {
            this.fieldFilters = Object.assign([], this.fieldFilters, $event.fieldFilters);
            this.columnLayoutsetting = $event.columnLayoutsetting;
            this.rowSetting = $event.rowSetting;
            this.widgetFormType = $event.widgetFormType;
            this.updateDisplayFieldsProperty(this.fieldFilters);
            this.propertiesForSaving.properties = cloneDeep(this.properties);
        }

        this._saveMenuChanges();
        this.updateDataForWidgetMenuStatus();
    }

    private _saveMenuChanges(isClosedPropertyPanel?: boolean) {
        if (this.columnLayoutsetting) {
            if (this.agGridComponent) {
                this.columnLayoutsetting.columnLayout = this.agGridComponent.getColumnLayout();
            } else {
                this.columnLayoutsetting.columnLayout = null;
            }

            this.allowFitColumn = this.columnLayoutsetting.isFitWidthColumn;
        }

        if (this.rowSetting) {
            this.showTotalRow = this.rowSetting.showTotalRow;
        }

        // Fix bug: The saving icon for grid config of table widget does not hide after saving
        // this.changeDisplayTable();

        this.checkToShowScrollbars();

        if (this.widgetMenuStatusComponent) {
            this.widgetMenuStatusComponent.resetToUpdateFieldsFilterFromOutside();
        }

        // Reset widget properties dirty
        this.properties = this.propertyPanelService.resetDirty(this.properties);
        this.propertiesForSaving.properties = this.propertyPanelService.resetDirty(this.propertiesForSaving.properties);
        this.removeTranslatedTitleFromPropertiesForSaving();

        // Save setting here
        this.onChangeFieldFilter.emit({
            fieldFilters: this.fieldFilters,
            widgetDetail: this.data,
            widgetFormType: this.widgetFormType,
            isClosedPropertyPanel: isClosedPropertyPanel,
        });
    }

    private checkToShowScrollbars() {
        if (!this.showInDialog) {
            if (this.agGridComponent) {
                // this.agGridComponent.checkGridHasScrollbars();
            }

            this.widgetFormLoadedHandler(true);
        }
    }

    public resizeWijmoGrid() {
        if (this.agGridComponent && this.allowFitColumn) {
            // this.agGridComponent.turnOnStarResizeMode();
            this.agGridComponent.refresh();
        }
    }
    public callRefreshWidgetDataHanlder() {
        this.onResetWidget.emit(this.data);
    }

    /**
     * changeDisplayTable
     * @param isOnChangingData
     * Note: Please don't use timeout in this function, contact author for detail.
     */
    private changeDisplayTable(isOnChangingData?: boolean) {
        if (!this.widgetUtils.isTableWidgetDataType(this.data)) {
            return;
        }

        if (!isOnChangingData) this.updateDataSourceFromDataTable();
        else this.copiedData = cloneDeep(this.data);
        this.updateDataSourceCloumnSettings();
        let contentDetail = this.copiedData.contentDetail;
        if (this.data.idRepWidgetType === WidgetType.Combination) {
            contentDetail = contentDetail && contentDetail.data ? contentDetail.data[2][0] : contentDetail;
        }

        if (this.agGridComponent != null) {
            this.agGridComponent.deselectRow();
        }

        this.buildDatatable(contentDetail);
        this.copiedData = null;
        this.checkToShowFilterTableOnMenuToolbar();
    }

    private editTitle() {
        if (this.allowDesignEdit) return;
        this.editingTitle = true;
        this.originalTitle = this.title.value;
    }

    private saveTitle() {
        if (!isNil(this.title.value)) {
            this.editingTitle = false;
            this.updateWidgetTitle(this.title);
            const propTitleText: WidgetPropertyModel = this.propertyPanelService.getItemRecursive(
                this.propertiesForSaving.properties,
                'TitleText',
            );
            propTitleText.value = this.title.value;
            propTitleText.translatedValue = '';
            this.onUpdateTitle.emit(this.data);
            this.originalTitle = this.title.value;
        }
    }

    private removeTranslatedTitleFromPropertiesForSaving() {
        const propTitleText: WidgetPropertyModel = this.propertyPanelService.getItemRecursive(
            this.propertiesForSaving.properties,
            'TitleText',
        );
        propTitleText.translatedValue = '';
    }

    private resetTitle() {
        this.editingTitle = false;
        this.title.value = this.originalTitle;
    }

    private onChangeTitle(event) {
        this.title.value = event.target.value;
        this.data.title = this.title.value;
    }

    public onCursorFocusOutOfMenuToolbar(event) {
        if (event) {
            this.hoverBox = false;
        }
    }

    private mouseout(event) {
        if (this.isActiveWidget) return;
        // Design mode
        if (this.allowDesignEdit) {
            return;
        }

        let parentElm, editDropdown;
        if (event.toElement) {
            parentElm = this.domHandler.findParent(event.toElement, 'filter-menu');
            editDropdown = this.domHandler.findParent(event.toElement, 'edit-dropdown');
        } else if (event.relatedTarget) {
            parentElm = this.domHandler.findParent(event.relatedTarget, 'filter-menu');
            editDropdown = this.domHandler.findParent(event.relatedTarget, 'edit-dropdown');
        }
        if ((!parentElm || parentElm.length === 0) && (!editDropdown || !editDropdown.length)) {
            this.hoverBox = false;
            if (
                !this.allowDesignEdit &&
                !this.isOnEditingCountry &&
                !this.isOnEditTreeView &&
                !this.isOnEditingTable &&
                !this.isOnEditFileExplorer &&
                !(
                    this.widgetFormComponent &&
                    (this.widgetFormComponent.editFormMode || this.widgetFormComponent.editFieldMode)
                )
            ) {
                if (this.widgetMenuStatusComponent) {
                    this.widgetMenuStatusComponent.dropdownStatus.isHidden = true;
                    this.widgetMenuStatusComponent.dropdownTableStatus.isHidden = true;
                    this.widgetMenuStatusComponent.isShowEditDropdown = false;
                    this.widgetMenuStatusComponent.hideMenuWidgetStatus();

                    if (this.widgetMenuStatusComponent.editFormDropdown)
                        this.widgetMenuStatusComponent.editFormDropdown.hide();
                }
            }
        }
        setTimeout(() => {
            $('div.box-default', $(this._eref.nativeElement)).removeClass('click');
        });

        this.scrollUtils.scrollUnHovering('left');
        this.scrollUtils.scrollUnHovering('top');
        this.widgetBorderColor = '';
    }

    private mouseenter(event) {
        // Design mode
        if (this.allowDesignEdit) {
            return;
        }
        this.hoverBox = true;
        if (event.type === 'click') {
            $('div.box-default', $(this._eref.nativeElement)).addClass('click');
            return;
        } else $('div.box-default', $(this._eref.nativeElement)).removeClass('click');
        if (
            !this.allowDesignEdit &&
            !this.isOnEditingCountry &&
            !this.isOnEditTreeView &&
            !this.isOnEditingTable &&
            !this.isOnEditFileExplorer &&
            !(
                this.widgetFormComponent &&
                (this.widgetFormComponent.editFormMode || this.widgetFormComponent.editFieldMode)
            )
        ) {
            if (this.widgetMenuStatusComponent) {
                this.widgetMenuStatusComponent.dropdownStatus.isHidden = false;
                this.widgetMenuStatusComponent.dropdownTableStatus.isHidden = false;
                this.widgetMenuStatusComponent.isShowEditDropdown = true;
            }
        }
        if (this.widgetStyle.borderColor) {
            this.widgetBorderColor = '1px solid ' + this.widgetStyle.borderColor;
            return;
        }
        if (this.widgetStyle.globalBorderColor)
            this.widgetBorderColor = '1px solid ' + this.widgetStyle.globalBorderColor;
    }

    private onEditFormField(event) {
        if (!event && this.isWidgetDataEdited) {
            this.isWidgetDataEdited = false;
            this.onCancelEditingWidget.emit(this.data);
        } else if (event) {
            this.controlMenuStatusToolButtons(true);
        }
    }

    public onCancelEditFormField(event) {
        if (event) {
            this.controlMenuStatusToolButtons(false);
        }
    }

    private saveCombinationWidget() {
        setTimeout(() => {
            if (this.agGridComponent) {
                this.isTableEdited = this.agGridComponent.hasUnsavedRows();
            }

            if (!this.isTableEdited) {
                this.isOnEditingTable = false;
                let strUpdateRequest: string = this.data.updateRequest;
                if (this.data.updateRequest.includes('<<JSONText>>')) {
                    const start = this.data.updateRequest.indexOf('<<JSONText>>');
                    const end = this.data.updateRequest.lastIndexOf('<<JSONText>>');
                    strUpdateRequest = this.data.updateRequest.substring(start, end + '<<JSONText>>'.length);
                    strUpdateRequest = this.data.updateRequest.replace(strUpdateRequest, '');
                }
                this.saveFormWidget(strUpdateRequest);
                return;
            } else {
                let _dataSourceTable = this.dataSourceTable;
                if (this.agGridComponent) {
                    const wijmoGridData = this.agGridComponent.getEditedItems();
                    _dataSourceTable = Uti.mergeWijmoGridData(this.dataSourceTable, wijmoGridData);
                }
                // TODO: NTH
                const key = Object.keys(
                    this.data.widgetDataType.listenKeyRequest(this.currentModule.moduleNameTrim),
                )[0];
                const value = this.data.widgetDataType.listenKeyRequest(this.currentModule.moduleNameTrim)[key];

                _dataSourceTable = this.rebuildComboboxData(_dataSourceTable);
                this.updateDataSourceFromDataTable(_dataSourceTable);
                let updateData = Uti.mapDataSourceToDataUpdateByColumnSetting(
                    this.copiedData.contentDetail.data[2][0],
                    key,
                    value,
                );
                updateData = JSON.stringify(updateData);
                updateData = updateData.replace(/"/g, '\\\\\\"');
                let strUpdateRequest: string = this.data.updateRequest;
                if (this.data.updateRequest.includes('<<JSONText>>')) {
                    strUpdateRequest = this.data.updateRequest.replace(new RegExp('<<JSONText>>', 'g'), '');
                }
                this.saveFormWidget(strUpdateRequest.replace('<<SubInputParameter>>', updateData));
                return;
            }
        });
    }

    private editEditableTableWidget(event): void {
        switch (this.data.idRepWidgetType) {
            case WidgetType.FileExplorer:
            case WidgetType.ToolFileTemplate:
                this.isOnEditFileExplorer = true;
                if (!this.isDeletedFiles && this.widgetMenuStatusComponent)
                    this.widgetMenuStatusComponent.manageSaveTableButtonStatus(true);
                break;
            case WidgetType.FileExplorerWithLabel:
            case WidgetType.FileTemplate:
                this.isOnEditFileExplorer = true;
                if (this.widgetMenuStatusComponent) this.widgetMenuStatusComponent.manageSaveTableButtonStatus(false);
                this.makeEditingContextMenuForFileExplorerComponent(true, true, true);
                break;
            default:
                if (this.data.idRepWidgetApp == 116 || this.data.idRepWidgetApp == 117) {
                    this.isCustomerStatusWidgetEdit = true;
                    this.reloadWidgets.emit([this.data]);
                } else {
                    this.isOnEditingTable = true;
                    this.contextMenuData = this.widgetUtils.contextMenuInEditMode(
                        this.contextMenuData,
                        this.getAccessRightAll(),
                        this.data,
                        this.widgetMenuStatusComponent,
                    );
                    if (this.agGridComponent) {
                        this.agGridComponent.toggleDeleteColumn(true);
                    }
                }

                break;
        }
        if (this.isTableEdited) {
            this.onEditingWidget.emit(this.data);
        }
    }

    private makeEditingContextMenuForFileExplorerComponent(
        isShow: boolean,
        isShowSaveWidget?: boolean,
        isShowCancelSave?: boolean,
    ) {
        if (!isShow) return;
        this.contextMenuData = this.widgetUtils.contextMenuInEditMode(
            this.contextMenuData,
            this.getAccessRightAll(),
            this.data,
            this.widgetMenuStatusComponent,
            {
                isShowSaveWidget: isShowSaveWidget,
                isShowCancelSave: isShowCancelSave,
                isShowUploadTemplate: true,
                isShowDeleteTemplate: true,
            },
        );
    }

    public checkToShowCommandButtons(makeCommandButsHidden?: boolean) {
        const isTableWidget =
            this.data.idRepWidgetType === WidgetType.EditableGrid ||
            this.data.idRepWidgetType === WidgetType.EditableTable;
        let isTableWidgetUnEdited = !this.isTableEdited && isTableWidget;

        const isFormWidget = this.data.idRepWidgetType === WidgetType.FieldSet;
        const isFormWidgetUnEdited = !this.isWidgetDataEdited && isFormWidget;

        const isCombinationWidget =
            this.data.idRepWidgetType === WidgetType.Combination ||
            this.data.idRepWidgetType === WidgetType.CombinationCreditCard;
        let isCombinationWidgetUnEdited = !this.isTableEdited && !this.isWidgetDataEdited && isCombinationWidget;

        const isFileExplorerWidget =
            this.data.idRepWidgetType === WidgetType.FileExplorer ||
            this.data.idRepWidgetType === WidgetType.ToolFileTemplate ||
            this.data.idRepWidgetType === WidgetType.FileExplorerWithLabel;
        const isFileExplorerWidgetUnEdited = !this.isOnEditFileExplorer && isFileExplorerWidget;

        if (makeCommandButsHidden && this.agGridComponent) {
            const editedItems = this.agGridComponent.getEditedItems();
            const hasEditedItems = !isNil(editedItems) && editedItems.itemsEdited && editedItems.itemsEdited.length > 0;
            if (isTableWidget) {
                isTableWidgetUnEdited = hasEditedItems ? false : true;
                if (isTableWidgetUnEdited) {
                    this.onCancelEditingWidget.emit(this.data);
                }
            }

            if (isCombinationWidget) {
                isCombinationWidgetUnEdited = this.isWidgetDataEdited
                    ? isCombinationWidgetUnEdited
                    : hasEditedItems
                    ? false
                    : true;
                if (isCombinationWidgetUnEdited) {
                    this.onCancelEditingWidget.emit(this.data);
                }
            }
        }

        return (
            isTableWidgetUnEdited || isFormWidgetUnEdited || isCombinationWidgetUnEdited || isFileExplorerWidgetUnEdited
        );
    }

    ///////// ----------------Start CombiCredit Card Widget-----------------////////////////////
    private onEditingCreditCard() {
        this.isWidgetDataEdited = true;
        this.onEditingWidget.emit(this.data);
    }

    private resetValueForCreditCard() {
        // this.isOnEditingCreditCard = false;
        if (this.creditCardComponent) {
            // this.isOnEditCreditCard = false;
            this.creditCardComponent.editMode = false;
            this.creditCardComponent.isFormChanged = false;
        }
        this.creditCardComponent.resetCreditCardComponent();
    }

    /**
     * getSelectedData
     * @param data
     */
    public getSelectedData(data: any) {
        this.onEditingCreditCard();
        this.widgetFormComponent.editFieldMode = true;
        this.creditCardSelected = data;
    }

    public onFileExplorerEditingHandler() {
        this.widgetMenuStatusComponent.manageSaveTableButtonStatus(false);
        this.isOnEditFileExplorer = true;
        this.makeEditingContextMenuForFileExplorerComponent(true, true, true);
    }

    public onFileTemplateEditingHandler() {
        this.updateWidgetEditedStatus(true);
        this.editingWidget(this.dataInfo);
        this.onRowMarkedAsDeleted({
            disabledDeleteButton: true,
            showCommandButtons: true,
        });
        if (this.widgetMenuStatusInfo) {
            // enable save button
            this.widgetMenuStatusComponent.manageSaveTableButtonStatus(false);
        }
    }

    /**
     * editCreditCard
     */
    private editCreditCard() {
        if (this.creditCardComponent) {
            this.creditCardComponent.editMode = true;
        }
    }

    ///////// ----------------End CombiCredit Card Widget-----------------////////////////////

    ///////// ----------------Start Country Widget-----------------////////////////////

    public getDataForCountryCheckList(eventData) {
        this.outputDataCountries = eventData;
        this.isWidgetDataEdited = true;
        this.onEditingWidget.emit(this.data);
    }

    ///////// ----------------Start Message Modal-----------------////////////////////
    private onModalSaveAndExit() {
        this.saveWidget(this.savingWidgetType);
    }

    private onModalExit() {
        this.isTableEdited = false;
        this.isWidgetDataEdited = false;
        this.resetWidget();
    }

    private onModalCancel() {}

    ///////// ----------------End Message Modal-----------------////////////////////

    //////// -----------------Start Wijmo Grid--------------///////////////////

    public onMediacodeDialogClosed() {
        this.showMediacodeDialog = false;
    }

    public onPdfColumnClickHandler(eventData) {
        if (eventData) {
            this.store.dispatch(this.backofficeActions.requestDownloadPdf(this.currentModule, eventData));
        }
    }

    public onDownloadFile(rowData: any) {
        this._downloadFileService.makeDownloadFile(
            rowData['MediaRelativePath'] + '\\' + rowData['MediaName'],
            rowData['MediaOriginalName'],
            this.modalService,
        );
    }

    public onTrackingColumnClickHandler(eventData) {
        if (eventData) {
            this.store.dispatch(this.backofficeActions.requestGoToTrackingPage(this.currentModule, eventData));
        }
    }

    public onReturnRefundColumnClickHandler(eventData) {
        if (eventData) {
            this.store.dispatch(this.backofficeActions.requestOpenReturnRefundModule(this.currentModule, eventData));
        }
    }

    public onWijmoGridRowDoubleClickHandler(eventData) {
        //TODO: update later
    }

    public onRowDoubleClickHandler($event: any) {
        // if (($event && $event.isReadOnlyColumn) || !this.getAccessRightForCommandButton('ToolbarButton') || !this.getAccessRightForCommandButton('ToolbarButton__EditButton')) return;
        if (
            ($event && $event.isReadOnlyColumn) ||
            !this.accessRight['edit'] ||
            !this.getAccessRightForCommandButton('ToolbarButton')
        )
            return;

        // call to open edit grid if not readolny
        if (
            this.data.idRepWidgetType == this.WidgetTypeView.EditableGrid ||
            this.data.idRepWidgetType == this.WidgetTypeView.EditableTable ||
            this.data.idRepWidgetType == this.WidgetTypeView.Combination ||
            this.data.idRepWidgetType == this.WidgetTypeView.EditableRoleTreeGrid
        ) {
            if (this.data.idRepWidgetApp == 116 || this.data.idRepWidgetApp == 117) {
                this.isCustomerStatusWidgetEdit = true;
                this.reloadWidgets.emit([this.data]);
            }

            this.onTableEditStart($event);
        }
    }

    public onSendLetterColumnClickHandler(eventData) {
        this.onShowEmailPopup.emit(eventData);
        //TODO: update later
    }

    public onUnblockColumnClickHandler(eventData) {
        if (eventData) {
            this.modalService.confirmMessageHtmlContent(
                new MessageModel({
                    headerText: 'Unblock Order',
                    message: [{ key: '<p>' }, { key: 'Modal_Message__DoYouWantToUnlockThisOrder' }, { key: '</p>' }],
                    callBack1: () => {
                        this.saveUnblockOrder(eventData);
                    },
                }),
            );
        }
    }

    public onDeleteColumnClickHandler(eventData) {
        if (eventData) {
            this.modalService.confirmMessageHtmlContent(
                new MessageModel({
                    messageType: MessageModal.MessageType.error,
                    headerText: 'Delete Order',
                    message: [{ key: '<p>' }, { key: 'Modal_Message__DoYouWantToDeleteThisOrder' }, { key: '</p>' }],
                    buttonType1: MessageModal.ButtonType.danger,
                    callBack1: () => {
                        this.saveUnblockOrder(eventData, true);
                    },
                }),
            );
        }
    }

    public onScheduleSettingClickHandle($event) {
        // TODO:
    }

    public onRunScheduleSettingClickHandle($event) {
        // TODO:
    }

    private saveUnblockOrder(eventData: any, isDelete?: boolean) {
        this.backOfficeServiceSubscription = this.backOfficeService
            .saveUnblockOrder(eventData.IdSalesOrder, isDelete)
            .subscribe((resultData: any) => {
                this.appErrorHandler.executeAction(() => {
                    // TODO: will get correct message in result
                    if (!this.agGridComponent) return;
                    this.agGridComponent.deleteRowByRowId(eventData.DT_RowId);
                });
            });
    }

    private hasScrollbarsHandler(eventData) {
        if (eventData) {
            this.scrollStatus.top = isNull(eventData.top) ? this.scrollStatus.top : eventData.top;
            this.scrollStatus.left = isNull(eventData.left) ? this.scrollStatus.left : eventData.left;
            this.scrollStatus.right = isNull(eventData.right) ? this.scrollStatus.right : eventData.right;
            this.scrollStatus.bottom = isNull(eventData.bottom) ? this.scrollStatus.bottom : eventData.bottom;
        }
    }

    private hasValidationErrorHandler(eventData) {
        if (this.agGridComponent) {
            if (this.widgetMenuStatusComponent && this.isOnEditingTable) {
                this.widgetMenuStatusComponent.manageAddRowTableButtonStatus(eventData);
                this.widgetMenuStatusComponent.manageSaveTableButtonStatus(eventData);
            }
        }
    }

    //////// -----------------End Wijmo Grid--------------///////////////////

    private checkWidgetFormHasScrollbars() {
        if (this.scrollUtils.hasVerticalScroll) {
            this.scrollStatus.top = this.scrollUtils.canScrollUpTop;
            this.scrollStatus.bottom = this.scrollUtils.canScrollDownBottom;
            this.addVerticalPerfectScrollEvent();
        } else {
            this.scrollStatus.top = false;
            this.scrollStatus.bottom = false;
            this.removeVerticalPerfectScrollEvent();
        }

        if (this.scrollUtils.hasHorizontalScroll) {
            this.scrollStatus.left = this.scrollUtils.canScrollToLeft;
            this.scrollStatus.right = this.scrollUtils.canScrollToRight;
            this.addHorizontalPerfectScrollEvent();
        } else {
            this.scrollStatus.left = false;
            this.scrollStatus.right = false;
            this.removeHorizontalPerfectScrollEvent();
        }

        if (this.directiveScroll && this.directiveScroll.elementRef) {
            // (Ps as any).update(this.directiveScroll.elementRef.nativeElement);
            this.directiveScroll.update();
        }

        // this.scrollUtils.displayScroll();
    }

    private widgetFormLoadedHandler(eventData) {
        setTimeout(() => {
            if (eventData && !this.showInDialog) {
                this.checkWidgetFormHasScrollbars();
            }
        }, 500);
    }

    private addHorizontalPerfectScrollEvent() {
        $(this._eref.nativeElement).on('ps-scroll-left', () => {
            this.scrollStatus.left = this.scrollUtils.canScrollToLeft;
            this.scrollStatus.right = this.scrollUtils.canScrollToRight;
        });

        $(this._eref.nativeElement).on('ps-scroll-right', () => {
            this.scrollStatus.left = this.scrollUtils.canScrollToLeft;
            this.scrollStatus.right = this.scrollUtils.canScrollToRight;
        });
    }

    private removeHorizontalPerfectScrollEvent() {
        $(this._eref.nativeElement).off('ps-scroll-left');
        $(this._eref.nativeElement).off('ps-scroll-right');
        $(this._eref.nativeElement).off('ps-x-reach-end');
        $(this._eref.nativeElement).off('ps-x-reach-start');
    }

    private addVerticalPerfectScrollEvent() {
        $(this._eref.nativeElement).on('ps-scroll-up', () => {
            this.scrollStatus.top = this.scrollUtils.canScrollUpTop;
            this.scrollStatus.bottom = this.scrollUtils.canScrollDownBottom;
        });

        $(this._eref.nativeElement).on('ps-scroll-down', () => {
            this.scrollStatus.top = this.scrollUtils.canScrollUpTop;
            this.scrollStatus.bottom = this.scrollUtils.canScrollDownBottom;
        });
    }

    private removeVerticalPerfectScrollEvent() {
        $(this._eref.nativeElement).off('ps-scroll-up');
        $(this._eref.nativeElement).off('ps-scroll-down');
        $(this._eref.nativeElement).off('ps-y-reach-end');
        $(this._eref.nativeElement).off('ps-y-reach-start');
    }

    /**
     * changeColumnLayoutsetting
     * @param $event
     */
    public changeColumnLayoutsetting($event: ColumnLayoutSetting) {
        this.columnLayoutsetting = $event;
        if (this.columnLayoutsetting) {
            this.columnLayout = this.columnLayoutsetting.columnLayout;
            this.allowFitColumn = this.columnLayoutsetting.isFitWidthColumn;
        }
        this.updateFitWidthColumnProperty(this.columnLayoutsetting);
    }

    public changeRowSetting($event: RowSetting) {
        this.rowSetting = $event;
        if (this.rowSetting) {
            this.showTotalRow = this.rowSetting.showTotalRow;
        }
        this.updateShowTotalRowProperty(this.rowSetting);
    }

    /**
     * changeWidgetLayout
     * @param $event
     */
    public changeWidgetFormType($event: WidgetFormTypeEnum) {
        this.widgetFormType = $event;
        this.updateWidgetFormTypeProperty($event);
        setTimeout(() => {
            const container = $('div.widget-form-container', $(this._eref.nativeElement));
            if (container && container.length) {
                // (Ps as any).update(container.get(0));
                (container.get(0) as any).update();
                setTimeout(() => {
                    this.checkWidgetFormHasScrollbars();
                });
            }
        });
    }

    /**
     * getWidgetItemSize: Full Height & Width of widget content
     */
    private getWidgetItemSize(): WidgetItemSize {
        let totalHeight = 0;
        const totalWidth = this._eref.nativeElement.scrollWidth;
        const container = this._eref.nativeElement.querySelector('.box-default');
        if (container && container.children.length) {
            for (let i = 0; i < container.children.length; i++) {
                totalHeight += container.children[i].scrollHeight;
            }
        }
        return {
            width: totalWidth,
            height: totalHeight,
        };
    }

    // ---------------File Explorer Widget

    public onPropertiesItemClickHandler(eventData) {
        if (eventData) {
            this.store.dispatch(this.additionalInformationActions.requestTogglePanel(false, this.currentModule));
            this.store.dispatch(
                this.propertyPanelActions.togglePanel(this.currentModule, eventData, this.data, this.properties, false),
            );
            this.hoverBox = false;
            this.onOpenPropertyPanel.emit(true);
        }
    }

    /**
     * openTranslateWidget
     * @param event
     */
    public openTranslateWidget(event) {
        this.isTranslateDataTextOnly = false;
        this.isRenderWidgetInfoTranslation = true;
        this.onOpenTranslateWidget.emit({ isHidden: false });
        this.data.fieldsTranslating = false;
        this.combinationTranslateMode = event ? event.mode : null;
        setTimeout(() => {
            if (this.widgetModuleInfoTranslationComponent) this.widgetModuleInfoTranslationComponent.showDialog = true;
        }, 250);
    }

    /**
     * openArticleTranslate
     */
    public openArticleTranslate() {
        if (this.widgetArticleTranslationDialogComponent) {
            this.widgetArticleTranslationDialogComponent.translatedDataGrid = this.dataSourceTable;
            this.widgetArticleTranslationDialogComponent.open();
            // this.ref.detectChanges();
        }
    }

    onHiddenWidgetInfoTranslation(event?: any) {
        this.isRenderWidgetInfoTranslation = false;
        this.isTranslateDataTextOnly = false;
        this.onOpenTranslateWidget.emit(event);
    }

    private resetWidgetTranslation($event: any) {
        this.resetWidget();
        this.onResetWidgetTranslation.emit(this.data.id);
    }

    openTranslateTitle() {
        this.isTranslateDataTextOnly = true;
        this.isRenderWidgetInfoTranslation = true;
        const propTitleText: WidgetPropertyModel = this.propertyPanelService.getItemRecursive(
            this.propertiesForSaving.properties,
            'TitleText',
        );
        this.translationDataKeyword = propTitleText.value;
        this.onOpenTranslateWidget.emit({ isHidden: false });
        setTimeout(() => {
            if (this.widgetModuleInfoTranslationComponent) this.widgetModuleInfoTranslationComponent.showDialog = true;
        }, 100);
    }

    public buildFormDataForReadonlyGrid() {
        if (
            this.data &&
            this.data.contentDetail &&
            this.data.contentDetail.collectionData &&
            this.data.contentDetail.columnSettings &&
            this.data.idRepWidgetType == WidgetType.DataGrid
        ) {
            if (
                this.readonlyGridAutoSwitchToDetailProp &&
                !this.readonlyGridMultipleRowDisplayProp &&
                this.agGridComponent &&
                this.agGridComponent.gridOptions &&
                this.agGridComponent.gridOptions.rowData &&
                this.agGridComponent.gridOptions.rowData.length <= 1
            ) {
                this.displayReadonlyGridAsForm = true;
                this.readonlyGridFormData = cloneDeep(this.data);
                this.readonlyGridFormData.contentDetail = {
                    data: [[[]], []],
                };
                this.readonlyGridFormData.contentDetail.data[1] = this.widgetUtils.buildReadonlyGridFormColumns(
                    this.data.contentDetail.columnSettings,
                    this.readonlyGridFormData.contentDetail.data[1],
                );
                this.readonlyGridFormData.contentDetail.data[1] = this.widgetUtils.buildReadonlyGridFormColumnsValue(
                    this.agGridComponent.gridOptions.rowData,
                    this.readonlyGridFormData.contentDetail.data[1],
                );
            } else {
                this.displayReadonlyGridAsForm = false;
                if (this.agGridComponent) {
                    this.agGridComponent.refresh();
                }
            }
        }
    }

    public onToolbarButtonsToggleHandler(isShow: boolean) {
        this.isToolbarButtonsShowed = isShow;

        if (this.agGridComponent) {
            this.agGridComponent.toggleDeleteColumn(isShow);
        }
        if (this.data.idRepWidgetType === WidgetType.FileExplorerWithLabel) {
            this.xnFileExplorerComponentCtrl.toggleEditingFileExplorer(isShow);
            if (isShow) {
                this.makeEditingContextMenuForFileExplorerComponent(true);
            } else {
                this.buildContextMenu(
                    this.contextMenuData,
                    this.data.idRepWidgetType,
                    this.currentModule,
                    this.toolbarSetting,
                    this.selectedTabHeader,
                    this.activeSubModule,
                );
            }
        }
    }

    public noEntryDataEvent($event): void {
        this.noEntryData = $event;
    }

    private buildContextMenu(
        contextMenuData,
        idRepWidgetType,
        currentModule,
        toolbarSetting,
        selectedTabHeader,
        activeSubModule,
    ) {
        this.contextMenuData = this.widgetUtils.contextMenuInViewMode(
            contextMenuData,
            idRepWidgetType,
            this.getAccessRightAll(),
            currentModule,
            toolbarSetting,
            selectedTabHeader,
            activeSubModule,
            this.widgetToolbarSetting,
            this.data.idRepWidgetApp,
        );
    }

    public onRightClick($event: MouseEvent) {
        $event.preventDefault();
        $event.stopPropagation();

        if (
            this.currentModule &&
            this.currentModule.idSettingsGUI == MenuModuleId.processing &&
            this.activeSubModule &&
            this.activeSubModule.idSettingsGUI != MenuModuleId.cashProvider
        ) {
            for (let i = 0; i < this.contextMenuData.length; i++) {
                if (
                    this.contextMenuData[i].title.indexOf('CC PRN') !== -1 ||
                    this.contextMenuData[i].title.indexOf('Provider Cost') !== -1
                ) {
                    this.contextMenuData[i].hidden = true;
                }
            }
        }
    }

    public onOpenFieldTranslateWidget(event) {
        if (this.data && this.data.idRepWidgetApp == 106) {
            //Repository Name widget

            let gridData = this.agGridComponent.gridOptions.rowData;
            let translateSource: any[] = [];
            let groupNames: any[] = [];
            for (let i = 0; i < gridData.length; i++) {
                if (!translateSource.length || !translateSource.find((t) => t.Value == gridData[i].TableName)) {
                    translateSource.push({
                        ColumnName: gridData[i].Alias,
                        OriginalText: gridData[i].Alias,
                        Value: gridData[i].TableName,
                        OriginalColumnName: 'RepositoryName_' + gridData[i].Alias.replace(/ /g, ''),
                        Selected:
                            this.agGridComponent &&
                            this.agGridComponent.selectedNode &&
                            this.agGridComponent.selectedNode.data &&
                            gridData[i].TableName == this.agGridComponent.selectedNode.data.TableName,
                    });

                    let groupName = gridData[i].GroupNameAlias;
                    if (groupNames.findIndex((x) => x.OriginalText == groupName) === -1) {
                        groupNames.push({
                            IsGroupName: true,
                            ColumnName: groupName,
                            OriginalText: groupName,
                            Value: gridData[i].GroupName,
                            OriginalColumnName: 'RepositoryName_' + groupName.replace(/ /g, ''),
                            Selected:
                                this.agGridComponent &&
                                this.agGridComponent.selectedNode &&
                                this.agGridComponent.selectedNode.data &&
                                gridData[i].TableName == this.agGridComponent.selectedNode.data.TableName,
                        });
                    }
                }
            }

            for (let i = 0; i < groupNames.length; i++) {
                translateSource.splice(i, 0, groupNames[i]);
            }

            this.data.fieldsTranslating = true;
            this.data.contentDetail.data = [null, translateSource];

            this.isTranslateDataTextOnly = false;
            this.isRenderWidgetInfoTranslation = true;
            this.onOpenTranslateWidget.emit({ isHidden: false });
            setTimeout(() => {
                if (this.widgetModuleInfoTranslationComponent)
                    this.widgetModuleInfoTranslationComponent.showDialog = true;
            }, 100);
        }
    }

    public buildReadOnlyCells(idRepWidgetApp) {
        switch (idRepWidgetApp) {
            case 105:
                return [
                    {
                        name: 'IdLoginRoles',
                        value: 1,
                    },
                    {
                        name: 'IdLoginRoles',
                        value: 2,
                    },
                ];
            default:
                return null;
        }
    }

    public checkToShowTableTooltip(idRepWidgetApp) {
        switch (idRepWidgetApp) {
            case 105:
            case 106:
                return true;
            default:
                return false;
        }
    }

    public buildCustomTooltip(idRepWidgetApp) {
        switch (idRepWidgetApp) {
            case 106:
                return { preText: 'Original Name: ', fieldName: 'Alias' };
            case 105:
                return { preText: '', fieldName: 'Explanation' };
            default:
                return null;
        }
    }

    public onAddWidgetTemplate() {
        if (
            this.data &&
            (this.data.idRepWidgetApp == 111 ||
                this.data.idRepWidgetApp == 112 ||
                this.data.idRepWidgetApp == 113 ||
                this.data.idRepWidgetApp == 114 ||
                this.data.idRepWidgetApp == 126)
        ) {
            if (this.agGridComponent) {
                this.clearDataSourceData();
            }
        }
    }

    public onChangeWidgetTemplate(templateId) {
        this.templateId = templateId;

        this.reloadWidgets.emit([this.data]);
        setTimeout(() => {
            this.onTableEditStart(null);
        }, 200);
    }

    public onRefreshWidget() {
        this.resetEditingWidget();
    }

    private buildIsShowToolPanelSetting() {
        switch (this.data.idRepWidgetType) {
            case this.WidgetTypeView.DataGrid:
            case this.WidgetTypeView.EditableGrid:
            case this.WidgetTypeView.EditableTable:
            case this.WidgetTypeView.FileExplorerWithLabel:
            case this.WidgetTypeView.EditableRoleTreeGrid:
                this.isShowToolPanelSetting = true;
        }
    }

    //#region [Access Right]

    private getAccessRightAll(): any {
        const moduleAccessRight = this._accessRightsService.getAccessRight(AccessRightTypeEnum.Tab, {
            idSettingsGUIParent: this.currentModule.idSettingsGUIParent,
            idSettingsGUI: this.currentModule.idSettingsGUI,
            tabID: this.tabID,
        });
        let result = {
            ParkedItem_New: moduleAccessRight.new,
            ParkedItem_Edit: moduleAccessRight.edit,
        };
        for (let item in AccessRightWidgetCommandButtonEnum) {
            result[item] = this.getAccessRightForCommandButton(item);
        }
        return { ...result, ...this.accessRight };
    }

    private initAccessRightDataForCommandButton() {
        let accessRightData: any = {};
        for (let item in AccessRightWidgetCommandButtonEnum) {
            accessRightData[item] = { read: false };
        }
        return accessRightData;
    }

    private buildAccessRight() {
        if (!this.activeSubModule) return;
        let accessRightData: Array<any> = [];
        for (let item in AccessRightWidgetCommandButtonEnum) {
            accessRightData.push({
                idSettingsGUIParent: this.currentModule.idSettingsGUIParent,
                idSettingsGUI: this.currentModule.idSettingsGUI,
                idRepWidgetApp: this.payload.idRepWidgetApp,
                buttonCommand: item,
            });
        }
        this.accessRightForCommandButton =
            this._accessRightsService.SetAccessRightsForWidgetMenuStatus(accessRightData);

        if (
            this.payload.idRepWidgetType === WidgetType.Translation ||
            this.payload.idRepWidgetType === WidgetType.BlankWidget
        ) {
            this.accessRight = this._accessRightsService.createFullAccessRight();
        } else {
            this.accessRight = this._accessRightsService.SetAccessRightsForWidget({
                idSettingsGUIParent: this.currentModule.idSettingsGUIParent,
                idSettingsGUI: this.currentModule.idSettingsGUI,
                idRepWidgetApp: this.payload.idRepWidgetApp,
            });
        }

        this.accessRightAll = { ...this.accessRight, ...this.accessRightForCommandButton };
        this.menuStatusSettings.accessRight = this.accessRightAll;
    }

    public getAccessRightForCommandButton(buttonName: string) {
        if (
            !this.accessRightForCommandButton ||
            !this.accessRightForCommandButton[AccessRightWidgetCommandButtonEnum[buttonName]]
        ) {
            return false;
        }
        let status = this.accessRightForCommandButton[AccessRightWidgetCommandButtonEnum[buttonName]]['read'];
        return status;
    }

    //#endregion [Access Right]

    public mouseDblClick($event) {
        if (
            this.data &&
            (this.data.idRepWidgetType == WidgetType.DoubleGrid ||
                this.data.idRepWidgetType == WidgetType.CountrySelection) &&
            this.widgetMenuStatusComponent &&
            !this.isToolbarButtonsShowed
        ) {
            this.widgetMenuStatusComponent.toggleToolButtonsWithoutClick(true);
        }
    }

    public onSaveSelectionWidgetSuccess() {
        this.manageEditableTableStatusButtonsAfterSaving();
        this.cancelEditingWidget(this.dataInfo);
        this.saveSuccessWidget(this.dataInfo);
        this.copiedData = null;
        this.reEditWhenInPopup();

        this.isTableEdited = false;
        this.isOnEditingTable = false;
    }

    public onReloadWidget() {
        this.reloadWidgets.emit([this.data]);
    }

    //#region SignalR
    public notifyItems: Array<SignalRNotifyModel> = [];
    public userJustSaved: SignalRNotifyModel;
    private listenEditingEventSubscription: Subscription;
    private listenSavedSuccessEventSubscription: Subscription;
    private _isActivated: boolean = true;
    private signalRRegisterEvent() {
        if (
            !Configuration.PublicSettings.enableSignalR ||
            !this.payload ||
            (this.payload.idRepWidgetType != this.WidgetTypeView.FieldSet &&
                this.payload.idRepWidgetType != this.WidgetTypeView.FieldSetReadonly)
        )
            return;
        this.registerListenEditingEvent();
        this.registerListenSavedSuccessEvent();
    }

    private registerListenEditingEvent() {
        if (this.listenEditingEventSubscription) this.listenEditingEventSubscription.unsubscribe();

        this.listenEditingEventSubscription = this.signalRService.messageReceived.subscribe(
            (items: Array<SignalRNotifyModel>) => {
                if (!this.widgetFormComponent || !this.widgetFormComponent.notifyObjectId) return;

                this.notifyItems = items.filter((x) => x.ObjectId === this.widgetFormComponent.notifyObjectId);
                this.setValueForIsOpenUserEditingList();
                setTimeout(() => {
                    this.ref.detectChanges();
                }, 100);
            },
        );
    }

    private registerListenSavedSuccessEvent() {
        if (this.listenSavedSuccessEventSubscription) this.listenSavedSuccessEventSubscription.unsubscribe();

        this.listenSavedSuccessEventSubscription = this.signalRService.messageWidgetSavedSuccessReceived.subscribe(
            (item: SignalRNotifyModel) => {
                if (!item) return;
                this.userJustSaved = item;

                if (this.isWidgetEditMode) {
                    this.isShowReloadMessage = true;
                } else {
                    this.reloadWidgets.emit([this.data]);
                    this.setReloadMessageValue(true);
                    this.autoClearMessageAfterShow(5000);
                }
                this.callDetectChanges();
            },
        );
    }

    public setActivatedForThisComponent(isActivated: boolean) {
        setTimeout(() => {
            this.isOpenUserEditingList = isActivated && !!(this.notifyItems && this.notifyItems.length);
            if (!this.signalRPopover) return;
            if (this.isOpenUserEditingList) {
                this.signalRPopover.show();
            } else {
                this.signalRPopover.hide();
            }
        }, 200);
        this._isActivated = isActivated;
    }

    private setValueForIsOpenUserEditingList() {
        this.isOpenUserEditingList = this._isActivated && !!(this.notifyItems && this.notifyItems.length);
    }

    private showEditingNotification() {
        if (this.widgetFormComponent && this.data && this.data.idRepWidgetType == this.WidgetTypeView.FieldSet) {
            this.widgetFormComponent.signalRIsThereAnyoneEditing();
        }
    }

    public isUserClickToggle: boolean = false;
    public onToggleClicked($event) {
        this.isUserClickToggle = $event;
    }

    public isShowReloadMessage: boolean = false;
    public reloadMessageIsBlockUI: boolean = true;
    public forceResetWidgetForm: boolean = false;
    public controlUpdated: Array<any> = [];
    private doesStayOnMessage: boolean = false;
    private autoClearMessageAfterShowTimeOut: any;
    public onReloadMessage($event) {
        this.setReloadMessageValue(false);

        this.reloadWidgets.emit([this.data]);
        this.forceResetWidgetForm = true;
    }

    public onCancelMessage($event) {
        this.setReloadMessageValue(false);
    }

    private resetSomeKeyOfSignalR() {
        setTimeout(() => {
            this.forceResetWidgetForm = false;
        }, 1000);
    }

    //public onDeleteRuleColumnClick(deletedItems: any[]) {
    //if (this.widgetMenuStatusComponent && this.widgetMenuStatusComponent.showDeleteRuleButton) {
    //this.widgetMenuStatusComponent.deletedRulesCount = deletedItems.length;
    //}
    //}

    private setReloadMessageValue(value: boolean) {
        this.isShowReloadMessage = value;
        this.reloadMessageIsBlockUI = !value;
    }

    private callDetectChanges() {
        setTimeout(() => {
            this.ref.detectChanges();
        }, 100);
    }

    public onMouseInReloadMessage() {
        this.doesStayOnMessage = true;
        if (this.autoClearMessageAfterShowTimeOut) {
            clearTimeout(this.autoClearMessageAfterShowTimeOut);
        }
    }

    public onMouseOutReloadMessage() {
        this.doesStayOnMessage = false;
        this.autoClearMessageAfterShow(1500);
    }

    private autoClearMessageAfterShow(timeOut: number) {
        this.autoClearMessageAfterShowTimeOut = setTimeout(() => {
            if (this.doesStayOnMessage) {
                return;
            }
            this.setReloadMessageValue(false);
            this.callDetectChanges();
        }, timeOut);
    }
    //#endregion

    //#region [Property]
    private currentObjectName: string = '';
    private requestDataWhenChangePropety(data: WidgetPropertiesStateModel) {
        if (data.widgetData.idRepWidgetApp == RepWidgetAppIdEnum.ChartWidget) {
            this.requestDataWhenChangeObjectNameOfChartProperty(data);
        }
    }

    private requestDataWhenChangeObjectNameOfChartProperty(data: WidgetPropertiesStateModel) {
        if (!data.widgetData || (data.widgetData.syncWidgetIds && data.widgetData.syncWidgetIds.length)) {
            return;
        }
        const properties = data.widgetProperties.properties ? data.widgetProperties.properties : data.widgetProperties;
        let dataSourceObject: WidgetPropertyModel = this.propertyPanelService.getItemRecursive(
            properties,
            ComboBoxTypeConstant.chartDataSourceObject,
            PropertyNameOfWidgetProperty.ComboboxStoreObject,
        );
        if (
            !dataSourceObject ||
            !dataSourceObject.value ||
            dataSourceObject.value == this.currentChartDataSourceObject
        ) {
            return;
        }
        data.widgetData.request = data.widgetData.request.replace(
            this.currentObjectName ? this.currentObjectName : '<<ObjectName>>',
            dataSourceObject.value,
        );
        this.currentObjectName = dataSourceObject.value;
        this.reloadWidgets.emit([data.widgetData]);
    }
    //#endregion [Property]

    //#region [Chart]
    public chartData: any;
    private updateChartData() {
        if (this.data.idRepWidgetApp != RepWidgetAppIdEnum.ChartWidget) return;
        let dataSourceObject: WidgetPropertyModel = this.propertyPanelService.getItemRecursive(
            this.properties,
            ComboBoxTypeConstant.chartDataSourceObject,
            PropertyNameOfWidgetProperty.ComboboxStoreObject,
        );

        if (dataSourceObject && dataSourceObject.value && dataSourceObject.value == this.currentChartDataSourceObject) {
            return;
        }

        let linkWidgetTitleId: WidgetPropertyModel = this.propertyPanelService.getItemRecursive(
            this.properties,
            PropertyNameOfWidgetProperty.LinkWidgetTitleId,
        );
        if (!this.data.syncWidgetIds || !this.data.syncWidgetIds.length) {
            dataSourceObject.visible = true;
            linkWidgetTitleId.visible = false;
            if (!this.data.contentDetail || !this.data.contentDetail.data || this.data.contentDetail.data.length < 2)
                return;
            this.chartData = this.datatableService.formatDataTableFromRawData(this.data.contentDetail.data);

            if (this.isExpandedPropertyPanel) {
                this.buildFieldFilterForChart(this.chartData.columnSettings);
            }

            this.currentChartDataSourceObject = dataSourceObject.value;
        } else {
            // Update combobx text when link chart to other widget
            dataSourceObject.visible = false;
            linkWidgetTitleId.visible = true;
            let parentWidget: WidgetDetail = this.getWidgetById(this.data.syncWidgetIds[0]);
            linkWidgetTitleId.value = parentWidget ? parentWidget.title : null;
            this.currentChartDataSourceObject = null;
        }
    }

    private getWidgetById(widgetId: any) {
        let widgetDetail: any;
        for (let item of this.layoutPageInfoWidget) {
            widgetDetail = item.widgetboxesTitle.find((x) => x.id == widgetId);
            if (widgetDetail && widgetDetail.id) return widgetDetail;
        }
        return widgetDetail;
    }

    private buildFieldFilterForChart(columnSettings) {
        this.fieldFilters = [];
        Object.keys(columnSettings).forEach((key) => {
            this.fieldFilters.push(
                new FieldFilter({
                    fieldDisplayName: columnSettings[key].ColumnName,
                    fieldName: columnSettings[key].OriginalColumnName,
                    selected: false,
                    isHidden: false,
                    isEditable: false,
                }),
            );
        });

        //Reset previous data
        this.widgetMenuStatusComponent.isInitDisplayFields = false;
        this.widgetMenuStatusComponent.fieldFilters = [];
        const propXSeries: WidgetPropertyModel = this.propertyPanelService.getItemRecursive(this.properties, 'XSeries');
        if (propXSeries) {
            propXSeries.options = [];
            propXSeries.value = [];
        }

        const propYSeries: WidgetPropertyModel = this.propertyPanelService.getItemRecursive(this.properties, 'YSeries');
        if (propYSeries) {
            propYSeries.options = [];
            propYSeries.value = [];
        }

        this.initwidgetMenuStatusData = {
            widgetDetail: {
                ...this.data,
                contentDetail: this.chartData,
            },
            selectedFilter: this.selectedFilter,
            selectedSubFilter: this.selectedSubFilter,
            fieldFilters: this.fieldFilters,
            columnLayoutsetting: this.columnLayoutsetting,
            rowSetting: this.rowSetting,
            selectedWidgetFormType: this.widgetFormType,
            widgetProperties: this.properties,
            gridLayoutSettings: this.columnsLayoutSettings,
            isForAllCountryCheckbox: false,
            isForAllCountryButton: false,
        };

        setTimeout(() => {
            this.store.dispatch(this.propertyPanelActions.clearProperties(this.currentModule));
            this.store.dispatch(
                this.propertyPanelActions.togglePanel(this.currentModule, true, this.data, this.properties, false),
            );
        }, 250);
    }
    //#endregion [Chart]

    public saveColumnsLayoutHandle() {
        this.widgetMenuStatusComponent.saveTableSetting();
    }

    @ViewChild(WidgetContextMenuComponent) widgetContextMenuComponent: WidgetContextMenuComponent;

    public onContextMenu($event: MouseEvent): void {
        this.isSelectingTextContextMenu = false;
        let txt;
        if (window.getSelection) {
            txt = window.getSelection();
        } else if (document.getSelection) {
            txt = document.getSelection();
        }
        // is selecting text
        if (txt.type === 'Range') this.isSelectingTextContextMenu = true;

        this.textFieldContextMenu = $event?.target?.['tagName'] === 'INPUT' || $event?.target?.['tagName'] === 'TEXTAREA' ? $event : null;

        this.ref.detectChanges();

        this.contextMenuService.show.next({
            // Optional - if unspecified, all context menu components will open
            contextMenu: this.widgetContextMenuComponent.contextMenu,
            event: $event,
            item: null,
        });
        $event.preventDefault();
        $event.stopPropagation();
    }

    //#region Maximize Widget
    maximizeWidget($event: any) {
        this.isMaximized = $event.isMaximized;
        this.hasJustRestoredFullScreen = !$event.isMaximized;
        this.onMaximizeWidget.emit({
            data: this.data,
            isMaximized: $event.isMaximized,
        });
        this.ref.markForCheck();
        this.ref.detectChanges();
    }
    //#endregion
}
