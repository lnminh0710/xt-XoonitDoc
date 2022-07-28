import { Component, OnInit, Input, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Module, TabSummaryModel, GlobalSettingModel } from '@app/models';
import { SubLayoutInfoState } from '@app/state-management/store/reducer/layout-info';
import { Store, ReducerManagerDispatcher } from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import { Observable, Subscription, Subject } from 'rxjs';
import {
    LayoutInfoActions,
    ProcessDataActions,
    GridActions,
    AdditionalInformationActions,
    TabButtonActions,
    LayoutSettingActions,
    CustomAction,
} from '@app/state-management/store/actions';
import { AppErrorHandler, GlobalSettingService } from '@app/services';
import isEmpty from 'lodash-es/isEmpty';
import isNil from 'lodash-es/isNil';
import isUndefined from 'lodash-es/isUndefined';
import { RequestSavingMode, MenuModuleId, GlobalSettingConstant } from '@app/app.constants';
import { XnAdditionalInformationMainComponent } from '@app/shared/components/xn-additional-information';
import * as tabSummaryReducer from '@app/state-management/store/reducer/tab-summary';
import * as moduleSettingReducer from '@app/state-management/store/reducer/module-setting';
import * as processDataReducer from '@app/state-management/store/reducer/process-data';
import * as layoutInfoReducer from '@app/state-management/store/reducer/layout-info';
import { BaseComponent } from '@app/pages/private/base';
import { Uti } from '@app/utilities';
import * as widgetTemplateReducer from '@app/state-management/store/reducer/widget-template';
import { filter, map, take } from 'rxjs/operators';
import { EnableWidgetTemplateState } from '@app/models/widget-template/enable-widget-template.model';

@Component({
    selector: 'xn-tab',
    styleUrls: ['./xn-tab.component.scss'],
    templateUrl: './xn-tab.component.html',
    host: {
        '(contextmenu)': 'onRightClick($event)',
    },
})
export class XnTabComponent extends BaseComponent implements OnInit, OnDestroy {
    private contextMenuData: Array<any> = [];
    public perfectScrollbarConfigForAI: any = {};
    public tabContainerStyle: Object = {};
    public config: any = { left: 68, right: 32 };
    public configWidth: any = { left: 68, right: 32, spliter: 5 };
    public editingTabData: any;
    public activeModule: Module;
    public formEditMode = false;
    public isShowContextMenu = true;

    private isViewMode = true;
    private toolbarSetting: any;
    private activeSubModule: Module;
    private editLayout: boolean = false;

    private layoutInfoModelSubscription: Subscription;
    private formDirtyStateSubscription: Subscription;
    private activeSubModuleStateSubscription: Subscription;
    private selectedTabHeaderModelSubscription: Subscription;
    private formEditModeStateSubscription: Subscription;
    private isViewModeStateSubscription: Subscription;
    private toolbarSettingStateSubscription: Subscription;
    private requestEditLayoutStateSubscription: Subscription;
    private enableWidgetTemplateStateSubscription: Subscription;
    private saveWidgetInEditModeSuccessStateSubscription: Subscription;

    private layoutInfoModel: Observable<SubLayoutInfoState>;
    private formValidState: Observable<boolean>;
    private formDirtyState: Observable<boolean>;
    private formEditModeState: Observable<boolean>;
    private isViewModeState: Observable<boolean>;
    private toolbarSettingState: Observable<any>;
    private activeSubModuleState: Observable<Module>;
    private selectedTabHeaderModel: Observable<TabSummaryModel>;
    private enableWidgetTemplateState: Observable<EnableWidgetTemplateState>;

    @Input() headerData: TabSummaryModel[];
    @Input() tabSetting: any;
    @Input() subTabSetting: any;
    @Input() selectedEntity: any;
    @Input() newTabConfig: any;

    @ViewChild('additionalInformationMain') additionalInformationMain: XnAdditionalInformationMainComponent;

    constructor(
        private store: Store<AppState>,
        private layoutInfoActions: LayoutInfoActions,
        private processDataActions: ProcessDataActions,
        private appErrorHandler: AppErrorHandler,
        private gridActions: GridActions,
        private tabButtonActions: TabButtonActions,
        private additionalInformationActions: AdditionalInformationActions,
        private dispatcher: ReducerManagerDispatcher,
        protected router: Router,
        private globalSettingService: GlobalSettingService,
        private globalSettingConstant: GlobalSettingConstant,
    ) {
        super(router);

        this.layoutInfoModel = store.select((state) =>
            layoutInfoReducer.getLayoutInfoState(state, this.ofModule.moduleNameTrim),
        );
        this.formValidState = store.select(
            (state) => processDataReducer.getProcessDataState(state, this.ofModule.moduleNameTrim).formValid,
        );
        this.formDirtyState = store.select(
            (state) => processDataReducer.getProcessDataState(state, this.ofModule.moduleNameTrim).formDirty,
        );
        this.formEditModeState = store.select(
            (state) => processDataReducer.getProcessDataState(state, this.ofModule.moduleNameTrim).formEditMode,
        );
        this.isViewModeState = store.select(
            (state) => processDataReducer.getProcessDataState(state, this.ofModule.moduleNameTrim).isViewMode,
        );
        this.activeSubModuleState = store.select((state) => state.mainModule.activeSubModule);
        this.selectedTabHeaderModel = store.select(
            (state) => tabSummaryReducer.getTabSummaryState(state, this.ofModule.moduleNameTrim).selectedTab,
        );
        this.toolbarSettingState = store.select(
            (state) => moduleSettingReducer.getModuleSettingState(state, this.ofModule.moduleNameTrim).toolbarSetting,
        );
        this.enableWidgetTemplateState = store.select(
            (state) =>
                widgetTemplateReducer.getWidgetTemplateState(state, this.ofModule.moduleNameTrim).enableWidgetTemplate,
        );
    }

    ngOnInit() {
        this.perfectScrollbarConfigForAI = {
            suppressScrollX: true,
            suppressScrollY: true,
        };

        this.subcribeLayoutInfoModel();
        this.subcribeFormDirtyState();
        this.subscribeFormEditModeState();
        this.subscribeIsViewModeState();
        this.subscribeActiveSubModuleState();
        this.subscribeSelectedTabHeaderModel();
        this.subscribeToolbarSettingState();
        this.subscribeEnableWidgetTemplateState();
        this.subscrible();
        this.subscribeSaveWidgetInEditModeState();
        this.getPanelWidth();
    }

    ngOnDestroy() {
        Uti.unsubscribe(this);
    }

    private subscribeEnableWidgetTemplateState() {
        if (this.enableWidgetTemplateStateSubscription) {
            this.enableWidgetTemplateStateSubscription.unsubscribe();
        }
        this.enableWidgetTemplateStateSubscription = this.enableWidgetTemplateState.subscribe(
            (enableWidgetTemplate) => {
                this.appErrorHandler.executeAction(() => {
                    setTimeout(() => {
                        this.isShowContextMenu = !enableWidgetTemplate.status;
                    });
                });
            });
    }

    private subcribeLayoutInfoModel() {
        this.layoutInfoModelSubscription = this.layoutInfoModel.subscribe((layoutInfo: SubLayoutInfoState) => {
            this.appErrorHandler.executeAction(() => {
                this.tabContainerStyle = {
                    // 'height': `calc(100vh - ${layoutInfo.globalSearchHeight}px - ${layoutInfo.headerHeight}px - ${layoutInfo.tabHeaderHeight}px - ${layoutInfo.smallHeaderLineHeight}px - ${layoutInfo.dashboardPaddingTop}px)`
                    //'height': `calc(100vh - ${layoutInfo.headerHeight}px -
                    //                        ${this.ofModule.idSettingsGUI != 43 ? layoutInfo.tabHeaderHeight : layoutInfo.tabHeaderBigSizeHeight}px -
                    //                        ${layoutInfo.smallHeaderLineHeight}px -
                    //                        ${layoutInfo.dashboardPaddingTop}px)`
                };
            });
        });
    }

    private subcribeFormDirtyState() {
        this.formDirtyStateSubscription = this.formDirtyState.subscribe((formInvalidState: boolean) => {
            this.appErrorHandler.executeAction(() => {
                if (!formInvalidState) {
                    this.editingTabData = null;
                }
            });
        });
    }

    private subscribeFormEditModeState() {
        this.formEditModeStateSubscription = this.formEditModeState.subscribe((formEditModeState: boolean) => {
            this.appErrorHandler.executeAction(() => {
                this.formEditMode = formEditModeState;
            });
        });
    }

    private subscribeIsViewModeState() {
        this.isViewModeStateSubscription = this.isViewModeState.subscribe((isViewModeState: boolean) => {
            this.appErrorHandler.executeAction(() => {
                this.isViewMode = isViewModeState;

                this.initContextMenu();
            });
        });
    }

    private subscribeSelectedTabHeaderModel() {
        this.selectedTabHeaderModelSubscription = this.selectedTabHeaderModel.subscribe(
            (selectedTabHeader: TabSummaryModel) => {
                this.appErrorHandler.executeAction(() => {
                    setTimeout(() => {
                        if (
                            !isEmpty(selectedTabHeader) &&
                            !selectedTabHeader.tabSummaryInfor.isMainTab &&
                            this.contextMenuData.length
                        ) {
                            if (this.contextMenuData[0])
                                this.contextMenuData[0].title = 'New ' + selectedTabHeader.tabSummaryInfor.tabName;

                            if (this.contextMenuData[1])
                                this.contextMenuData[1].title = 'Edit ' + selectedTabHeader.tabSummaryInfor.tabName;
                        }
                    }, 1000);
                });
            },
        );
    }

    private subscribeActiveSubModuleState() {
        this.activeSubModuleStateSubscription = this.activeSubModuleState.subscribe((activeSubModuleState: Module) => {
            this.appErrorHandler.executeAction(() => {
                this.activeSubModule = activeSubModuleState;
                setTimeout(() => {
                    if (
                        !isEmpty(this.activeSubModule) &&
                        this.activeSubModule.idSettingsGUIParent === MenuModuleId.processing &&
                        this.contextMenuData.length
                    ) {
                        if (this.contextMenuData[0])
                            this.contextMenuData[0].title = 'New ' + this.activeSubModule.moduleName;

                        if (this.contextMenuData[1])
                            this.contextMenuData[1].title = 'Edit ' + this.activeSubModule.moduleName;
                    }
                }, 1000);
            });
        });
    }

    private subscribeToolbarSettingState() {
        this.toolbarSettingStateSubscription = this.toolbarSettingState.subscribe((toolbarSettingState: any) => {
            this.appErrorHandler.executeAction(() => {
                this.toolbarSetting = toolbarSettingState;

                this.initContextMenu();
            });
        });
    }

    private subscrible() {
        this.requestEditLayoutStateSubscription = this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return (
                        action.type === LayoutSettingActions.REQUEST_TOGGLE_PANEL &&
                        action.module.idSettingsGUI == this.ofModule.idSettingsGUI
                    );
                }),
                map((action: CustomAction) => {
                    return action.payload;
                }),
            )
            .subscribe((isShow: any) => {
                this.appErrorHandler.executeAction(() => {
                    this.editLayout = isShow;
                    //this.changeDetectorRef.markForCheck();
                });
            });
    }

    private subscribeSaveWidgetInEditModeState() {
        this.saveWidgetInEditModeSuccessStateSubscription = this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return (
                        action.type === ProcessDataActions.SAVE_WIDGET_IN_EDIT_MODE_SUCCESS &&
                        action.module.idSettingsGUI == this.ofModule.idSettingsGUI
                    );
                }),
            )
            .subscribe((action: CustomAction) => {
                this.appErrorHandler.executeAction(() => {
                    if (action.payload) {
                        this.dispatchData(action.payload, true);
                    }
                });
            });
    }

    public dragEnd(event: any) {
        setTimeout(() => {
            const leftSize = $('.xn__tab-content__split').innerWidth();
            const rightSize = $('.additional-information__split').innerWidth();
            const spliters = $('.as-split-gutter');
            const lastSpliter = $(spliters[spliters.length - 1]);
            const splitSize = 5; // lastSpliter.innerWidth();
            const totalSize = leftSize + rightSize + splitSize;

            if (!lastSpliter.is(':visible')) { return; }
            this.configWidth.left = ((leftSize + splitSize / 2) * 100) / totalSize;
            this.configWidth.right = ((rightSize + splitSize / 2) * 100) / totalSize;
            this.configWidth.spliter = splitSize;
            this.additionalInformationMain.setConfigWidth(this.configWidth);
            this.additionalInformationMain.reCalculateSize();
            //this.store.dispatch(this.layoutInfoActions.setRightMenuWidth(rightSize + '', this.ofModule));
            this.store.dispatch(this.additionalInformationActions.requestResize(this.ofModule));
            this.store.dispatch(this.gridActions.requestRefresh(this.ofModule));
            this.savePanelWidth();
            this.store.dispatch(this.layoutInfoActions.resizeSplitter(this.ofModule));
        }, 200);
        Uti.handleWhenSpliterResize();
    }

    public onMainFormChanged(data) {
        this.dispatchData(data, true);
    }

    public onOtherFormChanged(data) {
        this.dispatchData(data, false);
    }

    public onRightClick($event: MouseEvent) {
        $event.preventDefault();
        $event.stopPropagation();
    }

    public onWidgetLayoutEdittingActionHandler($event) {
        this.isShowContextMenu = $event;
    }

    private dispatchData(data, isMainForm) {
        if (data) {
            this.editingTabData = data.formValue;
            this.store.dispatch(this.processDataActions.editingFormData(this.editingTabData, this.ofModule));

            if (typeof data.isValid === 'boolean') {
                this.store.dispatch(this.processDataActions.formValid(data.isValid, this.ofModule));
            }

            if (typeof data.isDirty === 'boolean') {
                this.store.dispatch(this.processDataActions.formDirty(data.isDirty, this.ofModule));
            }

            if (!isNil(data.submitResult)) {
                if (
                    this.formEditMode &&
                    !isUndefined(data.savingMode) &&
                    data.savingMode === RequestSavingMode.SaveOnly
                ) {
                    isMainForm
                        ? this.store.dispatch(this.processDataActions.saveOnlyMainTabResult(data, this.ofModule))
                        : this.store.dispatch(this.processDataActions.saveOnlyOtherTabResult(data, this.ofModule));
                } else {
                    isMainForm
                        ? this.store.dispatch(this.processDataActions.saveMainTabResult(data, this.ofModule))
                        : this.store.dispatch(this.processDataActions.saveOtherTabResult(data, this.ofModule));
                }
            }
        }
    }

    private initContextMenu() {
        this.contextMenuData = [
            {
                id: 'page-edit-menu-context',
                title: 'New ' + this.ofModule.moduleName,
                iconName: 'fa-plus  green-color',
                callback: (event) => {
                    this.store.dispatch(this.tabButtonActions.requestNew(this.ofModule));
                },
                subject: new Subject(),
                disabled: false,
                children: [],
                hidden: true,
            },
            {
                id: 'page-edit-menu-context',
                title: 'Edit ' + this.ofModule.moduleName,
                iconName: 'fa-pencil-square-o  orange-color',
                callback: (event) => {
                    this.store.dispatch(this.tabButtonActions.requestEdit(this.ofModule));
                },
                subject: new Subject(),
                disabled: false,
                children: [],
                hidden: true,
            },
        ];

        if (this.isViewMode && this.toolbarSetting) {
            if (this.toolbarSetting.CanNew == 1) {
                this.contextMenuData[0].hidden = false;
            }

            if (this.toolbarSetting.CanEdit == 1) {
                this.contextMenuData[1].hidden = false;
            }
        }
    }

    private getPanelWidth() {
        this.globalSettingService.getAllGlobalSettings(this.ofModule.idSettingsGUI).subscribe((data: any) => {
            this.appErrorHandler.executeAction(() => {
                if (data && data.length) {
                    const additionalInformationPanelWidth = data.find((x) => x.globalName === this.globalSettingConstant.additionalInformationPanelWidth);
                    if (
                        !additionalInformationPanelWidth ||
                        !additionalInformationPanelWidth.idSettingsGlobal ||
                        !additionalInformationPanelWidth.globalName
                    ) {
                        return;
                    }

                    this.configWidth = JSON.parse(additionalInformationPanelWidth.jsonSettings);
                }
            });
        });
    }

    private savePanelWidth() {
        this.globalSettingService
            .getAllGlobalSettings(this.ofModule.idSettingsGUI)
            .pipe(take(1))
            .subscribe((data: any) => {
                this.appErrorHandler.executeAction(() => {
                    let additionalInformationPanelWidth = data.find((x) => x.globalName === this.globalSettingConstant.additionalInformationPanelWidth);

                    if (
                        !additionalInformationPanelWidth ||
                        !additionalInformationPanelWidth.idSettingsGlobal ||
                        !additionalInformationPanelWidth.globalName
                    ) {
                        additionalInformationPanelWidth = new GlobalSettingModel({
                            globalName: this.globalSettingConstant.additionalInformationPanelWidth,
                            description: 'Additional Information Panel Width',
                            globalType: this.globalSettingConstant.additionalInformationPanelWidth,
                        });
                    }
                    additionalInformationPanelWidth.idSettingsGUI = this.ofModule.idSettingsGUI;
                    additionalInformationPanelWidth.jsonSettings = JSON.stringify(this.configWidth);
                    additionalInformationPanelWidth.isActive = true;

                    this.globalSettingService
                        .saveGlobalSetting(additionalInformationPanelWidth)
                        .subscribe((response) =>
                            this.globalSettingService.saveUpdateCache(
                                this.ofModule.idSettingsGUI,
                                additionalInformationPanelWidth,
                                response
                            ),
                        );
                });
            });
    }
}
