import {
    Component,
    OnInit,
    Input,
    OnDestroy,
    AfterViewInit,
    ElementRef,
    ViewChildren,
    QueryList,
    Output,
    EventEmitter,
    OnChanges,
    SimpleChanges,
    ViewChild,
    AfterContentInit,
    ChangeDetectorRef,
} from '@angular/core';
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
    MessageModel,
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
    AdministrationDocumentActionNames,
    AdministrationDocumentActions,
    DocumentThumbnailActions,
} from '@app/state-management/store/actions';
import {
    MenuModuleId,
    ArticleTabFieldMapping,
    Configuration,
    MessageModal,
    TreeFolderStructModeEnum,
    DocumentTreeTypeDisplayName,
} from '@app/app.constants';
import {
    TabService,
    AppErrorHandler,
    PropertyPanelService,
    SplitterService,
    ModalService,
    GlobalSettingService,
} from '@app/services';
import { Uti, DocumentHelper, String } from '@app/utilities';
import * as parkedItemReducer from '@app/state-management/store/reducer/parked-item';
import * as tabSummaryReducer from '@app/state-management/store/reducer/tab-summary';
import * as moduleSettingReducer from '@app/state-management/store/reducer/module-setting';
import * as processDataReducer from '@app/state-management/store/reducer/process-data';
import * as propertyPanelReducer from '@app/state-management/store/reducer/property-panel';
import * as layoutInfoReducer from '@app/state-management/store/reducer/layout-info';
import { BaseComponent, ModuleList } from '@app/pages/private/base';
import * as widgetContentReducer from '@app/state-management/store/reducer/widget-content-detail';
import { SubLayoutInfoState, AdministrationDocumentSelectors } from '@app/state-management/store/reducer';
import { FieldFormOnFocusModel } from '@app/state-management/store/models/administration-document/field-form-on-focus.model.payload';
import {
    DocumentTreeModel,
    DocumentTreeModeEnum,
} from '@app/models/administration-document/document-tree.payload.model';
import { TreeNode, TreeComponent } from '@circlon/angular-tree-component';
import { ToasterService } from 'angular2-toaster';
import { XnDocumentTreeComponent } from '@app/shared/components/xn-control';
import { GetDocumentTreeOptions } from '@app/state-management/store/models/administration-document/get-document-tree-options.payload';
import { DocumentContainerOcrStateModel } from '@app/state-management/store/models/administration-document/state/document-container-ocr.state.model';
import { filter, takeUntil } from 'rxjs/operators';
import { IconNames } from '@app/app-icon-registry.service';

enum ModeDisplayEnum {
    TreeFolder = 0,
    Tabs,
}

@Component({
    selector: 'xn-vertical-tab-header',
    styleUrls: ['./xn-vertical-tab-header.component.scss'],
    templateUrl: './xn-vertical-tab-header.component.html',
})
export class XnVerticalTabHeaderComponent extends BaseComponent implements OnInit, OnDestroy, AfterContentInit {
    public globalDateFormat = '';
    public globalNumberFormat = '';
    public otherTabsHeader: TabSummaryModel[] = [];
    public mainTabHeader: TabSummaryModel;
    public editingData: string = null;
    public isViewMode: boolean;
    public isMainTabSelected = true;
    public isTabCollapsed = false;
    public isConnectedToMain = false;
    public isSelectionProject = false;

    public ofModuleLocal: Module;
    public tabContainerStyle: any = {};
    public headerContainerStyle: any = {};
    public treeWidgetContainerStyle: any = {};
    public title = 'Document Assign';
    public pathFolder: string[] = [];
    public showIconOnly: boolean;
    public shouldGetDocumentQuantity: boolean;
    public documentsFolder: DocumentTreeModel[];
    public modeTree: TreeFolderStructModeEnum;
    public iconChevronDownCicle = IconNames.APP_CHEVRON_DOWN_CIRCLE;
    public isCollapsed = true;
    public isShowConfirmDialog = false;
    public callbackAcceptInDialog: any;

    private selectedTabHeader: TabSummaryModel;
    // private singleChoiceFilter: any = {};
    private willChangeTab: any = null;
    private editingWidgets: Array<EditingWidget> = [];
    private modulePrimaryKey = '';
    private scrollNo = 0;
    private selectedParkedItem: ParkedItemModel;
    private selectedSearchResult: SearchResultItemModel;
    private linkableWidget = false;
    private widgetListenKey = '';
    private activeSubModule: Module;
    private fieldFormOnFocus: FieldFormOnFocusModel;
    private modeDisplay: ModeDisplayEnum;
    private _mappingAction: Map<
        DocumentTreeModeEnum,
        {
            callbackConfirmOk: (node: TreeNode) => void;
            callbackConfirmCancel?: (node: TreeNode) => void;
        }
    > = new Map<
        DocumentTreeModeEnum,
        { callbackConfirmOk: (node: TreeNode) => void; callbackConfirmCancel?: (node: TreeNode) => void }
    >();

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
    private layoutInfoModel: Observable<SubLayoutInfoState>;

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
    private layoutInfoModelSubscription: Subscription;
    private _documentContainerOcr: DocumentContainerOcrStateModel;

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

    @Output() onHeaderClick: EventEmitter<any> = new EventEmitter();

    @ViewChildren('headerIconContainer') headerIconContainerList: QueryList<ElementRef>;
    @ViewChild('xnDocumentTree') xnDocumentTree: XnDocumentTreeComponent;

    constructor(
        protected router: Router,
        private cdRef: ChangeDetectorRef,
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
        private modalService: ModalService,
        private toastrService: ToasterService,
        private administrationActions: AdministrationDocumentActions,
        private administrationSelectors: AdministrationDocumentSelectors,
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
        this.layoutInfoModel = store.select((state) =>
            layoutInfoReducer.getLayoutInfoState(state, this.ofModule.moduleNameTrim),
        );
        this.isSelectionProject = Configuration.PublicSettings.isSelectionProject;

        this.administrationSelectors
            .actionSuccessOfSubtype$(AdministrationDocumentActionNames.GET_DOCUMENT_TREE)
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((action: CustomAction) => {
                const tree = action.payload as any[];
                this.documentsFolder = DocumentHelper.mapToDocumentNode(tree, DocumentTreeTypeDisplayName.TREE_FOLDER);
                this.cdRef.detectChanges();
            });

        this.shouldGetDocumentQuantity = false;
        this.modeTree = TreeFolderStructModeEnum.VIEW_FOLDER;
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
        this.subcribeLayoutInfoModel();
        this.subscribeDocumentState();
        this.subscribeCaptureModule();

        this.store.dispatch(
            this.administrationActions.getDocumentTree({
                shouldGetDocumentQuantity: this.shouldGetDocumentQuantity,
                idPerson: '',
            } as GetDocumentTreeOptions),
        );
    }

    private subscribeCaptureModule() {
        this.administrationSelectors
            .actionOfType$(AdministrationDocumentActionNames.CHANGE_MODE_SELECTABLE_FOLDER)
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((_) => {
                this.modeTree = TreeFolderStructModeEnum.SELECTABLE_FOLDER;
            });

        this.administrationSelectors
            .actionOfType$(AdministrationDocumentActionNames.CLEAR_PATH_FOLDER_ON_CAPTURED_TREE)
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((_) => {
                this.pathFolder = [];
            });

        this.administrationSelectors
            .actionSuccessOfSubtype$(AdministrationDocumentActionNames.CREATE_NEW_TREE_FOLDER)
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((action: CustomAction) => {
                const documentFolder = action.payload as DocumentTreeModel;
                this.toastrService.pop(
                    MessageModal.MessageType.success,
                    'System',
                    `Create new folder "${documentFolder.name}" successfully`,
                );
                documentFolder.mode = DocumentTreeModeEnum.VIEW;
            });

        this.administrationSelectors
            .actionSuccessOfSubtype$(AdministrationDocumentActionNames.ADD_NEWLY_SUB_TREE_FOLDER)
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((action: CustomAction) => {
                const documentFolder = action.payload as DocumentTreeModel;
                this.toastrService.pop(
                    MessageModal.MessageType.success,
                    'System',
                    `Add folder "${documentFolder.name}" successfully`,
                );
                documentFolder.mode = DocumentTreeModeEnum.VIEW;
            });

        this.administrationSelectors
            .actionSuccessOfSubtype$(AdministrationDocumentActionNames.RENAME_TREE_FOLDER)
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((action: CustomAction) => {
                const documentFolder = action.payload as DocumentTreeModel;
                this.toastrService.pop(
                    MessageModal.MessageType.success,
                    'System',
                    `Rename folder "${documentFolder.name}" successfully`,
                );
                documentFolder.mode = DocumentTreeModeEnum.VIEW;
            });

        this.administrationSelectors
            .actionSuccessOfSubtype$(AdministrationDocumentActionNames.DELETE_TREE_FOLDER)
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((action: CustomAction) => {
                const node = action.payload as TreeNode;
                this.toastrService.pop(
                    MessageModal.MessageType.success,
                    'System',
                    `Delete folder "${node.data.name}" successfully`,
                );

                const parentNode = node.parent;
                const index = parentNode.data.children.findIndex((n: DocumentTreeModel) => n === node.data);
                parentNode.data.children.splice(index, 1);
                this.xnDocumentTree.updateTree();
            });

        this.administrationSelectors
            .actionOfType$(AdministrationDocumentActionNames.SET_HIGHLIGHT_AND_SAVE_DOCUMENT_INTO_FOLDER)
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((action: CustomAction) => {
                const idDocumentTree = action.payload as number;
                if (!idDocumentTree) return;

                const selectedFolder = this.xnDocumentTree.selectDocumentFolder(idDocumentTree);
                if (!selectedFolder) return;

                this.modeTree = TreeFolderStructModeEnum.SELECTABLE_FOLDER;
                selectedFolder.path = this.xnDocumentTree.getPathSelectedFolder();
                this.store.dispatch(this.administrationActions.saveDocumentIntoFolder(selectedFolder));
                this.cdRef.detectChanges();
            });

        this.administrationSelectors
            .actionOfType$(AdministrationDocumentActionNames.CLEAR_SELECTED_FOLDER_OF_CLASSIFICATION)
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((action: CustomAction) => {
                const selectedNode = this.xnDocumentTree?.selectedNode;
                if (!selectedNode) return;

                this.xnDocumentTree.toggleHighlightNodePath(selectedNode);
                this.xnDocumentTree.selectedNode = null;
            });

        this.dispatcher
            .pipe(
                filter((action: CustomAction) => action.type === DocumentThumbnailActions.DOCUMENT_THUMBNAIL_NO_ITEM),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((_) => {
                this.modeTree = TreeFolderStructModeEnum.VIEW_FOLDER;
                this.xnDocumentTree.clearSelectedNode();
                this.store.dispatch(this.administrationActions.clearSelectedFolderOfClassification());
            });

        this.administrationSelectors.documentContainerOcr$
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((documentContainerOcr) => {
                this._documentContainerOcr = documentContainerOcr;
            });
    }

    public ngAfterContentInit(): void {
        this.registerFolderModeActions();
    }

    ngOnDestroy() {
        if (this.headerIconContainerList) {
            this.headerIconContainerList.forEach((item, index) => {
                item.nativeElement.removeEventListener('mouseenter', this.onTabIconMouseenter.bind(this), false);
                item.nativeElement.removeEventListener('mouseleave', this.onTabIconMouseleave.bind(this), false);
            });
        }

        Uti.unsubscribe(this);
        super.onDestroy();
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

                    if ((!this.editingWidgets || !this.editingWidgets.length) && this.willChangeTab) {
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

    private subcribeLayoutInfoModel() {
        this.layoutInfoModelSubscription = this.layoutInfoModel.subscribe((layoutInfo: SubLayoutInfoState) => {
            this.appErrorHandler.executeAction(() => {
                this.tabContainerStyle = {
                    // 'min-height': `calc(100vh - ${layoutInfo.globalSearchHeight}px - ${layoutInfo.headerHeight}px - ${layoutInfo.parkedItemTitleHeight}px - ${layoutInfo.parkedItemPadding}px)`,
                    // 'max-height': `calc(100vh - ${layoutInfo.globalSearchHeight}px - ${layoutInfo.headerHeight}px - ${layoutInfo.parkedItemTitleHeight}px - ${layoutInfo.parkedItemPadding}px)`
                    //'min-height': `calc(100vh - ${layoutInfo.headerHeight}px - ${layoutInfo.parkedItemTitleHeight}px - ${layoutInfo.parkedItemPadding}px - ${layoutInfo.selectedEntityHeight}px)`,
                    //'max-height': `calc(100vh - ${layoutInfo.headerHeight}px - ${layoutInfo.parkedItemTitleHeight}px - ${layoutInfo.parkedItemPadding}px - ${layoutInfo.selectedEntityHeight}px)`
                    'min-height': `calc(100vh - ${layoutInfo.headerHeight}px - 8px)`,
                    'max-height': `calc(100vh - ${layoutInfo.headerHeight}px - 8px)`,
                    width: '98%',
                };

                this.headerContainerStyle = {
                    // 'min-height': `calc(100vh - ${layoutInfo.globalSearchHeight}px - ${layoutInfo.headerHeight}px - ${layoutInfo.parkedItemTitleHeight}px - ${layoutInfo.parkedItemBufferHeight}px)`,
                    // 'max-height': `calc(100vh - ${layoutInfo.globalSearchHeight}px - ${layoutInfo.headerHeight}px - ${layoutInfo.parkedItemTitleHeight}px - ${layoutInfo.parkedItemBufferHeight}px)`
                    'min-height': `calc(100vh - ${layoutInfo.headerHeight}px - 110px)`,
                    'max-height': `calc(100vh - ${layoutInfo.headerHeight}px - 110px)`,
                };

                this.treeWidgetContainerStyle = {
                    'min-height': `calc((100vh - ${layoutInfo.headerHeight}px) - 79px)`,
                    'max-height': `calc((100vh - ${layoutInfo.headerHeight}px) - 79px)`,
                };
                //this.ref.markForCheck();
            });
        });
    }

    private subscribeDocumentState() {
        super.registerSubscriptionsToAutomaticallyUnsubscribe(
            this.administrationSelectors.fieldFormOnFocus$
                .pipe(filter((fieldFormOnFocus) => !!fieldFormOnFocus))
                .subscribe((data: FieldFormOnFocusModel) => {
                    this.fieldFormOnFocus = data;
                }),

            // this.administrationSelectors
            //     .actionOfType$(AdministrationDocumentActionNames.ON_INITIALIZE_CAPTURED_FORM)
            //     .subscribe((action: CustomAction) => {
            //         const payload = action.payload as DocumentFormNameEnum;
            //         // set initDone to false when open new document and choose a folder tree to save the document
            //         // be ready to get OCR data from new document
            //         let tab: TabSummaryModel;
            //         switch (payload) {
            //             case DocumentFormNameEnum.WIDGET_CONTRACT:
            //                 tab = this.otherTabsHeader.find(_tab => _tab.tabSummaryInfor.tabID === 'Contract');
            //                 break;

            //             case DocumentFormNameEnum.WIDGET_CONTACT:
            //                 tab = this.otherTabsHeader.find(_tab => _tab.tabSummaryInfor.tabID === 'Kontakt');
            //                 break;

            //             case DocumentFormNameEnum.WIDGET_INVOICE:
            //                 tab = this.otherTabsHeader.find(_tab => _tab.tabSummaryInfor.tabID === 'Rechnungsinformationen');
            //                 break;

            //             case DocumentFormNameEnum.WIDGET_NOTES:
            //                 tab = this.otherTabsHeader.find(_tab => _tab.tabSummaryInfor.tabID === 'NotizenTags');
            //                 break;

            //             case DocumentFormNameEnum.WIDGET_BANK:
            //                 tab = this.otherTabsHeader.find(_tab => _tab.tabSummaryInfor.tabID === 'Bank');
            //                 break;

            //             default:
            //                 return;
            //         }

            //         // console.log(`xn-vertical-tab-header: set tab ${tab.tabSummaryInfor.tabID} initDone to false`);
            //         tab.initDone = false;
            //     }),

            // this.administrationSelectors.documentsState$
            //     .filter(documentsState => !!documentsState)
            //     .subscribe(forms => {
            //         if (forms.documentOnUpdate.isOnInit) {
            //             // console.log(`xn-vertical-tab-header: update formState when clicking new document (isOnInit): ${forms.documentOnUpdate.isOnInit}`, forms);
            //             for (const key in forms.documentsForm) {
            //                 if (forms.documentsForm.hasOwnProperty(key)) {
            //                     const documentForm = forms.documentsForm[key];
            //                     // this.mainTabHeader = this.tabService.updateFieldValue([this.mainTabHeader], forms.documentsForm[DocumentProcessingTypeEnum.INVOICE].formsState, true);
            //                     this.tabService.updateFieldValueOnInit(this.otherTabsHeader, documentForm.formsState);
            //                     this.otherTabsHeader = this.otherTabsHeader.map(tab => {
            //                         if (tab.initDone === true) return { ...tab };
            //                         return tab;
            //                     });
            //                 }
            //             }
            //             return;
            //         }

            //         const docOnUpdate = forms.documentOnUpdate.documentType;
            //         const formName = forms.documentOnUpdate.formName;
            //         // console.log(`xn-vertical-tab-header: update formName ${formName} of documentType ${docOnUpdate} with new value`, forms.documentsForm[docOnUpdate].formsState[formName], forms);
            //         const selectedTabHeader = this.otherTabsHeader.find(tab => tab.tabSummaryInfor.tabID === this.selectedTabHeader.tabSummaryInfor.tabID);
            //         this.tabService.updateFieldValuesOnTab(selectedTabHeader, forms.documentsForm[docOnUpdate].formsState[formName]);

            //         this.otherTabsHeader = this.otherTabsHeader.map(tab => {
            //             if (tab.tabSummaryInfor.tabID === selectedTabHeader.tabSummaryInfor.tabID) return { ...tab };
            //             return tab;
            //         });
            //     }),
        );
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

    private initHeaderData(data) {
        if (!data || !data.length) {
            return;
        }

        //if (this.tabService.isTabStructureChanged(this.mainTabHeader, this.otherTabsHeader, data)) {
        this.mainTabHeader = this.tabService.getMainTabHeader(data);

        if (this.mainTabHeader && this.ofModule.idSettingsGUI === MenuModuleId.selectionCampaign) {
            this.mainTabHeader.showAsOtherTab = true;
        }

        this.mainTabHeader = this.tabService.buildFields([this.mainTabHeader], true);

        this.otherTabsHeader = this.tabService.getOtherTabsHeader(data);
        this.otherTabsHeader = this.tabService.appendProp(this.otherTabsHeader, 'active', false);
        this.otherTabsHeader = this.tabService.appendProp(this.otherTabsHeader, 'visible', true);
        this.otherTabsHeader = this.tabService.appendProp(this.otherTabsHeader, 'disabled', false);
        this.otherTabsHeader = this.tabService.appendProp(this.otherTabsHeader, 'initDone', false);

        this.otherTabsHeader = this.tabService.buildFields(this.otherTabsHeader);

        if (this.selectedTabHeader) {
            this.processToSelectTabHeader();
        } else if (
            this.mainTabHeader.visible &&
            this.mainTabHeader.accessRight &&
            this.mainTabHeader.accessRight.read
        ) {
            this.mainTabHeader.active = true;
        } else if (this.otherTabsHeader.length) {
            let visibleOtherTab = this.otherTabsHeader.find((t) => t.visible && t.accessRight && t.accessRight.read);
            if (visibleOtherTab) {
                visibleOtherTab.active = true;
            }
        }
        //} else {
        //    this.mainTabHeader = this.tabService.appendMainTabData(this.mainTabHeader, data);
        //    this.otherTabsHeader = this.tabService.appendOtherTabsData(this.otherTabsHeader, data);
        //}

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

    private clickOtherTabsHeader(tabHeader, event?) {
        if (
            !this.selectedTabHeader ||
            (this.selectedTabHeader && this.selectedTabHeader.tabSummaryInfor.tabID != tabHeader.tabSummaryInfor.tabID)
        ) {
            if (
                typeof tabHeader.disabled != 'undefined' &&
                tabHeader.disabled != undefined &&
                tabHeader.disabled == true
            ) {
                event.preventDefault();
                $(event.currentTarget).removeAttr('data-toggle');
                return false;
            }

            this.willChangeTab = {
                tab: tabHeader,
                isMainTab: false,
            };

            if (this.setting && this.setting.Content) {
                let tabSetting = this.setting.Content.CustomTabs.find(
                    (t) => t.TabID == tabHeader.tabSummaryInfor.tabID,
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

        if (
            this.mainTabHeader &&
            this.mainTabHeader.tabSummaryInfor.tabID == this.selectedTabHeader.tabSummaryInfor.tabID
        ) {
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

        //this.store.dispatch(this.tabSummaryActions.toggleTabButton(true, this.ofModule));
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

    public toggleTabHeader() {
        this.onHeaderClick.emit();
    }

    public rotateTabHeader() {
        let tabContainer = $('#tab-container', this.elmRef.nativeElement);
        if (tabContainer.length) {
            if (tabContainer.outerWidth() <= 200) {
                this.showIconOnly = true;
                this.title = '';
                $('.tab-header', this.elmRef.nativeElement).addClass('justify-content-center');
                return;
            }

            this.showIconOnly = false;
            this.title = 'Document Assign';
            $('.tab-header', this.elmRef.nativeElement).removeClass('justify-content-center');
        }
    }

    public trackByTabField(index, node: { name: string; value: string }) {
        return node.value;
    }

    public newFolder($event: { event: Event; treeComponent: TreeComponent }) {
        this.xnDocumentTree.closeContextMenu();
        if (!$event.treeComponent.treeModel.nodes) $event.treeComponent.treeModel.nodes = [];

        const newData = DocumentHelper.mapData({}, DocumentTreeTypeDisplayName.TREE_FOLDER);
        newData.mode = DocumentTreeModeEnum.CREATE_NEW;
        $event.treeComponent.treeModel.nodes.push(newData);
        $event.treeComponent.treeModel.update();
    }

    public addSubfolder($event: { $event: Event; node: TreeNode }) {
        this.xnDocumentTree.closeContextMenu();

        if (!$event.node.data.children) $event.node.data.children = [];

        const parentData = $event.node.data as DocumentTreeModel;
        const newData = DocumentHelper.mapData({}, DocumentTreeTypeDisplayName.TREE_FOLDER);
        newData.idDocumentType = parentData.idDocumentType;
        newData.mode = DocumentTreeModeEnum.ADD_SUB_FOLDER;

        $event.node.data.children.push(newData);
        $event.node.data.hasChildren = true;
        $event.node.expand();
        this.xnDocumentTree.updateTree();

        this.xnDocumentTree.focusOnInputNode();
    }

    public renameFolder($event: { $event: Event; node: TreeNode }) {
        this.xnDocumentTree.closeContextMenu();
        const data = $event.node.data as DocumentTreeModel;
        data.mode = DocumentTreeModeEnum.RENAME;
        const path = this.xnDocumentTree.getPathFolder($event.node);
        data.path = path.join(Configuration.SEPARATOR_PATH);
        (data as any).oldFolderName = data.name;

        this.xnDocumentTree.focusOnInputNode();
    }

    public deleteFolder($event: { $event: Event; node: TreeNode }) {
        this.xnDocumentTree.closeContextMenu();
        const data = $event.node.data as DocumentTreeModel;
        data.mode = DocumentTreeModeEnum.DELETE;

        this.confirmToSaveFolder(
            data,
            () => {
                if (!this._mappingAction.get(data.mode).callbackConfirmOk) return;

                this._mappingAction.get(data.mode).callbackConfirmOk($event.node);
            },
            null,
        );
    }

    public okActionFolderName($event: { event: Event; node: TreeNode; value: string }) {
        if (!$event.value.length) {
            this.toastrService.pop(MessageModal.MessageType.warning, 'System', 'Please enter a folder name');
            return;
        }

        if (!this.checkRulesFolderName($event.value)) {
            this.toastrService.pop(
                MessageModal.MessageType.warning,
                'System',
                `The folder name "${$event.value}" can't contain any the following characters: \\ / : * ? " < > |`,
            );
            return;
        }

        const parentNode = $event.node.parent;

        if (parentNode) {
            const found = parentNode.children.find((n) => (n.data as DocumentTreeModel).name === $event.value);
            if (found) {
                this.toastrService.pop(
                    MessageModal.MessageType.warning,
                    'System',
                    `The folder name "${$event.value}" has existed`,
                );
                return;
            }
        }

        const node = $event.node;
        const data = node.data as DocumentTreeModel;

        if (!this._mappingAction.get(data.mode).callbackConfirmOk) return;

        data.name = $event.value;
        this._mappingAction.get(data.mode).callbackConfirmOk(node);
    }

    public cancelActionFolderName($event: { event: Event; node: TreeNode }) {
        const node = $event.node;
        const data = $event.node.data as DocumentTreeModel;

        if (!this._mappingAction.get(data.mode).callbackConfirmCancel) return;

        this._mappingAction.get(data.mode).callbackConfirmCancel(node);
    }

    public clickOnNode($event: { event: Event; node: TreeNode }) {
        if (this.modeTree === TreeFolderStructModeEnum.VIEW_FOLDER) {
            if (!$event.node.hasChildren) return;

            $event.node.mouseAction('expanderClick', $event);
            return;
        }
    }

    public dblClickOnNode($event: { event: Event; node: TreeNode }) {
        if (this.modeTree === TreeFolderStructModeEnum.VIEW_FOLDER) {
            if (!$event.node.hasChildren) return;

            $event.node.mouseAction('expanderClick', $event);
            return;
        }

        const data = $event.node.data as DocumentTreeModel;
        if (!data.idDocument || data.mode === DocumentTreeModeEnum.RENAME) return; // is new node, not have name yet OR is on mode RENAME.

        if (this.xnDocumentTree.selectedNode === $event.node) return;

        if (!this._documentContainerOcr) return;
        this.callbackAcceptInDialog = (() => {
            this.isShowConfirmDialog = false;
            this.callbackAcceptInDialog = null;
            this.dispatchSaveDocumentIntoFolder($event.node);
        }).bind(this);
        // this.modalService.confirmMessageHtmlContent(
        //     new MessageModel({
        //         headerText: 'Confirmation',
        //         messageType: MessageModal.MessageType.confirm,
        //         message: `<p>Do you want to save into this folder?</p>`,
        //         buttonType1: MessageModal.ButtonType.danger,
        //         callBack1: (() => {
        //             // button Ok clicked
        //             this.dispatchSaveDocumentIntoFolder($event.node);
        //         }).bind(this),
        //         callBack2: () => {
        //             // butoon Cancel clicked
        //             // DO NOTHING
        //         },
        //     }),
        // );
    }

    public toggleFolderTree($event) {
        if (!this.xnDocumentTree) return;

        if (this.isCollapsed) {
            this.xnDocumentTree.expandAllFolders();
        } else {
            this.xnDocumentTree.collapseAllFolders();
        }

        this.isCollapsed = !this.isCollapsed;
    }

    private dispatchSaveDocumentIntoFolder(node: TreeNode) {
        const folder = node.data as DocumentTreeModel;

        this.pathFolder = this.xnDocumentTree.getPathFolder(node);
        folder.path = this.pathFolder.join(Configuration.SEPARATOR_PATH);

        this.xnDocumentTree.selectDocumentFolder(node.data as DocumentTreeModel);

        // dispatch action SAVE_DOCUMENT_INTO_FOLDER
        this.store.dispatch(this.administrationActions.saveDocumentIntoFolder(folder));
        this.cdRef.detectChanges();
    }

    private registerFolderModeActions() {
        this._mappingAction.set(DocumentTreeModeEnum.CREATE_NEW, {
            callbackConfirmOk: (node: TreeNode) => {
                const parent = node.parent;
                const data = node.data as DocumentTreeModel;
                data.order = parent.children.length;
                this.store.dispatch(this.administrationActions.createNewTreeFolder(data));
            },
            callbackConfirmCancel: (node: TreeNode) => {
                const data = node.data as DocumentTreeModel;
                const parentNode = node.parent;
                const index = parentNode.data.children.findIndex((n: DocumentTreeModel) => n === data);
                parentNode.data.children.splice(index, 1);
                this.xnDocumentTree.updateTree();
            },
        });

        this._mappingAction.set(DocumentTreeModeEnum.ADD_SUB_FOLDER, {
            callbackConfirmOk: (node: TreeNode) => {
                const data = node.data as DocumentTreeModel;

                if (!node.parent) {
                    return;
                }
                const parentData = node.parent.data as DocumentTreeModel;

                data.idDocumentParent = parentData.idDocument;
                data.order = parentData.children.length;
                this.store.dispatch(this.administrationActions.addNewlySubTreeFolder(data));
            },
            callbackConfirmCancel: (node: TreeNode) => {
                const data = node.data as DocumentTreeModel;
                const parentNode = node.parent;
                const index = parentNode.data.children.findIndex((n: DocumentTreeModel) => n === data);
                parentNode.data.children.splice(index, 1);
                if (!parentNode.data.children.length) {
                    parentNode.data.hasChildren = false;
                }
                this.xnDocumentTree.updateTree();
            },
        });

        this._mappingAction.set(DocumentTreeModeEnum.DELETE, {
            callbackConfirmOk: (node: TreeNode) => {
                const pathFolder = this.xnDocumentTree.getPathFolder(node);

                // deleting choosen folder. So dispatch the action Select folder again
                if (
                    this.pathFolder.join(Configuration.SEPARATOR_PATH) === pathFolder.join(Configuration.SEPARATOR_PATH)
                ) {
                    this.modeTree = TreeFolderStructModeEnum.SELECTABLE_FOLDER;
                    this.pathFolder = [];
                }

                this.store.dispatch(this.administrationActions.deleteTreeFolder(node));
            },
            callbackConfirmCancel: (node: TreeNode) => {
                const data = node.data as DocumentTreeModel;
                data.mode = DocumentTreeModeEnum.VIEW;
            },
        });

        this._mappingAction.set(DocumentTreeModeEnum.RENAME, {
            callbackConfirmOk: (node: TreeNode) => {
                this.store.dispatch(this.administrationActions.renameTreeFolder(node.data as DocumentTreeModel));
                delete (node.data as any).oldFolderName;
            },
            callbackConfirmCancel: (node: TreeNode) => {
                const data = node.data as DocumentTreeModel;
                data.mode = DocumentTreeModeEnum.VIEW;
                delete (node.data as any).oldFolderName;
            },
        });
    }

    private confirmToSaveFolder(folder: DocumentTreeModel, callbackOk: () => void, callbackCancel?: () => void): void {
        this.modalService.confirmMessageHtmlContent(
            new MessageModel({
                headerText: 'Confirmation',
                messageType: MessageModal.MessageType.confirm,
                message: [ { key: '<p>' }, { key: 'Modal_Message__AreYouSureTo' }, { key: folder.mode }, { key: 'Modal_Message__ThisFolder' }, { key: '</p>' }],
                buttonType1: MessageModal.ButtonType.danger,
                callBack1: () => {
                    // button Ok clicked
                    callbackOk();
                },
                callBack2: () => {
                    // button Cancel clicked
                    callbackCancel && callbackCancel();
                },
            }),
        );
    }

    private checkRulesFolderName(name: string): boolean {
        if (!name || !name.length) return false;

        if (name.search(/[\\/:*?"<>|]/g) >= 0) return false;

        return true;
    }
}
