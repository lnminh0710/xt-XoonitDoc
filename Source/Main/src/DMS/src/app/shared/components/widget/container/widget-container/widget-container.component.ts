import {
    Component,
    OnInit,
    OnDestroy,
    Input,
    Output,
    EventEmitter,
    OnChanges,
    SimpleChanges,
    ViewChild,
    ViewChildren,
    QueryList,
    ChangeDetectorRef,
    ElementRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { NgGrid, NgGridItem, NgGridConfig, NgGridItemConfig, NgGridItemEvent } from '@app/shared/components/grid-stack';
import {
    LightWidgetDetail,
    WidgetDetail,
    WidgetDetailPage,
    WidgetDetailPageSetting,
    FilterData,
    WidgetTemplateSettingModel,
    Module,
    PageSetting,
    FieldFilter,
    ColumnLayoutSetting,
    WidgetPropertyModel,
    WidgetSettingModel,
    IListenKeyConfig,
    WidgetPropertiesStateModel,
    LayoutPageInfoModel,
    WidgetType,
    WidgetKeyType,
    IWidgetTargetRender,
    TabSummaryModel,
    ReloadMode,
    RowSetting,
    OrderDataEntryProperties,
} from '@app/models';
import { Store, ReducerManagerDispatcher } from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import { Observable, Subscription, forkJoin } from 'rxjs';
import {
    WidgetDetailActions,
    LayoutInfoActions,
    TabSummaryActions,
    CustomAction,
    ProcessDataActions,
    LayoutSettingActions,
} from '@app/state-management/store/actions';
import { WidgetTemplateActions, PropertyPanelActions, XnCommonActions } from '@app/state-management/store/actions';
import { ModuleState } from '@app/state-management/store/reducer/main-module';
import { WidgetTemplateSettingService, DomHandler, AccessRightsService } from '@app/services';
import { PageSettingService } from '@app/services';
import { UUID } from 'angular2-uuid';
import { WidgetModuleComponent } from '../../components/widget-info';
import { SubLayoutInfoState } from '@app/state-management/store/reducer/layout-info';
import {
    RowData,
    EditingWidget,
    WidgetDataUpdated,
    RelatingWidget,
} from '@app/state-management/store/reducer/widget-content-detail';
import {
    FilterModeEnum,
    MenuModuleId,
    WidgetFormTypeEnum,
    SavingWidgetType,
    OrderDataEntryWidgetLayoutModeEnum,
    TranslateDataTypeEnum,
    Configuration,
    SplitterDirectionMode,
    MouseEvent,
    RepWidgetAppIdEnum,
} from '@app/app.constants';
import { WidgetUtils } from '../../utils';
import isNil from 'lodash-es/isNil';
import isEmpty from 'lodash-es/isEmpty';
import cloneDeep from 'lodash-es/cloneDeep';
import uniqBy from 'lodash-es/uniqBy';
import upperFirst from 'lodash-es/upperFirst';
import findIndex from 'lodash-es/findIndex';
import {
    AppErrorHandler,
    ModalService,
    PropertyPanelService,
    GlobalSettingService,
    ObservableShareService,
} from '@app/services';
import { Uti } from '@app/utilities';
import { ToasterService } from 'angular2-toaster/angular2-toaster';
import { WidgetEditDialogComponent } from '../../components/widget-edit-dialog';
import { BaseWidgetContainer, WidgetBox } from './base.widget-container';
import * as wjcGrid from 'wijmo/wijmo.grid';
import * as tabSummaryReducer from '@app/state-management/store/reducer/tab-summary';
import * as moduleSettingReducer from '@app/state-management/store/reducer/module-setting';
import * as processDataReducer from '@app/state-management/store/reducer/process-data';
import * as layoutInfoReducer from '@app/state-management/store/reducer/layout-info';
import * as commonReducer from '@app/state-management/store/reducer/xn-common';
import * as propertyPanelReducer from '@app/state-management/store/reducer/property-panel';
import * as widgetContentReducer from '@app/state-management/store/reducer/widget-content-detail';
import * as widgetTemplateReducer from '@app/state-management/store/reducer/widget-template';
import { ModuleList } from '@app/pages/private/base';
import isEqual from 'lodash-es/isEqual';
import { ICommunicationWidget } from '../../components/widget-communication-dialog';
import { filter, finalize } from 'rxjs/operators';
import { EnableWidgetTemplateState } from '@app/models/widget-template/enable-widget-template.model';

@Component({
    selector: 'widget-container',
    styleUrls: ['./widget-container.component.scss'],
    templateUrl: './widget-container.component.html',
    providers: [WidgetUtils],
})
export class WidgetContainerComponent extends BaseWidgetContainer implements OnInit, OnChanges, OnDestroy {
    @ViewChildren(WidgetEditDialogComponent)
    private widgetEditDialogs: QueryList<WidgetEditDialogComponent>;

    @ViewChild(NgGrid)
    private ngGrid: NgGrid;

    @Input() height = 0;

    private _isActivated: boolean = true;
    @Input() set isActivated(status: boolean) {
        this.setActivatedForWidgetModuleInfo(status);
        this._isActivated = status;
        this.widgetModuleComponents;
        if (!status) {
            // console.log('PageID:' + this.pageId + ' OFF');
            if (this.selectedEntityStateSubscription) {
                this.selectedEntityStateSubscription.unsubscribe();
            }
            // this.ref.detach();
        } else {
            // console.log('PageID:' + this.pageId + ' ON');
            // this.ref.reattach();
            if (this.isViewInitialized) {
                this.subscribeSelectedEntityState();
                if (!this.currentWidgetStateKey) {
                    this.updateWidgetContent(this.currentPageSetting, false, false);
                }
            }
        }
    }

    get isActivated() {
        return this._isActivated;
    }

    @Input() isSplitterDragging;

    @Output() onWidgetDeleted = new EventEmitter<any>();

    static DEFAULT_SIZE_Y = 35;
    static DEFAULT_SIZE_X = 50;

    public allowDesignEdit = false;
    private idSettingsPage?: number = null;
    public widgetEditInPopupId: string;
    private currentPageSetting: PageSetting = null;
    private modulePrimaryKey = '';
    private mainWidgetTemplateSettings: WidgetTemplateSettingModel[];
    public activeSubModule: Module;
    public toolbarSetting: any;
    public rowDataChange: any;
    public selectedTabHeader: TabSummaryModel;
    private selectedEntity: any;
    private isExpandedPropertyPanel: boolean = false;
    private widgetArray: Array<any> = [];
    private isReloadAll: boolean = false;
    private reloadMode: ReloadMode = ReloadMode.ListenKey;

    private widgetListenKeyStateSubscription: Subscription;
    private activeSubModuleStateSubscription: Subscription;
    private enableWidgetTemplateStateSubscription: Subscription;
    private saveWidgetStateSubscription: Subscription;
    private connectForChildFromParentWidgetSubscription: Subscription;
    private connectForParentFromChildWidgetSubscription: Subscription;
    private connectForSameTypeWidgetSubscription: Subscription;
    private resetWidgetStateSubscription: Subscription;
    private selectedEntityStateSubscription: Subscription;
    private rowDataStateSubscription: Subscription;
    private columnFilterStateSubscription: Subscription;
    private widgetDataUpdatedSubscription: Subscription;
    private relatingWidgetSubscription: Subscription;
    private requestSaveStateSubscription: Subscription;
    private requestReloadStateSubscription: Subscription;
    private widgetTemplateSettingSubscription: Subscription;
    private layoutPageInfoModelStateSubscription: Subscription;
    private modulePrimaryKeyStateSubscription: Subscription;
    private globalPropertiesStateSubscription: Subscription;
    private toolbarSettingStateSubscription: Subscription;
    private selectedTabHeaderModelSubscription: Subscription;
    private widgetTemplateSettingServiceSubscription: Subscription;
    private globalSettingServiceSubscription: Subscription;
    private resizeSplitterStateSubscription: Subscription;
    private isExpandPropertyPanelStateSubscription: Subscription;
    private requestRefreshWidgetsInTabStateSubscription: Subscription;
    private requestAddToDoubletSubscription: Subscription;
    private requestEditLayoutTogglePanelStateSubscription: Subscription;

    private activeSubModuleState: Observable<Module>;
    private enableWidgetTemplateState: Observable<EnableWidgetTemplateState>;
    private selectedEntityState: Observable<any>;
    private rowDataState: Observable<RowData>;
    private columnFilterState: Observable<any>;
    private widgetDataUpdatedState: Observable<WidgetDataUpdated>;
    private relatingWidgetState: Observable<RelatingWidget>;
    private requestSaveState: Observable<any>;
    private requestReloadState: Observable<any>;
    private widgetListenKeyState: Observable<string>;
    private widgetTemplateSettingModelState: Observable<WidgetTemplateSettingModel[]>;
    private layoutPageInfoModelState: Observable<LayoutPageInfoModel[]>;
    private modulePrimaryKeyState: Observable<string>;
    private globalPropertiesState: Observable<any>;
    private toolbarSettingState: Observable<any>;
    private isExpandPropertyPanelState: Observable<boolean>;
    private selectedTabHeaderModel: Observable<TabSummaryModel>;

    public onAfterChangeSize = '';
    public isDesignUpdating: boolean;
    public showEmailSettingDialog = false;
    public emailSettingData: any = {};
    public columnFilter: any;
    public widgetMouseEvent: MouseEvent = MouseEvent.None;
    public mouseEvent = MouseEvent;

    constructor(
        protected store: Store<AppState>,
        protected widgetDetailActions: WidgetDetailActions,
        private propertyPanelActions: PropertyPanelActions,
        private widgetTemplateActions: WidgetTemplateActions,
        private layoutInfoActions: LayoutInfoActions,
        protected xnCommonActions: XnCommonActions,
        protected widgetTemplateSettingService: WidgetTemplateSettingService,
        private pageSettingService: PageSettingService,
        protected widgetUtils: WidgetUtils,
        private appErrorHandler: AppErrorHandler,
        private toasterService: ToasterService,
        private modalService: ModalService,
        protected propertyPanelService: PropertyPanelService,
        private globalSettingService: GlobalSettingService,
        protected obserableShareService: ObservableShareService,
        private uti: Uti,
        private configuration: Configuration,
        private tabSummaryActions: TabSummaryActions,
        protected router: Router,
        protected ref: ChangeDetectorRef,
        private dispatcher: ReducerManagerDispatcher,
        private elementRef: ElementRef,
        private domHandler: DomHandler,
        protected accessRightService: AccessRightsService,
    ) {
        super(
            store,
            widgetDetailActions,
            widgetUtils,
            widgetTemplateSettingService,
            obserableShareService,
            propertyPanelService,
            xnCommonActions,
            router,
            accessRightService,
        );

        this.widgetListenKeyState = store.select((state) => moduleSettingReducer.getModuleSettingState(state, this.ofModule.moduleNameTrim).widgetListenKey);
        //this.usingModuleState = store.select(state => state.mainModule.usingModule);
        this.activeSubModuleState = store.select((state) => state.mainModule.activeSubModule);
        this.selectedTabHeaderModel = store.select((state) => tabSummaryReducer.getTabSummaryState(state, this.ofModule.moduleNameTrim).selectedTab);
        this.enableWidgetTemplateState = store.select((state) => widgetTemplateReducer.getWidgetTemplateState(state, this.ofModule.moduleNameTrim).enableWidgetTemplate);
        this.toolbarSettingState = store.select((state) => moduleSettingReducer.getModuleSettingState(state, this.ofModule.moduleNameTrim).toolbarSetting);
        this.selectedEntityState = store.select((state) => processDataReducer.getProcessDataState(state, this.ofModule.moduleNameTrim).selectedEntity);
        this.rowDataState = store.select((state) => widgetContentReducer.getWidgetContentDetailState(state, this.ofModule.moduleNameTrim).rowData);
        this.columnFilterState = store.select((state) => tabSummaryReducer.getTabSummaryState(state, this.ofModule.moduleNameTrim).columnFilter);
        this.widgetDataUpdatedState = store.select((state) => widgetContentReducer.getWidgetContentDetailState(state, this.ofModule.moduleNameTrim).widgetDataUpdated);
        this.requestSaveState = store.select((state) => widgetContentReducer.getWidgetContentDetailState(state, this.ofModule.moduleNameTrim).requestSave);
        this.requestReloadState = store.select((state) => widgetContentReducer.getWidgetContentDetailState(state, this.ofModule.moduleNameTrim).requestReload);
        this.widgetTemplateSettingModelState = store.select((state) => widgetTemplateReducer.getWidgetTemplateState(state, this.ofModule.moduleNameTrim).mainWidgetTemplateSettings);
        this.relatingWidgetState = store.select((state) => widgetContentReducer.getWidgetContentDetailState(state, this.ofModule.moduleNameTrim).relatingWidget);
        this.layoutPageInfoModelState = store.select((state) => commonReducer.getCommonState(state, this.ofModule.moduleNameTrim).layoutPageInfo);
        this.modulePrimaryKeyState = store.select((state) => moduleSettingReducer.getModuleSettingState(state, this.ofModule.moduleNameTrim).modulePrimaryKey);
        this.globalPropertiesState = store.select((state) => propertyPanelReducer.getPropertyPanelState(state, ModuleList.Base.moduleNameTrim).globalProperties);
        this.isExpandPropertyPanelState = store.select((state) => propertyPanelReducer.getPropertyPanelState(state, this.ofModule.moduleNameTrim).isExpand);
    }

    /**
     * confirmSavingWhenChangeStatus
     */
    private confirmSavingWhenChangeStatus() {
        this.modalService.unsavedWarningMessageDefault({
            headerText: 'Saving Changes',
            onModalSaveAndExit: () => {
                this.store.dispatch(this.widgetTemplateActions.saveWidget(this.ofModule));
            },
            onModalExit: () => {
                this.store.dispatch(this.widgetTemplateActions.resetWidget(this.ofModule));
            },
            onModalCancel: () => {
                this.store.dispatch(this.widgetTemplateActions.resetWidget(this.ofModule));
            },
            buttonType3: false,
        });
    }

    /**
     * ngOnInit
     */
    public ngOnInit() {
        super.ngOnInit();
        this.isViewInitialized = true;
        if (!WidgetUtils.widgetDataTypeValues[this.ofModule.moduleNameTrim]) {
            WidgetUtils.widgetDataTypeValues[this.ofModule.moduleNameTrim] = {};
        }
        this.subscribeActiveSubModuleState();
        this.subscribeModulePrimaryKeyState();
        this.subscribeSelectedTabHeaderModel();
        this.subscribeToolbarSettingState();
        this.subscribeWidgetListenKeyState();
        this.subscribeEnableWidgetTemplateState();
        this.subscribeSaveWidgetState();
        this.subscribeResetWidgetState();
        this.subscribeLayoutPageInfoModelState();
        this.subscribeSelectedEntityState();
        this.subscribeRowDataState();
        this.subscribeColumnFilterState();
        this.subscribeWidgetDataUpdated();
        this.subscribeRequestSaveState();
        this.subscribeRequestReloadState();
        this.subscribeWidgetTemplateSetting();
        this.subscribeRelatingWidget();
        this.subscribeGlobalProperties();
        this.subscribeResizeSplitterState();
        this.subscribeConnectForChildFromParentWidgetState();
        this.subscribeConnectForParentFromChildWidgetState();
        this.subscribeConnectForSameTypeWidgetState();
        this.dispatchActionSetWidgetboxesInfo();
        this.subscribeIsExpandPropertyPanelState();
        this.subscribeRequestRefreshWidgetsInTabState();
        this.subcribeRequestAddToDoubletState();
        this.subscribeToggleDesignPageLayout();
    }

    /**
     * ngAfterViewInit
     **/
    ngAfterViewInit() {
        this.store.dispatch(this.widgetDetailActions.setWidgetContainer(this, this.ofModule));
    }

    private subscribeIsExpandPropertyPanelState() {
        if (this.isExpandPropertyPanelStateSubscription) {
            this.isExpandPropertyPanelStateSubscription.unsubscribe();
        }

        this.isExpandPropertyPanelStateSubscription = this.isExpandPropertyPanelState.subscribe((isExpand: boolean) => {
            this.appErrorHandler.executeAction(() => {
                this.isExpandedPropertyPanel = isExpand;
            });
        });
    }

    /**
     * subscribeModulePrimaryKeyState
     */
    private subscribeModulePrimaryKeyState() {
        if (this.modulePrimaryKeyStateSubscription) {
            this.modulePrimaryKeyStateSubscription.unsubscribe();
        }
        this.modulePrimaryKeyStateSubscription = this.modulePrimaryKeyState.subscribe((key: string) => {
            this.appErrorHandler.executeAction(() => {
                this.modulePrimaryKey = key;
            });
        });
    }

    /**
     * subscribeSelectedTabHeaderModel
     */
    private subscribeSelectedTabHeaderModel() {
        if (this.selectedTabHeaderModelSubscription) {
            this.selectedTabHeaderModelSubscription.unsubscribe();
        }
        this.selectedTabHeaderModelSubscription = this.selectedTabHeaderModel.subscribe(
            (selectedTabHeader: TabSummaryModel) => {
                this.appErrorHandler.executeAction(() => {
                    this.selectedTabHeader = selectedTabHeader;

                    //clear all maximize widgets
                    this.resetMaximizeWidget();
                    //restore the current maximized widget
                    this.restoreMaximizeWidget();
                });
            },
        );
    }

    /**
     * subscribeWidgetListenKeyState
     */
    private subscribeWidgetListenKeyState() {
        if (this.widgetListenKeyStateSubscription) {
            this.widgetListenKeyStateSubscription.unsubscribe();
        }
        this.widgetListenKeyStateSubscription = this.widgetListenKeyState.subscribe((widgetListenKeyState: string) => {
            this.appErrorHandler.executeAction(() => {
                this.widgetListenKey = widgetListenKeyState;
            });
        });
    }

    /**
     * subscribeActiveSubModuleState
     */
    private subscribeActiveSubModuleState() {
        if (this.activeSubModuleStateSubscription) {
            this.activeSubModuleStateSubscription.unsubscribe();
        }
        this.activeSubModuleStateSubscription = this.activeSubModuleState.subscribe((activeSubModuleState: Module) => {
            this.appErrorHandler.executeAction(() => {
                this.activeSubModule = activeSubModuleState;
            });
        });
    }

    /**
     * subscribeToolbarSettingState
     */
    private subscribeToolbarSettingState() {
        if (this.toolbarSettingStateSubscription) {
            this.toolbarSettingStateSubscription.unsubscribe();
        }
        this.toolbarSettingStateSubscription = this.toolbarSettingState.subscribe((toolbarSettingState: any) => {
            this.appErrorHandler.executeAction(() => {
                this.toolbarSetting = toolbarSettingState;
            });
        });
    }

    /**
     * subscribeEnableWidgetTemplateState
     */
    private subscribeEnableWidgetTemplateState() {
        if (this.enableWidgetTemplateStateSubscription) {
            this.enableWidgetTemplateStateSubscription.unsubscribe();
        }
        this.enableWidgetTemplateStateSubscription = this.enableWidgetTemplateState.subscribe((enableWidgetTemplate: EnableWidgetTemplateState) => {
            this.appErrorHandler.executeAction(() => {
                // clear all maximize widgets
                this.resetMaximizeWidget();
                if (this.currentMaximizeWidgetData.isMaximizedWidget) {
                    this.restoreMaximizeWidget(!status, true); // true: Edit mode -> must minimize widget
                } else {
                    this.restoreMaximizeWidget(false, false);
                }
                setTimeout(() => {
                    this.allowDesignEdit = enableWidgetTemplate.status;
                    this.ngGrid.setDesignMode(this.allowDesignEdit);
                    // View mode && any changes on Widget
                    if (!status && this.isWidgetDesignChanged()) {
                        this.confirmSavingWhenChangeStatus();
                    }
                });
            });
        });
    }

    /**
     * subscribeSaveWidgetState
     */
    private subscribeSaveWidgetState() {
        if (this.saveWidgetStateSubscription) {
            this.saveWidgetStateSubscription.unsubscribe();
        }
        this.saveWidgetStateSubscription = this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return (
                        action.type === WidgetTemplateActions.SAVE_WIDGET &&
                        action.module.idSettingsGUI == this.ofModule.idSettingsGUI
                    );
                }),
            )
            .subscribe((data: CustomAction) => {
                this.appErrorHandler.executeAction(() => {
                    //if (!this.isActivated) {
                    //    return;
                    //}
                    if (this.isWidgetDesignChanged()) {
                        const widgetBoxesDirty = this.widgetBoxes.filter((p) => p.isDirty || p.isDeleted);
                        for (let i = 0; i < widgetBoxesDirty.length; i++) {
                            const widgetBox: WidgetBox = widgetBoxesDirty[i];
                            const widgetDetail: WidgetDetail = Object.assign({}, widgetBox.data);
                            const widgetModuleComponents = this.widgetModuleComponents.filter(
                                (p) => p.data.id === widgetDetail.id,
                            );
                            for (let j = 0; j < widgetModuleComponents.length; j++) {
                                if (widgetModuleComponents[j].data.idRepWidgetType === WidgetType.Chart) {
                                    widgetModuleComponents[j].propertiesForSaving.properties = cloneDeep(
                                        widgetModuleComponents[j].properties,
                                    );
                                }
                            }
                        }
                        setTimeout(() => {
                            this.saveWidgetPage();
                        });
                    }
                });
            });
    }

    private subscribeRequestRefreshWidgetsInTabState() {
        if (this.requestRefreshWidgetsInTabStateSubscription) {
            this.requestRefreshWidgetsInTabStateSubscription.unsubscribe();
        }
        this.requestRefreshWidgetsInTabStateSubscription = this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return (
                        action.type === WidgetDetailActions.REQUEST_REFRESH_WIDGETS_IN_TAB &&
                        action.module.idSettingsGUI == this.ofModule.idSettingsGUI &&
                        action.payload == this.tabID
                    );
                }),
            )
            .subscribe((data: CustomAction) => {
                this.appErrorHandler.executeAction(() => {
                    this.reloadAllWidgetsByPageId();
                });
            });
    }

    /**
     * subscribeConnectForChildFromParentWidgetState
     * */
    private subscribeConnectForChildFromParentWidgetState() {
        if (this.connectForChildFromParentWidgetSubscription) {
            this.connectForChildFromParentWidgetSubscription.unsubscribe();
        }
        this.connectForChildFromParentWidgetSubscription = this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return (
                        action.type === WidgetDetailActions.SET_CONNECT_FOR_CHILD_FROM_PARENT_WIDGET &&
                        action.module.idSettingsGUI == this.ofModule.idSettingsGUI
                    );
                }),
            )
            .subscribe((data: CustomAction) => {
                this.appErrorHandler.executeAction(() => {
                    if (data.payload) {
                        const communicationWidget = data.payload as ICommunicationWidget;
                        if (
                            communicationWidget.childrenRelatingWidgetInfos &&
                            communicationWidget.childrenRelatingWidgetInfos.length
                        ) {
                            if (this.widgetModuleComponents && this.widgetModuleComponents.length) {
                                communicationWidget.childrenRelatingWidgetInfos.forEach((child) => {
                                    const widgetModuleComponent = this.widgetModuleComponents.find(
                                        (p) => p.data.id == child.id,
                                    );
                                    if (widgetModuleComponent) {
                                        this.widgetUtils.buildListenKeyConfigForWidgetDetail(
                                            widgetModuleComponent.data,
                                            false,
                                        );
                                        widgetModuleComponent.data.widgetDataType.parentWidgetIds = [
                                            communicationWidget.srcWidgetDetail.id,
                                        ];
                                        // Fix bug 2740 : [BLOCKED ORDER] blue background is shown after clicking on connection button
                                        widgetModuleComponent.linkedWidgetCoverDisplay = false;
                                        widgetModuleComponent.supportLinkedWidgetCoverDisplay = false;
                                        this.onSuccessLinkingWidget(widgetModuleComponent.data);
                                    }
                                });
                            }
                        }
                    }
                });
            });
    }

    /**
     * subscribeConnectForSameTypeWidgetState
     * */
    private subscribeConnectForSameTypeWidgetState() {
        if (this.connectForSameTypeWidgetSubscription) {
            this.connectForSameTypeWidgetSubscription.unsubscribe();
        }
        this.connectForSameTypeWidgetSubscription = this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return (
                        action.type === WidgetDetailActions.SET_CONNECT_FOR_SAME_TYPE_WIDGET &&
                        action.module.idSettingsGUI == this.ofModule.idSettingsGUI
                    );
                }),
            )
            .subscribe((data: CustomAction) => {
                this.appErrorHandler.executeAction(() => {
                    if (data.payload) {
                        const communicationWidget = data.payload as ICommunicationWidget;
                        if (communicationWidget.sameTypeWidgetInfos && communicationWidget.sameTypeWidgetInfos.length) {
                            if (this.widgetModuleComponents && this.widgetModuleComponents.length) {
                                communicationWidget.sameTypeWidgetInfos.forEach((child) => {
                                    const widgetModuleComponent = this.widgetModuleComponents.find(
                                        (p) => p.data.id == child.id,
                                    );
                                    if (widgetModuleComponent) {
                                        widgetModuleComponent.data.syncWidgetIds = [
                                            communicationWidget.srcWidgetDetail.id,
                                        ];
                                        this.onSuccessLinkingWidget(widgetModuleComponent.data);
                                    }
                                });
                            }
                        }
                    }
                });
            });
    }

    /**
     * subscribeConnectForParentFromChildWidgetState
     * */
    private subscribeConnectForParentFromChildWidgetState() {
        if (this.connectForParentFromChildWidgetSubscription) {
            this.connectForParentFromChildWidgetSubscription.unsubscribe();
        }
        this.connectForParentFromChildWidgetSubscription = this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return (
                        action.type === WidgetDetailActions.SET_CONNECT_FOR_PARENT_FROM_CHILD_WIDGET &&
                        action.module.idSettingsGUI == this.ofModule.idSettingsGUI
                    );
                }),
            )
            .subscribe((data: CustomAction) => {
                this.appErrorHandler.executeAction(() => {
                    if (data.payload) {
                        const communicationWidget = data.payload as ICommunicationWidget;
                        if (communicationWidget.relatingWidgetInfos && communicationWidget.relatingWidgetInfos.length) {
                            if (this.widgetModuleComponents && this.widgetModuleComponents.length) {
                                communicationWidget.relatingWidgetInfos.forEach((child) => {
                                    const widgetModuleComponent = this.widgetModuleComponents.find(
                                        (p) => p.data.id == child.id,
                                    );
                                    if (widgetModuleComponent) {
                                        widgetModuleComponent.linkedSuccessWidget = true;
                                        widgetModuleComponent.reattach();
                                    }
                                });
                            }
                        }
                    }
                });
            });
    }

    /**
     * subscribeResetWidgetState
     */
    private subscribeResetWidgetState() {
        if (this.resetWidgetStateSubscription) {
            this.resetWidgetStateSubscription.unsubscribe();
        }
        this.resetWidgetStateSubscription = this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return (
                        action.type === WidgetTemplateActions.RESET_WIDGET &&
                        action.module.idSettingsGUI == this.ofModule.idSettingsGUI
                    );
                }),
            )
            .subscribe((data: CustomAction) => {
                this.appErrorHandler.executeAction(() => {
                    this.isWidgetDesignDirty = false;
                    if (!this.isActivated) {
                        return;
                    }
                    this.reloadAllWidgetsByPageId();
                });
            });
    }

    /**
     * subscribeResizeSplitterState
     */
    private subscribeResizeSplitterState() {
        this.resizeSplitterStateSubscription = this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return (
                        action.type === LayoutInfoActions.RESIZE_SPLITTER &&
                        action.module.idSettingsGUI == this.ofModule.idSettingsGUI
                    );
                }),
            )
            .subscribe((data: CustomAction) => {
                this.appErrorHandler.executeAction(() => {
                    if (!this.isActivated) {
                        return;
                    }
                    // if widget element is not visible, do nothing
                    if (
                        this.elementRef &&
                        this.elementRef.nativeElement &&
                        this.elementRef.nativeElement.offsetParent == null
                    ) {
                        return;
                    }

                    if (this.allowDesignEdit) {
                        this.isWidgetDesignDirty = true;
                    }

                    // let splitterMode: SplitterDirectionMode = data.payload;
                    setTimeout(() => {
                        this.ngGrid.triggerResize();
                        this.onAfterChangeSize = 'spliter-' + new Date().getTime();
                        this.resizeChartWidget();
                        this.refreshPdfWidget();
                    }, 200);
                });
            });
    }

    private resizeChartWidget() {
        for (let i = 0; i < this.widgetBoxes.length; i++) {
            const widgetBox: WidgetBox = this.widgetBoxes[i];
            const widgetDetail: WidgetDetail = Object.assign({}, widgetBox.data);
            const widgetModuleComponents = this.widgetModuleComponents.filter((p) => p.data.id === widgetDetail.id);
            for (let j = 0; j < widgetModuleComponents.length; j++) {
                if (widgetModuleComponents[j].data.idRepWidgetType === WidgetType.Chart) {
                    widgetModuleComponents[j].chartWidget.refresh();
                }
            }
        }
    }

    private refreshPdfWidget() {
        for (let i = 0; i < this.widgetBoxes.length; i++) {
            const widgetBox: WidgetBox = this.widgetBoxes[i];
            const widgetDetail: WidgetDetail = Object.assign({}, widgetBox.data);
            const widgetModuleComponents = this.widgetModuleComponents.filter((p) => p.data.id === widgetDetail.id);
            for (let j = 0; j < widgetModuleComponents.length; j++) {
                if (
                    widgetModuleComponents[j].data.idRepWidgetType === WidgetType.PdfViewer &&
                    widgetModuleComponents[j].pdfWidget
                ) {
                    widgetModuleComponents[j].pdfWidget.refresh();
                }
            }
        }
    }

    /**
     * subscribeLayoutPageInfoModelState
     */
    private subscribeLayoutPageInfoModelState() {
        if (this.layoutPageInfoModelStateSubscription) {
            this.layoutPageInfoModelStateSubscription.unsubscribe();
        }
        this.layoutPageInfoModelStateSubscription = this.layoutPageInfoModelState.subscribe(
            (layoutInfoState: LayoutPageInfoModel[]) => {
                if (layoutInfoState) this.layoutPageInfo = layoutInfoState;
            },
        );
    }

    /**
     * subscribeSelectedEntityState
     */
    private subscribeSelectedEntityState() {
        if (this.selectedEntityStateSubscription) {
            this.selectedEntityStateSubscription.unsubscribe();
        }
        this.selectedEntityStateSubscription = this.selectedEntityState.subscribe((selectedEntityState: any) => {
            this.appErrorHandler.executeAction(() => {
                this.selectedEntity = selectedEntityState;

                if (
                    isEmpty(selectedEntityState) ||
                    selectedEntityState[this.modulePrimaryKey] == null ||
                    selectedEntityState[this.modulePrimaryKey] == undefined
                ) {
                    return;
                }

                // this.widgetUtils.clearWidgetDataTypeValues();

                // this.resetWidgetTableOnEntityChanged();

                this.widgetUtils.updateWidgetDataTypeValuesFromSelectedEntity(
                    this.ofModule.moduleNameTrim,
                    selectedEntityState,
                    this.widgetListenKey,
                );

                //
                this.currentWidgetStateKey = this.widgetUtils.getWidgetStateKey(
                    selectedEntityState,
                    this.widgetListenKey,
                );

                if (this.currentPageSetting) {
                    this.store.dispatch(this.widgetDetailActions.clearWidgetTypeDetail(this.ofModule));
                    this.store.dispatch(this.widgetDetailActions.clearWidgetTypeDetailForCampaignMedia(this.ofModule));
                    this.reloadMode = ReloadMode.ListenKey;
                    this.updateWidgetContent(this.currentPageSetting, false, false);
                }
            });
        });
    }

    /**
     * subscribeRowDataState
     */
    private subscribeRowDataState() {
        if (this.rowDataStateSubscription) {
            this.rowDataStateSubscription.unsubscribe();
        }

        this.rowDataStateSubscription = this.rowDataState.subscribe((rowData: RowData) => {
            this.appErrorHandler.executeAction(() => {
                this.rowDataChange = rowData;
                if (!this.isActivated) {
                    return;
                }

                const primayIdValueCells = Uti.getPrimaryValueFromKey(rowData);
                if (!primayIdValueCells.length) {
                    return;
                }

                let isDirty: boolean;
                let widgetDirtyList: Array<WidgetModuleComponent> = [];
                // Find other widgets with the same type that was synced with it self.
                const foundWidgetDetails = this.findValidSyncSameTypeWidgets(rowData.widgetDetail);
                if (foundWidgetDetails && foundWidgetDetails.length) {
                    let filterObj = {};
                    primayIdValueCells.forEach((primayIdValueCell) => {
                        filterObj[primayIdValueCell.key] = primayIdValueCell.value;
                    });

                    this.widgetModuleComponents.forEach((widgetModuleComponent) => {
                        const isTableEdited = widgetModuleComponent.isTableEdited;
                        // Find edited tables which listen from the current row state.
                        if (isTableEdited) {
                            if (widgetModuleComponent.data.id != rowData.widgetDetail.id) {
                                if (
                                    widgetModuleComponent.data.widgetDataType &&
                                    widgetModuleComponent.data.widgetDataType.listenKey &&
                                    widgetModuleComponent.data.widgetDataType.listenKey.key
                                ) {
                                    let ignoreDirtyCheck = this.widgetUtils.ignoreDirtyCheck(
                                        widgetModuleComponent.data,
                                    );
                                    if (!ignoreDirtyCheck) {
                                        const keyArr: Array<string> = widgetModuleComponent.data.widgetDataType.listenKey.key.split(
                                            ',',
                                        );
                                        let count = 0;
                                        if (keyArr && keyArr.length) {
                                            keyArr.forEach((key) => {
                                                const iRet = primayIdValueCells.find((p) => p.key == key);
                                                if (iRet) {
                                                    count++;
                                                }
                                            });
                                        }
                                        if (count && count == primayIdValueCells.length) {
                                            isDirty = true;
                                            widgetDirtyList.push(widgetModuleComponent);
                                        }
                                    }
                                }
                            }
                        }
                        const iRet = foundWidgetDetails.filter((p) => p.id == widgetModuleComponent.data.id);
                        if (iRet.length) {
                            if (
                                widgetModuleComponent.data.id != rowData.widgetDetail.id &&
                                widgetModuleComponent.agGridComponent
                            ) {
                                widgetModuleComponent.agGridComponent.setActiveRowByCondition(filterObj);
                                widgetModuleComponent.buildFormDataForReadonlyGrid();
                                Object.keys(filterObj).forEach((key) => {
                                    this.widgetUtils.updateWidgetDataTypeValues(
                                        this.ofModule.moduleNameTrim,
                                        key,
                                        filterObj[key],
                                        WidgetKeyType.Sub,
                                        widgetModuleComponent.data,
                                        this.pageId,
                                    );
                                });
                            }
                        }
                    });
                }

                this.resetWidgetModuleInfoDataBaseOnParent(rowData, this.widgetModuleComponents);

                if (WidgetUtils.widgetDataTypeValues[this.ofModule.moduleNameTrim])
                    WidgetUtils.widgetDataTypeValues[this.ofModule.moduleNameTrim].renderFor = [];

                primayIdValueCells.forEach((primayIdValueCell) => {
                    const value = primayIdValueCell.value;
                    const key = primayIdValueCell.key;
                    this.widgetUtils.updateWidgetDataTypeValues(
                        this.ofModule.moduleNameTrim,
                        key,
                        value,
                        WidgetKeyType.Sub,
                        rowData.widgetDetail,
                        this.pageId,
                    );

                    const widgetTargetRender: IWidgetTargetRender = {
                        key: key,
                        widgetKeyType: WidgetKeyType.Sub,
                        srcWidgetId: rowData.widgetDetail.id,
                        syncWidgetIds:
                            !foundWidgetDetails || (foundWidgetDetails && !foundWidgetDetails.length)
                                ? null
                                : foundWidgetDetails.map((p) => p.id),
                    };

                    if (
                        WidgetUtils.widgetDataTypeValues[this.ofModule.moduleNameTrim] &&
                        !WidgetUtils.widgetDataTypeValues[this.ofModule.moduleNameTrim].renderFor
                    )
                        WidgetUtils.widgetDataTypeValues[this.ofModule.moduleNameTrim].renderFor = [];

                    WidgetUtils.widgetDataTypeValues[this.ofModule.moduleNameTrim].renderFor.push(widgetTargetRender);
                });

                if (this.currentPageSetting) {
                    this.reloadMode = ReloadMode.ListenKey;
                    // Check dirty before reload widgets.
                    if (isDirty) {
                        this.modalService.unsavedWarningMessageDefault({
                            headerText: 'Saving Changes',
                            onModalSaveAndExit: () => {
                                widgetDirtyList.forEach((widgetDirty) => {
                                    widgetDirty.saveWidget(true);
                                });
                                setTimeout(() => {
                                    this.updateWidgetContent(this.currentPageSetting, false, false);
                                }, 500);
                            },
                            onModalExit: () => {
                                widgetDirtyList.forEach((widgetDirty) => {
                                    widgetDirty.resetEditingWidget();
                                });
                                this.updateWidgetContent(this.currentPageSetting, false, false);
                            },
                            onModalCancel: () => {
                                widgetDirtyList.forEach((widgetDirty) => {
                                    widgetDirty.resetEditingWidget();
                                });
                                this.updateWidgetContent(this.currentPageSetting, false, false);
                            },
                        });
                    } else {
                        this.updateWidgetContent(this.currentPageSetting, false, false);
                    }
                }
            });
        });
    }

    private resetWidgetModuleInfoDataBaseOnParent(
        rowData: RowData,
        widgetModuleComponents: QueryList<WidgetModuleComponent>,
    ) {
        if (this.widgetUtils.isTemplateWidget(rowData.widgetDetail)) {
            widgetModuleComponents.forEach((widgetModuleComponent) => {
                if (this.widgetUtils.isValidWidgetToConnectOfParent(rowData.widgetDetail, widgetModuleComponent.data)) {
                    widgetModuleComponent.templateId = null;
                    widgetModuleComponent.widgetMenuStatusComponent.toggleEditTemplateMode(false);
                }
            });
        }
    }

    /**
     * subscribeColumnFilterState
     */
    private subscribeColumnFilterState() {
        if (this.columnFilterStateSubscription) {
            this.columnFilterStateSubscription.unsubscribe();
        }
        this.columnFilterStateSubscription = this.columnFilterState.subscribe((columnFilter: any) => {
            if (columnFilter) {
                this.columnFilter = columnFilter;
            }
        });
    }

    /**
     * subscribeWidgetDataUpdated
     */
    private subscribeWidgetDataUpdated() {
        if (this.widgetDataUpdatedSubscription) {
            this.widgetDataUpdatedSubscription.unsubscribe();
        }
        this.widgetDataUpdatedSubscription = this.widgetDataUpdatedState.subscribe(
            (widgetDataUpdated: WidgetDataUpdated) => {
                this.appErrorHandler.executeAction(() => {
                    // Fix bug 0001115: Load too much request Get for widget infor when user update a widget Customer info
                    if (!this.isActivated) {
                        return;
                    }
                    if (widgetDataUpdated && this.widgetModuleComponents) {
                        const widgetDetailUpdates: Array<WidgetDetail> = [];
                        const widgetDetail: LightWidgetDetail = widgetDataUpdated.widgetDetail;

                        if (!widgetDetail.widgetDataType) {
                            return;
                        }

                        // Loop to find valid widget need to update
                        this.widgetModuleComponents.forEach((widgetModuleComponent) => {
                            if (!widgetModuleComponent.data || !widgetModuleComponent.data.widgetDataType) {
                                return;
                            }

                            // Only update widget with the same listenKey
                            if (
                                isEqual(
                                    widgetDetail.widgetDataType.listenKey,
                                    widgetModuleComponent.data.widgetDataType.listenKey,
                                )
                            ) {
                                if (
                                    widgetDetail.id !== widgetModuleComponent.data.id ||
                                    widgetDataUpdated.isSelfUpdated
                                ) {
                                    this.widgetUtils.replaceEditModeForTreeView(widgetModuleComponent.data);
                                    // ****** Keeping State ******
                                    widgetDetailUpdates.push(new WidgetDetail(widgetModuleComponent.data));
                                }
                            }

                            //Also update parent widget
                            if (widgetDataUpdated.isReloadForParent) {
                                if (
                                    widgetDetail.widgetDataType.parentWidgetIds &&
                                    widgetDetail.widgetDataType.parentWidgetIds.length &&
                                    isEqual(
                                        widgetDetail.widgetDataType.parentWidgetIds[0],
                                        widgetModuleComponent.data.id,
                                    )
                                ) {
                                    widgetDetailUpdates.push(new WidgetDetail(widgetModuleComponent.data));
                                }
                            }
                        });

                        // need to clear from cache of observable
                        if (widgetDetailUpdates.length) {
                            widgetDetailUpdates.forEach((widgetUpdated) => {
                                let key = this.widgetUtils.getWidgetDetailKeyForObservable(
                                    widgetUpdated,
                                    this.ofModule.moduleNameTrim,
                                );
                                if (key) {
                                    this.obserableShareService.deleteObservable(key);
                                }
                            });
                        }
                        this.reloadMode = ReloadMode.UpdatingData;
                        this.reloadWidgetDetails(widgetDetailUpdates, (widgetDetail) => {
                            this.callbackActionsAfterReloadWidgetDetail(widgetDetail);
                        });
                    }
                });
            },
        );
    }

    /**
     * subscribeWidgetDataUpdated
     */
    private subscribeRequestSaveState() {
        if (this.requestSaveStateSubscription) {
            this.requestSaveStateSubscription.unsubscribe();
        }
        this.requestSaveStateSubscription = this.requestSaveState.subscribe((requestSaveState: any) => {
            this.appErrorHandler.executeAction(() => {
                if (!this.isActivated) {
                    return;
                }
                if (requestSaveState) {
                    this.saveAllWidget();
                }
            });
        });
    }

    /**
     * subscribeRequestReloadState
     */
    private subscribeRequestReloadState() {
        if (this.requestReloadStateSubscription) {
            this.requestReloadStateSubscription.unsubscribe();
        }
        this.requestReloadStateSubscription = this.requestReloadState.subscribe((requestReloadState: any) => {
            this.appErrorHandler.executeAction(() => {
                if (!this.isActivated) {
                    return;
                }
                if (requestReloadState) {
                    this.updateWidgetContent(this.currentPageSetting, false, false);
                }
            });
        });
    }

    /**
     * subscribeWidgetTemplateSetting
     */
    private subscribeWidgetTemplateSetting() {
        if (this.widgetTemplateSettingSubscription) {
            this.widgetTemplateSettingSubscription.unsubscribe();
        }
        this.widgetTemplateSettingSubscription = this.widgetTemplateSettingModelState.subscribe(
            (mainWidgetTemplateSettings: WidgetTemplateSettingModel[]) => {
                this.appErrorHandler.executeAction(() => {
                    this.mainWidgetTemplateSettings = mainWidgetTemplateSettings;
                });
            },
        );
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
                if (!this.isActivated) {
                    return;
                }
                if (relatingWidget && this.widgetModuleComponents) {
                    if (relatingWidget.mode == 'hover') {
                        this.widgetModuleComponents.forEach((widgetModuleComponent) => {
                            if (!widgetModuleComponent.data) {
                                return;
                            }
                            if (widgetModuleComponent.data.id != relatingWidget.scrWidgetDetail.id) {
                                // Active for connected widgets
                                relatingWidget.relatingWidgetIds.forEach((widgetId) => {
                                    if (widgetId === widgetModuleComponent.data.id) {
                                        widgetModuleComponent.linkedWidgetCoverDisplay = true;
                                        widgetModuleComponent.reattach();
                                    }
                                });
                            }

                            // Find and active widgets that can be connected with scrWidgetDetail which not in relatingWidgetIds
                            const isFound = relatingWidget.relatingWidgetIds.find(
                                (p) => p == widgetModuleComponent.data.id,
                            );
                            if (!isFound) {
                                let status = this.widgetUtils.isValidWidgetToConnect(
                                    relatingWidget.scrWidgetDetail,
                                    widgetModuleComponent.data,
                                );
                                if (status.isValid) {
                                    if (status.connected) {
                                        widgetModuleComponent.linkedWidgetCoverDisplay = true;
                                        widgetModuleComponent.linkedSuccessWidget = true;
                                    } else {
                                        widgetModuleComponent.supportLinkedWidgetCoverDisplay = true;
                                    }
                                    widgetModuleComponent.reattach();
                                }
                            }
                        });
                    } else {
                        this.widgetModuleComponents.forEach((widgetModuleComponent) => {
                            widgetModuleComponent.linkedWidgetCoverDisplay = false;
                            widgetModuleComponent.supportLinkedWidgetCoverDisplay = false;
                            widgetModuleComponent.reattach();
                        });
                        this.store.dispatch(
                            this.widgetDetailActions.hoverAndDisplayRelatingWidget(null, this.ofModule),
                        );
                    }
                }
            });
        });
    }

    /**
     * subscribeGlobalProperties
     */
    private subscribeGlobalProperties() {
        if (this.globalPropertiesStateSubscription) {
            this.globalPropertiesStateSubscription.unsubscribe();
        }
        this.globalPropertiesStateSubscription = this.globalPropertiesState.subscribe((globalProperties: any) => {
            this.appErrorHandler.executeAction(() => {
                if (!globalProperties) {
                    return;
                }
                this.setBoxShadow(globalProperties);
                // 0001151: The widget is not effect immediately when user change something in properties panel
                if (!this.widgetModuleComponents) {
                    return;
                }
                this.widgetModuleComponents.forEach((widgetModuleComponent) => {
                    widgetModuleComponent.reattach();
                    widgetModuleComponent.detach(500);
                });
            });
        });
    }

    /**
     * subcribeRequestAddToDoubletState
     **/
    private subcribeRequestAddToDoubletState() {
        this.requestAddToDoubletSubscription = this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return action.type === ProcessDataActions.REQUEST_ADD_TO_DOUBLET;
                }),
            )
            .subscribe((data: CustomAction) => {
                this.appErrorHandler.executeAction(() => {
                    const widgetModuleComponent = this.widgetModuleComponents.find(
                        (p) => p && p.data && p.data.idRepWidgetApp == RepWidgetAppIdEnum.CustomerDoublette,
                    );
                    if (widgetModuleComponent) {
                        widgetModuleComponent.addToDoubletWidget(data.payload);
                    }
                });
            });
    }

    private subscribeToggleDesignPageLayout() {
        // Called when clicking on 'Design Page Layout' --> Init all Tabs
        this.requestEditLayoutTogglePanelStateSubscription = this.dispatcher.filter((action: CustomAction) => {
            return action.type === LayoutSettingActions.REQUEST_TOGGLE_PANEL && action.module.idSettingsGUI == this.ofModule.idSettingsGUI;
        }).subscribe((data: any) => {
            this.appErrorHandler.executeAction(() => {
                if (data) {
                    //clear all maximize widgets
                    this.resetMaximizeWidget();
                    //true: minimize widget, else: restore to the previous state
                    this.restoreMaximizeWidget(data.payload ? false : null, true);//restore to the previous state
                }
            });
        });
    }

    private setBoxShadow(globalProperties: any) {
        const displayShadow = this.propertyPanelService.getItemRecursive(globalProperties, 'DisplayShadow');
        const borderStatus = displayShadow ? displayShadow.value || '' : 'None';
        switch (borderStatus.toLowerCase()) {
            case MouseEvent.Hover:
                this.widgetMouseEvent = MouseEvent.Hover;
                break;
            case MouseEvent.Always:
                this.widgetMouseEvent = MouseEvent.Always;
                break;
            default:
                this.widgetMouseEvent = MouseEvent.None;
        }
    }

    public onShowEmailPopup($event: any) {
        this.emailSettingData = $event;
        this.showEmailSettingDialog = true;
    }

    public onEmailPopupClosed() {
        this.showEmailSettingDialog = false;
    }

    public onResetWidgetTranslation($event: any) {
        const widgetDetailUpdates: Array<WidgetDetail> = [];
        this.widgetModuleComponents.forEach((widgetModuleComponent) => {
            if (!widgetModuleComponent.data || !widgetModuleComponent.data.widgetDataType) {
                return;
            }
            if ($event === widgetModuleComponent.data.id) {
                widgetDetailUpdates.push(widgetModuleComponent.data);
            }
        });

        const observables = new Array<Observable<WidgetDetail>>();

        widgetDetailUpdates.forEach((widgetDetailUpdate) => {
            const widgetDetail = Object.assign({}, widgetDetailUpdate);
            observables.push(
                this.widgetTemplateSettingService.getWidgetDetailByRequestString(
                    widgetDetail,
                    widgetDetail.widgetDataType.listenKeyRequest(this.ofModule.moduleNameTrim),
                ),
            );
        });

        // Excute request
        for (let i = 0; i < observables.length; i++) {
            observables[i].subscribe(
                (widgetDetail: WidgetDetail) => {
                    this.appErrorHandler.executeAction(() => {
                        if (widgetDetail) {
                            for (let j = 0; j < this.widgetBoxes.length; j++) {
                                if (this.widgetBoxes[j].id === widgetDetail.id) {
                                    this.widgetBoxes[j].data = widgetDetail;
                                    break;
                                }
                            }
                        }
                        this.dispatchActionSetWidgetboxesInfo();
                    });
                },
                (err) => { },
            );
        }
    }

    public handleTranslateWidgetDialog(event) {
        if (event && event.isHidden && event.isUpdated) {
            WidgetUtils.widgetDataTypeValues[this.ofModule.moduleNameTrim].renderFor = null;
            // this.updateWidgetContent(this.currentPageSetting, true, true);
            // Fix bug translate title on dialiog but not effect after closing dialog
            this.reloadAllWidgetsByPageId();
        }
    }

    /**
     * ngOnChanges
     * @param changes
     */
    public ngOnChanges(changes: SimpleChanges) {
        if (!changes['pageId']) {
            return;
        }
        const hasChanges = this.hasChanges(changes['pageId']);
        if (hasChanges) {
            this.reloadAllWidgetsByPageId();
        }
    }

    /**
     * reloadAllWidgetsByPageId
     */
    private reloadAllWidgetsByPageId() {
        this.isWidgetDesignDirty = false;
        this.isReloadAll = true;
        if (WidgetUtils.widgetDataTypeValues[this.ofModule.moduleNameTrim]) {
            WidgetUtils.widgetDataTypeValues[this.ofModule.moduleNameTrim].renderFor = null;
        }
        this.store.dispatch(this.widgetDetailActions.clearWidgetTypeDetail(this.ofModule));
        this.store.dispatch(this.widgetDetailActions.clearWidgetTypeDetailForCampaignMedia(this.ofModule));
        this.widgetBoxes = [];
        setTimeout(() => {
            this.updatePageSetting((pageSetting) => {
                this.updateWidgetContent(pageSetting, true, true);
                this.isReloadAll = false;
            });
        }, 500);
    }

    /**
     * updatePageSetting
     * @param callback
     */
    private updatePageSetting(callback?: any) {
        this.widgetTemplateSettingServiceSubscription = this.widgetTemplateSettingService
            .getWidgetSetting('ObjectNr', this.pageId)
            .subscribe((rs) => {
                this.appErrorHandler.executeAction(() => {
                    if (!rs) {
                        return;
                    }
                    const pageSetting: PageSetting = this.widgetUtils.buildPageSettingData(rs.data);
                    if (!pageSetting) {
                        this.currentPageSetting = this.createEmptyPageSetting();
                        return;
                    }
                    this.currentPageSetting = pageSetting;
                    if (callback) {
                        callback(pageSetting);
                    }
                });
            });
    }

    /**
     * ngOnDestroy
     */
    public ngOnDestroy() {
        this.destroy();
        Uti.unsubscribe(this);
    }

    private createEmptyPageSetting(): PageSetting {
        const data: WidgetDetailPageSetting = new WidgetDetailPageSetting({
            pageId: this.pageId,
        });

        const pageSetting = this.createPageSettingModel(data);
        return pageSetting;
    }

    /**
     * updateWidgetSetting
     * @param widgetDetail
     */
    updateWidgetSetting(widgetDetail: WidgetDetail) {
        if (this.mainWidgetTemplateSettings && this.mainWidgetTemplateSettings.length > 0) {
            const rs = this.mainWidgetTemplateSettings.filter((p) => p.idRepWidgetApp === widgetDetail.idRepWidgetApp);
            if (rs.length > 0) {
                const widgetTemplateSettingModel: WidgetTemplateSettingModel = rs[0];
                const wgTemplateDetail = this.widgetUtils.mapWidgetDetailFromWidgetTemplateSetting(
                    widgetTemplateSettingModel,
                );

                // Merge setting from the last saving to template setting.
                if (wgTemplateDetail.widgetDataType && widgetDetail.widgetDataType) {
                    wgTemplateDetail.widgetDataType.parentWidgetIds = Object.assign(
                        [],
                        widgetDetail.widgetDataType.parentWidgetIds,
                    );
                    wgTemplateDetail.widgetDataType.listenKey.main = widgetDetail.widgetDataType.listenKey.main;
                    wgTemplateDetail.widgetDataType.listenKey.sub = widgetDetail.widgetDataType.listenKey.sub;
                    wgTemplateDetail.widgetDataType.editFormSetting = widgetDetail.widgetDataType.editFormSetting;
                }

                Object.assign(widgetDetail, wgTemplateDetail, {
                    id: widgetDetail.id,
                    idSettingsWidget: widgetDetail.idSettingsWidget,
                    title: widgetDetail.title,
                    moduleName: this.ofModule.moduleName,
                    defaultProperties: rs[0].defaultProperties || '',
                    extensionData: widgetDetail.extensionData,
                    syncWidgetIds: widgetDetail.syncWidgetIds,
                });
            }
        }
    }

    /**
     * updateWidgetContent
     * @param pageSetting
     * @param redrawWidgetBoxes
     * @param clearData
     */
    updateWidgetContent(pageSetting: PageSetting, redrawWidgetBoxes: boolean, clearData?: boolean) {
        if (!pageSetting) return;
        this.idSettingsPage = pageSetting.idSettingsPage;
        const jsonSettingsData = pageSetting.jsonSettings;
        const jsObj: WidgetDetailPageSetting = JSON.parse(jsonSettingsData);

        if (jsObj.gridConfig) {
            this.gridConfig.design_size_diff_percentage = jsObj.gridConfig.designSizeDiffPercentage;
        }

        let widgets: Array<WidgetDetailPage> = pageSetting.widgets;

        if (!widgets || widgets.length === 0) {
            return;
        }

        widgets = this.widgetUtils.sortWidgetDetails(widgets);

        if (redrawWidgetBoxes) {
            this.widgetBoxes = [];
        }

        let widgetDetailsNeedToUpdate: Array<WidgetDetail> = [];

        // Create boxes & observables list;
        for (let i = 0; i < widgets.length; i++) {
            const widget: WidgetDetailPage = widgets[i];
            // Map data from widget template
            this.updateWidgetSetting(widget.widgetDetail);

            if (!widget.filterData) {
                widget.filterData = new FilterData({
                    filterMode: FilterModeEnum.ShowAll,
                    subFilterMode: FilterModeEnum.ShowAll,
                    fieldFilters: [],
                });
            }

            if (redrawWidgetBoxes) {
                const properties = this.propertyPanelService.mergeProperties(widget.properties, widget.widgetDetail.defaultProperties);

                if (properties) {
                    let propTitleText = this.propertyPanelService.getItemRecursive(properties.properties, 'TitleText');
                    if (propTitleText) {
                        propTitleText.translatedValue = widget.widgetDetail.title;
                    }
                }

                // Create empty boxes
                this.widgetBoxes.push(
                    new WidgetBox({
                        id: widget.widgetDetail.id,
                        config: widget.config,
                        //data: new WidgetDetail(),
                        widgetStates: [],
                        filterData: widget.filterData,
                        properties: properties,
                        columnsLayoutSettings: widget.columnsLayoutSettings,
                        promiseList: [],
                        payload: widget.widgetDetail,
                    }),
                );
            }

            if (clearData) {
                if (this.widgetBoxes[i]) {
                    this.widgetBoxes[i].data = new WidgetDetail();
                }
            }

            this.addDelay(this.widgetBoxes[i]);

            if (this.checkWidgetIgnoreDefaultRequest(widget.widgetDetail)) {
                if (this.widgetBoxes[i]) {
                    // this.widgetBoxes[i].data = cloneDeep(widget.widgetDetail);
                    this.updateContentForWidgetBox(this.widgetBoxes[i], cloneDeep(widget.widgetDetail));
                }
                this.callbackActionsAfterReloadWidgetDetail(widget.widgetDetail);
                continue;
            }

            if (!widget.widgetDetail.widgetDataType) {
                continue;
            }

            if (!WidgetUtils.widgetDataTypeValues[this.ofModule.moduleNameTrim]) {
                WidgetUtils.widgetDataTypeValues[this.ofModule.moduleNameTrim] = {};
            }

            // Render All
            if (!WidgetUtils.widgetDataTypeValues[this.ofModule.moduleNameTrim].renderFor || this.isReloadAll) {
                this.widgetUtils.replaceEditModeForTreeView(widget.widgetDetail);
                if (widget.widgetDetail.widgetDataType) {
                    widgetDetailsNeedToUpdate.push(new WidgetDetail(widget.widgetDetail));
                }
            } else {
                // Render for specific type
                if (WidgetUtils.widgetDataTypeValues[this.ofModule.moduleNameTrim].renderFor.length > 0) {
                    let isValidWidget = false;
                    if (widget.widgetDetail.widgetDataType && widget.widgetDetail.widgetDataType.listenKeyCount === 1) {
                        for (
                            let k = 0;
                            k < WidgetUtils.widgetDataTypeValues[this.ofModule.moduleNameTrim].renderFor.length;
                            k++
                        ) {
                            if (
                                this.widgetUtils.isValidWidgetForRender(
                                    WidgetUtils.widgetDataTypeValues[this.ofModule.moduleNameTrim].renderFor[k],
                                    widget.widgetDetail,
                                )
                            ) {
                                isValidWidget = true;
                                break;
                            }
                        }
                    } else {
                        let count = 0;
                        for (
                            let k = 0;
                            k < WidgetUtils.widgetDataTypeValues[this.ofModule.moduleNameTrim].renderFor.length;
                            k++
                        ) {
                            if (
                                this.widgetUtils.isValidWidgetForRender(
                                    WidgetUtils.widgetDataTypeValues[this.ofModule.moduleNameTrim].renderFor[k],
                                    widget.widgetDetail,
                                )
                            ) {
                                count += 1;
                            }
                        }
                        if (count && count === widget.widgetDetail.widgetDataType.listenKeyCount) {
                            isValidWidget = true;
                        }
                    }
                    if (isValidWidget) {
                        this.widgetUtils.replaceEditModeForTreeView(widget.widgetDetail);
                        if (widget.widgetDetail.widgetDataType) {
                            widgetDetailsNeedToUpdate.push(new WidgetDetail(widget.widgetDetail));
                        }
                    }
                }
            }
        }

        if (widgetDetailsNeedToUpdate.length) {
            this.reloadWidgetDetails(widgetDetailsNeedToUpdate, (widgetDetail) => {
                this.callbackActionsAfterReloadWidgetDetail(widgetDetail);
            });
        }
    }

    /**
     * buildWidgetBox
     * @param widgetDetail
     * @param id
     * @param config
     */
    private buildWidgetBox(widgetDetail: WidgetDetail, id: string, config: NgGridItemConfig = null): WidgetBox {
        let conf: NgGridItemConfig;
        if (!config) {
            const defaultConf: NgGridItemConfig = this._generateDefaultItemConfig();
            conf = Object.assign({}, defaultConf, { payload: id });

            conf.sizex = 0; // WidgetContainerComponent.DEFAULT_SIZE_X;
            conf.sizey = 0; // WidgetContainerComponent.DEFAULT_SIZE_Y;
        } else {
            conf = config;
        }
        let widgetBox: WidgetBox = new WidgetBox({
            id: id,
            config: conf,
            // data: widgetDetail,
            widgetStates: [],
            columnsLayoutSettings: { settings: '' },
            properties: widgetDetail.defaultProperties ? JSON.parse(widgetDetail.defaultProperties) : [],
        });
        this.updateContentForWidgetBox(widgetBox, widgetDetail);
        return widgetBox;
    }

    /**
     * onChangeStop
     * @param box
     * @param event
     */
    onChangeStop(box: WidgetBox, event: NgGridItemEvent): void {
        // If dirty
        if (this.isWidgetDesignModified(box, event)) {
            //console.log('onChangeStop dirty: ' + box.data.title);
            box.config.col = event.col;
            box.config.row = event.row;
            box.config.sizex = event.sizex;
            box.config.sizey = event.sizey;
            box.config.leftPercentage = event.leftPercentage;
            box.config.topPercentage = event.topPercentage;
            box.config.widthPercentage = event.widthPercentage;
            box.config.heightPercentage = event.heightPercentage;
            box.isDirty = true;
        }
    }

    /**
     * isWidgetDesignChanged
     */
    private isWidgetDesignChanged() {
        const widgetBoxesDirty = this.widgetBoxes.filter((p) => p.isDirty || p.isDeleted);
        if (widgetBoxesDirty.length > 0) {
            return true;
        }
        return false;
    }

    /**
     * Check if widget update position or width/height
     */
    private isWidgetDesignModified(box: WidgetBox, event: NgGridItemEvent) {
        if (this.isWidgetDesignDirty) {
            if (
                box.config.col !== event.col ||
                box.config.row !== event.row ||
                box.config.sizex !== event.sizex ||
                box.config.sizey !== event.sizey ||
                box.config.leftPercentage !== event.leftPercentage ||
                box.config.topPercentage !== event.topPercentage ||
                box.config.widthPercentage !== event.widthPercentage ||
                box.config.heightPercentage !== event.heightPercentage
            ) {
                return true;
            }
        }
        return false;
    }

    /**
     * onResizeStop
     * @param box
     * @param event
     */
    onResizeStop(box: WidgetBox, event: NgGridItemEvent): void {
        this.isDesignUpdating = false;
        if (box.data) {
            this.widgetModuleComponents.forEach((widgetModuleComponent) => {
                if (widgetModuleComponent && widgetModuleComponent.data.id === box.data.id) {
                    widgetModuleComponent.onResizeStop();
                }
            });
            this.onAfterChangeSize = 'stop-' + box.data.id + '-' + new Date().getTime();
        }
    }

    /**
     * onResizeStart
     * @param box
     * @param event
     */
    onResizeStart(box: WidgetBox, event: NgGridItemEvent): void {
        this.isWidgetDesignDirty = true;
        this.isDesignUpdating = true;
        if (box.data) {
            this.onAfterChangeSize = 'start-' + box.data.id + '-' + new Date().getTime();
        }
    }

    /**
     * onDragStart
     * @param box
     * @param event
     */
    onDragStart(box: WidgetBox, event: NgGridItemEvent): void {
        this.isWidgetDesignDirty = true;
        this.isDesignUpdating = true;
    }

    /**
     * onDragStop
     * @param box
     * @param event
     */
    onDragStop(box: WidgetBox, event: NgGridItemEvent): void {
        this.isDesignUpdating = false;
    }

    /**
     * onRemoveWidget
     * @param $event
     */
    onRemoveWidget($event: WidgetDetail): void {
        this.isWidgetDesignDirty = true;
        if (!$event.idSettingsWidget) {
            this.widgetBoxes = this.widgetBoxes.filter((item) => item.id !== $event.id);
        } else {
            const widgetBox = this.widgetBoxes.filter((item) => item.id === $event.id);
            if (widgetBox.length) {
                widgetBox[0].isDeleted = true;
            }
        }
        this.dispatchActionSetWidgetboxesInfo();

        // Remove listen key from IWidgetDataTypeValues
        this.widgetUtils.removeListenKeyFromWidgetDataTypeValues(this.ofModule.moduleNameTrim, $event.id);

        // Update currentPageSetting if any
        if (this.currentPageSetting && this.currentPageSetting.widgets) {
            const widgets: Array<WidgetDetailPage> = this.currentPageSetting.widgets;
            this.currentPageSetting.widgets = widgets.filter((item) => item.widgetDetail.id !== $event.id);
        }

        setTimeout(() => {
            this.ngGrid.triggerDragStopEventForAllItems();
        });

        this.onWidgetDeleted.emit(true);
    }

    /**
     * getMousePosition
     * @param e
     */
    private getMousePosition(e) {
        const refPos: any = this.elementRef.nativeElement.getBoundingClientRect();
        // Get top, left of mouse in this current widget
        return {
            left: e.clientX - refPos.left,
            top: e.clientY - refPos.top,
        };
    }

    /**
     * dragOverNewWidget
     * @param $event
     */
    dragOverNewWidget($event: any) {
        this.ngGrid.dragOverNewWidget($event.mouseEvent);
    }

    /**
     * dragNewWidgetLeave
     * @param $event
     */
    dragNewWidgetLeave($event) {
        // There are some specical cases when dragging inside this container but it's still raise drage leave event
        // So we need to check these special cases
        if ($event && $event.mouseEvent && $event.mouseEvent.fromElement) {
            // Check if mouse still inside parent ,  then do nothing if still inside parent
            const parent = this.domHandler.findParent(
                $event.mouseEvent.fromElement,
                '*[data-pageid="' + this.pageId + '"]',
            );
            // If drag out of zone of this container
            if (!parent || (parent && parent.length == 0)) {
                this.ngGrid.destroyPlaceholderRefForNewWidget();
                return;
            }
            /*
            // cover-edit-mode
            const arr = ['grid-placeholder', 'grid-placeholder__warning', 'cover-edit-mode', 'box-header-title', 'main-title'];
                       
            if (arr.indexOf($event.mouseEvent.fromElement.className) == -1) {
                this.ngGrid.destroyPlaceholderRefForNewWidget();
            }
            */
        }
    }

    /**
     * transferDataSuccess
     * @param $event
     */
    transferDataSuccess($event: any) {
        const sizePos = this.ngGrid.dropStopNewWidget();

        if (!$event || !$event.dragData || !sizePos) {
            return;
        }

        this.isWidgetDesignDirty = true;

        const widgetTemplateSettingModel: WidgetTemplateSettingModel = $event.dragData;

        // Create widget detail
        const wgDetail = this.widgetUtils.mapWidgetDetailFromWidgetTemplateSetting(widgetTemplateSettingModel);
        const widgetDetail: WidgetDetail = Object.assign({}, wgDetail, {
            id: null,
            title: $event.dragData.WidgetName,
            moduleName: this.ofModule.moduleName,
            defaultProperties: $event.dragData.defaultProperties || '',
        });

        let isDisplayDialog: boolean = false;

        if (this.checkWidgetIgnoreDefaultRequest(widgetDetail)) {
            // Check & set listen key from default config
            isDisplayDialog = this.detectListenKeyAfterDrag(widgetDetail);

            const widgetId = UUID.UUID();
            widgetDetail.id = widgetId;
            // Build widget box
            const widgetBox = this.buildWidgetBox(widgetDetail, widgetId);
            if (sizePos) {
                widgetBox.config.sizex = sizePos.size.x;
                widgetBox.config.sizey = sizePos.size.y;
                widgetBox.config.row = sizePos.pos.row;
                widgetBox.config.col = sizePos.pos.col;
            }
            widgetBox.payload = widgetDetail;

            this.updateWidgetTitlePropertyFromWidgetBox(widgetBox, widgetDetail);

            this.addDelay(widgetBox);
            this.widgetBoxes.push(widgetBox);
            this.dispatchActionSetWidgetboxesInfo();
            this.getWidgetTitleTranslation(widgetDetail, true);
            if (isDisplayDialog) {
                this.displayConnectedWidgetDialog = true;
            }
            //setTimeout(() => {
            //    this.ngGrid.triggerDragStopEventForAllItems();
            //});
            return;
        }

        this.widgetUtils.replaceEditModeForTreeView(widgetDetail);

        let rsObservable: Observable<WidgetDetail>;

        if (widgetDetail.widgetDataType) {
            rsObservable = this.widgetTemplateSettingService.getWidgetDetailByRequestString(
                widgetDetail,
                widgetDetail.widgetDataType.listenKeyRequest(this.ofModule.moduleNameTrim),
            );
        }

        if (!rsObservable) {
            return;
        }

        rsObservable.subscribe((widgetDetailData: WidgetDetail) => {
            this.appErrorHandler.executeAction(() => {
                if (widgetDetailData && Object.keys(widgetDetailData).length > 0) {
                    // Update Id, Title for Widget Detail
                    const widgetId = UUID.UUID();
                    widgetDetailData.id = widgetId;

                    // Build widget box
                    // After run this, widgetDetailData and widgetBox.data may have difference from memory
                    // So we need to work on widgetBox.data
                    const widgetBox = this.buildWidgetBox(widgetDetailData, widgetId);
                    if (sizePos) {
                        widgetBox.config.sizex = sizePos.size.x;
                        widgetBox.config.sizey = sizePos.size.y;
                        widgetBox.config.row = sizePos.pos.row;
                        widgetBox.config.col = sizePos.pos.col;
                    }
                    widgetBox.payload = widgetDetailData;

                    this.updateWidgetTitlePropertyFromWidgetBox(widgetBox, widgetDetailData);

                    this.addDelay(widgetBox);
                    this.widgetBoxes.push(widgetBox);

                    this.dispatchActionSetWidgetboxesInfo();
                    this.getWidgetTitleTranslation(widgetDetailData, true);
                    // Update currentPageSetting if any
                    if (this.currentPageSetting && this.currentPageSetting.jsonSettings) {
                        let widgets: Array<WidgetDetailPage> = this.currentPageSetting.widgets;

                        if (!widgets) {
                            widgets = [];
                        }

                        const widgetDetailPage: WidgetDetailPage = new WidgetDetailPage({
                            widgetDetail: Object.assign({}, widgetBox.data),
                            config: widgetBox.config,
                        });
                        widgets.push(widgetDetailPage);
                    }

                    setTimeout(() => {
                        this.ngGrid.triggerDragStopEventForAllItems();
                    });

                    // Check & set listen key from default config
                    // We moved this code from outside to this section because we need to get the latest
                    // memory WidgetDetail from widgetBox
                    isDisplayDialog = this.detectListenKeyAfterDrag(widgetBox.data);

                    if (isDisplayDialog) {
                        this.displayConnectedWidgetDialog = true;
                    } else {
                        // Get data after getting valid listen key
                        this.reloadWidgetDetails([widgetBox.data]);
                    }

                    this.initListenKeyFromPrimaryKey(widgetDetail);
                }
            });
        });
    }

    /**
     * updateWidgetTitlePropertyFromWidgetBox
     * */
    private updateWidgetTitlePropertyFromWidgetBox(widgetBox: WidgetBox, widgetDetail: WidgetDetail) {
        const widgetBoxProperties = widgetBox.properties ? widgetBox.properties.properties : null;
        if (widgetBoxProperties) {
            if (!this.layoutPageInfo || !this.layoutPageInfo.length)
                widgetBox.properties.properties = this.updateDefaultWidgetTitleFromProperty(
                    widgetBoxProperties,
                    widgetDetail.title,
                );
            else {
                const pagesInfo = this.layoutPageInfo.filter((page) => page.moduleName === this.ofModule.moduleName);
                pagesInfo.forEach((page) => {
                    widgetBox.properties.properties = this.updateDefaultWidgetTitleFromProperty(
                        widgetBoxProperties,
                        widgetDetail.title,
                        page,
                    );
                });
            }
            const propTitleText: WidgetPropertyModel = this.propertyPanelService.getItemRecursive(
                widgetBox.properties.properties,
                'TitleText',
            );
            if (propTitleText && propTitleText.value) widgetBox.data.title = propTitleText.value;
        }
    }

    private callbackActionsAfterReloadWidgetDetail(widgetDetail: WidgetDetail) {
        this.dispatchActionSetWidgetboxesInfo();
        this.getWidgetTitleTranslation(widgetDetail);
    }

    private dispatchActionSetWidgetboxesInfo(widgetDetail?: WidgetDetail) {
        const layoutPageInfo = new LayoutPageInfoModel({
            id: this.pageId,
            moduleName: this.ofModule.moduleName,
            widgetboxesTitle: this.buildArrayWidgetBoxTitle(widgetDetail),
        });
        this.store.dispatch(this.xnCommonActions.setWidgetboxesInfo(layoutPageInfo, this.ofModule));
    }

    /**
     * getWidgetTitleTranslation
     * @param widgetDetail
     * @param fallback :
     *
     */
    private getWidgetTitleTranslation(widgetDetail: WidgetDetail, fallback?: boolean) {
        if (!widgetDetail || widgetDetail.idRepWidgetType === WidgetType.OrderDataEntry) return;

        const box = this.widgetBoxes.find((item) => item.id === widgetDetail.id);
        if (!box) return;

        if (!box.properties || !box.data.defaultProperties) {
            return;
        }

        let properties = this.propertyPanelService.mergeProperties(box.properties, box.data.defaultProperties);
        if (!properties) {
            return;
        }

        const propTitleText: WidgetPropertyModel = this.propertyPanelService.getItemRecursive(
            properties.properties,
            'TitleText',
        );
        if (!propTitleText || !propTitleText.value) return;

        const translatedTitle = widgetDetail.title; // this.widgetUtils.getTranslatedTitle(widgetDetail);
        propTitleText.translatedValue = translatedTitle || propTitleText.value;

        if (!fallback) {
            if (propTitleText && propTitleText.value) box.data.title = propTitleText.translatedValue;
            const widgetPropertiesStateModel: WidgetPropertiesStateModel = new WidgetPropertiesStateModel({
                widgetData: widgetDetail,
                widgetProperties: properties,
            });
            this.store.dispatch(this.propertyPanelActions.updateProperties(widgetPropertiesStateModel, this.ofModule));
        } else {
            const accessToken = this.uti.decodeAccessToken();
            let language = 1;
            if (accessToken && accessToken.appinfo) {
                const appInfo = JSON.parse(accessToken.appinfo);
                if (appInfo && appInfo.Language) {
                    language = appInfo.Language;
                }
            }
            this.globalSettingServiceSubscription = this.globalSettingService
                .getTranslateLabelText(
                    propTitleText.value,
                    widgetDetail.idRepWidgetApp + '',
                    widgetDetail.id,
                    TranslateDataTypeEnum.Data + '',
                )
                .subscribe((response) => {
                    this.appErrorHandler.executeAction(
                        // successfully
                        () => {
                            if (response && response.data && response.data.length > 1) {
                                const tranlateItem = (response.data[1] as Array<any>).find(
                                    (item) => item.IdRepLanguage == language,
                                );
                                if (
                                    !tranlateItem ||
                                    (!tranlateItem.AllTranslateText && !tranlateItem.OnlyThisWidgetTranslateText)
                                ) {
                                    propTitleText.translatedValue = propTitleText.value;
                                } else {
                                    if (tranlateItem.OnlyThisWidgetTranslateText)
                                        propTitleText.translatedValue = tranlateItem.OnlyThisWidgetTranslateText;
                                    else propTitleText.translatedValue = tranlateItem.AllTranslateText;
                                }
                                if (propTitleText && propTitleText.value)
                                    box.data.title = propTitleText.translatedValue;
                                const widgetPropertiesStateModel: WidgetPropertiesStateModel = new WidgetPropertiesStateModel(
                                    {
                                        widgetData: widgetDetail,
                                        widgetProperties: properties,
                                    },
                                );
                                this.store.dispatch(
                                    this.propertyPanelActions.updateProperties(
                                        widgetPropertiesStateModel,
                                        this.ofModule,
                                    ),
                                );
                            }
                        },
                        // failed
                        () => (propTitleText.translatedValue = propTitleText.value),
                    );
                });
        }
    }

    private buildArrayWidgetBoxTitle(editingWidget: WidgetDetail): any {
        let array = [];
        this.widgetBoxes.forEach((box) => {
            if (!box.isDeleted && box.properties) {
                const propTitleText: WidgetPropertyModel = this.propertyPanelService.getItemRecursive(
                    box.properties.properties,
                    'TitleText',
                );
                let title = '';
                if (propTitleText && propTitleText.value) {
                    title = propTitleText.value;
                } else {
                    if (box.data) {
                        title = box.data.title;
                    }
                }
                array.push({
                    id: box.id,
                    title: title,
                    widgetDetail: editingWidget || box.data,
                });
            }
        });
        return array;
    }

    private updateDefaultWidgetTitleFromProperty(properties: any, title: string, pageInfo?: LayoutPageInfoModel): any {
        if (properties) {
            const propTitleText: WidgetPropertyModel = this.propertyPanelService.getItemRecursive(
                properties,
                'TitleText',
            );
            if (propTitleText) {
                if (
                    (!this.widgetBoxes || !this.widgetBoxes.length) &&
                    (!pageInfo || !pageInfo.widgetboxesTitle || !pageInfo.widgetboxesTitle.length)
                )
                    propTitleText.value = title;
                else {
                    let _number = 0;
                    if (pageInfo) {
                        if (propTitleText.value.trim().indexOf(title + '(') === 0) {
                            try {
                                _number = parseInt(
                                    propTitleText.value
                                        .replace(title + '(', '')
                                        .replace(')', '')
                                        .trim(),
                                );
                            } catch (ex) { }
                        }
                        pageInfo.widgetboxesTitle.forEach((_boxTitle) => {
                            const _title = _boxTitle.title;
                            if (_title.trim().indexOf(title + '(') === 0) {
                                try {
                                    const tempNumber =
                                        parseInt(
                                            _title
                                                .replace(title + '(', '')
                                                .replace(')', '')
                                                .trim(),
                                        ) + 1;
                                    if (tempNumber > _number) _number = tempNumber;
                                } catch (ex) { }
                            } else if (_title.trim() === title) _number = 1;
                        });
                    } else {
                        this.widgetBoxes.forEach((item) => {
                            if (item.data && item.data.title) {
                                const _title = item.data.title;
                                if (_title.trim().indexOf(title + '(') === 0) {
                                    try {
                                        const tempNumber =
                                            parseInt(
                                                _title
                                                    .replace(title + '(', '')
                                                    .replace(')', '')
                                                    .trim(),
                                            ) + 1;
                                        if (tempNumber > _number) _number = tempNumber;
                                    } catch (ex) { }
                                } else if (_title.trim() === title) _number = 1;
                            }
                        });
                    }

                    if (_number > 0) propTitleText.value = title + '(' + _number + ')';
                    else propTitleText.value = title;
                }
            }
            return properties;
        }
        return null;
    }

    /**
     * saveWidgetPage
     * @param parmWidgetDetail
     * @param isClosePropertyPanel
     */
    saveWidgetPage(parmWidgetDetail?: WidgetDetail, isClosePropertyPanel?: boolean) {
        let widgets: Array<WidgetDetailPage> = [];
        let currentFilterData: FilterData;
        const widgetBoxesDirty = this.widgetBoxes.filter((p) => p.isDirty || p.isDeleted);
        for (let i = 0; i < widgetBoxesDirty.length; i++) {
            const widgetBox: WidgetBox = widgetBoxesDirty[i];

            const widgetDetail: WidgetDetail = Object.assign({}, widgetBox.data);
            let filterMode: FilterModeEnum = FilterModeEnum.ShowAll;
            let subFilterMode: FilterModeEnum = FilterModeEnum.ShowAll;
            let fieldFilters: Array<FieldFilter>;
            let columnLayoutsetting: ColumnLayoutSetting = null;
            let rowSetting: RowSetting = null;
            let widgetFormType: WidgetFormTypeEnum = null;
            let widgetProperties: any = {};
            let orderDataEntryWidgetLayoutMode: OrderDataEntryWidgetLayoutModeEnum = null;
            let orderDataEntryProperties: OrderDataEntryProperties = new OrderDataEntryProperties();
            if (widgetDetail.idRepWidgetType !== WidgetType.OrderDataEntry) {
                const widgetModuleComponents = this.widgetModuleComponents.filter((p) => p.data.id === widgetDetail.id);

                if (widgetModuleComponents.length > 0) {
                    filterMode = widgetModuleComponents[0].selectedFilter;
                    subFilterMode = widgetModuleComponents[0].selectedSubFilter;
                    fieldFilters = widgetModuleComponents[0].fieldFilters;
                    columnLayoutsetting = widgetModuleComponents[0].columnLayoutsetting;
                    rowSetting = widgetModuleComponents[0].rowSetting;
                    widgetFormType = widgetModuleComponents[0].widgetFormType;
                    widgetProperties = widgetModuleComponents[0].propertiesForSaving;
                }
            } else {
            }

            const widgetDetailPage: WidgetDetailPage = new WidgetDetailPage({
                widgetDetail: widgetDetail,
                config: widgetBox.config,
                properties: widgetProperties,
                columnsLayoutSettings: widgetBox.columnsLayoutSettings,
            });

            if (widgetDetail.idRepWidgetType === WidgetType.OrderDataEntry) {
                widgetDetailPage.filterData = new FilterData({
                    filterMode: filterMode,
                    subFilterMode: subFilterMode,
                    columnLayoutsetting: columnLayoutsetting,
                    rowSetting: rowSetting,
                    fieldFilters: fieldFilters,
                    widgetFormType: widgetFormType,
                    orderDataEntryWidgetLayoutMode: orderDataEntryWidgetLayoutMode,
                    orderDataEntryProperties: orderDataEntryProperties,
                });
                // build property for order data entry summary table
                if (fieldFilters && fieldFilters.length) {
                    widgetDetailPage.properties = this.buildPropertiesForOrderDataEntryWidget(filterMode, fieldFilters);
                    widgetBox.properties = {
                        version: '1.0',
                        properties: widgetDetailPage.properties,
                    };
                }
            }
            widgets.push(widgetDetailPage);
            if (parmWidgetDetail && widgetDetail.id === parmWidgetDetail.id)
                currentFilterData = widgetDetailPage.filterData;
        }

        const observableBatch = [];
        widgets.forEach((widget: WidgetDetailPage) => {
            const rs = widgetBoxesDirty.filter((p) => p.data.id == widget.widgetDetail.id);
            if (rs.length) {
                const widgetSettingModel = new WidgetSettingModel({
                    idSettingsWidget: rs[0].data.idSettingsWidget,
                    idRepWidgetApp: rs[0].data.idRepWidgetApp,
                    widgetName: typeof rs[0].data.title == 'string' ? rs[0].data.title : '',
                    widgetType: rs[0].data.idRepWidgetType ? rs[0].data.idRepWidgetType.toString() : '',
                    objectNr: this.pageId,
                    jsonSettings: JSON.stringify(widget),
                    idSettingsGUI: this.ofModule ? this.ofModule.idSettingsGUI : null
                });

                if (rs[0].isDeleted) {
                    observableBatch.push(this.widgetTemplateSettingService.deleteWidgetSetting(widgetSettingModel));
                } else {
                    if (widgetSettingModel.idSettingsWidget) {
                        observableBatch.push(this.widgetTemplateSettingService.updateWidgetSetting(widgetSettingModel));
                    } else {
                        observableBatch.push(this.widgetTemplateSettingService.createWidgetSetting(widgetSettingModel));
                    }
                }
            }
        });

        const size = this.ngGrid.getDesignSizeUpdatePercentage();

        const data: WidgetDetailPageSetting = new WidgetDetailPageSetting({
            gridConfig: {
                designSizeDiffPercentage: size,
            },
        });

        observableBatch.push(this.pageSettingService.savePageSetting(this.createPageSettingModel(data)));

        forkJoin(observableBatch)
            .pipe(
                finalize(() => {
                    this.isWidgetDesignDirty = false;
                    // this.updatePageSetting();
                    this.isReloadAll = true;
                    this.updatePageSetting((pageSetting) => {
                        this.updateWidgetContent(pageSetting, true, true);
                        this.isReloadAll = false;
                    });
                    // this.reloadAllWidgetsByPageId();
                }),
            )
            .subscribe((results: Array<any>) => {
                this.appErrorHandler.executeAction(() => {
                    for (let i = 0; i < results.length - 1; i++) {
                        widgets[i].widgetDetail.idSettingsWidget = results[i].returnValue;
                        const box = this.widgetBoxes.filter((p) => p.data.id === widgets[i].widgetDetail.id);
                        if (box.length) {
                            box[0].data.idSettingsWidget = results[i].returnValue;
                            box[0].isDirty = false;
                            this.getWidgetTitleTranslation(box[0].data, true);
                        }
                    }

                    // Remove deleted widget from widgetBoxes & setting after successfully submit.
                    this.widgetBoxes = this.widgetBoxes.filter((p) => !p.isDeleted);
                    this.dispatchActionSetWidgetboxesInfo();

                    const pageSettingRs: any = results[results.length - 1];
                    this.idSettingsPage = pageSettingRs.returnValue;

                    if (
                        parmWidgetDetail &&
                        (parmWidgetDetail.idRepWidgetType === WidgetType.FieldSet ||
                            parmWidgetDetail.idRepWidgetType === WidgetType.Combination ||
                            parmWidgetDetail.idRepWidgetType === WidgetType.DataGrid ||
                            parmWidgetDetail.idRepWidgetType === WidgetType.EditableGrid ||
                            parmWidgetDetail.idRepWidgetType === WidgetType.EditableTable ||
                            parmWidgetDetail.idRepWidgetType === WidgetType.TableWithFilter)
                    ) {
                        const filterBox = this.widgetBoxes.find((item) => item.data.id === parmWidgetDetail.id);
                        if (filterBox) filterBox.filterData = currentFilterData;
                    }

                    this.toasterService.pop('success', 'Success', 'Widget saved successfully');

                    if (isClosePropertyPanel !== false) {
                        this.store.dispatch(this.propertyPanelActions.togglePanel(this.ofModule, false));
                        this.store.dispatch(this.layoutInfoActions.setRightPropertyPanelWidth('0', this.ofModule));
                    }
                    this.store.dispatch(this.propertyPanelActions.requestClearPropertiesSuccess(this.ofModule));
                });
            });
    }

    private buildPropertiesForOrderDataEntryWidget(filterMode, fieldFilters): any {
        return [
            new WidgetPropertyModel({
                children: [
                    {
                        id: 'ShowData',
                        name: 'ShowData',
                        value: isNil(filterMode) ? 1 : filterMode,
                        disabled: false,
                        collapsed: true,
                        dataType: 'Object',
                        options: [
                            {
                                key: 1,
                                value: 'Show All',
                            },
                            {
                                key: 2,
                                value: 'Only has data',
                            },
                            {
                                key: 3,
                                value: 'Only empty data',
                            },
                        ],
                        children: [],
                    },
                ],
                dataType: 'MultiSelect',
                dirty: false,
                disabled: false,
                id: 'DisplayColumn',
                name: 'DisplayColumn',
                options: fieldFilters.map((x) => {
                    return {
                        isEditable: x.isEditable,
                        isHidden: x.isHidden,
                        key: x.fieldName,
                        selected: x.selected,
                        value: x.fieldDisplayName,
                    };
                }),
                value: null,
            }),
        ];
    }

    private createPageSettingModel(data: any): PageSetting {
        let pageSetting: PageSetting;
        pageSetting = new PageSetting({
            idSettingsPage: this.idSettingsPage,
            objectNr: this.pageId,
            isActive: 'true',
            jsonSettings: JSON.stringify(data),
            widgets: [],
            idSettingsGUI: this.ofModule ? this.ofModule.idSettingsGUI : null
        });
        return pageSetting;
    }

    private _generateDefaultItemConfig(): NgGridItemConfig {
        return {
            dragHandle: '.handle',
            col: 1,
            row: 1,
        };
    }

    private hasChanges(changes) {
        return changes.hasOwnProperty('currentValue') && changes.hasOwnProperty('previousValue');
    }

    public onRowTableClick($event: any) {
        const cellInfos = $event.cellInfos;
        const widgetDetail = $event.widgetDetail;

        const rowData: RowData = {
            data: cellInfos,
            widgetDetail: widgetDetail,
        };
        this.store.dispatch(this.widgetDetailActions.loadWidgetTypeDetail(rowData, this.ofModule));

        if (this.ofModule && this.ofModule.idSettingsGUI == MenuModuleId.warehouseMovement) {
            let warehouseId = cellInfos.find((c) => c.key == upperFirst(this.modulePrimaryKey));
            if (warehouseId && warehouseId.value) {
                this.store.dispatch(this.tabSummaryActions.requestUpdateTabHeader(warehouseId.value, this.ofModule));
            }
        }
        this.storeTableCurrentRowData(cellInfos, widgetDetail.idRepWidgetApp);

        // Set data for Campaign Media T2 form
        if (!Uti.checkKeynameExistInArray(cellInfos, 'key', 'IdSalesCampaignWizardItems')) return;
        this.store.dispatch(this.widgetDetailActions.loadWidgetTypeDetailForCampaignMedia(rowData, this.ofModule));
    }

    private storeTableCurrentRowData(rowData: any, widgetDetailId: any) {
        this.store.dispatch(
            this.widgetDetailActions.loadWidgetTableDataRows(
                {
                    rowData: rowData,
                    widgetDetailId: widgetDetailId,
                },
                this.ofModule,
            ),
        );
    }

    onChangeFieldFilter($event: any) {
        const box = this.widgetBoxes.filter((p) => p.data.id === $event.widgetDetail.id);
        if (box.length) {
            box[0].isDirty = true;
        }
        this.saveWidgetPage($event.widgetDetail, $event.isClosedPropertyPanel);
        this.onCancelEditingWidget($event.widgetDetail);
    }

    onEditingWidget(widgetDetail: WidgetDetail, isOrderDataEntry?: boolean) {
        // console.log('onEditingWidget');
        // Use LightWidgetDetail to avoid unnescessary param that causing huge memmory in store.
        const editingWidgetDettail: LightWidgetDetail = new LightWidgetDetail(widgetDetail);
        let tabID = this.selectedTabHeader ? this.selectedTabHeader.tabSummaryInfor.tabID : this.tabID;
        const editingWidget: EditingWidget = {
            widgetDetail: editingWidgetDettail,
            pageId: this.pageId,
            selectedEntity: this.selectedEntity,
            tabId: tabID,
        };
        if (widgetDetail['gridSelectedRow'] && widgetDetail['gridSelectedRow'].length)
            widgetDetail['dataChanged'] = [...widgetDetail['gridSelectedRow']];

        this.dispatchActionSetWidgetboxesInfo(widgetDetail);
        this.store.dispatch(
            this.widgetDetailActions.addWidgetEditing(
                editingWidget,
                isOrderDataEntry ? ModuleList.OrderDataEntry : this.ofModule,
            ),
        );
    }

    onCancelEditingWidget(widgetDetail: WidgetDetail) {
        // Use LightWidgetDetail to avoid unnescessary param that causing huge memmory in store.
        const cancelEditingWidgetDettail: LightWidgetDetail = new LightWidgetDetail(widgetDetail);
        const editingWidget: EditingWidget = {
            widgetDetail: cancelEditingWidgetDettail,
            pageId: this.pageId,
        };
        this.store.dispatch(this.widgetDetailActions.cancelWidgetEditing(editingWidget, this.ofModule));
    }

    onUpdateTitle(widgetDetail: WidgetDetail) {
        this.widgetUtils.updateWidgetTitleDataTypeValues(this.ofModule.moduleNameTrim, widgetDetail);
        const box = this.widgetBoxes.filter((p) => p.data.id === widgetDetail.id);
        if (box.length) {
            box[0].isDirty = true;
        }
        this.saveWidgetPage();
    }

    /**
     * onSaveSuccessWidget
     * @param widgetDetail
     */
    onSaveSuccessWidget(widgetDetail: WidgetDetail, widgetEditDialog) {
        let updateInfo = null;
        if (widgetDetail.idRepWidgetType === WidgetType.FieldSet) {
            updateInfo = this.widgetUtils.getKeyValueListFromFieldSetWidget(widgetDetail);
        } else if (widgetDetail.idRepWidgetType === WidgetType.Translation) {
            this.saveWidgetPage();
            this.onCancelEditingWidget(widgetDetail);
        }

        // Use LightWidgetDetail to avoid unnescessary param that causing huge memmory in store.
        const updatedWidgetDettail: LightWidgetDetail = new LightWidgetDetail(widgetDetail);

        const widgetDataUpdated: WidgetDataUpdated = {
            widgetDetail: updatedWidgetDettail,
            isSelfUpdated: true,
            isReloadForParent: this.widgetUtils.isReloadForParentAfterUpdating(widgetDetail),
            updateInfo: updateInfo,
        };
        this.toasterService.pop('success', 'Success', 'Widget saved successfully');
        // if (!widgetEditDialog) {
        //     this.store.dispatch(this.widgetDetailActions.syncUpdateDataWidget(widgetDataUpdated, this.ofModule));
        // }
        this.store.dispatch(this.widgetDetailActions.syncUpdateDataWidget(widgetDataUpdated, this.ofModule));
        this.store.dispatch(this.widgetDetailActions.clearRequestSave(this.ofModule));
    }

    saveAllWidget() {
        if (this.widgetModuleComponents) {
            this.widgetModuleComponents.forEach((widgetModuleComponent) => {
                if (widgetModuleComponent.data) {
                    // If Edit status, then save.
                    if (widgetModuleComponent.isWidgetDataEdited || widgetModuleComponent.isTableEdited) {
                        let savingWidgetType: SavingWidgetType = null;
                        switch (widgetModuleComponent.data.idRepWidgetType) {
                            case WidgetType.FieldSet:
                                savingWidgetType = SavingWidgetType.Form;
                                break;

                            case WidgetType.EditableGrid:
                            case WidgetType.EditableTable:
                                savingWidgetType = SavingWidgetType.EditableTable;
                                break;

                            case WidgetType.Combination:
                                savingWidgetType = SavingWidgetType.Combination;
                                break;

                            case WidgetType.CombinationCreditCard:
                                savingWidgetType = SavingWidgetType.CombinationCreditCard;
                                break;

                            case WidgetType.Country:
                                savingWidgetType = SavingWidgetType.Country;
                                break;

                            case WidgetType.FileExplorer:
                            case WidgetType.ToolFileTemplate:
                                savingWidgetType = SavingWidgetType.FileExplorer;
                                break;

                            case WidgetType.FileExplorerWithLabel:
                                savingWidgetType = SavingWidgetType.FileExplorerWithLabel;
                                break;

                            case WidgetType.FileTemplate:
                                savingWidgetType = SavingWidgetType.FileTemplate;
                                break;

                            case WidgetType.TreeView:
                                savingWidgetType = SavingWidgetType.TreeView;
                                break;
                        }
                        widgetModuleComponent.saveWidget(savingWidgetType);
                    } else {
                        widgetModuleComponent.resetWidget();
                    }
                }
            });
        }
    }

    public onEditWidgetInPopupHandler(eventData, currentBoxData) {
        if (eventData.id === currentBoxData.id) {
            this.widgetEditInPopupId = eventData.id;
            setTimeout(() => {
                if (this.widgetEditDialogs && this.widgetEditDialogs.length)
                    this.widgetEditDialogs.forEach((widgetEditDialog) => {
                        if (widgetEditDialog && widgetEditDialog.widgetData.id === eventData.id) {
                            widgetEditDialog.showDialog = true;

                            if (
                                widgetEditDialog.widgetData.data.idRepWidgetType == WidgetType.DataGrid ||
                                widgetEditDialog.widgetData.data.idRepWidgetType == WidgetType.EditableGrid ||
                                widgetEditDialog.widgetData.data.idRepWidgetType == WidgetType.EditableTable ||
                                widgetEditDialog.widgetData.data.idRepWidgetType == WidgetType.Combination ||
                                widgetEditDialog.widgetData.data.idRepWidgetType == WidgetType.GroupTable ||
                                widgetEditDialog.widgetData.data.idRepWidgetType == WidgetType.Translation ||
                                widgetEditDialog.widgetData.data.idRepWidgetType == WidgetType.TableWithFilter
                            ) {
                                $(document).on('keydown', this.preventTabKey.bind(this));
                            }
                        }
                    });
            }, 100);
        }
    }

    public onHideWidgetEditDialog(event) {
        this.widgetEditInPopupId = '';

        $(document).off('keydown');

        if (event && event.willReloadWidget) {
            this.onSaveSuccessWidget(event.widgetData.data, null);
            if (this.widgetEditDialogs && this.widgetEditDialogs.length)
                this.widgetEditDialogs.forEach((widgetEditDialog) => {
                    if (widgetEditDialog && widgetEditDialog.widgetData.id === event.widgetData.id) {
                        widgetEditDialog.willReloadWidget = false;
                    }
                });
        }
    }

    private preventTabKey(objEvent) {
        if (objEvent.keyCode == 9) {
            //tab pressed
            objEvent.preventDefault(); // stops its action
        }
    }

    onClickOutsideWidget($event) {
        const index = findIndex(this.widgetArray, { widgetApp: $event.widgetApp, id: $event.id });
        if (index >= 0) {
            if ($event.isActive) {
                if (this.isExpandedPropertyPanel && !this.widgetArray[index].isActive) {
                    this.widgetModuleComponents.forEach((item) => {
                        if (item.data.idRepWidgetApp === $event.widgetApp && item.data.id === $event.id) {
                            this.store.dispatch(this.propertyPanelActions.clearProperties(this.ofModule));
                            item.onPropertiesItemClickHandler(true);
                        }
                    });
                }
            }
            this.widgetArray[index] = $event;
        } else {
            this.widgetArray.push($event);
        }
    }

    onOpenPropertyPanel($event) {
        this.isExpandedPropertyPanel = $event;
    }

    public onLinkingWidgetClicked(widgetDetail: WidgetDetail) {
        this.displayConnectedWidgetDialog = this.detectListenKeyAfterDrag(widgetDetail);
        // this.reloadWidgetDetails([widgetDetail]);
    }

    public reloadWidgetsHandler(widgetDatas: Array<WidgetDetail>) {
        this.reloadWidgetDetails(widgetDatas);
    }

    private setActivatedForWidgetModuleInfo(status: boolean) {
        if (!this.widgetModuleComponents || !this.widgetModuleComponents.length) return;
        this.widgetModuleComponents.forEach((widgetModuleComponent) => {
            widgetModuleComponent.setActivatedForThisComponent(status);
        });
    }

    //#region Maximize Widget
    private currentMaximizeWidgetData: any = {
        boxDataId: null,
        isMaximizedWidget: false
    }

    public maximizeWidget($event, currentBoxData) {
        const eventData = $event.data;
        if (eventData.id === currentBoxData.id) {
            currentBoxData.isMaximizedWidget = $event.isMaximized;
            this.currentMaximizeWidgetData = {
                boxDataId: currentBoxData.id,
                isMaximizedWidget: currentBoxData.isMaximizedWidget
            };
            this.setMaximizeWidget($event.isMaximized);
        }
    }

    public setMaximizeWidget(isMaximized) {
        if (isMaximized) {
            $('gs-main .faked-heading, gs-main .global-search').addClass('gs-split-area-maximize');

            let $curentBox = $(this.elementRef.nativeElement).closest('as-split-area.split-area-content:not(.xn__tab-content__split)');
            if (!$curentBox.length) return;

            //Hide all as-split-area
            $(this.elementRef.nativeElement)
                .closest('xn-tab-content')
                .find('.tab-pane.active as-split-area.split-area-content')
                .addClass('split-area-hide');

            //Show current split-area
            $curentBox
                .removeClass('split-area-hide')
                .addClass('split-area-maximize');

            //Show all parents of current
            const $parents = $curentBox.parents('as-split-area.split-area-content:not(.xn__tab-content__split)');
            if ($parents.length) {
                $parents.removeClass('split-area-hide').addClass('split-area-maximize');
                //Hide all as-split-gutter of all parents
                $parents.siblings('.as-split-gutter').addClass('split-gutter-hide');
            }

            //Hide all as-split-gutter of current
            $curentBox.siblings('.as-split-gutter').addClass('split-gutter-hide');
        }
        else {
            this.resetMaximizeWidget();
        }
    }

    private resetMaximizeWidget() {
        //Restore to original state
        $('as-split-area.split-area-content').removeClass('split-area-maximize split-area-hide');
        $('gs-main .faked-heading, gs-main .global-search').removeClass('gs-split-area-maximize');
        $('.as-split-gutter.split-gutter-hide').removeClass('split-gutter-hide');
    }

    private restoreMaximizeWidgetTimeout;
    private restoreMaximizeWidget(isMaximized?: boolean, forceMaximize?: boolean) {
        if (!this.currentMaximizeWidgetData.boxDataId || !this.isCurrentTab()) return;

        var needToSetMaximizeWidget = false;
        for (let i = 0; i < this.widgetBoxes.length; i++) {
            const widgetBox: WidgetBox = this.widgetBoxes[i];
            if (widgetBox.data.id == this.currentMaximizeWidgetData.boxDataId && (!widgetBox.data['isMaximizedWidget'] || forceMaximize)) {
                //if isMaximized is null -> keep the previous state
                if (isMaximized == undefined) {
                    isMaximized = this.currentMaximizeWidgetData.isMaximizedWidget;
                }
                widgetBox.data['isMaximizedWidget'] = isMaximized;
                needToSetMaximizeWidget = true;
                break;
            }
        }//for

        if (needToSetMaximizeWidget || forceMaximize) {
            clearTimeout(this.restoreMaximizeWidgetTimeout);
            this.restoreMaximizeWidgetTimeout = null;
            this.restoreMaximizeWidgetTimeout = setTimeout(() => {
                //console.log('restoreMaximizeWidget: ' + new Date().getTime());
                this.setMaximizeWidget(needToSetMaximizeWidget ? isMaximized : false);
            }, 100);
        }
    }

    private isCurrentTab() {
        return this.selectedTabHeader && this.selectedTabHeader.tabSummaryInfor && this.selectedTabHeader.tabSummaryInfor.tabID == this.tabID;
    }
    //#endregion
}
