import {
    Component, OnInit, OnDestroy, AfterViewInit,
    ViewChild, ElementRef, ChangeDetectorRef, HostListener
} from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { Router } from '@angular/router';
import { SlimLoadingBarService } from 'ng2-slim-loading-bar';
import isNil from 'lodash-es/isNil';
import isEmpty from 'lodash-es/isEmpty';

import {
    ParkedItemModel,
    TabSummaryModel,
    ModuleSettingModel,
    GlobalSettingModel,
    SimpleTabModel,
    ReturnRefundInvoiceNumberModel,

    WidgetPropertyModel,

    FormOutputModel
} from '@app/models';
import { RowData } from '@app/state-management/store/reducer/widget-content-detail';
import {
    TabService,
    AppErrorHandler,
    ModalService,
    GlobalSettingService,
    PropertyPanelService,
    BaseService,
    AccessRightsService
} from '@app/services';
import { Uti } from '@app/utilities/uti';
import { String } from '@app/utilities/string';
import { ToasterService } from 'angular2-toaster/angular2-toaster';
import {
    Store,
    ReducerManagerDispatcher
} from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import { EditingWidget } from '@app/state-management/store/reducer/widget-content-detail';
import { SubLayoutInfoState } from '@app/state-management/store/reducer/layout-info';
import { Observable, Subscription } from 'rxjs';
import {
    XnCommonActions,
    TabSummaryActions,
    ParkedItemActions,
    ModuleActions,
    ModuleSettingActions,
    ProcessDataActions,
    WidgetDetailActions,
    TabButtonActions,
    PropertyPanelActions,
    CustomAction,
    DocumentActions,
} from '@app/state-management/store/actions';
import { WidgetDataUpdated } from '@app/state-management/store/reducer/widget-content-detail';
import {
    GlobalSettingConstant,
    RequestSavingMode,
    TabButtonActionConst,
    MenuModuleId,
    Configuration,
    AccessRightTypeEnum
} from '@app/app.constants';
import * as uti from '@app/utilities';
import * as parkedItemReducer from '@app/state-management/store/reducer/parked-item';
import * as tabSummaryReducer from '@app/state-management/store/reducer/tab-summary';
import * as processDataReducer from '@app/state-management/store/reducer/process-data';
import * as moduleSettingReducer from '@app/state-management/store/reducer/module-setting';
import * as tabButtonReducer from '@app/state-management/store/reducer/tab-button';
import * as layoutInfoReducer from '@app/state-management/store/reducer/layout-info';
import { BaseComponent, ModuleList } from '@app/pages/private/base';
import * as widgetContentReducer from '@app/state-management/store/reducer/widget-content-detail';
import { MatButton } from '../../xn-control/light-material-ui/button';
import * as documentReducer from '@app/state-management/store/reducer/document';
import { filter, map } from 'rxjs/operators';

@Component({
    selector: 'xn-tab-button',
    styleUrls: ['./xn-tab-button.component.scss'],
    templateUrl: './xn-tab-button.component.html',
    animations: [
        trigger(
            'enterAnimation', [
                transition(':enter', [
                    style({ transform: 'translateY(-100%)', opacity: 0 }),
                    animate('100ms', style({ transform: 'translateY(0)', opacity: 1 }))
                ]),
                transition(':leave', [
                    style({ transform: 'translateY(0)', opacity: 1 }),
                    animate('100ms', style({ transform: 'translateY(-100%)', opacity: 0 }))
                ])
            ]
        )
    ]
})
export class XnTabButtonComponent extends BaseComponent implements OnInit, OnDestroy, AfterViewInit {
    public MenuModuleId = MenuModuleId;
    private isViewModeStateSubscription: Subscription;
    private parkedItemsStateSubscription: Subscription;
    private selectedEntityStateSubscription: Subscription;
    private tabsStateSubscription: Subscription;
    private selectedTabStateSubscription: Subscription;
    private selectedODETabStateSubscription: Subscription;
    private selectedSimpleTabStateSubscription: Subscription;
    private selectedSubTabStateSubscription: Subscription;
    private editingWidgetsStateSubscription: Subscription;
    private formDirtyStateSubscription: Subscription;
    private toolbarSettingStateSubscription: Subscription;
    private moduleSettingStateSubscription: Subscription;
    private layoutInfoStateSubscription: Subscription;
    private currentActionStateSubscription: Subscription;
    private saveMainTabResultStateSubscription: Subscription;
    private saveOtherTabResultStateSubscription: Subscription;
    private modulePrimaryKeyStateSubscription: Subscription;
    private widgetListenKeyStateSubscription: Subscription;
    private saveOnlyMainTabResultStateSubscription: Subscription;
    private saveOnlyOtherTabResultStateSubscription: Subscription;
    private widgetDataUpdatedStateSubscription: Subscription;
    private requestSaveStateSubscription: Subscription;
    private requestSaveAllWidgetsStateSubscription: Subscription;
    private requestSaveAndCloseStateSubscription: Subscription;
    private requestSaveAndNewStateSubscription: Subscription;
    private requestSaveAndNextStateSubscription: Subscription;
    private tabHeaderHasScrollerStateSubscription: Subscription;
    private returnAndRefundInvoiceNumberDataStateSubscription: Subscription;
    private isHiddenParkedItemStateSubscription: Subscription;
    private requestChangeParkedItemStateSubscription: Subscription;
    private requestChangeTabStateSubscription: Subscription;
    private requestRemoveTabStateSubscription: Subscription;
    private requestCreateNewFromModuleDropdownStateSubscription: Subscription;
    private requestCreateNewMainTabStateSubscription: Subscription;
    private requestCancelStateSubscription: Subscription;
    private requestEditStateSubscription: Subscription;
    private requestNewStateSubscription: Subscription;
    private requestNewInEditStateSubscription: Subscription;
    private dblClickTabHeaderStateSubscription: Subscription;
    private requestChangeModuleStateSubscription: Subscription;
    private requestChangeSubModuleStateSubscription: Subscription;
    private requestClearPropertiesSuccessStateSubscription: Subscription;
    private requestGoToFirstStepStateSubscription: Subscription;
    private requestGoToSecondStepStateSubscription: Subscription;
    private requestChangeBusinessCostRowStateSubscription: Subscription;
    private requestChangeSearchResultStateSubscription: Subscription;
    private saveOrderDataEntryResultStateSubscription: Subscription;
    private selectedWidgetRowDataStateSubscription: Subscription;
    private requestSaveOnlyWithoutControllingTabStateSubscription: Subscription;
    private showSendToAdminCompleteSubscription: Subscription;
    private formEditModeStateSubscription: Subscription;
    private scanningStatusStateSubscription: Subscription;

    public showTabButton: Observable<boolean>;
    private parkedItemsState: Observable<any>;
    private selectedEntityState: Observable<any>;
    private selectedTabState: Observable<TabSummaryModel>;
    private selectedODETabState: Observable<any>;
    private selectedSimpleTabState: Observable<SimpleTabModel>;
    private selectedSubTabState: Observable<any>;
    public isViewModeState: Observable<boolean>;
    private editingWidgetsState: Observable<Array<EditingWidget>>;
    private formDirtyState: Observable<boolean>;
    private toolbarSettingState: Observable<any>;
    private moduleSettingState: Observable<ModuleSettingModel[]>;
    private layoutInfoState: Observable<SubLayoutInfoState>;
    private currentActionState: Observable<string>;
    private saveMainTabResultState: Observable<any>;
    private saveOtherTabResultState: Observable<any>;
    private modulePrimaryKeyState: Observable<string>;
    private widgetListenKeyState: Observable<string>;
    private saveOnlyMainTabResultState: Observable<any>;
    private saveOnlyOtherTabResultState: Observable<any>;
    private widgetDataUpdatedState: Observable<WidgetDataUpdated>;
    private returnAndRefundInvoiceNumberDataState: Observable<any>;
    private isHiddenParkedItemState: Observable<boolean>;
    private selectedWidgetRowDataState: Observable<RowData>;
    public tabHeaderHasScrollerState: Observable<any>;
    private formEditModeState: Observable<boolean>;
    private scanningStatusState: Observable<any>;

    private parkedItems: ParkedItemModel[] = [];
    private selectedEntity: any;
    private isViewMode: boolean;
    private selectedTab: TabSummaryModel;
    private selectedODETab: any;
    private selectedSimpleTab: SimpleTabModel;
    private selectedSubTab: any;
    private formDirty: boolean;
    public editingWidgets: Array<EditingWidget>;
    public toolbarSetting: any;
    public isFormEditMode = false;
    public parentStyle: any;
    private currentAction: string;
    private modulePrimaryKey = '';
    private widgetListenKey = '';
    private newMainTabResultId: any;
    private newOtherTabResultId: any;
    private editMainTabResultId: any;
    private editOtherTabItemId: any;
    private requestAdd = false;
    private requestEdit = false;
    private requestClone = false;
    private requestClose = false;
    public isTabCollapsed = false;
    private showUnsavedDialog = true;
    private collapseStateSettings: any;
    private globalSettingName = '';
    public returnAndRefundInvoiceNumberData: ReturnRefundInvoiceNumberModel;
    private isHiddenParkedItem = false;
    private isEditAllWidgetMode = false;
    public isSelectionProject = false;
    public TAB_BUTTON_STATE = {
        save: {
            disabled: false
        },
        saveAndNew: {
            disabled: false
        },
        saveAndClose: {
            disabled: false
        },
        saveAndNext: {
            disabled: false
        }
    }
    private selectedWidgetRowData: RowData;
    private saveButtonClass = {
        dataDirty: false
    }
    public isSendToAdminLoading = false;
    public idScansContainerItems: any;
    public moduleAccessRight: any;
    public tabAccessRight: any;
    public docMButtonsAccessRight: { save: boolean, skip: boolean } = {
        save: true,
        skip: true
    };
    public ordersButtonsAccessRight: { pdf: boolean, tracking: boolean, returnRefund: boolean } = {
        pdf: false,
        tracking: false,
        returnRefund: false,
    };
    public returnRefundButtonsAccessRight: { confirm: boolean, newInvoice: boolean } = {
        confirm: false,
        newInvoice: false,
    };
    public sysManageWidgetTabButtonsAccessRight: { clone: boolean } = {
        clone: false
    };

    @ViewChild('btnSaveAllWidgetCtrl') btnSaveAllWidgetCtrl: MatButton;
    @ViewChild('btnSaveOnlyCtrl') btnSaveOnlyCtrl: MatButton;

    @HostListener('document:keyup.out-zone', ['$event'])
    onKeyUp(event) {
        const e = <KeyboardEvent>event;
        // Pagedown key
        if (e.keyCode == 34) {
            if (this.btnSaveAllWidgetCtrl && !this.btnSaveAllWidgetCtrl['disabled']) {
                this.btnSaveAllWidgetCtrl['_elementRef'].nativeElement.click();
            }
            else if (this.btnSaveOnlyCtrl && !this.btnSaveOnlyCtrl['disabled']) {
                this.btnSaveOnlyCtrl['_elementRef'].nativeElement.click();
            }
        }
    }

    constructor(
        protected router: Router,
        private tabService: TabService,
        private store: Store<AppState>,
        private tabSummaryActions: TabSummaryActions,
        private parkedItemActions: ParkedItemActions,
        private moduleActions: ModuleActions,
        private moduleSettingActions: ModuleSettingActions,
        private processDataActions: ProcessDataActions,
        private slimLoadingBarService: SlimLoadingBarService,
        private widgetDetailActions: WidgetDetailActions,
        private xnCommonActions: XnCommonActions,
        private appErrorHandler: AppErrorHandler,
        private modalService: ModalService,
        private tabButtonActions: TabButtonActions,
        private toasterService: ToasterService,
        private propertyPanelActions: PropertyPanelActions,
        private globalSettingService: GlobalSettingService,
        private globalSettingConstant: GlobalSettingConstant,
        private dispatcher: ReducerManagerDispatcher,
        private propertyPanelService: PropertyPanelService,
        private changeDetectorRef: ChangeDetectorRef,
        private elmRef: ElementRef,
        private accessRightService: AccessRightsService,
        private documentAction: DocumentActions
    ) {
        super(router);

        this.parkedItemsState = store.select(state => parkedItemReducer.getParkedItemState(state, this.ofModule.moduleNameTrim).parkedItems);
        this.selectedEntityState = store.select(state => processDataReducer.getProcessDataState(state, this.ofModule.moduleNameTrim).selectedEntity);
        this.showTabButton = store.select(state => tabSummaryReducer.getTabSummaryState(state, this.ofModule.moduleNameTrim).showTabButton);
        this.selectedTabState = store.select(state => tabSummaryReducer.getTabSummaryState(state, this.ofModule.moduleNameTrim).selectedTab);
        this.selectedODETabState = store.select(state => tabSummaryReducer.getTabSummaryState(state, this.ofModule.moduleNameTrim).selectedODETab);
        this.selectedSimpleTabState = store.select(state => tabSummaryReducer.getTabSummaryState(state, this.ofModule.moduleNameTrim).selectedSimpleTab);
        this.selectedSubTabState = store.select(state => tabSummaryReducer.getTabSummaryState(state, this.ofModule.moduleNameTrim).selectedSubTab);
        this.isViewModeState = store.select(state => processDataReducer.getProcessDataState(state, this.ofModule.moduleNameTrim).isViewMode);
        this.editingWidgetsState = store.select(state => widgetContentReducer.getWidgetContentDetailState(state, this.ofModule.moduleNameTrim).editingWidgets);
        this.formDirtyState = store.select(state => processDataReducer.getProcessDataState(state, this.ofModule.moduleNameTrim).formDirty);
        this.moduleSettingState = store.select(state => moduleSettingReducer.getModuleSettingState(state, this.ofModule.moduleNameTrim).moduleSetting);
        this.toolbarSettingState = store.select(state => moduleSettingReducer.getModuleSettingState(state, this.ofModule.moduleNameTrim).toolbarSetting);
        this.layoutInfoState = store.select(state => layoutInfoReducer.getLayoutInfoState(state, this.ofModule.moduleNameTrim));
        this.currentActionState = store.select(state => tabButtonReducer.getTabButtonState(state, this.ofModule.moduleNameTrim).currentAction);
        this.saveMainTabResultState = store.select(state => processDataReducer.getProcessDataState(state, this.ofModule.moduleNameTrim).saveMainTabResult);
        this.saveOtherTabResultState = store.select(state => processDataReducer.getProcessDataState(state, this.ofModule.moduleNameTrim).saveOtherTabResult);
        this.modulePrimaryKeyState = store.select(state => moduleSettingReducer.getModuleSettingState(state, this.ofModule.moduleNameTrim).modulePrimaryKey);
        this.widgetListenKeyState = store.select(state => moduleSettingReducer.getModuleSettingState(state, this.ofModule.moduleNameTrim).widgetListenKey);
        this.saveOnlyMainTabResultState = store.select(state => processDataReducer.getProcessDataState(state, this.ofModule.moduleNameTrim).saveOnlyMainTabResult);
        this.saveOnlyOtherTabResultState = store.select(state => processDataReducer.getProcessDataState(state, this.ofModule.moduleNameTrim).saveOnlyOtherTabResult);
        this.widgetDataUpdatedState = store.select(state => widgetContentReducer.getWidgetContentDetailState(state, this.ofModule.moduleNameTrim).widgetDataUpdated);
        this.tabHeaderHasScrollerState = store.select(state => tabButtonReducer.getTabButtonState(state, this.ofModule.moduleNameTrim).tabHeaderHasScroller);
        this.isHiddenParkedItemState = store.select(state => moduleSettingReducer.getModuleSettingState(state, this.ofModule.moduleNameTrim).isHiddenParkedItem);
        this.selectedWidgetRowDataState = this.store.select(state => widgetContentReducer.getWidgetContentDetailState(state, this.ofModule.moduleNameTrim).rowData);
        this.formEditModeState = this.store.select(state => processDataReducer.getProcessDataState(state, this.ofModule.moduleNameTrim).formEditMode);
        this.scanningStatusState = this.store.select(state => documentReducer.getDocumentState(state, this.ofModule.moduleNameTrim).scanningStatusData);

        this.slimLoadingBarService.interval = 50;
        this.isSelectionProject = Configuration.PublicSettings.isSelectionProject;
    }

    ngOnInit() {
        this.getModule();
        this.getTabHeaderCollapseStateFromGlobalSetting();
        this.getUnsavedDialogSettingFromGlobalSetting();

        this.subscribeParkedItemsState();
        this.subscribeSelectedEntityState();
        this.subscribeSelectedTabState();
        this.subscribeScansContainerItems();
        this.subscribeSelectedSimpleTabState();
        this.subscribeSelectedSubTabState();
        this.subcribeIsViewModeState();
        this.subscribeWidgetDetailState();
        this.subcribeFormDirtyState();
        this.subcribeModuleSettingState();
        this.subcribeToolbarSettingState();
        this.subscribeLayoutInfoModel();
        this.subscribeCurrentActionState();
        this.subcribeSaveMainTabResultState();
        this.subcribeSaveOtherTabResultState();
        this.subcribeModulePrimaryKeyState();
        this.subcribeWidgetListenKeyState();
        this.subcribeRequestChangeParkedItemState();
        this.subcribeRequestChangeTabState();
        this.subcribeRequestRemoveTabState();
        this.subcribeRequestCreateNewFromModuleDropdownState();
        this.subcribeRequestCreateNewMainTabState();
        this.subcribeRequestChangeModuleState();
        this.subcribeRequestChangeSubModuleState();
        this.subcribeSaveOnlyMainTabResultState();
        this.subcribeSaveOnlyOtherTabResultState();
        this.subscribeWidgetDataUpdatedState();
        this.subscribeRequestClearPropertiesSuccessState();
        this.subscribeRequestGoToFirstStepState();
        this.subscribeRequestGoToSecondStepState();
        this.subscribeRequestChangeBusinessCostRowState();
        this.subcribeRequestCancelState();
        this.subcribeRequestEditState();
        this.subcribeRequestNewState();
        this.subcribeRequestCloneState();
        this.subcribeDblClickTabHeaderState();
        this.subcribeIsHiddenParkedItemState();
        this.subcribeRequestChangeSearchResultState();
        this.subscribeSelectedWidgetRowDataState();
        this.subscribeFormEditModeState();
        this.subscribeShowSendToAdminCompleteState();

        BaseService.toggleSlimLoadingBar$.subscribe(state => {
            this.appErrorHandler.executeAction(() => {
                if (state) {
                    if (state.status === 'START') {
                        this.slimLoadingBarService.start();
                    } else if (state.status === 'COMPLETE') {
                        this.slimLoadingBarService.complete();
                    }
                }
            });
        });
    }

    ngAfterViewInit() {
        this.moduleAccessRight = this.accessRightService.getAccessRight(AccessRightTypeEnum.Module, { idSettingsGUI: this.ofModule.idSettingsGUI });
    }

    ngOnDestroy() {
        Uti.unsubscribe(this);
    }

    private subscribeParkedItemsState() {
        this.parkedItemsStateSubscription = this.parkedItemsState.subscribe((parkedItemsState: any) => {
            this.appErrorHandler.executeAction(() => {
                if (parkedItemsState) {
                    this.parkedItems = parkedItemsState;

                    if (this.newMainTabResultId || this.newOtherTabResultId)
                    {
                        this.processNewMainTabSuccess(parkedItemsState);
                    }
                }
            });
        });
    }

    private subscribeSelectedEntityState() {
        this.selectedEntityStateSubscription = this.selectedEntityState.subscribe((selectedEntityState: any) => {
            this.appErrorHandler.executeAction(() => {
                this.selectedEntity = selectedEntityState;
            });
        });
    }

    private subscribeSelectedTabState() {
        this.selectedTabStateSubscription = this.selectedTabState.subscribe((selectedTabState: TabSummaryModel) => {
            this.appErrorHandler.executeAction(() => {
                this.selectedTab = selectedTabState;

                if (this.selectedTab) {
                    this.tabAccessRight = this.accessRightService.getAccessRight(AccessRightTypeEnum.Tab, {
                        idSettingsGUIParent: this.ofModule.idSettingsGUIParent,
                        idSettingsGUI: this.ofModule.idSettingsGUI,
                        tabID: this.selectedTab.tabSummaryInfor.tabID
                    });

                    // this.getTabButtonAccessRight();
                } else {
                    this.tabAccessRight = null;
                }
            });
        });
    }    

    private subscribeSelectedSimpleTabState() {
        this.selectedSimpleTabStateSubscription = this.selectedSimpleTabState.subscribe((selectedSimpleTabState: SimpleTabModel) => {
            this.appErrorHandler.executeAction(() => {
                this.selectedSimpleTab = selectedSimpleTabState;
            });
        });
    }

    private subscribeSelectedSubTabState() {
        this.selectedSubTabStateSubscription = this.selectedSubTabState.subscribe((selectedSubTabState: any) => {
            this.appErrorHandler.executeAction(() => {
                this.selectedSubTab = selectedSubTabState;

                if (this.selectedSubTab && this.ofModule.idSettingsGUI == MenuModuleId.businessCosts) {
                    if (this.selectedSubTab.title === 'Main') {
                        switch (this.currentAction) {
                            case TabButtonActionConst.EDIT_OTHER_TAB:
                                this.store.dispatch(this.processDataActions.turnOffFormEditMode(this.ofModule));
                                this.store.dispatch(this.processDataActions.turnOffFormCloneMode(this.ofModule));
                                this.store.dispatch(this.processDataActions.viewMode(this.ofModule));
                                setTimeout(() => {
                                    this.store.dispatch(this.tabSummaryActions.requestSelectTab('MainInfo', this.ofModule));
                                    this.edit();
                                }, 50);

                                break;
                        }
                    }
                }
            });
        });
    }

    private subcribeIsViewModeState() {
        this.isViewModeStateSubscription = this.isViewModeState.subscribe((isViewModeState: boolean) => {
            this.appErrorHandler.executeAction(() => {
                this.isViewMode = isViewModeState;
            });
        });
    }

    private subscribeWidgetDetailState() {
        this.editingWidgetsStateSubscription = this.editingWidgetsState.subscribe((editingWidgets: Array<EditingWidget>) => {
            this.appErrorHandler.executeAction(() => {
                this.editingWidgets = editingWidgets;

                if (!this.editingWidgets.length && !this.formDirty) {
                    this.store.dispatch(this.moduleActions.removeDirtyModule(this.ofModule));
                }

                this.detectDataDirty();
            });
        });
    }

    private subcribeFormDirtyState() {
        this.formDirtyStateSubscription = this.formDirtyState.subscribe((formDirtyState: boolean) => {
            this.appErrorHandler.executeAction(() => {
                this.formDirty = formDirtyState;

                if (!this.editingWidgets.length && !this.formDirty) {
                    this.store.dispatch(this.moduleActions.removeDirtyModule(this.ofModule));
                }

                this.detectDataDirty();
            });
        });
    }

    private subcribeModuleSettingState() {
        this.moduleSettingStateSubscription = this.moduleSettingState.subscribe((moduleSettingState: ModuleSettingModel[]) => {
            this.appErrorHandler.executeAction(() => {
                if (moduleSettingState && moduleSettingState.length && this.ofModule && this.ofModule.idSettingsGUI == MenuModuleId.orderDataEntry) {
                    let jsonSettings: any = {};
                    try {
                        jsonSettings = JSON.parse(moduleSettingState[0].jsonSettings);
                    } catch (e) {
                        jsonSettings = {};
                    }

                    if (!isEmpty(jsonSettings)
                        && jsonSettings.Content
                        && jsonSettings.Content.CustomTabs
                        && jsonSettings.Content.CustomTabs.length
                        && jsonSettings.Content.CustomTabs[0].Toolbar) {
                        this.store.dispatch(this.moduleSettingActions.selectToolbarSetting(jsonSettings.Content.CustomTabs[0].Toolbar, this.ofModule));
                    }
                }
            });
        });
    }

    private subcribeToolbarSettingState() {
        this.toolbarSettingStateSubscription = this.toolbarSettingState.subscribe((toolbarSettingState: any) => {
            this.appErrorHandler.executeAction(() => {
                this.toolbarSetting = toolbarSettingState;
            });
        });
    }

    private subscribeLayoutInfoModel() {
        this.layoutInfoStateSubscription = this.layoutInfoState.subscribe((layoutInfoState: SubLayoutInfoState) => {
            this.appErrorHandler.executeAction(() => {
                this.parentStyle = {
                    'min-width': `calc(100vw - ${layoutInfoState.rightMenuWidth}px)`
                };
            });
        });
    }

    private subscribeCurrentActionState() {
        this.currentActionStateSubscription = this.currentActionState.subscribe((currentActionState: string) => {
            this.appErrorHandler.executeAction(() => {
                this.currentAction = currentActionState;
            });
        });
    }

    private subcribeSaveMainTabResultState() {
        this.saveMainTabResultStateSubscription = this.saveMainTabResultState.subscribe((saveMainTabResultState: any) => {
            this.appErrorHandler.executeAction(() => {
                if (!saveMainTabResultState) {
                    return;
                }

                if (!isNil(saveMainTabResultState.returnID)) {
                    if ((typeof saveMainTabResultState.returnID == 'string' || typeof saveMainTabResultState.returnID == 'number')
                        && saveMainTabResultState.returnID) {
                        switch (this.currentAction) {
                            case TabButtonActionConst.EDIT_AND_SAVE_AND_CLOSE_MAIN_TAB:
                            case TabButtonActionConst.EDIT_AND_SAVE_AND_NEXT_MAIN_TAB:
                            case TabButtonActionConst.EDIT_AND_SAVE_ONLY_MAIN_TAB:
                            case TabButtonActionConst.SAVE_ONLY_OTHER_TAB:
                            case TabButtonActionConst.EDIT_MAIN_TAB_AND_OP_STORE_TEMPORARILY:
                            case TabButtonActionConst.EDIT_MAIN_TAB_AND_OP_SAVE_AND_RUN_AS_EMAIL:
                            case TabButtonActionConst.EDIT_MAIN_TAB_AND_OP_SAVE_AND_RUN_AS_PRINT:
                                this.editMainTabResultId = saveMainTabResultState.returnID;                                
                                this.processEditMainTabSuccess();
                                // Find updated item if exists in parkedItems
                                // If yes, then we dispatch action loadThenAddParkedItem to update the latest value
                                const editedItem = this.parkedItems.find(i => i[this.modulePrimaryKey].value == saveMainTabResultState.returnID);
                                if (editedItem) {
                                    this.store.dispatch(this.parkedItemActions.loadThenAddParkedItem(saveMainTabResultState.returnID, this.ofModule, this.modulePrimaryKey, this.widgetListenKey));
                                }
                                break;

                            default:
                                if (this.currentAction === TabButtonActionConst.EDIT_AND_SAVE_AND_CLOSE_OTHER_TAB &&
                                    (this.ofModule.idSettingsGUI == MenuModuleId.businessCosts || this.ofModule.idSettingsGUI == MenuModuleId.campaign)) {
                                    this.processNewMainTabSuccessThenBackToViewMode();
                                } else if (!this.isHiddenParkedItem) {
                                    this.newMainTabResultId = saveMainTabResultState.returnID;
                                    this.store.dispatch(this.parkedItemActions.loadThenAddParkedItem(this.newMainTabResultId, this.ofModule, this.modulePrimaryKey, this.widgetListenKey));
                                } else {
                                    this.processNewMainTabSuccessThenBackToViewMode();
                                }
                                break;
                        }

                        return;
                    }
                }

                this.saveFailed(saveMainTabResultState);
            });
        });
    }

    private subcribeSaveOtherTabResultState() {
        this.saveOtherTabResultStateSubscription = this.saveOtherTabResultState.subscribe((saveOtherTabResultState: FormOutputModel) => {
            this.appErrorHandler.executeAction(() => {
                if (!saveOtherTabResultState) {
                    return;
                }

                if (!isNil(saveOtherTabResultState.returnID)) {
                    if ((typeof saveOtherTabResultState.returnID == 'string' || typeof saveOtherTabResultState.returnID == 'number')
                        && saveOtherTabResultState.returnID) {
                        switch (this.currentAction) {
                            case TabButtonActionConst.EDIT_AND_SAVE_AND_CLOSE_OTHER_TAB:
                            case TabButtonActionConst.EDIT_OTHER_TAB:
                            case TabButtonActionConst.EDIT_AND_SAVE_ONLY_OTHER_TAB:
                            case TabButtonActionConst.EDIT_OTHER_TAB_AND_OP_STORE_TEMPORARILY:
                            case TabButtonActionConst.EDIT_OTHER_TAB_AND_OP_SAVE_AND_RUN_AS_EMAIL:
                            case TabButtonActionConst.EDIT_OTHER_TAB_AND_OP_SAVE_AND_RUN_AS_PRINT:
                                this.processEditOtherTabSuccess();
                                if (this.ofModule.idSettingsGUI == MenuModuleId.orderProcessing) {
                                    // Find updated item if exists in parkedItems
                                    // If yes, then we dispatch action loadThenAddParkedItem to update the latest value
                                    const editedItem = this.parkedItems.find(i => i[this.modulePrimaryKey].value == saveOtherTabResultState.returnID);
                                    if (editedItem) {
                                        this.store.dispatch(this.parkedItemActions.loadThenAddParkedItem(saveOtherTabResultState.returnID, this.ofModule, this.modulePrimaryKey, this.widgetListenKey));
                                    }
                                }
                                break;

                            default:
                                if (this.ofModule.idSettingsGUI == MenuModuleId.orderProcessing) {
                                    if (!this.isHiddenParkedItem) {
                                        this.store.dispatch(this.parkedItemActions.loadThenAddParkedItem(saveOtherTabResultState.returnID, this.ofModule, this.modulePrimaryKey, this.widgetListenKey));
                                    }
                                    this.newOtherTabResultId = saveOtherTabResultState.returnID;
                                }                                
                                this.processNewOtherTabSuccess();
                                break;
                        }

                        return;
                    }
                }

                this.saveFailed(saveOtherTabResultState);
            });
        });
    }

    private subcribeSaveOnlyMainTabResultState() {
        this.saveOnlyMainTabResultStateSubscription = this.saveOnlyMainTabResultState.subscribe((saveOnlyMainTabResultState: any) => {
            this.appErrorHandler.executeAction(() => {
                if (!saveOnlyMainTabResultState) {
                    return;
                }

                if (!isNil(saveOnlyMainTabResultState.returnID)) {
                    if ((typeof saveOnlyMainTabResultState.returnID == 'string' || typeof saveOnlyMainTabResultState.returnID == 'number')
                        && saveOnlyMainTabResultState.returnID) {
                        switch (this.currentAction) {
                            case TabButtonActionConst.EDIT_AND_SAVE_ONLY_MAIN_TAB:
                            case TabButtonActionConst.EDIT_MAIN_TAB_AND_GO_TO_FIRST_STEP:
                            case TabButtonActionConst.EDIT_MAIN_TAB_AND_GO_TO_SECOND_STEP:
                            case TabButtonActionConst.EDIT_MAIN_TAB_AND_CHANGE_BUSINESS_COST_ROW:
                                this.editMainTabResultId = saveOnlyMainTabResultState.returnID;
                                this.processEditMainTabSuccess();
                                break;

                            default:
                                break;
                        }

                        return;
                    }
                }

                this.saveFailed(saveOnlyMainTabResultState);
            });
        });
    }

    private subcribeSaveOnlyOtherTabResultState() {
        this.saveOnlyOtherTabResultStateSubscription = this.saveOnlyOtherTabResultState.subscribe((saveOnlyOtherTabResultState: any) => {
            this.appErrorHandler.executeAction(() => {
                if (!saveOnlyOtherTabResultState) {
                    return;
                }

                if (!isNil(saveOnlyOtherTabResultState.returnID)) {
                    if ((typeof saveOnlyOtherTabResultState.returnID == 'string' || typeof saveOnlyOtherTabResultState.returnID == 'number')
                        && saveOnlyOtherTabResultState.returnID) {
                        switch (this.currentAction) {
                            case TabButtonActionConst.EDIT_AND_SAVE_ONLY_OTHER_TAB:
                            case TabButtonActionConst.EDIT_OTHER_TAB_AND_GO_TO_FIRST_STEP:
                            case TabButtonActionConst.EDIT_OTHER_TAB_AND_GO_TO_SECOND_STEP:
                            case TabButtonActionConst.EDIT_OTHER_TAB_AND_CHANGE_BUSINESS_COST_ROW:
                                this.editOtherTabItemId = saveOnlyOtherTabResultState.returnID;
                                this.processEditOtherTabSuccess();
                                break;

                            default:
                                break;
                        }

                        return;
                    }
                }

                this.saveFailed(saveOnlyOtherTabResultState);
            });
        });
    }

    private subscribeWidgetDataUpdatedState() {
        this.widgetDataUpdatedStateSubscription = this.widgetDataUpdatedState.subscribe((widgetDataUpdatedState: WidgetDataUpdated) => {
            this.appErrorHandler.executeAction(() => {
                if (widgetDataUpdatedState) {
                    switch (this.currentAction) {
                        case TabButtonActionConst.CHANGE_MODULE:
                            this.store.dispatch(this.processDataActions.okToChangeModule(this.ofModule));
                            break;

                        case TabButtonActionConst.CHANGE_SUB_MODULE:
                            this.store.dispatch(this.processDataActions.okToChangeSubModule(this.ofModule));
                            break;

                        case TabButtonActionConst.CHANGE_TAB:
                            this.store.dispatch(this.processDataActions.okToChangeTab(this.ofModule));
                            break;

                        case TabButtonActionConst.REMOVE_TAB:
                            this.store.dispatch(this.processDataActions.okToRemoveTab(this.ofModule));
                            break;

                        case TabButtonActionConst.CREATE_NEW_FROM_MODULE_DROPDOWN:
                            this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.FIRST_LOAD, this.ofModule));
                            this.store.dispatch(this.processDataActions.okToCreateNewFromModuleDropdown(this.ofModule));
                            break;

                        case TabButtonActionConst.BEFORE_EDIT_OTHER_TAB:
                            this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.EDIT_OTHER_TAB, this.ofModule));
                            this.store.dispatch(this.processDataActions.newOtherTab(this.ofModule));
                            break;

                        case TabButtonActionConst.CHANGE_SEARCH_RESULT_FROM_MAIN_TAB:
                        case TabButtonActionConst.CHANGE_SEARCH_RESULT_FROM_OTHER_TAB:
                            this.store.dispatch(this.processDataActions.okToChangeSearchResult(this.ofModule));
                            break;

                        case TabButtonActionConst.BEFORE_CLOSE:
                            this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.FIRST_LOAD, this.ofModule));
                            this.processClose();
                            break;

                        case TabButtonActionConst.REFRESH_TAB:
                            this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.FIRST_LOAD, this.ofModule));
                            this.store.dispatch(this.widgetDetailActions.requestRefreshWidgetsInTab(this.selectedTab.tabSummaryInfor.tabID, this.ofModule));
                            break;

                        default:
                            break;
                    }
                }
            });
        });
    }

    private subcribeModulePrimaryKeyState() {
        this.modulePrimaryKeyStateSubscription = this.modulePrimaryKeyState.subscribe((modulePrimaryKeyState: string) => {
            this.appErrorHandler.executeAction(() => {
                this.modulePrimaryKey = modulePrimaryKeyState;
            });
        });
    }

    private subcribeWidgetListenKeyState() {
        this.widgetListenKeyStateSubscription = this.widgetListenKeyState.subscribe((widgetListenKeyState: string) => {
            this.appErrorHandler.executeAction(() => {
                this.widgetListenKey = widgetListenKeyState;
            });
        });
    }

    private subcribeRequestChangeParkedItemState() {
        this.requestChangeParkedItemStateSubscription = this.dispatcher.pipe(
            filter((action: CustomAction) => {
                return action.type === ProcessDataActions.REQUEST_CHANGE_PARKED_ITEM && action.module.idSettingsGUI == this.ofModule.idSettingsGUI;
            })
        ).subscribe(() => {
            this.appErrorHandler.executeAction(() => {
                let currentAction;
                if (!this.selectedTab) {
                    currentAction = TabButtonActionConst.FIRST_LOAD;
                } else if (this.tabService.isMainTabSelected(this.selectedTab)) {
                    currentAction = TabButtonActionConst.CHANGE_PARKED_ITEM_FROM_MAIN_TAB;
                } else {
                    currentAction = TabButtonActionConst.CHANGE_PARKED_ITEM_FROM_OTHER_TAB;
                }

                if (this.isDirty()) {
                    this.store.dispatch(this.tabButtonActions.setCurrentAction(currentAction, this.ofModule));
                    this.showDirtyWarningMessage();
                } else {
                    switch (currentAction) {
                        case TabButtonActionConst.FIRST_LOAD:
                            this.store.dispatch(this.processDataActions.okToChangeParkedItem(this.ofModule));
                            break;

                        case TabButtonActionConst.CHANGE_PARKED_ITEM_FROM_MAIN_TAB:
                            this.store.dispatch(this.processDataActions.turnOffFormEditMode(this.ofModule));
                            this.store.dispatch(this.processDataActions.turnOffFormCloneMode(this.ofModule));
                            this.store.dispatch(this.processDataActions.viewMode(this.ofModule));
                            this.store.dispatch(this.parkedItemActions.removeDraftItem(this.ofModule));
                            this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.FIRST_LOAD, this.ofModule));
                            this.store.dispatch(this.processDataActions.okToChangeParkedItem(this.ofModule));
                            break;

                        case TabButtonActionConst.CHANGE_PARKED_ITEM_FROM_OTHER_TAB:
                            this.store.dispatch(this.processDataActions.turnOffFormEditMode(this.ofModule));
                            this.store.dispatch(this.processDataActions.turnOffFormCloneMode(this.ofModule));
                            this.store.dispatch(this.processDataActions.viewMode(this.ofModule));
                            this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.FIRST_LOAD, this.ofModule));
                            this.store.dispatch(this.processDataActions.okToChangeParkedItem(this.ofModule));
                            break;

                        default:
                            break;
                    }
                }
            });
        });
    }

    private subcribeRequestChangeTabState() {
        this.requestChangeTabStateSubscription = this.dispatcher.pipe(
            filter((action: CustomAction) => {
                return action.type === ProcessDataActions.REQUEST_CHANGE_TAB && action.module.idSettingsGUI == this.ofModule.idSettingsGUI;
            }),
            map((action: CustomAction) => {
                return {
                    tabSetting: action.payload
                }
            })
        ).subscribe((requestChangeTabState: any) => {
            this.appErrorHandler.executeAction(() => {
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.CHANGE_TAB, this.ofModule));

                if (this.isDirty(requestChangeTabState.tabSetting)) {
                    if (this.ofModule.idSettingsGUI != ModuleList.OrderDataEntry.idSettingsGUI) {
                        this.showDirtyWarningMessage();
                    } else {
                        this.onModalExit();
                    }
                } else {
                    this.store.dispatch(this.processDataActions.viewMode(this.ofModule));
                    this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.FIRST_LOAD, this.ofModule));
                    this.store.dispatch(this.processDataActions.okToChangeTab(this.ofModule));
                }
            });
        });
    }

    private subcribeRequestRemoveTabState() {
        this.requestRemoveTabStateSubscription = this.dispatcher.pipe(
            filter((action: CustomAction) => {
                return action.type === ProcessDataActions.REQUEST_REMOVE_TAB && action.module.idSettingsGUI == this.ofModule.idSettingsGUI;
            }),
            map((action: CustomAction) => {
                return {
                    tabSetting: action.payload
                }
            })
        ).subscribe((requestRemoveTabState: any) => {
            this.appErrorHandler.executeAction(() => {
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.REMOVE_TAB, this.ofModule));

                if (this.isDirty(requestRemoveTabState.tabSetting)) {
                    this.showDirtyWarningMessage();
                } else {
                    this.store.dispatch(this.processDataActions.viewMode(this.ofModule));
                    this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.FIRST_LOAD, this.ofModule));
                    this.store.dispatch(this.processDataActions.okToRemoveTab(this.ofModule));
                }
            });
        });
    }

    private subcribeRequestCreateNewFromModuleDropdownState() {
        this.requestCreateNewFromModuleDropdownStateSubscription = this.dispatcher.pipe(
            filter((action: CustomAction) => {
                return action.type === ProcessDataActions.REQUEST_CREATE_NEW_FROM_MODULE_DROPDOWN && action.module.idSettingsGUI == this.ofModule.idSettingsGUI;
            })
        ).subscribe(() => {
            this.appErrorHandler.executeAction(() => {
                if (this.currentAction == TabButtonActionConst.NEW_MAIN_TAB) {
                    return;
                }

                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.CREATE_NEW_FROM_MODULE_DROPDOWN, this.ofModule));

                if (this.isDirty()) {
                    this.showDirtyWarningMessage();
                } else {
                    this.store.dispatch(this.processDataActions.turnOffFormEditMode(this.ofModule));
                    this.store.dispatch(this.processDataActions.turnOffFormCloneMode(this.ofModule));
                    this.store.dispatch(this.processDataActions.viewMode(this.ofModule));
                    this.store.dispatch(this.parkedItemActions.removeDraftItem(this.ofModule));
                    this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.FIRST_LOAD, this.ofModule));
                    setTimeout(() => {
                        this.store.dispatch(this.processDataActions.okToCreateNewFromModuleDropdown(this.ofModule));
                    }, 500);
                }
            });
        });
    }

    private subcribeRequestCreateNewMainTabState() {
        this.requestCreateNewMainTabStateSubscription = this.dispatcher.pipe(
            filter((action: CustomAction) => {
                return action.type === ProcessDataActions.REQUEST_CREATE_NEW_MAIN_TAB && action.module.idSettingsGUI == this.ofModule.idSettingsGUI;
            })
        ).subscribe(() => {
            this.appErrorHandler.executeAction(() => {
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.NEW_MAIN_TAB, this.ofModule));
                this.store.dispatch(this.processDataActions.newMainTab(this.ofModule));
            });
        });
    }

    private subcribeRequestCancelState() {
        this.requestCancelStateSubscription = this.dispatcher.pipe(
            filter((action: CustomAction) => {
                return action.type === TabButtonActions.REQUEST_CANCEL && action.module.idSettingsGUI == this.ofModule.idSettingsGUI;
            }),
            map((action: CustomAction) => {
                return {
                    fromMediaCode: action.payload
                };
            }),
        ).subscribe((requestCancelState: any) => {
            this.appErrorHandler.executeAction(() => {
                if (requestCancelState.fromMediaCode) {
                    this.store.dispatch(this.processDataActions.turnOffFormEditMode(this.ofModule));
                    this.store.dispatch(this.processDataActions.turnOffFormCloneMode(this.ofModule));
                    this.store.dispatch(this.processDataActions.viewMode(this.ofModule));
                    this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.FIRST_LOAD, this.ofModule));
                    this.store.dispatch(this.tabSummaryActions.toggleTabButton(false, this.ofModule));
                } else {
                    this.cancel();
                }
            });
        });
    }

    private subcribeRequestEditState() {
        this.requestEditStateSubscription = this.dispatcher.pipe(
            filter((action: CustomAction) => {
                return action.type === TabButtonActions.REQUEST_EDIT && action.module.idSettingsGUI == this.ofModule.idSettingsGUI;
            })
        )
        .subscribe(() => {
            this.appErrorHandler.executeAction(() => {
                this.edit();
            });
        });
    }

    private subcribeRequestNewState() {
        this.requestNewStateSubscription = this.dispatcher.pipe(
            filter((action: CustomAction) => {
                return action.type === TabButtonActions.REQUEST_NEW && action.module.idSettingsGUI == this.ofModule.idSettingsGUI;
            })
        ).subscribe(() => {
            this.appErrorHandler.executeAction(() => {
                this.add();
            });
        });
    }

    private subcribeRequestCloneState() {
        this.requestNewStateSubscription = this.dispatcher.pipe(
            filter((action: CustomAction) => {
                return action.type === TabButtonActions.REQUEST_CLONE && action.module.idSettingsGUI == this.ofModule.idSettingsGUI;
            })
        ).subscribe(() => {
            this.appErrorHandler.executeAction(() => {
                this.clone();
            });
        });
    }

    private subcribeDblClickTabHeaderState() {
        this.dblClickTabHeaderStateSubscription = this.dispatcher.pipe(
            filter((action: CustomAction) => {
                return action.type === TabButtonActions.DBL_CLICK_TAB_HEADER && action.module.idSettingsGUI == this.ofModule.idSettingsGUI;
            })
        )
        .subscribe(() => {
            this.appErrorHandler.executeAction(() => {
                this.toggleTab();
            });
        });
    }

    private subcribeRequestChangeModuleState() {
        this.requestChangeModuleStateSubscription = this.dispatcher.pipe(
            filter((action: CustomAction) => {
                return action.type === ProcessDataActions.REQUEST_CHANGE_MODULE && action.module.idSettingsGUI == this.ofModule.idSettingsGUI;
            }),
        )
        .subscribe(() => {
            this.appErrorHandler.executeAction(() => {
                //this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.CHANGE_MODULE, this.ofModule));
                let currentAction = this.currentAction;
                switch (currentAction) {
                    case TabButtonActionConst.NEW_MAIN_TAB:
                        currentAction = TabButtonActionConst.NEW_MAIN_TAB_AND_CHANGE_MODULE;
                        break;

                    case TabButtonActionConst.NEW_OTHER_TAB:
                        currentAction = TabButtonActionConst.NEW_OTHER_TAB_AND_CHANGE_MODULE;
                        break;

                    case TabButtonActionConst.EDIT_MAIN_TAB:
                        currentAction = TabButtonActionConst.EDIT_MAIN_TAB_AND_CHANGE_MODULE;
                        break;

                    case TabButtonActionConst.EDIT_OTHER_TAB:
                        currentAction = TabButtonActionConst.EDIT_OTHER_TAB_AND_CHANGE_MODULE;
                        break;

                    case TabButtonActionConst.FIRST_LOAD:
                        currentAction = TabButtonActionConst.CHANGE_MODULE;
                        break;
                }

                if (this.showUnsavedDialog && this.isDirty()) {
                    this.store.dispatch(this.tabButtonActions.setCurrentAction(currentAction, this.ofModule));
                    this.showDirtyWarningMessage();
                } else {
                    //this.store.dispatch(this.processDataActions.viewMode(this.ofModule));
                    //this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.FIRST_LOAD, this.ofModule));

                    if (this.isDirty()) {
                        this.store.dispatch(this.moduleActions.addDirtyModule(this.ofModule));
                    }

                    switch (currentAction) {
                        case TabButtonActionConst.NEW_MAIN_TAB_AND_CHANGE_MODULE:
                            this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.NEW_MAIN_TAB, this.ofModule));
                            break;

                        case TabButtonActionConst.NEW_OTHER_TAB_AND_CHANGE_MODULE:
                            this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.NEW_OTHER_TAB, this.ofModule));
                            break;

                        case TabButtonActionConst.EDIT_MAIN_TAB_AND_CHANGE_MODULE:
                            this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.EDIT_MAIN_TAB, this.ofModule));
                            break;

                        case TabButtonActionConst.EDIT_OTHER_TAB_AND_CHANGE_MODULE:
                            this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.EDIT_OTHER_TAB, this.ofModule));
                            break;
                    }

                    this.store.dispatch(this.processDataActions.okToChangeModule(this.ofModule));
                }
            });
        });
    }

    private subcribeRequestChangeSubModuleState() {
        this.requestChangeSubModuleStateSubscription = this.dispatcher.pipe(
            filter((action: CustomAction) => {
                return action.type === ProcessDataActions.REQUEST_CHANGE_SUB_MODULE && action.module.idSettingsGUI == this.ofModule.idSettingsGUI;
            })
        ).subscribe(() => {
            this.appErrorHandler.executeAction(() => {
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.CHANGE_SUB_MODULE, this.ofModule));

                if (this.isDirty()) {
                    this.showDirtyWarningMessage();
                } else {
                    this.store.dispatch(this.processDataActions.turnOffFormEditMode(this.ofModule));
                    this.store.dispatch(this.processDataActions.turnOffFormCloneMode(this.ofModule));
                    this.store.dispatch(this.processDataActions.viewMode(this.ofModule));
                    this.store.dispatch(this.parkedItemActions.removeDraftItem(this.ofModule));
                    this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.FIRST_LOAD, this.ofModule));
                    setTimeout(() => {
                        this.store.dispatch(this.processDataActions.okToChangeSubModule(this.ofModule));
                    }, 500);
                }
            });
        });
    }

    private subscribeRequestClearPropertiesSuccessState() {
        this.requestClearPropertiesSuccessStateSubscription = this.dispatcher.pipe(
            filter((action: CustomAction) => {
                return action.type === PropertyPanelActions.REQUEST_CLEAR_PROPERTIES_SUCCESS && action.module.idSettingsGUI == this.ofModule.idSettingsGUI;
            })
        ).subscribe(() => {
            this.appErrorHandler.executeAction(() => {
                if (this.requestAdd) {
                    this.okToAdd();
                } else if (this.requestEdit) {
                    this.okToEdit();
                } else if (this.requestClone) {
                    this.okToClone();
                } else if (this.requestClose) {
                    this.okToClose();
                }
            });
        });
    }

    private subscribeRequestGoToFirstStepState() {
        this.requestGoToFirstStepStateSubscription = this.dispatcher.pipe(
            filter((action: CustomAction) => {
                return action.type === ProcessDataActions.REQUEST_GO_TO_FIRST_STEP && action.module.idSettingsGUI == this.ofModule.idSettingsGUI;
            })
        ).subscribe(() => {
            this.appErrorHandler.executeAction(() => {
                let currentAction;
                switch (this.currentAction) {
                    case TabButtonActionConst.EDIT_MAIN_TAB:
                    case TabButtonActionConst.EDIT_AND_SAVE_AND_NEXT_SECOND_STEP:
                        currentAction = TabButtonActionConst.EDIT_MAIN_TAB_AND_GO_TO_FIRST_STEP;
                        break;

                    case TabButtonActionConst.EDIT_OTHER_TAB:
                        currentAction = TabButtonActionConst.EDIT_OTHER_TAB_AND_GO_TO_FIRST_STEP;
                        break;

                    case TabButtonActionConst.SAVE_AND_NEXT_SECOND_STEP:
                        currentAction = TabButtonActionConst.SAVE_AND_NEXT;
                        break;
                }

                if (this.isDirty()) {
                    this.store.dispatch(this.tabButtonActions.setCurrentAction(currentAction, this.ofModule));
                    this.showDirtyWarningMessage();
                } else {
                    switch (currentAction) {
                        case TabButtonActionConst.EDIT_MAIN_TAB_AND_GO_TO_FIRST_STEP:
                            this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.EDIT_MAIN_TAB, this.ofModule));
                            this.store.dispatch(this.processDataActions.okToGoToFirstStep(this.ofModule));
                            break;

                        case TabButtonActionConst.EDIT_OTHER_TAB_AND_GO_TO_FIRST_STEP:
                            this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.EDIT_OTHER_TAB, this.ofModule));
                            this.store.dispatch(this.processDataActions.okToGoToFirstStep(this.ofModule));
                            break;

                        case TabButtonActionConst.SAVE_AND_NEXT:
                            this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.EDIT_MAIN_TAB, this.ofModule));
                            this.store.dispatch(this.processDataActions.okToGoToFirstStep(this.ofModule));
                            break;
                    }
                }
            });
        });
    }

    private subscribeRequestGoToSecondStepState() {
        this.requestGoToSecondStepStateSubscription = this.dispatcher.pipe(
            filter((action: CustomAction) => {
                return action.type === ProcessDataActions.REQUEST_GO_TO_SECOND_STEP && action.module.idSettingsGUI == this.ofModule.idSettingsGUI;
            })
        ).subscribe(() => {
            this.appErrorHandler.executeAction(() => {
                let currentAction;
                switch (this.currentAction) {
                    case TabButtonActionConst.EDIT_MAIN_TAB:
                        currentAction = TabButtonActionConst.EDIT_MAIN_TAB_AND_GO_TO_SECOND_STEP;
                        break;

                    case TabButtonActionConst.EDIT_OTHER_TAB:
                        currentAction = TabButtonActionConst.EDIT_OTHER_TAB_AND_GO_TO_SECOND_STEP;
                        break;
                }

                if (this.isDirty()) {
                    this.store.dispatch(this.tabButtonActions.setCurrentAction(currentAction, this.ofModule));
                    this.showDirtyWarningMessage();
                } else {
                    switch (currentAction) {
                        case TabButtonActionConst.EDIT_MAIN_TAB_AND_GO_TO_SECOND_STEP:
                            this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.EDIT_MAIN_TAB, this.ofModule));
                            this.store.dispatch(this.processDataActions.okToGoToSecondStep(this.ofModule));
                            break;

                        case TabButtonActionConst.EDIT_OTHER_TAB_AND_GO_TO_SECOND_STEP:
                            this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.EDIT_OTHER_TAB, this.ofModule));
                            this.store.dispatch(this.processDataActions.okToGoToSecondStep(this.ofModule));
                            break;
                    }
                }
            });
        });
    }

    private subscribeRequestChangeBusinessCostRowState() {
        this.requestChangeBusinessCostRowStateSubscription = this.dispatcher.pipe(
            filter((action: CustomAction) => {
                return action.type === ProcessDataActions.REQUEST_CHANGE_BUSINESS_COST_ROW && action.module.idSettingsGUI == this.ofModule.idSettingsGUI;
            })
        ).subscribe(() => {
            this.appErrorHandler.executeAction(() => {
                let currentAction;
                switch (this.currentAction) {
                    case TabButtonActionConst.EDIT_MAIN_TAB:
                        currentAction = TabButtonActionConst.EDIT_MAIN_TAB_AND_CHANGE_BUSINESS_COST_ROW;
                        break;

                    case TabButtonActionConst.EDIT_OTHER_TAB:
                        currentAction = TabButtonActionConst.EDIT_OTHER_TAB_AND_CHANGE_BUSINESS_COST_ROW;
                        break;
                }


                if (this.isDirty()) {
                    this.store.dispatch(this.tabButtonActions.setCurrentAction(currentAction, this.ofModule));
                    this.showDirtyWarningMessage();
                } else {
                    switch (currentAction) {
                        case TabButtonActionConst.EDIT_MAIN_TAB_AND_CHANGE_BUSINESS_COST_ROW:
                            this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.EDIT_MAIN_TAB, this.ofModule));
                            this.store.dispatch(this.processDataActions.okToChangeBusinessCostRow(this.ofModule));
                            break;

                        case TabButtonActionConst.EDIT_OTHER_TAB_AND_CHANGE_BUSINESS_COST_ROW:
                            this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.EDIT_OTHER_TAB, this.ofModule));
                            this.store.dispatch(this.processDataActions.okToChangeBusinessCostRow(this.ofModule));
                            break;
                    }
                }
            });
        });
    }

    private subscribereturnAndRefundInvoiceNumberDataState() {
        this.returnAndRefundInvoiceNumberDataStateSubscription = this.returnAndRefundInvoiceNumberDataState.subscribe((invoiceNumberData: ReturnRefundInvoiceNumberModel) => {
            this.appErrorHandler.executeAction(() => {
                this.returnAndRefundInvoiceNumberData = invoiceNumberData;
            })
        });
    }

    private subcribeIsHiddenParkedItemState() {
        this.isHiddenParkedItemStateSubscription = this.isHiddenParkedItemState.subscribe((isHiddenParkedItemState: boolean) => {
            this.appErrorHandler.executeAction(() => {
                this.isHiddenParkedItem = isHiddenParkedItemState;
            });
        });
    }

    private subcribeRequestChangeSearchResultState() {
        this.requestChangeSearchResultStateSubscription = this.dispatcher.pipe(
            filter((action: CustomAction) => {
                return action.type === ProcessDataActions.REQUEST_CHANGE_SEARCH_RESULT && action.module.idSettingsGUI == this.ofModule.idSettingsGUI;
            })
        ).subscribe(() => {
            this.appErrorHandler.executeAction(() => {
                let currentAction;
                if (!this.selectedTab) {
                    currentAction = TabButtonActionConst.FIRST_LOAD;
                } else if (this.tabService.isMainTabSelected(this.selectedTab)) {
                    currentAction = TabButtonActionConst.CHANGE_SEARCH_RESULT_FROM_MAIN_TAB;
                } else {
                    currentAction = TabButtonActionConst.CHANGE_SEARCH_RESULT_FROM_OTHER_TAB;
                }

                if (this.isDirty()) {
                    this.store.dispatch(this.tabButtonActions.setCurrentAction(currentAction, this.ofModule));
                    this.showDirtyWarningMessage();
                } else {
                    switch (currentAction) {
                        case TabButtonActionConst.FIRST_LOAD:
                            this.store.dispatch(this.processDataActions.okToChangeSearchResult(this.ofModule));
                            break;

                        case TabButtonActionConst.CHANGE_SEARCH_RESULT_FROM_MAIN_TAB:
                            this.store.dispatch(this.processDataActions.turnOffFormEditMode(this.ofModule));
                            this.store.dispatch(this.processDataActions.turnOffFormCloneMode(this.ofModule));
                            this.store.dispatch(this.processDataActions.viewMode(this.ofModule));
                            this.store.dispatch(this.parkedItemActions.removeDraftItem(this.ofModule));
                            this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.FIRST_LOAD, this.ofModule));
                            this.store.dispatch(this.processDataActions.okToChangeSearchResult(this.ofModule));
                            break;

                        case TabButtonActionConst.CHANGE_SEARCH_RESULT_FROM_OTHER_TAB:
                            this.store.dispatch(this.processDataActions.turnOffFormEditMode(this.ofModule));
                            this.store.dispatch(this.processDataActions.turnOffFormCloneMode(this.ofModule));
                            this.store.dispatch(this.processDataActions.viewMode(this.ofModule));
                            this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.FIRST_LOAD, this.ofModule));
                            this.store.dispatch(this.processDataActions.okToChangeSearchResult(this.ofModule));
                            break;

                        default:
                            break;
                    }
                }
            });
        });
    }

    private subscribeSelectedWidgetRowDataState() {
        this.selectedWidgetRowDataStateSubscription = this.selectedWidgetRowDataState.subscribe((selectedWidgetRowDataState: RowData) => {
            this.appErrorHandler.executeAction(() => {
                this.selectedWidgetRowData = selectedWidgetRowDataState;
            });
        });
    }

    private subscribeFormEditModeState() {
        this.formEditModeStateSubscription = this.formEditModeState.subscribe((formEditModeState: boolean) => {
            this.appErrorHandler.executeAction(() => {
                this.isFormEditMode = formEditModeState;
            });
        });
    }

    /**
     * openTranslationDialog
     */
    public openTranslationDialog() {
        this.store.dispatch(this.processDataActions.openTranslationDialog(this.ofModule));
    }

    public addItemInEdit() {
        // this.store.dispatch(this.processDataActions.requestNewInEdit(this.ofModule));
    }

    public saveAllWidget() {
        this.store.dispatch(this.widgetDetailActions.requestSave(this.ofModule));
        if (this.isFormEditMode) {
            this.store.dispatch(this.processDataActions.turnOffFormEditMode(this.ofModule));
            this.store.dispatch(this.processDataActions.turnOffFormCloneMode(this.ofModule));
        }
    }

    public add() {
        //this.requestAdd = true;
        //this.store.dispatch(this.propertyPanelActions.requestClearProperties(this.ofModule));
        this.okToAdd();
    }

    public edit() {
        //this.requestEdit = true;
        //this.store.dispatch(this.propertyPanelActions.requestClearProperties(this.ofModule));
        this.okToEdit();
    }

    public clone() {
        //this.requestClone = true;
        //this.store.dispatch(this.propertyPanelActions.requestClearProperties(this.ofModule));
        this.okToClone();
    }

    public cancel() {
        if (this.isDirty()) {
            this.showDirtyWarningMessage();
        } else {
            this.store.dispatch(this.processDataActions.turnOffFormEditMode(this.ofModule));
            this.store.dispatch(this.processDataActions.turnOffFormCloneMode(this.ofModule));
            this.store.dispatch(this.processDataActions.viewMode(this.ofModule));

            switch (this.currentAction) {
                case TabButtonActionConst.NEW_MAIN_TAB:
                case TabButtonActionConst.NEW_MAIN_TAB_AND_OP_STORE_TEMPORARILY:
                case TabButtonActionConst.NEW_MAIN_TAB_AND_OP_SAVE_AND_RUN_AS_PRINT:
                case TabButtonActionConst.NEW_MAIN_TAB_AND_OP_SAVE_AND_RUN_AS_EMAIL:
                    this.store.dispatch(this.parkedItemActions.removeDraftItem(this.ofModule));
                    this.store.dispatch(this.parkedItemActions.selectPreviousParkedItem(this.ofModule));

                    if (this.selectedEntity && this.selectedEntity.hasOwnProperty('selectedParkedItem')) {
                        this.store.dispatch(this.moduleActions.moveSelectedParkedItemToTop(this.ofModule, this.selectedEntity.selectedParkedItem));
                    }

                    this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.FIRST_LOAD, this.ofModule));
                    break;

                case TabButtonActionConst.NEW_OTHER_TAB:
                case TabButtonActionConst.NEW_OTHER_TAB_AND_OP_STORE_TEMPORARILY:
                case TabButtonActionConst.NEW_OTHER_TAB_AND_OP_SAVE_AND_RUN_AS_PRINT:
                case TabButtonActionConst.NEW_OTHER_TAB_AND_OP_SAVE_AND_RUN_AS_EMAIL:
                    this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.FIRST_LOAD, this.ofModule));
                    break;

                case TabButtonActionConst.EDIT_MAIN_TAB:
                case TabButtonActionConst.EDIT_MAIN_TAB_AND_OP_STORE_TEMPORARILY:
                case TabButtonActionConst.EDIT_MAIN_TAB_AND_OP_SAVE_AND_RUN_AS_PRINT:
                case TabButtonActionConst.EDIT_MAIN_TAB_AND_OP_SAVE_AND_RUN_AS_EMAIL:
                    this.store.dispatch(this.parkedItemActions.selectPreviousParkedItem(this.ofModule));

                    if (this.selectedEntity && this.selectedEntity.hasOwnProperty('selectedParkedItem')) {
                        this.store.dispatch(this.moduleActions.moveSelectedParkedItemToTop(this.ofModule, this.selectedEntity.selectedParkedItem));
                    }

                    this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.FIRST_LOAD, this.ofModule));
                    break;

                case TabButtonActionConst.EDIT_OTHER_TAB:
                case TabButtonActionConst.EDIT_OTHER_TAB_AND_OP_STORE_TEMPORARILY:
                case TabButtonActionConst.EDIT_OTHER_TAB_AND_OP_SAVE_AND_RUN_AS_PRINT:
                case TabButtonActionConst.EDIT_OTHER_TAB_AND_OP_SAVE_AND_RUN_AS_EMAIL:
                    this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.FIRST_LOAD, this.ofModule));
                    break;

                case TabButtonActionConst.CREATE_NEW_FROM_MODULE_DROPDOWN:
                    this.store.dispatch(this.parkedItemActions.removeDraftItem(this.ofModule));
                    this.store.dispatch(this.parkedItemActions.selectPreviousParkedItem(this.ofModule));

                    if (this.selectedEntity && this.selectedEntity.hasOwnProperty('selectedParkedItem')) {
                        this.store.dispatch(this.moduleActions.moveSelectedParkedItemToTop(this.ofModule, this.selectedEntity.selectedParkedItem));
                    }

                    this.store.dispatch(this.tabSummaryActions.requestLoadTabs(this.ofModule));
                    this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.FIRST_LOAD, this.ofModule));
                    break;

                case TabButtonActionConst.SAVE_AND_CLOSE_MAIN_TAB:
                case TabButtonActionConst.SAVE_AND_NEW_MAIN_TAB:
                    this.store.dispatch(this.parkedItemActions.removeDraftItem(this.ofModule));
                    this.store.dispatch(this.parkedItemActions.selectPreviousParkedItem(this.ofModule));

                    if (this.selectedEntity && this.selectedEntity.hasOwnProperty('selectedParkedItem')) {
                        this.store.dispatch(this.moduleActions.moveSelectedParkedItemToTop(this.ofModule, this.selectedEntity.selectedParkedItem));
                    }

                    this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.FIRST_LOAD, this.ofModule));
                    break;

                case TabButtonActionConst.SAVE_AND_CLOSE_OTHER_TAB:
                case TabButtonActionConst.SAVE_AND_NEW_OTHER_TAB:
                    this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.FIRST_LOAD, this.ofModule));
                    break;

                case TabButtonActionConst.SAVE_AND_NEXT:
                    this.store.dispatch(this.parkedItemActions.removeDraftItem(this.ofModule));
                    this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.FIRST_LOAD, this.ofModule));
                    break;

                case TabButtonActionConst.SAVE_AND_NEXT_SECOND_STEP:
                    this.store.dispatch(this.parkedItemActions.selectPreviousParkedItem(this.ofModule));

                    if (this.selectedEntity && this.selectedEntity.hasOwnProperty('selectedParkedItem')) {
                        this.store.dispatch(this.moduleActions.moveSelectedParkedItemToTop(this.ofModule, this.selectedEntity.selectedParkedItem));
                    }

                    this.store.dispatch(this.tabSummaryActions.requestLoadTabs(this.ofModule));
                    this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.FIRST_LOAD, this.ofModule));
                    break;

                case TabButtonActionConst.SAVE_ONLY_MAIN_TAB:
                    this.store.dispatch(this.parkedItemActions.removeDraftItem(this.ofModule));
                    this.store.dispatch(this.parkedItemActions.selectPreviousParkedItem(this.ofModule));
                    this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.FIRST_LOAD, this.ofModule));
                    break;

                default:
                    break;
            }

            this.store.dispatch(this.tabSummaryActions.toggleTabButton(false, this.ofModule));
            this.setTabButtonState('disabled', [{ save: false }, { saveAndNew: false }, { saveAndClose: false }, { saveAndNext: false }]);
        }
    }

    public close() {
        //this.requestClose = true;
        //this.store.dispatch(this.propertyPanelActions.requestClearProperties(this.ofModule));
        this.okToClose();
    }

    public saveAndClose() {
        setTimeout(() => {
            this.setTabButtonState('disabled', [{ saveAndClose: true }]);

            switch (this.currentAction) {
                case TabButtonActionConst.EDIT_MAIN_TAB:
                    this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.EDIT_AND_SAVE_AND_CLOSE_MAIN_TAB, this.ofModule));
                    break;

                case TabButtonActionConst.EDIT_OTHER_TAB:
                    this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.EDIT_AND_SAVE_AND_CLOSE_OTHER_TAB, this.ofModule));
                    break;

                case TabButtonActionConst.EDIT_AND_SAVE_AND_NEXT_SECOND_STEP:
                    this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.EDIT_AND_SAVE_AND_CLOSE_MAIN_TAB, this.ofModule));
                    break;

                default:
                    if (this.currentAction == TabButtonActionConst.SAVE_AND_NEXT_SECOND_STEP && this.ofModule.idSettingsGUI == MenuModuleId.campaign) {
                        this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.EDIT_AND_SAVE_AND_CLOSE_OTHER_TAB, this.ofModule));
                    } else if (this.tabService.isMainTabSelected(this.selectedTab)) {
                        this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.SAVE_AND_CLOSE_MAIN_TAB, this.ofModule));
                    } else {
                        this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.SAVE_AND_CLOSE_OTHER_TAB, this.ofModule));
                    }
                    break;
            }

            this.store.dispatch(this.processDataActions.requestSave(this.ofModule, RequestSavingMode.SaveAndClose));
        }, 200);
    }

    public saveAndNew() {
        setTimeout(() => {
            this.setTabButtonState('disabled', [{ saveAndNew: true }]);

            if (this.tabService.isMainTabSelected(this.selectedTab)) {
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.SAVE_AND_NEW_MAIN_TAB, this.ofModule));
            } else {
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.SAVE_AND_NEW_OTHER_TAB, this.ofModule));
            }

            this.store.dispatch(this.processDataActions.requestSave(this.ofModule, RequestSavingMode.SaveAndNew));
        }, 200);
    }

    public saveAndNext() {
        setTimeout(() => {
            this.setTabButtonState('disabled', [{ saveAndNext: true }]);

            switch (this.currentAction) {
                case TabButtonActionConst.EDIT_MAIN_TAB:
                case TabButtonActionConst.EDIT_AND_SAVE_AND_NEXT_SECOND_STEP:
                case TabButtonActionConst.SAVE_AND_NEXT_SECOND_STEP:
                    this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.EDIT_AND_SAVE_AND_NEXT_MAIN_TAB, this.ofModule));
                    break;

                case TabButtonActionConst.EDIT_OTHER_TAB:
                    this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.EDIT_AND_SAVE_AND_NEXT_OTHER_TAB, this.ofModule));
                    break;

                default:
                    this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.SAVE_AND_NEXT, this.ofModule));
                    break;
            }

            this.store.dispatch(this.processDataActions.requestSave(this.ofModule, RequestSavingMode.SaveAndNext));
        }, 200);
    }

    public saveAndNext_Widget() {
        //this.setTabButtonState('disabled', [{ saveAndNext: true }]);

        let isSimpleTab = false;
        switch (this.selectedTab.tabSummaryInfor.tabID) {
            case 'SelectProject':
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.SAVE_AND_NEXT_STEP_SELECT_PROJECT, this.ofModule));
                break;
            case 'Country':
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.SAVE_AND_NEXT_STEP_COUNTRY, this.ofModule));
                break;
            case 'Database':
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.SAVE_AND_NEXT_STEP_DATABASE, this.ofModule));
                break;
            case 'Logic':
                isSimpleTab = true;
                switch (this.selectedSimpleTab.TabID) {
                    case 'BlackList':
                        this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.SAVE_AND_NEXT_STEP_LOGIC_BLACKLIST, this.ofModule));
                        break;
                    case 'AgeFilter':
                        this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.SAVE_AND_NEXT_STEP_LOGIC_AGE_FILTER, this.ofModule));
                        break;
                    case 'ExtendedFilter':
                        this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.SAVE_AND_NEXT_STEP_LOGIC_EXTENDED_FILTER, this.ofModule));
                        break;
                    case 'GroupPriority':
                        this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.SAVE_AND_NEXT_STEP_LOGIC_GROUP_PRIORITY, this.ofModule));
                        break;
                }
            case 'Frequencies':
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.SAVE_AND_NEXT_STEP_FREQUENCIES, this.ofModule));
                break;
            case 'Export':
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.SAVE_AND_NEXT_STEP_EXPORT, this.ofModule));
                break;
            case 'Finalize':
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.SAVE_AND_NEXT_STEP_FINALIZE, this.ofModule));
                break;
        }

        let tabId = isSimpleTab ? this.selectedSimpleTab.TabID : this.selectedTab.tabSummaryInfor.tabID;
        this.store.dispatch(this.processDataActions.requestSaveWidget(this.ofModule, tabId));
    }

    public saveOnly() {
        setTimeout(() => {
            this.setTabButtonState('disabled', [{ save: true }]);

            switch (this.currentAction) {
                case TabButtonActionConst.EDIT_MAIN_TAB:
                case TabButtonActionConst.EDIT_AND_SAVE_AND_NEXT_SECOND_STEP:
                    this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.EDIT_AND_SAVE_ONLY_MAIN_TAB, this.ofModule));
                    break;

                case TabButtonActionConst.EDIT_OTHER_TAB:
                    this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.EDIT_AND_SAVE_ONLY_OTHER_TAB, this.ofModule));
                    break;

                default:
                    if (this.currentAction === TabButtonActionConst.SAVE_AND_NEXT_SECOND_STEP && this.ofModule.idSettingsGUI == MenuModuleId.businessCosts) {
                        this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.SAVE_ONLY_OTHER_TAB, this.ofModule));
                    } else if (this.tabService.isMainTabSelected(this.selectedTab)) {
                        this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.SAVE_ONLY_MAIN_TAB, this.ofModule));
                    } else {
                        this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.SAVE_ONLY_OTHER_TAB, this.ofModule));
                    }
                    break;
            }

            this.store.dispatch(this.processDataActions.requestSave(this.ofModule, RequestSavingMode.SaveOnly));
        }, 200);
    }    

    public toggleTab() {
        this.isTabCollapsed = !this.isTabCollapsed;
        this.reloadAndSaveSetting();
        this.store.dispatch(this.tabSummaryActions.toggleTabHeader(this.isTabCollapsed, this.ofModule));
    }

    private trigerClickBeforeSaving() {
        this.elmRef.nativeElement.click();
    }

    private okToAdd() {
        let currentAction;
        if (this.tabService.isMainTabSelected(this.selectedTab)) {
            currentAction = TabButtonActionConst.BEFORE_NEW_MAIN_TAB;
        } else {
            currentAction = TabButtonActionConst.BEFORE_NEW_OTHER_TAB;
        }

        if (this.isDirty()) {
            this.store.dispatch(this.tabButtonActions.setCurrentAction(currentAction, this.ofModule));
            this.showDirtyWarningMessage();
        } else {
            this.store.dispatch(this.processDataActions.turnOffFormEditMode(this.ofModule));
            this.store.dispatch(this.processDataActions.turnOffFormCloneMode(this.ofModule));

            switch (currentAction) {
                case TabButtonActionConst.BEFORE_NEW_MAIN_TAB:
                    this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.NEW_MAIN_TAB, this.ofModule));
                    this.store.dispatch(this.processDataActions.newMainTab(this.ofModule));
                    break;

                case TabButtonActionConst.BEFORE_NEW_OTHER_TAB:
                    this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.NEW_OTHER_TAB, this.ofModule));
                    this.store.dispatch(this.processDataActions.newOtherTab(this.ofModule));
                    break;

                default:
                    break;
            }
        }

        this.requestAdd = false;
    }

    private okToEdit() {
        let currentAction;

        if (this.tabService.isMainTabSelected(this.selectedTab)) {
            currentAction = TabButtonActionConst.BEFORE_EDIT_MAIN_TAB;
        } else if (this.selectedSimpleTab && this.selectedSimpleTab.ParentTabID == this.selectedTab.tabSummaryInfor.tabID) {
            currentAction = TabButtonActionConst.BEFORE_EDIT_SIMPLE_TAB;
        } else {
            currentAction = TabButtonActionConst.BEFORE_EDIT_OTHER_TAB;
        }

        if (this.isDirty()) {
            this.store.dispatch(this.tabButtonActions.setCurrentAction(currentAction, this.ofModule));
            this.showDirtyWarningMessage();
        } else {
            switch (currentAction) {
                case TabButtonActionConst.BEFORE_EDIT_MAIN_TAB:
                    this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.EDIT_MAIN_TAB, this.ofModule));
                    this.store.dispatch(this.processDataActions.updateMainTab(this.ofModule));

                    if (this.ofModule.idSettingsGUI != MenuModuleId.systemManagement && this.selectedEntity) {
                        this.store.dispatch(this.processDataActions.turnOnFormEditMode(this.selectedEntity, this.ofModule));
                    }

                    if (this.ofModule.idSettingsGUI == MenuModuleId.systemManagement && this.selectedWidgetRowData) {
                        this.store.dispatch(this.processDataActions.turnOnFormEditMode(this.selectedWidgetRowData, this.ofModule));
                    }

                    break;

                case TabButtonActionConst.BEFORE_EDIT_OTHER_TAB:
                    this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.EDIT_OTHER_TAB, this.ofModule));
                    this.store.dispatch(this.processDataActions.newOtherTab(this.ofModule));

                    if (this.ofModule.idSettingsGUI != MenuModuleId.systemManagement && this.selectedEntity) {
                        this.store.dispatch(this.processDataActions.turnOnFormEditMode(this.selectedEntity, this.ofModule));
                    }

                    if (this.ofModule.idSettingsGUI == MenuModuleId.systemManagement && this.selectedWidgetRowData) {
                        this.store.dispatch(this.processDataActions.turnOnFormEditMode(this.selectedWidgetRowData, this.ofModule));
                    }

                    break;

                case TabButtonActionConst.BEFORE_EDIT_SIMPLE_TAB:
                    this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.EDIT_SIMPLE_TAB, this.ofModule));
                    this.store.dispatch(this.processDataActions.newSimpleTab(this.ofModule));
                    break;

                default:
                    break;
            }
        }

        this.requestEdit = false;
    }

    private okToClone() {
        let currentAction;

        if (this.selectedSimpleTab) {
            currentAction = TabButtonActionConst.BEFORE_CLONE_SIMPLE_TAB;
        } else {
            if (this.tabService.isMainTabSelected(this.selectedTab)) {
                currentAction = TabButtonActionConst.BEFORE_CLONE_MAIN_TAB;
            } else {
                currentAction = TabButtonActionConst.BEFORE_CLONE_OTHER_TAB;
            }
        }

        if (this.isDirty()) {
            this.store.dispatch(this.tabButtonActions.setCurrentAction(currentAction, this.ofModule));
            this.showDirtyWarningMessage();
        } else {
            switch (currentAction) {
                case TabButtonActionConst.BEFORE_CLONE_MAIN_TAB:
                    this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.CLONE_MAIN_TAB, this.ofModule));
                    this.store.dispatch(this.processDataActions.updateMainTab(this.ofModule));

                    if (this.ofModule.idSettingsGUI != MenuModuleId.systemManagement && this.selectedEntity) {
                        this.store.dispatch(this.processDataActions.turnOnFormCloneMode(this.selectedEntity, this.ofModule));
                    }

                    if (this.ofModule.idSettingsGUI == MenuModuleId.systemManagement && this.selectedWidgetRowData) {
                        this.store.dispatch(this.processDataActions.turnOnFormCloneMode(this.selectedWidgetRowData, this.ofModule));
                    }

                    break;

                case TabButtonActionConst.BEFORE_CLONE_OTHER_TAB:
                    this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.CLONE_OTHER_TAB, this.ofModule));
                    this.store.dispatch(this.processDataActions.newOtherTab(this.ofModule));

                    if (this.ofModule.idSettingsGUI != MenuModuleId.systemManagement && this.selectedEntity) {
                        this.store.dispatch(this.processDataActions.turnOnFormCloneMode(this.selectedEntity, this.ofModule));
                    }

                    if (this.ofModule.idSettingsGUI == MenuModuleId.systemManagement && this.selectedWidgetRowData) {
                        this.store.dispatch(this.processDataActions.turnOnFormCloneMode(this.selectedWidgetRowData, this.ofModule));
                    }

                    break;

                case TabButtonActionConst.BEFORE_CLONE_SIMPLE_TAB:
                    this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.CLONE_SIMPLE_TAB, this.ofModule));
                    this.store.dispatch(this.processDataActions.newSimpleTab(this.ofModule));
                    break;

                default:
                    break;
            }
        }

        this.requestClone = false;
    }

    private okToClose() {
        let currentAction;
        currentAction = TabButtonActionConst.BEFORE_CLOSE;

        if (this.isDirty()) {
            this.store.dispatch(this.tabButtonActions.setCurrentAction(currentAction, this.ofModule));
            this.showDirtyWarningMessage();
        } else {

            if (currentAction == TabButtonActionConst.BEFORE_CLOSE) {
                this.processClose();
            }
        }
    }

    private isDirty(tabSetting?: any) {
        if (this.formDirty) {
            return true;
        }

        if (!this.editingWidgets.length) return false;

        if (tabSetting) {
            for (let editingWidget of this.editingWidgets) {
                let pageId = editingWidget.pageId;

                if (tabSetting.Split && tabSetting.Split.Items) {
                    let splitItem = tabSetting.Split.Items.find(si => si.Page && si.Page.PageId == pageId);
                    if (splitItem) {
                        return true;
                    }
                } else if (tabSetting.Page && tabSetting.Page.PageId == pageId) {
                    return true;
                }
            }//for
        } else if (this.selectedEntity) {
            //ODE
            if (this.selectedODETab && this.selectedODETab.TabID) {
                var modulePrimaryKey = this.modulePrimaryKey || 'id';
                if (!modulePrimaryKey) return false;

                for (let editingWidget of this.editingWidgets) {
                    if (this.selectedODETab.TabID == editingWidget.tabId &&
                        editingWidget.selectedEntity && editingWidget.selectedEntity[modulePrimaryKey] == this.selectedEntity[modulePrimaryKey]) {
                        return true;
                    }
                }//for
            }
            else {
                for (let editingWidget of this.editingWidgets) {
                    if (editingWidget.selectedEntity && editingWidget.selectedEntity[this.modulePrimaryKey] == this.selectedEntity[this.modulePrimaryKey]) {
                        return true;
                    }
                }//for
            }
        }

        return false;
    }

    private showDirtyWarningMessage() {
        let modalOptions: any = {
            headerText: 'Saving Changes',
            message: [{ key: '<p>'}, { key: 'Modal_Message__DoYouWantToSaveTheseChanges' }, { key: '<p>' }],
            onModalSaveAndExit: this.onModalSaveAndExit.bind(this),
            onModalExit: this.onModalExit.bind(this),
            onModalCancel: this.onModalCancel.bind(this),
            callBackFunc: this.onModalCancel.bind(this),
            noButtonText: this.ofModule.idSettingsGUI == MenuModuleId.orderDataEntry ? 'Keep Data' : null
        };

        if (this.ofModule.idSettingsGUI == MenuModuleId.orderDataEntry) {
            modalOptions.customClass = 'custom-modal-medium';
            modalOptions.yesButtonText = 'Save Data';
            //modalOptions.yesButtonDisabled = !this.isOrderDataEntrySaveDisabled || !this.isOrderDataEntrySaveDisabled.status || (this.selectedODETab && this.selectedODETab.TabID == 'Scanning' && !this.idScansContainerItems);

            if (this.requestClose) {
                modalOptions.noButtonText = 'Close Module';
            } else if (this.currentAction === TabButtonActionConst.RELOAD_ORDER_DATA_ENTRY) {
                modalOptions.noButtonText = 'Reload Data';
            } else if (this.currentAction === TabButtonActionConst.REMOVE_TAB) {
                modalOptions.noButtonText = 'Remove Tab';
            } else {
                modalOptions.noButtonText = 'Keep Data';
            }
        } else {
            delete modalOptions.yesButtonText;
            delete modalOptions.noButtonText;
            delete modalOptions.customClass;
        }

        this.modalService.unsavedWarningMessage(modalOptions);
    }

    private onModalSaveAndExit() {
        switch (this.currentAction) {
            case TabButtonActionConst.CHANGE_PARKED_ITEM_FROM_MAIN_TAB:
            case TabButtonActionConst.CHANGE_PARKED_ITEM_FROM_OTHER_TAB:
            case TabButtonActionConst.CHANGE_SEARCH_RESULT_FROM_MAIN_TAB:
            case TabButtonActionConst.CHANGE_SEARCH_RESULT_FROM_OTHER_TAB:
            case TabButtonActionConst.CHANGE_TAB:
            case TabButtonActionConst.REMOVE_TAB:
            case TabButtonActionConst.CREATE_NEW_FROM_MODULE_DROPDOWN:
            case TabButtonActionConst.CHANGE_MODULE:
            case TabButtonActionConst.CHANGE_SUB_MODULE:
            case TabButtonActionConst.NEW_MAIN_TAB_AND_CHANGE_MODULE:
            case TabButtonActionConst.SAVE_AND_CLOSE_OTHER_TAB:
            case TabButtonActionConst.RELOAD_ORDER_DATA_ENTRY:
            case TabButtonActionConst.BEFORE_CLOSE:
                if (this.ofModule.idSettingsGUI == MenuModuleId.document) {
                    //this.saveDocumentManagement();
                    this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.FIRST_LOAD, this.ofModule));
                } else if (this.editingWidgets.length) {
                    this.store.dispatch(this.widgetDetailActions.requestSave(this.ofModule));
                } else {
                    this.store.dispatch(this.processDataActions.requestSave(this.ofModule, RequestSavingMode.SaveAndClose));
                }
                break;

            case TabButtonActionConst.BEFORE_NEW_MAIN_TAB:
            case TabButtonActionConst.BEFORE_NEW_OTHER_TAB:
            case TabButtonActionConst.BEFORE_EDIT_OTHER_TAB:
                this.store.dispatch(this.widgetDetailActions.requestSave(this.ofModule));
                break;

            case TabButtonActionConst.NEW_MAIN_TAB:
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.SAVE_AND_CLOSE_MAIN_TAB, this.ofModule));
                this.store.dispatch(this.processDataActions.requestSave(this.ofModule, RequestSavingMode.SaveAndClose));
                break;

            case TabButtonActionConst.NEW_OTHER_TAB:
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.SAVE_AND_CLOSE_OTHER_TAB, this.ofModule));
                this.store.dispatch(this.processDataActions.requestSave(this.ofModule, RequestSavingMode.SaveAndClose));
                break;

            case TabButtonActionConst.EDIT_MAIN_TAB:
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.EDIT_AND_SAVE_AND_CLOSE_MAIN_TAB, this.ofModule));
                this.store.dispatch(this.processDataActions.requestSave(this.ofModule, RequestSavingMode.SaveAndClose));
                break;

            case TabButtonActionConst.EDIT_OTHER_TAB:
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.EDIT_AND_SAVE_AND_CLOSE_OTHER_TAB, this.ofModule));
                this.store.dispatch(this.processDataActions.requestSave(this.ofModule, RequestSavingMode.SaveAndClose));
                break;

            case TabButtonActionConst.EDIT_SIMPLE_TAB:
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.EDIT_AND_SAVE_AND_CLOSE_SIMPLE_TAB, this.ofModule));
                this.store.dispatch(this.processDataActions.requestSave(this.ofModule, RequestSavingMode.SaveAndClose));
                break;

            case TabButtonActionConst.EDIT_MAIN_TAB_AND_GO_TO_FIRST_STEP:
            case TabButtonActionConst.EDIT_MAIN_TAB_AND_GO_TO_SECOND_STEP:
            case TabButtonActionConst.EDIT_OTHER_TAB_AND_GO_TO_FIRST_STEP:
            case TabButtonActionConst.EDIT_OTHER_TAB_AND_GO_TO_SECOND_STEP:
            case TabButtonActionConst.EDIT_MAIN_TAB_AND_CHANGE_BUSINESS_COST_ROW:
            case TabButtonActionConst.EDIT_OTHER_TAB_AND_CHANGE_BUSINESS_COST_ROW:
                this.store.dispatch(this.processDataActions.requestSave(this.ofModule, RequestSavingMode.SaveOnly));
                break;

            default:
                break;
        }
    }

    private onModalExit() {
        switch (this.currentAction) {
            case TabButtonActionConst.CHANGE_MODULE:
            case TabButtonActionConst.CHANGE_SUB_MODULE:
            case TabButtonActionConst.CHANGE_PARKED_ITEM_FROM_MAIN_TAB:
            case TabButtonActionConst.CHANGE_PARKED_ITEM_FROM_OTHER_TAB:
            case TabButtonActionConst.CHANGE_SEARCH_RESULT_FROM_MAIN_TAB:
            case TabButtonActionConst.CHANGE_SEARCH_RESULT_FROM_OTHER_TAB:
            case TabButtonActionConst.CHANGE_TAB:
            case TabButtonActionConst.REMOVE_TAB:
            case TabButtonActionConst.NEW_MAIN_TAB_AND_CHANGE_MODULE:
            case TabButtonActionConst.NEW_OTHER_TAB_AND_CHANGE_MODULE:
            case TabButtonActionConst.EDIT_MAIN_TAB_AND_CHANGE_MODULE:
            case TabButtonActionConst.EDIT_OTHER_TAB_AND_CHANGE_MODULE:
            case TabButtonActionConst.RELOAD_ORDER_DATA_ENTRY:
                break;

            default:
                this.store.dispatch(this.processDataActions.formDirty(false, this.ofModule));
                this.store.dispatch(this.processDataActions.formValid(true, this.ofModule));
                break;
        }

        switch (this.currentAction) {
            case TabButtonActionConst.CHANGE_PARKED_ITEM_FROM_MAIN_TAB:
                if (!this.isViewMode) {
                    this.store.dispatch(this.processDataActions.formDirty(false, this.ofModule));
                    this.store.dispatch(this.processDataActions.formValid(true, this.ofModule));
                    this.store.dispatch(this.processDataActions.turnOffFormEditMode(this.ofModule));
                    this.store.dispatch(this.processDataActions.turnOffFormCloneMode(this.ofModule));
                    this.store.dispatch(this.widgetDetailActions.canceAllWidgetEditing(this.ofModule));
                    this.store.dispatch(this.processDataActions.viewMode(this.ofModule));
                    this.store.dispatch(this.parkedItemActions.removeDraftItem(this.ofModule));
                    this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.FIRST_LOAD, this.ofModule));

                }
                this.store.dispatch(this.processDataActions.okToChangeParkedItem(this.ofModule));
                break;

            case TabButtonActionConst.CHANGE_PARKED_ITEM_FROM_OTHER_TAB:
                if (!this.isViewMode) {
                    this.store.dispatch(this.processDataActions.formDirty(false, this.ofModule));
                    this.store.dispatch(this.processDataActions.formValid(true, this.ofModule));
                    this.store.dispatch(this.processDataActions.turnOffFormEditMode(this.ofModule));
                    this.store.dispatch(this.processDataActions.turnOffFormCloneMode(this.ofModule));
                    this.store.dispatch(this.widgetDetailActions.canceAllWidgetEditing(this.ofModule));
                    this.store.dispatch(this.processDataActions.viewMode(this.ofModule));
                    this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.FIRST_LOAD, this.ofModule));
                }
                this.store.dispatch(this.processDataActions.okToChangeParkedItem(this.ofModule));
                break;

            case TabButtonActionConst.CHANGE_SEARCH_RESULT_FROM_MAIN_TAB:
                if (!this.isViewMode) {
                    this.store.dispatch(this.processDataActions.formDirty(false, this.ofModule));
                    this.store.dispatch(this.processDataActions.formValid(true, this.ofModule));
                    this.store.dispatch(this.processDataActions.turnOffFormEditMode(this.ofModule));
                    this.store.dispatch(this.processDataActions.turnOffFormCloneMode(this.ofModule));
                    this.store.dispatch(this.widgetDetailActions.canceAllWidgetEditing(this.ofModule));
                    this.store.dispatch(this.processDataActions.viewMode(this.ofModule));
                    this.store.dispatch(this.parkedItemActions.removeDraftItem(this.ofModule));
                    this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.FIRST_LOAD, this.ofModule));
                }
                this.store.dispatch(this.processDataActions.okToChangeSearchResult(this.ofModule));
                break;

            case TabButtonActionConst.CHANGE_SEARCH_RESULT_FROM_OTHER_TAB:
                if (!this.isViewMode) {
                    this.store.dispatch(this.processDataActions.formDirty(false, this.ofModule));
                    this.store.dispatch(this.processDataActions.formValid(true, this.ofModule));
                    this.store.dispatch(this.processDataActions.turnOffFormEditMode(this.ofModule));
                    this.store.dispatch(this.processDataActions.turnOffFormCloneMode(this.ofModule));
                    this.store.dispatch(this.widgetDetailActions.canceAllWidgetEditing(this.ofModule));
                    this.store.dispatch(this.processDataActions.viewMode(this.ofModule));
                    this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.FIRST_LOAD, this.ofModule));
                }
                this.store.dispatch(this.processDataActions.okToChangeSearchResult(this.ofModule));
                break;

            case TabButtonActionConst.BEFORE_NEW_MAIN_TAB:
                this.store.dispatch(this.processDataActions.formDirty(false, this.ofModule));
                this.store.dispatch(this.processDataActions.formValid(true, this.ofModule));
                this.store.dispatch(this.processDataActions.turnOffFormEditMode(this.ofModule));
                this.store.dispatch(this.processDataActions.turnOffFormCloneMode(this.ofModule));
                this.store.dispatch(this.widgetDetailActions.canceAllWidgetEditing(this.ofModule));
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.NEW_MAIN_TAB, this.ofModule));
                this.store.dispatch(this.processDataActions.newMainTab(this.ofModule));
                break;

            case TabButtonActionConst.BEFORE_NEW_OTHER_TAB:
                this.store.dispatch(this.processDataActions.formDirty(false, this.ofModule));
                this.store.dispatch(this.processDataActions.formValid(true, this.ofModule));
                this.store.dispatch(this.processDataActions.turnOffFormEditMode(this.ofModule));
                this.store.dispatch(this.processDataActions.turnOffFormCloneMode(this.ofModule));
                this.store.dispatch(this.widgetDetailActions.canceAllWidgetEditing(this.ofModule));
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.NEW_OTHER_TAB, this.ofModule));
                this.store.dispatch(this.processDataActions.newOtherTab(this.ofModule));
                break;

            case TabButtonActionConst.NEW_MAIN_TAB:
            case TabButtonActionConst.NEW_MAIN_TAB_AND_OP_STORE_TEMPORARILY:
            case TabButtonActionConst.NEW_MAIN_TAB_AND_OP_SAVE_AND_RUN_AS_PRINT:
            case TabButtonActionConst.NEW_MAIN_TAB_AND_OP_SAVE_AND_RUN_AS_EMAIL:
                this.store.dispatch(this.processDataActions.turnOffFormEditMode(this.ofModule));
                this.store.dispatch(this.processDataActions.turnOffFormCloneMode(this.ofModule));
                this.store.dispatch(this.processDataActions.viewMode(this.ofModule));
                this.store.dispatch(this.parkedItemActions.removeDraftItem(this.ofModule));
                this.store.dispatch(this.parkedItemActions.selectPreviousParkedItem(this.ofModule));

                if (this.selectedEntity && this.selectedEntity.hasOwnProperty('selectedParkedItem')) {
                    this.store.dispatch(this.moduleActions.moveSelectedParkedItemToTop(this.ofModule, this.selectedEntity.selectedParkedItem));
                }

                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.FIRST_LOAD, this.ofModule));
                break;

            case TabButtonActionConst.NEW_OTHER_TAB:
            case TabButtonActionConst.NEW_OTHER_TAB_AND_OP_STORE_TEMPORARILY:
            case TabButtonActionConst.NEW_OTHER_TAB_AND_OP_SAVE_AND_RUN_AS_PRINT:
            case TabButtonActionConst.NEW_OTHER_TAB_AND_OP_SAVE_AND_RUN_AS_EMAIL:
                this.store.dispatch(this.processDataActions.turnOffFormEditMode(this.ofModule));
                this.store.dispatch(this.processDataActions.turnOffFormCloneMode(this.ofModule));
                this.store.dispatch(this.processDataActions.viewMode(this.ofModule));
                this.store.dispatch(this.parkedItemActions.requestTogglePanel(true, this.ofModule));
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.FIRST_LOAD, this.ofModule));
                break;

            case TabButtonActionConst.EDIT_MAIN_TAB:
            case TabButtonActionConst.EDIT_MAIN_TAB_AND_OP_STORE_TEMPORARILY:
            case TabButtonActionConst.EDIT_MAIN_TAB_AND_OP_SAVE_AND_RUN_AS_PRINT:
            case TabButtonActionConst.EDIT_MAIN_TAB_AND_OP_SAVE_AND_RUN_AS_EMAIL:
            case TabButtonActionConst.CLONE_MAIN_TAB:
                this.store.dispatch(this.processDataActions.turnOffFormEditMode(this.ofModule));
                this.store.dispatch(this.processDataActions.turnOffFormCloneMode(this.ofModule));
                this.store.dispatch(this.processDataActions.viewMode(this.ofModule));
                this.store.dispatch(this.parkedItemActions.selectPreviousParkedItem(this.ofModule));

                if (this.selectedEntity && this.selectedEntity.hasOwnProperty('selectedParkedItem')) {
                    this.store.dispatch(this.moduleActions.moveSelectedParkedItemToTop(this.ofModule, this.selectedEntity.selectedParkedItem));
                }

                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.FIRST_LOAD, this.ofModule));
                break;

            case TabButtonActionConst.BEFORE_EDIT_OTHER_TAB:
                this.store.dispatch(this.widgetDetailActions.canceAllWidgetEditing(this.ofModule));
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.EDIT_OTHER_TAB, this.ofModule));
                this.store.dispatch(this.processDataActions.newOtherTab(this.ofModule));
                break;

            case TabButtonActionConst.BEFORE_CLONE_OTHER_TAB:
                this.store.dispatch(this.widgetDetailActions.canceAllWidgetEditing(this.ofModule));
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.CLONE_OTHER_TAB, this.ofModule));
                this.store.dispatch(this.processDataActions.newOtherTab(this.ofModule));
                break;

            case TabButtonActionConst.EDIT_OTHER_TAB:
            case TabButtonActionConst.EDIT_OTHER_TAB_AND_OP_STORE_TEMPORARILY:
            case TabButtonActionConst.EDIT_OTHER_TAB_AND_OP_SAVE_AND_RUN_AS_PRINT:
            case TabButtonActionConst.EDIT_OTHER_TAB_AND_OP_SAVE_AND_RUN_AS_EMAIL:
            case TabButtonActionConst.CLONE_OTHER_TAB:
                this.store.dispatch(this.processDataActions.turnOffFormEditMode(this.ofModule));
                this.store.dispatch(this.processDataActions.turnOffFormCloneMode(this.ofModule));
                this.store.dispatch(this.processDataActions.viewMode(this.ofModule));
                this.store.dispatch(this.parkedItemActions.selectPreviousParkedItem(this.ofModule));

                if (this.selectedEntity && this.selectedEntity.hasOwnProperty('selectedParkedItem')) {
                    this.store.dispatch(this.moduleActions.moveSelectedParkedItemToTop(this.ofModule, this.selectedEntity.selectedParkedItem));
                }

                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.FIRST_LOAD, this.ofModule));
                break;

            case TabButtonActionConst.CHANGE_TAB:
                if (!this.isViewMode) {
                    this.store.dispatch(this.processDataActions.formDirty(false, this.ofModule));
                    this.store.dispatch(this.processDataActions.formValid(true, this.ofModule));
                    this.store.dispatch(this.processDataActions.turnOffFormEditMode(this.ofModule));
                    this.store.dispatch(this.processDataActions.turnOffFormCloneMode(this.ofModule));
                    this.store.dispatch(this.widgetDetailActions.canceAllWidgetEditing(this.ofModule));
                    this.store.dispatch(this.processDataActions.viewMode(this.ofModule));
                } else if (this.ofModule.idSettingsGUI == MenuModuleId.orderDataEntry) {
                    this.store.dispatch(this.processDataActions.formDirty(false, this.ofModule));
                    this.store.dispatch(this.processDataActions.formValid(true, this.ofModule));
                    this.store.dispatch(this.widgetDetailActions.canceAllWidgetEditing(this.ofModule));
                }
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.FIRST_LOAD, this.ofModule));
                this.store.dispatch(this.processDataActions.okToChangeTab(this.ofModule));
                break;

            case TabButtonActionConst.REMOVE_TAB:
                if (!this.isViewMode) {
                    this.store.dispatch(this.processDataActions.formDirty(false, this.ofModule));
                    this.store.dispatch(this.processDataActions.formValid(true, this.ofModule));
                    this.store.dispatch(this.processDataActions.turnOffFormEditMode(this.ofModule));
                    this.store.dispatch(this.processDataActions.turnOffFormCloneMode(this.ofModule));
                    this.store.dispatch(this.widgetDetailActions.canceAllWidgetEditing(this.ofModule));
                    this.store.dispatch(this.processDataActions.viewMode(this.ofModule));
                } else if (this.ofModule.idSettingsGUI == MenuModuleId.orderDataEntry) {
                    this.store.dispatch(this.processDataActions.formDirty(false, this.ofModule));
                    this.store.dispatch(this.processDataActions.formValid(true, this.ofModule));
                    this.store.dispatch(this.widgetDetailActions.canceAllWidgetEditing(this.ofModule));
                    this.store.dispatch(this.parkedItemActions.requestReloadList(this.ofModule));
                }
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.FIRST_LOAD, this.ofModule));
                this.store.dispatch(this.processDataActions.okToRemoveTab(this.ofModule));
                break;

            case TabButtonActionConst.CREATE_NEW_FROM_MODULE_DROPDOWN:
                this.store.dispatch(this.processDataActions.turnOffFormEditMode(this.ofModule));
                this.store.dispatch(this.processDataActions.turnOffFormCloneMode(this.ofModule));
                this.store.dispatch(this.widgetDetailActions.canceAllWidgetEditing(this.ofModule));
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.FIRST_LOAD, this.ofModule));
                this.store.dispatch(this.processDataActions.viewMode(this.ofModule));
                this.store.dispatch(this.processDataActions.okToCreateNewFromModuleDropdown(this.ofModule));
                break;

            case TabButtonActionConst.CHANGE_MODULE:
                //this.store.dispatch(this.processDataActions.turnOffFormEditMode(this.ofModule));
                //this.store.dispatch(this.processDataActions.turnOffFormCloneMode(this.ofModule));
                //this.store.dispatch(this.widgetDetailActions.canceAllWidgetEditing(this.ofModule));
                //this.store.dispatch(this.processDataActions.viewMode(this.ofModule));
                //this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.FIRST_LOAD, this.ofModule));
                this.store.dispatch(this.processDataActions.okToChangeModule(this.ofModule));
                break;

            case TabButtonActionConst.CHANGE_SUB_MODULE:
                //this.store.dispatch(this.processDataActions.turnOffFormEditMode(this.ofModule));
                //this.store.dispatch(this.processDataActions.turnOffFormCloneMode(this.ofModule));
                //this.store.dispatch(this.widgetDetailActions.canceAllWidgetEditing(this.ofModule));
                //this.store.dispatch(this.processDataActions.viewMode(this.ofModule));
                //this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.FIRST_LOAD, this.ofModule));
                this.store.dispatch(this.processDataActions.okToChangeSubModule(this.ofModule));
                break;

            case TabButtonActionConst.SAVE_AND_NEW_MAIN_TAB:
            case TabButtonActionConst.SAVE_AND_CLOSE_MAIN_TAB:
                this.store.dispatch(this.processDataActions.turnOffFormEditMode(this.ofModule));
                this.store.dispatch(this.processDataActions.turnOffFormCloneMode(this.ofModule));
                this.store.dispatch(this.processDataActions.viewMode(this.ofModule));
                this.store.dispatch(this.parkedItemActions.removeDraftItem(this.ofModule));
                this.store.dispatch(this.parkedItemActions.selectPreviousParkedItem(this.ofModule));

                if (this.selectedEntity && this.selectedEntity.hasOwnProperty('selectedParkedItem')) {
                    this.store.dispatch(this.moduleActions.moveSelectedParkedItemToTop(this.ofModule, this.selectedEntity.selectedParkedItem));
                }

                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.FIRST_LOAD, this.ofModule));
                break;

            case TabButtonActionConst.SAVE_AND_NEW_OTHER_TAB:
            case TabButtonActionConst.SAVE_AND_CLOSE_OTHER_TAB:
                this.store.dispatch(this.processDataActions.turnOffFormEditMode(this.ofModule));
                this.store.dispatch(this.processDataActions.turnOffFormCloneMode(this.ofModule));
                this.store.dispatch(this.processDataActions.viewMode(this.ofModule));
                this.store.dispatch(this.parkedItemActions.selectPreviousParkedItem(this.ofModule));

                if (this.selectedEntity && this.selectedEntity.hasOwnProperty('selectedParkedItem')) {
                    this.store.dispatch(this.moduleActions.moveSelectedParkedItemToTop(this.ofModule, this.selectedEntity.selectedParkedItem));
                }

                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.FIRST_LOAD, this.ofModule));
                break;

            case TabButtonActionConst.BEFORE_CLOSE:
                this.store.dispatch(this.processDataActions.turnOffFormEditMode(this.ofModule));
                this.store.dispatch(this.processDataActions.turnOffFormCloneMode(this.ofModule));
                this.store.dispatch(this.widgetDetailActions.canceAllWidgetEditing(this.ofModule));
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.FIRST_LOAD, this.ofModule));
                this.processClose();
                break;

            case TabButtonActionConst.SAVE_AND_NEXT:
            case TabButtonActionConst.SAVE_AND_NEXT_SECOND_STEP:
                this.store.dispatch(this.processDataActions.turnOffFormEditMode(this.ofModule));
                this.store.dispatch(this.processDataActions.turnOffFormCloneMode(this.ofModule));
                this.store.dispatch(this.processDataActions.viewMode(this.ofModule));
                this.store.dispatch(this.parkedItemActions.removeDraftItem(this.ofModule));
                this.store.dispatch(this.parkedItemActions.selectPreviousParkedItem(this.ofModule));

                if (this.selectedEntity && this.selectedEntity.hasOwnProperty('selectedParkedItem')) {
                    this.store.dispatch(this.moduleActions.moveSelectedParkedItemToTop(this.ofModule, this.selectedEntity.selectedParkedItem));
                }

                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.FIRST_LOAD, this.ofModule));
                break;

            case TabButtonActionConst.EDIT_MAIN_TAB_AND_GO_TO_FIRST_STEP:
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.EDIT_MAIN_TAB, this.ofModule));
                this.store.dispatch(this.processDataActions.okToGoToFirstStep(this.ofModule));
                break;

            case TabButtonActionConst.EDIT_MAIN_TAB_AND_GO_TO_SECOND_STEP:
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.EDIT_MAIN_TAB, this.ofModule));
                this.store.dispatch(this.processDataActions.okToGoToSecondStep(this.ofModule));
                break;

            case TabButtonActionConst.EDIT_OTHER_TAB_AND_GO_TO_FIRST_STEP:
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.EDIT_OTHER_TAB, this.ofModule));
                this.store.dispatch(this.processDataActions.okToGoToFirstStep(this.ofModule));
                break;

            case TabButtonActionConst.EDIT_OTHER_TAB_AND_GO_TO_SECOND_STEP:
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.EDIT_OTHER_TAB, this.ofModule));
                this.store.dispatch(this.processDataActions.okToGoToSecondStep(this.ofModule));
                break;

            case TabButtonActionConst.EDIT_MAIN_TAB_AND_CHANGE_BUSINESS_COST_ROW:
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.EDIT_MAIN_TAB, this.ofModule));
                this.store.dispatch(this.processDataActions.okToChangeBusinessCostRow(this.ofModule));
                break;

            case TabButtonActionConst.EDIT_OTHER_TAB_AND_CHANGE_BUSINESS_COST_ROW:
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.EDIT_OTHER_TAB, this.ofModule));
                this.store.dispatch(this.processDataActions.okToChangeBusinessCostRow(this.ofModule));
                break;

            case TabButtonActionConst.NEW_MAIN_TAB_AND_CHANGE_MODULE:
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.NEW_MAIN_TAB, this.ofModule));
                this.store.dispatch(this.processDataActions.okToChangeModule(this.ofModule));
                break;

            case TabButtonActionConst.NEW_OTHER_TAB_AND_CHANGE_MODULE:
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.NEW_OTHER_TAB, this.ofModule));
                this.store.dispatch(this.processDataActions.okToChangeModule(this.ofModule));
                break;

            case TabButtonActionConst.EDIT_MAIN_TAB_AND_CHANGE_MODULE:
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.EDIT_MAIN_TAB, this.ofModule));
                this.store.dispatch(this.processDataActions.okToChangeModule(this.ofModule));
                break;

            case TabButtonActionConst.EDIT_OTHER_TAB_AND_CHANGE_MODULE:
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.EDIT_OTHER_TAB, this.ofModule));
                this.store.dispatch(this.processDataActions.okToChangeModule(this.ofModule));
                break;

            case TabButtonActionConst.EDIT_SIMPLE_TAB:
            case TabButtonActionConst.CLONE_SIMPLE_TAB:
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.FIRST_LOAD, this.ofModule));
                this.store.dispatch(this.processDataActions.turnOffFormEditMode(this.ofModule));
                this.store.dispatch(this.processDataActions.turnOffFormCloneMode(this.ofModule));
                this.store.dispatch(this.processDataActions.viewMode(this.ofModule));
                this.store.dispatch(this.parkedItemActions.selectPreviousParkedItem(this.ofModule));
                break;

            case TabButtonActionConst.RELOAD_ORDER_DATA_ENTRY:
                this.store.dispatch(this.widgetDetailActions.canceAllWidgetEditing(this.ofModule));
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.FIRST_LOAD, this.ofModule));
                break;
        }

        this.store.dispatch(this.tabSummaryActions.toggleTabButton(false, this.ofModule));
        this.setTabButtonState('disabled', [{ save: false }, { saveAndNew: false }, { saveAndClose: false }, { saveAndNext: false }]);
    }

    private onModalCancel() {
        switch (this.currentAction) {
            case TabButtonActionConst.CHANGE_MODULE:
            case TabButtonActionConst.CHANGE_SUB_MODULE:
            case TabButtonActionConst.CHANGE_TAB:
            case TabButtonActionConst.REMOVE_TAB:
            case TabButtonActionConst.CREATE_NEW_FROM_MODULE_DROPDOWN:
            case TabButtonActionConst.BEFORE_EDIT_OTHER_TAB:
            case TabButtonActionConst.RELOAD_ORDER_DATA_ENTRY:
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.FIRST_LOAD, this.ofModule));
                break;

            case TabButtonActionConst.EDIT_MAIN_TAB_AND_GO_TO_FIRST_STEP:
            case TabButtonActionConst.EDIT_MAIN_TAB_AND_GO_TO_SECOND_STEP:
            case TabButtonActionConst.EDIT_MAIN_TAB_AND_CHANGE_BUSINESS_COST_ROW:
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.EDIT_MAIN_TAB, this.ofModule));
                break;

            case TabButtonActionConst.EDIT_OTHER_TAB_AND_GO_TO_FIRST_STEP:
            case TabButtonActionConst.EDIT_OTHER_TAB_AND_GO_TO_SECOND_STEP:
            case TabButtonActionConst.EDIT_OTHER_TAB_AND_CHANGE_BUSINESS_COST_ROW:
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.EDIT_OTHER_TAB, this.ofModule));
                break;

            case TabButtonActionConst.NEW_MAIN_TAB_AND_CHANGE_MODULE:
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.NEW_MAIN_TAB, this.ofModule));
                break;

            case TabButtonActionConst.NEW_OTHER_TAB_AND_CHANGE_MODULE:
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.NEW_OTHER_TAB, this.ofModule));
                break;

            case TabButtonActionConst.EDIT_MAIN_TAB_AND_CHANGE_MODULE:
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.EDIT_MAIN_TAB, this.ofModule));
                break;

            case TabButtonActionConst.EDIT_OTHER_TAB_AND_CHANGE_MODULE:
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.EDIT_OTHER_TAB, this.ofModule));
                break;

            case TabButtonActionConst.BEFORE_CLOSE:
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.FIRST_LOAD, this.ofModule));
                this.requestClose = false;
                break;
        }

        this.setTabButtonState('disabled', [{ save: false }, { saveAndNew: false }, { saveAndClose: false }, { saveAndNext: false }]);
    }

    private processClose() {
        this.requestClose = false;
        this.store.dispatch(this.processDataActions.turnOffFormEditMode(this.ofModule));
        this.store.dispatch(this.processDataActions.turnOffFormCloneMode(this.ofModule));
        this.store.dispatch(this.widgetDetailActions.canceAllWidgetEditing(this.ofModule));
        this.store.dispatch(this.moduleActions.clearActiveModule());
        this.store.dispatch(this.moduleActions.clearActiveSubModule());
        this.store.dispatch(this.parkedItemActions.unselectParkedItem(this.ofModule));
        this.store.dispatch(this.tabSummaryActions.toggleTabButton(false, this.ofModule));
        this.store.dispatch(this.processDataActions.clearSearchResult(this.ofModule));
        this.store.dispatch(this.propertyPanelActions.togglePanel(this.ofModule, false));
        this.setTabButtonState('disabled', [{ save: false }, { saveAndNew: false }, { saveAndClose: false }, { saveAndNext: false }]);
        this.store.dispatch(this.moduleActions.removeWorkingModule(this.ofModule));
        this.store.dispatch(this.processDataActions.setSelectedEntity(this.ofModule, null));
        this.store.dispatch(this.widgetDetailActions.toggleEditAllWidgetMode(false, this.ofModule));

        this.router.navigate([Configuration.rootPrivateUrl]);
    }

    private processNewMainTabSuccess(parkedItemsState) {
        const newInsertedItem = parkedItemsState.find(item => item.isNewInsertedItem);
        if (newInsertedItem &&
            newInsertedItem[this.modulePrimaryKey] &&
            !isEmpty(newInsertedItem[this.modulePrimaryKey])) {
            // && newInsertedItem[this.modulePrimaryKey].value === this.newMainTabResultId) {

            this.store.dispatch(this.parkedItemActions.removeDraftItem(this.ofModule));
            this.store.dispatch(this.processDataActions.formValid(true, this.ofModule));
            this.store.dispatch(this.processDataActions.formDirty(false, this.ofModule));

            if (this.currentAction !== TabButtonActionConst.SAVE_AND_NEXT) {
                this.store.dispatch(this.parkedItemActions.requestSaveParkedItemList(this.ofModule));
            }

            this.toasterService.pop('success', 'Success', this.ofModule.moduleName + ' added successfully');

            this.newMainTabResultId = null;
            this.newOtherTabResultId = null;

            this.store.dispatch(this.processDataActions.clearSaveResult(this.ofModule));

            switch (this.currentAction) {
                case TabButtonActionConst.SAVE_AND_NEW_MAIN_TAB:
                    this.store.dispatch(this.processDataActions.turnOffFormEditMode(this.ofModule));
                    this.store.dispatch(this.processDataActions.turnOffFormCloneMode(this.ofModule));
                    this.store.dispatch(this.processDataActions.viewMode(this.ofModule));
                    this.store.dispatch(this.widgetDetailActions.canceAllWidgetEditing(this.ofModule));
                    this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.NEW_MAIN_TAB, this.ofModule));
                    this.store.dispatch(this.processDataActions.newMainTab(this.ofModule));
                    break;

                case TabButtonActionConst.SAVE_AND_CLOSE_MAIN_TAB:
                    this.store.dispatch(this.processDataActions.turnOffFormEditMode(this.ofModule));
                    this.store.dispatch(this.processDataActions.turnOffFormCloneMode(this.ofModule));
                    this.store.dispatch(this.processDataActions.viewMode(this.ofModule));
                    this.store.dispatch(this.widgetDetailActions.canceAllWidgetEditing(this.ofModule));
                    this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.FIRST_LOAD, this.ofModule));
                    this.store.dispatch(this.parkedItemActions.selectParkedItem(newInsertedItem, this.ofModule));
                    this.store.dispatch(this.moduleActions.moveSelectedParkedItemToTop(this.ofModule, newInsertedItem));
                    break;

                case TabButtonActionConst.CHANGE_PARKED_ITEM_FROM_MAIN_TAB:
                    this.store.dispatch(this.processDataActions.turnOffFormEditMode(this.ofModule));
                    this.store.dispatch(this.processDataActions.turnOffFormCloneMode(this.ofModule));
                    this.store.dispatch(this.processDataActions.viewMode(this.ofModule));
                    this.store.dispatch(this.widgetDetailActions.canceAllWidgetEditing(this.ofModule));
                    this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.FIRST_LOAD, this.ofModule));
                    this.store.dispatch(this.processDataActions.okToChangeParkedItem(this.ofModule));
                    break;

                case TabButtonActionConst.CHANGE_PARKED_ITEM_FROM_OTHER_TAB:
                    this.store.dispatch(this.processDataActions.turnOffFormEditMode(this.ofModule));
                    this.store.dispatch(this.processDataActions.turnOffFormCloneMode(this.ofModule));
                    this.store.dispatch(this.processDataActions.viewMode(this.ofModule));
                    this.store.dispatch(this.widgetDetailActions.canceAllWidgetEditing(this.ofModule));
                    this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.FIRST_LOAD, this.ofModule));
                    this.store.dispatch(this.processDataActions.okToChangeParkedItem(this.ofModule));
                    break;

                case TabButtonActionConst.CHANGE_SEARCH_RESULT_FROM_MAIN_TAB:
                    this.store.dispatch(this.processDataActions.turnOffFormEditMode(this.ofModule));
                    this.store.dispatch(this.processDataActions.turnOffFormCloneMode(this.ofModule));
                    this.store.dispatch(this.processDataActions.viewMode(this.ofModule));
                    this.store.dispatch(this.widgetDetailActions.canceAllWidgetEditing(this.ofModule));
                    this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.FIRST_LOAD, this.ofModule));
                    this.store.dispatch(this.processDataActions.okToChangeSearchResult(this.ofModule));
                    break;

                case TabButtonActionConst.CHANGE_SEARCH_RESULT_FROM_OTHER_TAB:
                    this.store.dispatch(this.processDataActions.turnOffFormEditMode(this.ofModule));
                    this.store.dispatch(this.processDataActions.turnOffFormCloneMode(this.ofModule));
                    this.store.dispatch(this.processDataActions.viewMode(this.ofModule));
                    this.store.dispatch(this.widgetDetailActions.canceAllWidgetEditing(this.ofModule));
                    this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.FIRST_LOAD, this.ofModule));
                    this.store.dispatch(this.processDataActions.okToChangeSearchResult(this.ofModule));
                    break;

                case TabButtonActionConst.CHANGE_MODULE:
                    this.store.dispatch(this.processDataActions.turnOffFormEditMode(this.ofModule));
                    this.store.dispatch(this.processDataActions.turnOffFormCloneMode(this.ofModule));
                    this.store.dispatch(this.processDataActions.viewMode(this.ofModule));
                    this.store.dispatch(this.widgetDetailActions.canceAllWidgetEditing(this.ofModule));
                    this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.FIRST_LOAD, this.ofModule));
                    this.store.dispatch(this.processDataActions.okToChangeModule(this.ofModule));
                    break;

                case TabButtonActionConst.CHANGE_SUB_MODULE:
                    this.store.dispatch(this.processDataActions.turnOffFormEditMode(this.ofModule));
                    this.store.dispatch(this.processDataActions.turnOffFormCloneMode(this.ofModule));
                    this.store.dispatch(this.processDataActions.viewMode(this.ofModule));
                    this.store.dispatch(this.widgetDetailActions.canceAllWidgetEditing(this.ofModule));
                    this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.FIRST_LOAD, this.ofModule));
                    this.store.dispatch(this.processDataActions.okToChangeSubModule(this.ofModule));
                    break;

                case TabButtonActionConst.SAVE_AND_NEXT:
                    this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.SAVE_AND_NEXT_SECOND_STEP, this.ofModule));
                    this.store.dispatch(this.parkedItemActions.selectParkedItem(newInsertedItem, this.ofModule));
                    this.store.dispatch(this.moduleActions.moveSelectedParkedItemToTop(this.ofModule, newInsertedItem));
                    break;

                case TabButtonActionConst.SAVE_ONLY_MAIN_TAB:
                    this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.EDIT_MAIN_TAB, this.ofModule));
                    this.store.dispatch(this.parkedItemActions.selectParkedItem(newInsertedItem, this.ofModule));
                    this.store.dispatch(this.moduleActions.moveSelectedParkedItemToTop(this.ofModule, newInsertedItem));
                    break;

                case TabButtonActionConst.NEW_MAIN_TAB_AND_OP_STORE_TEMPORARILY:
                case TabButtonActionConst.NEW_OTHER_TAB_AND_OP_STORE_TEMPORARILY:
                    this.store.dispatch(this.processDataActions.turnOffFormEditMode(this.ofModule));
                    this.store.dispatch(this.processDataActions.turnOffFormCloneMode(this.ofModule));
                    this.store.dispatch(this.processDataActions.viewMode(this.ofModule));
                    this.store.dispatch(this.widgetDetailActions.canceAllWidgetEditing(this.ofModule));
                    this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.FIRST_LOAD, this.ofModule));
                    this.store.dispatch(this.parkedItemActions.selectParkedItem(newInsertedItem, this.ofModule));
                    this.store.dispatch(this.moduleActions.moveSelectedParkedItemToTop(this.ofModule, newInsertedItem));
                    break;
            }

            this.store.dispatch(this.tabSummaryActions.toggleTabButton(false, this.ofModule));
        }
        this.setTabButtonState('disabled', [{ save: false }, { saveAndNew: false }, { saveAndClose: false }, { saveAndNext: false }]);
    }

    private processEditMainTabSuccess() {
        const editedItem = this.parkedItems.find(i => i[this.modulePrimaryKey].value == this.editMainTabResultId);

        this.store.dispatch(this.processDataActions.formValid(true, this.ofModule));
        this.store.dispatch(this.processDataActions.formDirty(false, this.ofModule));
        this.toasterService.pop('success', 'Success', 'Edit ' + this.ofModule.moduleName + ' successfully');

        this.editMainTabResultId = null;

        this.store.dispatch(this.processDataActions.clearSaveResult(this.ofModule));

        switch (this.currentAction) {
            case TabButtonActionConst.EDIT_AND_SAVE_AND_CLOSE_MAIN_TAB:
            case TabButtonActionConst.EDIT_MAIN_TAB_AND_OP_STORE_TEMPORARILY:
                this.store.dispatch(this.processDataActions.turnOffFormEditMode(this.ofModule));
                this.store.dispatch(this.processDataActions.turnOffFormCloneMode(this.ofModule));
                this.store.dispatch(this.widgetDetailActions.canceAllWidgetEditing(this.ofModule));
                this.store.dispatch(this.processDataActions.viewMode(this.ofModule));
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.FIRST_LOAD, this.ofModule));
                if (editedItem) {
                    this.store.dispatch(this.parkedItemActions.selectParkedItem(editedItem, this.ofModule));
                    this.store.dispatch(this.moduleActions.moveSelectedParkedItemToTop(this.ofModule, editedItem));
                }                
                break;

            case TabButtonActionConst.EDIT_AND_SAVE_AND_NEXT_MAIN_TAB:
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.EDIT_AND_SAVE_AND_NEXT_SECOND_STEP, this.ofModule));
                this.store.dispatch(this.parkedItemActions.selectParkedItem(editedItem, this.ofModule));
                this.store.dispatch(this.moduleActions.moveSelectedParkedItemToTop(this.ofModule, editedItem));
                break;

            case TabButtonActionConst.EDIT_AND_SAVE_ONLY_MAIN_TAB:
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.EDIT_MAIN_TAB, this.ofModule));
                this.store.dispatch(this.parkedItemActions.selectParkedItem(editedItem, this.ofModule));
                break;

            case TabButtonActionConst.EDIT_MAIN_TAB_AND_GO_TO_FIRST_STEP:
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.EDIT_MAIN_TAB, this.ofModule));
                this.store.dispatch(this.processDataActions.okToGoToFirstStep(this.ofModule));
                break;

            case TabButtonActionConst.EDIT_MAIN_TAB_AND_GO_TO_SECOND_STEP:
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.EDIT_MAIN_TAB, this.ofModule));
                this.store.dispatch(this.processDataActions.okToGoToSecondStep(this.ofModule));
                break;

            case TabButtonActionConst.EDIT_MAIN_TAB_AND_CHANGE_BUSINESS_COST_ROW:
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.EDIT_MAIN_TAB, this.ofModule));
                this.store.dispatch(this.processDataActions.okToChangeBusinessCostRow(this.ofModule));
                break;

            case TabButtonActionConst.SAVE_ONLY_OTHER_TAB:
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.EDIT_OTHER_TAB, this.ofModule));
                this.store.dispatch(this.parkedItemActions.selectParkedItem(editedItem, this.ofModule));
                break;

        }

        this.store.dispatch(this.tabSummaryActions.toggleTabButton(false, this.ofModule));
        this.setTabButtonState('disabled', [{ save: false }, { saveAndNew: false }, { saveAndClose: false }, { saveAndNext: false }]);
    }

    private processNewOtherTabSuccess() {
        this.store.dispatch(this.processDataActions.formValid(true, this.ofModule));
        this.store.dispatch(this.processDataActions.formDirty(false, this.ofModule));
        this.toasterService.pop('success', 'Success', this.selectedTab.tabSummaryInfor.tabName + ' added successfully');

        if (this.currentAction !== TabButtonActionConst.SAVE_AND_NEW_OTHER_TAB) {
            this.store.dispatch(this.processDataActions.turnOffFormEditMode(this.ofModule));
            this.store.dispatch(this.processDataActions.turnOffFormCloneMode(this.ofModule));
            this.store.dispatch(this.processDataActions.viewMode(this.ofModule));
            this.store.dispatch(this.widgetDetailActions.canceAllWidgetEditing(this.ofModule));
        }

        this.store.dispatch(this.processDataActions.clearSaveResult(this.ofModule));

        switch (this.currentAction) {
            case TabButtonActionConst.SAVE_AND_NEW_OTHER_TAB:
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.NEW_OTHER_TAB, this.ofModule));
                //this.store.dispatch(this.processDataActions.newOtherTab(this.ofModule));
                break;

            case TabButtonActionConst.SAVE_AND_CLOSE_OTHER_TAB:
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.FIRST_LOAD, this.ofModule));
                this.store.dispatch(this.tabSummaryActions.requestLoadTabs(this.ofModule));
                break;

            case TabButtonActionConst.CHANGE_PARKED_ITEM_FROM_MAIN_TAB:
                this.store.dispatch(this.parkedItemActions.removeDraftItem(this.ofModule));
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.FIRST_LOAD, this.ofModule));
                this.store.dispatch(this.processDataActions.okToChangeParkedItem(this.ofModule));
                break;

            case TabButtonActionConst.CHANGE_PARKED_ITEM_FROM_OTHER_TAB:
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.FIRST_LOAD, this.ofModule));
                this.store.dispatch(this.processDataActions.okToChangeParkedItem(this.ofModule));
                break;

            case TabButtonActionConst.CHANGE_SEARCH_RESULT_FROM_MAIN_TAB:
                this.store.dispatch(this.parkedItemActions.removeDraftItem(this.ofModule));
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.FIRST_LOAD, this.ofModule));
                this.store.dispatch(this.processDataActions.okToChangeSearchResult(this.ofModule));
                break;

            case TabButtonActionConst.CHANGE_SEARCH_RESULT_FROM_OTHER_TAB:
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.FIRST_LOAD, this.ofModule));
                this.store.dispatch(this.processDataActions.okToChangeSearchResult(this.ofModule));
                break;

            case TabButtonActionConst.CREATE_NEW_FROM_MODULE_DROPDOWN:
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.FIRST_LOAD, this.ofModule));
                this.store.dispatch(this.processDataActions.okToCreateNewFromModuleDropdown(this.ofModule));
                break;
        }

        this.store.dispatch(this.tabSummaryActions.toggleTabButton(false, this.ofModule));
        this.setTabButtonState('disabled', [{ save: false }, { saveAndNew: false }, { saveAndClose: false }, { saveAndNext: false }]);
    }

    private processEditOtherTabSuccess() {
        this.store.dispatch(this.processDataActions.formValid(true, this.ofModule));
        this.store.dispatch(this.processDataActions.formDirty(false, this.ofModule));
        this.toasterService.pop('success', 'Success', 'Edit ' + this.selectedTab.tabSummaryInfor.tabName + ' successfully');

        this.store.dispatch(this.processDataActions.clearSaveResult(this.ofModule));

        switch (this.currentAction) {
            case TabButtonActionConst.EDIT_AND_SAVE_AND_CLOSE_OTHER_TAB:
            case TabButtonActionConst.EDIT_OTHER_TAB:
            case TabButtonActionConst.EDIT_OTHER_TAB_AND_OP_STORE_TEMPORARILY:
            case TabButtonActionConst.EDIT_OTHER_TAB_AND_OP_SAVE_AND_RUN_AS_EMAIL:
            case TabButtonActionConst.EDIT_OTHER_TAB_AND_OP_SAVE_AND_RUN_AS_PRINT:
                this.store.dispatch(this.processDataActions.turnOffFormEditMode(this.ofModule));
                this.store.dispatch(this.processDataActions.turnOffFormCloneMode(this.ofModule));
                this.store.dispatch(this.processDataActions.viewMode(this.ofModule));
                this.store.dispatch(this.widgetDetailActions.canceAllWidgetEditing(this.ofModule));
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.FIRST_LOAD, this.ofModule));
                this.store.dispatch(this.tabSummaryActions.requestLoadTabs(this.ofModule));
                break;

            case TabButtonActionConst.EDIT_AND_SAVE_ONLY_OTHER_TAB:
                this.store.dispatch(this.processDataActions.turnOffFormEditMode(this.ofModule));
                this.store.dispatch(this.processDataActions.turnOffFormCloneMode(this.ofModule));
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.EDIT_OTHER_TAB, this.ofModule));
                break;

            case TabButtonActionConst.EDIT_OTHER_TAB_AND_GO_TO_FIRST_STEP:
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.EDIT_OTHER_TAB, this.ofModule));
                this.store.dispatch(this.processDataActions.okToGoToFirstStep(this.ofModule));
                break;

            case TabButtonActionConst.EDIT_OTHER_TAB_AND_GO_TO_SECOND_STEP:
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.EDIT_OTHER_TAB, this.ofModule));
                this.store.dispatch(this.processDataActions.okToGoToSecondStep(this.ofModule));
                break;

            case TabButtonActionConst.EDIT_OTHER_TAB_AND_CHANGE_BUSINESS_COST_ROW:
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.EDIT_OTHER_TAB, this.ofModule));
                this.store.dispatch(this.processDataActions.okToChangeBusinessCostRow(this.ofModule));
                break;
        }

        this.store.dispatch(this.tabSummaryActions.toggleTabButton(false, this.ofModule));
        this.setTabButtonState('disabled', [{ save: false }, { saveAndNew: false }, { saveAndClose: false }, { saveAndNext: false }]);
    }

    private saveFailed(saveResult) {
        // 0001059: Campaign - Validation message is wrong
        // isValid: true  : valid validation.
        // isValid: false : in-valid validation.
        if (saveResult.submitResult) {
            if (isNil(saveResult.returnID)) {
                this.toasterService.pop('error', 'Failed', saveResult.errorMessage || 'Save operation is not successful.');
            }
        } else {
            if (saveResult.isValid && !saveResult.isDirty) {
                this.toasterService.pop('warning', 'Validation Failed', saveResult.errorMessage || 'No entry data for saving!');
                //
            } else if (!saveResult.isValid) {
                this.toasterService.pop('warning', 'Validation Failed', saveResult.errorMessage || 'There are some fields do not pass validation!');
            }
        }
        this.store.dispatch(this.processDataActions.clearSaveResult(this.ofModule));

        switch (this.currentAction) {
            case TabButtonActionConst.EDIT_AND_SAVE_ONLY_MAIN_TAB:
            case TabButtonActionConst.EDIT_AND_SAVE_AND_CLOSE_MAIN_TAB:
            case TabButtonActionConst.EDIT_MAIN_TAB_AND_GO_TO_SECOND_STEP:
            case TabButtonActionConst.EDIT_MAIN_TAB_AND_GO_TO_FIRST_STEP:
            case TabButtonActionConst.EDIT_MAIN_TAB_AND_CHANGE_BUSINESS_COST_ROW:
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.EDIT_MAIN_TAB, this.ofModule));
                break;

            case TabButtonActionConst.EDIT_AND_SAVE_ONLY_OTHER_TAB:
            case TabButtonActionConst.EDIT_AND_SAVE_AND_CLOSE_OTHER_TAB:
            case TabButtonActionConst.EDIT_OTHER_TAB_AND_GO_TO_SECOND_STEP:
            case TabButtonActionConst.EDIT_OTHER_TAB_AND_GO_TO_FIRST_STEP:
            case TabButtonActionConst.EDIT_OTHER_TAB_AND_CHANGE_BUSINESS_COST_ROW:
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.EDIT_OTHER_TAB, this.ofModule));
                break;

            case TabButtonActionConst.SAVE_AND_CLOSE_MAIN_TAB:
            case TabButtonActionConst.SAVE_AND_NEXT:
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.NEW_MAIN_TAB, this.ofModule));
                break;

            case TabButtonActionConst.SAVE_AND_CLOSE_OTHER_TAB:
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.NEW_OTHER_TAB, this.ofModule));
                break;

            case TabButtonActionConst.SAVE_ORDER_DATA_ENTRY:
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.FIRST_LOAD, this.ofModule));
                break;
        }

        this.setTabButtonState('disabled', [{ save: false }, { saveAndNew: false }, { saveAndClose: false }, { saveAndNext: false }]);
    }

    private processNewMainTabSuccessThenBackToViewMode() {
        this.store.dispatch(this.processDataActions.formValid(true, this.ofModule));
        this.store.dispatch(this.processDataActions.formDirty(false, this.ofModule));

        this.toasterService.pop('success', 'Success', this.ofModule.moduleName + ' added successfully');

        this.newMainTabResultId = null;

        this.store.dispatch(this.processDataActions.clearSaveResult(this.ofModule));

        this.store.dispatch(this.processDataActions.turnOffFormEditMode(this.ofModule));
        this.store.dispatch(this.processDataActions.turnOffFormCloneMode(this.ofModule));
        this.store.dispatch(this.processDataActions.viewMode(this.ofModule));
        this.store.dispatch(this.widgetDetailActions.canceAllWidgetEditing(this.ofModule));
        this.store.dispatch(this.parkedItemActions.removeDraftItem(this.ofModule));
        this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.FIRST_LOAD, this.ofModule));
        this.setTabButtonState('disabled', [{ save: false }, { saveAndNew: false }, { saveAndClose: false }, { saveAndNext: false }]);
    }

    private processSaveOrderDataEntrySuccess() {
        this.store.dispatch(this.processDataActions.formValid(true, this.ofModule));
        this.store.dispatch(this.processDataActions.formDirty(false, this.ofModule));
        this.toasterService.pop('success', 'Success', 'Save ' + this.ofModule.moduleName + ' successfully');

        if (Configuration.PublicSettings.enableOrderFailed) {
            this.store.dispatch(this.parkedItemActions.requestReloadList(this.ofModule));
        }

        switch (this.currentAction) {
            case TabButtonActionConst.SAVE_ORDER_DATA_ENTRY:
                this.store.dispatch(this.widgetDetailActions.canceAllWidgetEditing(this.ofModule));
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.FIRST_LOAD, this.ofModule));
                break;

            case TabButtonActionConst.SAVE_ORDER_DATA_ENTRY_AND_CHANGE_TAB:
                this.store.dispatch(this.widgetDetailActions.canceAllWidgetEditing(this.ofModule));
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.FIRST_LOAD, this.ofModule));
                this.store.dispatch(this.processDataActions.okToChangeTab(this.ofModule));
                break;

            case TabButtonActionConst.SAVE_ORDER_DATA_ENTRY_AND_REMOVE_TAB:
                this.store.dispatch(this.widgetDetailActions.canceAllWidgetEditing(this.ofModule));
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.FIRST_LOAD, this.ofModule));
                this.store.dispatch(this.processDataActions.okToRemoveTab(this.ofModule));
                break;

            case TabButtonActionConst.SAVE_ORDER_DATA_ENTRY_AND_RELOAD:
                this.store.dispatch(this.widgetDetailActions.canceAllWidgetEditing(this.ofModule));
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.FIRST_LOAD, this.ofModule));
                break;

        }
    }

    private getUnsavedDialogSettingFromGlobalSetting() {
        this.globalSettingService.getAllGlobalSettings(ModuleList.Base.idSettingsGUI).subscribe((globalSetting: any) => {
            this.appErrorHandler.executeAction(() => {
                this.showUnsavedDialog = this.getUnsavedDialogSetting(globalSetting);
            });
        });
    }

    private getUnsavedDialogSetting(globalSetting) {
        if (!globalSetting || !globalSetting.length) {
            return true;
        }

        let propertiesSettings = globalSetting.find(x => x.globalName === this.globalSettingConstant.globalWidgetProperties);
        if (!propertiesSettings || !propertiesSettings.idSettingsGlobal) {
            propertiesSettings = {};
            propertiesSettings.jsonSettings = JSON.stringify(this.propertyPanelService.createDefaultGlobalSettings());
        }

        const properties = JSON.parse(propertiesSettings.jsonSettings) as GlobalSettingModel[];
        if (properties && properties.length) {
            const propApplicationSetting: WidgetPropertyModel = this.propertyPanelService.getItemRecursive(properties, 'ApplicationSettings');
            if (propApplicationSetting) {
                const propUnsavedDialog = this.propertyPanelService.getItemRecursive(properties, 'UnsavedDialog');
                if (propUnsavedDialog) {
                    return propUnsavedDialog.value;
                }
            }
        }

        return true;
    }

    private getTabHeaderCollapseStateFromGlobalSetting() {
        this.globalSettingService.getAllGlobalSettings(this.ofModule.idSettingsGUI).subscribe((data: any) => {
            this.appErrorHandler.executeAction(() => {
                this.isTabCollapsed = this.getCollapseState(data);
                this.store.dispatch(this.tabSummaryActions.toggleTabHeader(this.isTabCollapsed, this.ofModule));
            });
        });
    }

    private getCollapseState(data) {
        if (!data || !data.length) {
            return false;
        }
        this.collapseStateSettings = data.find(x => x.globalName === this.globalSettingName);
        if (!this.collapseStateSettings || !this.collapseStateSettings.idSettingsGlobal) {
            return false;
        }
        const collapseStateSetting = JSON.parse(this.collapseStateSettings.jsonSettings);

        return (collapseStateSetting && collapseStateSetting.IsCollapsed);
    }

    private reloadAndSaveSetting() {
        this.globalSettingService.getAllGlobalSettings(this.ofModule.idSettingsGUI).subscribe((data: any) => {
            this.appErrorHandler.executeAction(() => {
                this.saveSetting(data);
            });
        });
    }
    private saveSetting(data: GlobalSettingModel[]) {
        if (!data || !Array.isArray(data)) return;
        this.collapseStateSettings = data.find(x => x.globalName === this.globalSettingName);
        if (!this.collapseStateSettings || !this.collapseStateSettings.idSettingsGlobal || !this.collapseStateSettings.globalName) {
            this.collapseStateSettings = new GlobalSettingModel({
                globalName: this.globalSettingName,
                description: 'Tab Header Collapse State',
                globalType: this.globalSettingConstant.tabHeaderCollapseState
            });
        }
        this.collapseStateSettings.idSettingsGUI = this.ofModule.idSettingsGUI;
        this.collapseStateSettings.jsonSettings = JSON.stringify({ IsCollapsed: this.isTabCollapsed });
        this.collapseStateSettings.isActive = true;

        this.globalSettingService.saveGlobalSetting(this.collapseStateSettings).subscribe(
            _data => this.saveSettingSuccess(_data),
            error => this.saveSettingError(error));
    }

    private getShowTabsNameToList(tabs: any[]): Array<string> {
        const result: Array<string> = [];
        for (const item of tabs) {
            result.push(item.TabID);
        }
        return result;
    }

    private saveSettingSuccess(data: any) {
        this.globalSettingService.saveUpdateCache(this.ofModule.idSettingsGUI, this.collapseStateSettings, data);
    }

    private saveSettingError(error) {
        console.log(error);
    }

    private getModule() {
        this.globalSettingName = uti.String.Format('{0}_{1}',
            this.globalSettingConstant.tabHeaderCollapseState,
            uti.String.hardTrimBlank(this.ofModule.moduleName));
    }

    public downloadPdf() {
        // this.store.dispatch(this.backofficeActions.requestDownloadPdf(this.ofModule));
    }

    public goToTrackingPage() {
        // this.store.dispatch(this.backofficeActions.requestGoToTrackingPage(this.ofModule));
    }

    public openReturnRefundModule() {
        // this.store.dispatch(this.backofficeActions.requestOpenReturnRefundModule(this.ofModule));
    }

    public confirmReturnRefund() {
        // this.store.dispatch(this.returnRefundActions.requestConfirm(this.ofModule));
    }

    public newInvoiceReturnRefund() {
        // this.store.dispatch(this.returnRefundActions.requestNewInvoice(this.ofModule));
    }

    private setTabButtonState(stateName: string, values: any[]) {
        values.forEach(val => {
            if (!isNil(val)) {
                this.TAB_BUTTON_STATE[Object.keys(val)[0]][stateName] = val[Object.keys(val)[0]];
            }
        });
    }

    private detectDataDirty(): void {
        this.saveButtonClass.dataDirty = this.formDirty || this.editingWidgets.length > 0;
    }

    /**
     * sendToAdmin
     */
    public sendToAdmin() {
        this.isSendToAdminLoading = true;
        this.store.dispatch(this.xnCommonActions.showFeedbackClicked(true));
        this.store.dispatch(this.xnCommonActions.storeFeedbacData({
            isSendToAdmin: true,
            tabID: this.selectedODETab.TabID
        }));
    }
    private subscribeShowSendToAdminCompleteState() {
        this.showSendToAdminCompleteSubscription = this.dispatcher.pipe(
            filter((action: CustomAction) => {
                return action.type === XnCommonActions.SHOW_FEEDBACK_COMPLETE;
            })
        ).subscribe(() => {
            this.appErrorHandler.executeAction(() => {
                this.isSendToAdminLoading = false;
                this.changeDetectorRef.markForCheck();
            });
        });
    }

    /**
     * print
     */
    public print() {
        // this.store.dispatch(this.dataEntryAction.dataEntryPrint(this.selectedODETab.TabID));
    }

    public confirmAllSortingGood(): void {
        // this.store.dispatch(this.warehouseMovementActions.requestCofirmAll(this.ofModule));
    }

    public refreshWidgets() {
        this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.REFRESH_TAB, this.ofModule));

        if (this.isWidgetInCurrentTabDirty()) {
            this.showReloadWidgetsDirtyWarningMessage();
        } else {
            this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.FIRST_LOAD, this.ofModule));
            this.store.dispatch(this.widgetDetailActions.requestRefreshWidgetsInTab(this.selectedTab.tabSummaryInfor.tabID, this.ofModule));
            this.refreshPageLayout();
        }
    }

    private refreshPageLayout() {
        this.globalSettingService.getAllGlobalSettingsRefreshPageLayout(this.ofModule.idSettingsGUI).subscribe((data: any) => {
            this.appErrorHandler.executeAction(() => {
                if (!data || !(data instanceof Array)) return;

                const globalSettingName = String.Format('{0}_{1}', this.globalSettingConstant.moduleLayoutSetting, String.hardTrimBlank(this.ofModule.moduleName));
                let globalSettingItem = data.find(x => x.globalName && x.idSettingsGlobal && x.globalName === globalSettingName);
                if (!globalSettingItem)
                    globalSettingItem = data.find(x => x.globalName === globalSettingName);

                if (globalSettingItem && globalSettingItem.jsonSettings) {
                    const moduleSetting = JSON.parse(globalSettingItem.jsonSettings);
                    if (moduleSetting.item) {
                        this.store.dispatch(this.moduleSettingActions.loadModuleSettingSuccess(moduleSetting.item, this.ofModule)); // Refresh layout
                    }
                }
            });
        });
    }

    private showReloadWidgetsDirtyWarningMessage() {
        let modalOptions: any = {
            headerText: 'Saving Widgets',
            message: [{ key: '<p>'}, { key: 'Modal_Message__DoYouWantToSaveTheseChanges' }, { key: '<p>' }],
            onModalSaveAndExit: () => {
                this.store.dispatch(this.widgetDetailActions.requestSave(this.ofModule));
            },
            onModalExit: () => {
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.FIRST_LOAD, this.ofModule));
                this.store.dispatch(this.widgetDetailActions.requestRefreshWidgetsInTab(this.selectedTab.tabSummaryInfor.tabID, this.ofModule));
            },
            onModalCancel: () => {
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.FIRST_LOAD, this.ofModule));
            },
            callBackFunc: () => {
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.FIRST_LOAD, this.ofModule));
            },
        };

        this.modalService.unsavedWarningMessage(modalOptions);
    }

    private isWidgetInCurrentTabDirty() {
        let dirtyWidgetsInCurrentTab = this.editingWidgets.filter(x => x.tabId == this.selectedTab.tabSummaryInfor.tabID);
        return dirtyWidgetsInCurrentTab.length > 0;
    }

    public toggleEditAllWidget() {
        this.isEditAllWidgetMode = !this.isEditAllWidgetMode;
        this.store.dispatch(this.widgetDetailActions.toggleEditAllWidgetMode(this.isEditAllWidgetMode, this.ofModule));

        if (this.isEditAllWidgetMode) {
            this.toasterService.pop('info', '', 'All widget has just switched to edit mode, so that you don\'t need to click edit for everytime updating');
        }
    }

    public buildFrequency() {
        this.store.dispatch(this.processDataActions.requestBuildFrequency(this.ofModule));
    }

    public getTabButtonAccessRight() {
        if (this.ofModule.idSettingsGUI === ModuleList.Document.idSettingsGUI) {
            this.docMButtonsAccessRight = {
                save: true,
                skip: true
            };
        }

        if (this.ofModule.idSettingsGUI == ModuleList.Orders.idSettingsGUI) {
            this.ordersButtonsAccessRight = {
                pdf: this.accessRightService.getAccessRight(AccessRightTypeEnum.TabButton, { idSettingsGUIParent: this.ofModule.idSettingsGUIParent, idSettingsGUI: this.ofModule.idSettingsGUI, tabID: this.selectedTab.tabSummaryInfor.tabID, buttonName: 'Pdf' }).read,
                tracking: this.accessRightService.getAccessRight(AccessRightTypeEnum.TabButton, { idSettingsGUIParent: this.ofModule.idSettingsGUIParent, idSettingsGUI: this.ofModule.idSettingsGUI, tabID: this.selectedTab.tabSummaryInfor.tabID, buttonName: 'Tracking' }).read,
                returnRefund: this.accessRightService.getAccessRight(AccessRightTypeEnum.TabButton, { idSettingsGUIParent: this.ofModule.idSettingsGUIParent, idSettingsGUI: this.ofModule.idSettingsGUI, tabID: this.selectedTab.tabSummaryInfor.tabID, buttonName: 'ReturnRefund' }).read,
            };
        }

        if (this.ofModule.idSettingsGUI == ModuleList.ReturnRefund.idSettingsGUI) {
            this.returnRefundButtonsAccessRight = {
                confirm: this.accessRightService.getAccessRight(AccessRightTypeEnum.TabButton, { idSettingsGUIParent: this.ofModule.idSettingsGUIParent, idSettingsGUI: this.ofModule.idSettingsGUI, tabID: this.selectedTab.tabSummaryInfor.tabID, buttonName: 'Confirm' }).read,
                newInvoice: this.accessRightService.getAccessRight(AccessRightTypeEnum.TabButton, { idSettingsGUIParent: this.ofModule.idSettingsGUIParent, idSettingsGUI: this.ofModule.idSettingsGUI, tabID: this.selectedTab.tabSummaryInfor.tabID, buttonName: 'NewInvoice' }).read,
            };
        }

        if (this.ofModule.idSettingsGUI == ModuleList.SystemManagement.idSettingsGUI) {
            this.sysManageWidgetTabButtonsAccessRight = {
                clone: this.accessRightService.getAccessRight(AccessRightTypeEnum.TabButton, { idSettingsGUIParent: this.ofModule.idSettingsGUIParent, idSettingsGUI: this.ofModule.idSettingsGUI, tabID: this.selectedTab.tabSummaryInfor.tabID, buttonName: 'Clone' }).read,
            };
        }
    }

    public storeTemporarily() {
        switch (this.currentAction) {
            case TabButtonActionConst.NEW_MAIN_TAB:
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.NEW_MAIN_TAB_AND_OP_STORE_TEMPORARILY, this.ofModule));
                break;
            case TabButtonActionConst.EDIT_MAIN_TAB:
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.EDIT_MAIN_TAB_AND_OP_STORE_TEMPORARILY, this.ofModule));
                break;
            case TabButtonActionConst.NEW_OTHER_TAB:
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.NEW_OTHER_TAB_AND_OP_STORE_TEMPORARILY, this.ofModule));
                break;
            case TabButtonActionConst.EDIT_MAIN_TAB:
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.EDIT_OTHER_TAB_AND_OP_STORE_TEMPORARILY, this.ofModule));
                break;
        }
        // this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.OP_STORE_TEMPORARILY, this.ofModule));
        this.store.dispatch(this.processDataActions.requestSave(this.ofModule, RequestSavingMode.OPStoreTemporarily));
    }

    public saveAndRunAsPrint() {
        switch (this.currentAction) {
            case TabButtonActionConst.NEW_MAIN_TAB:
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.NEW_MAIN_TAB_AND_OP_SAVE_AND_RUN_AS_PRINT, this.ofModule));
                break;
            case TabButtonActionConst.EDIT_MAIN_TAB:
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.EDIT_MAIN_TAB_AND_OP_SAVE_AND_RUN_AS_PRINT, this.ofModule));
                break;
            case TabButtonActionConst.NEW_OTHER_TAB:
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.NEW_OTHER_TAB_AND_OP_SAVE_AND_RUN_AS_PRINT, this.ofModule));
                break;
            case TabButtonActionConst.EDIT_MAIN_TAB:
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.EDIT_OTHER_TAB_AND_OP_SAVE_AND_RUN_AS_PRINT, this.ofModule));
                break;
        }
        // this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.OP_SAVE_AND_RUN_AS_PRINT, this.ofModule));
        this.store.dispatch(this.processDataActions.requestSave(this.ofModule, RequestSavingMode.OPSaveAndRunAsPrint));
    }

    public saveAndRunAsEmail() {
        switch (this.currentAction) {
            case TabButtonActionConst.NEW_MAIN_TAB:
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.NEW_MAIN_TAB_AND_OP_SAVE_AND_RUN_AS_EMAIL, this.ofModule));
                break;
            case TabButtonActionConst.EDIT_MAIN_TAB:
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.EDIT_MAIN_TAB_AND_OP_SAVE_AND_RUN_AS_EMAIL, this.ofModule));
                break;
            case TabButtonActionConst.NEW_OTHER_TAB:
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.NEW_OTHER_TAB_AND_OP_SAVE_AND_RUN_AS_EMAIL, this.ofModule));
                break;
            case TabButtonActionConst.EDIT_MAIN_TAB:
                this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.EDIT_OTHER_TAB_AND_OP_SAVE_AND_RUN_AS_EMAIL, this.ofModule));
                break;
        }
        // this.store.dispatch(this.tabButtonActions.setCurrentAction(TabButtonActionConst.OP_SAVE_AND_RUN_AS_EMAIL, this.ofModule));
        this.store.dispatch(this.processDataActions.requestSave(this.ofModule, RequestSavingMode.OPSaveAndRunAsEmail));
    }

    //#region Document Management
    private subscribeScansContainerItems(): void {
        if (this.scanningStatusStateSubscription) {
            this.scanningStatusStateSubscription.unsubscribe();
        }

        this.scanningStatusStateSubscription = this.scanningStatusState.subscribe((scanningStatusState: any) => {
            this.appErrorHandler.executeAction(() => {
                this.idScansContainerItems = scanningStatusState && scanningStatusState.length ? scanningStatusState[0].idScansContainerItems : null;
            });
        });
    }

    public saveDocumentManagement() {
        this.store.dispatch(this.documentAction.save(this.ofModule));
    }

    public skipDocumentManagement() {
        this.store.dispatch(this.documentAction.scanningStatusCallSkip(true, this.ofModule));
    }
    //#endregion Document Management
}
