import {
    Component,
    OnInit,
    Input,
    OnDestroy,
    ElementRef,
    ViewChildren,
    QueryList,
    Output,
    EventEmitter,
    OnChanges,
    SimpleChanges,
    ViewChild,
    ChangeDetectorRef,
    SkipSelf,
    ChangeDetectionStrategy,
    Injector,
    AfterViewInit,
    ViewContainerRef,
    TemplateRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import isEqual from 'lodash-es/isEqual';
import isEmpty from 'lodash-es/isEmpty';

import {
    Module,
    SearchResultItemModel,
    ParkedItemModel,
    WidgetDetail,
    TabSummaryModel,
    FieldFilter,
    User,
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
    TreeFolderStructModeEnum,
    DocumentTreeTypeDisplayName,
    IdDocumentTreeConstant,
} from '@app/app.constants';
import {
    TabService,
    AppErrorHandler,
    PropertyPanelService,
    SplitterService,
    GlobalSettingService,
    UserService,
} from '@app/services';
import { Uti, DocumentHelper, String } from '@app/utilities';
import * as parkedItemReducer from '@app/state-management/store/reducer/parked-item';
import * as tabSummaryReducer from '@app/state-management/store/reducer/tab-summary';
import * as moduleSettingReducer from '@app/state-management/store/reducer/module-setting';
import * as processDataReducer from '@app/state-management/store/reducer/process-data';
import * as propertyPanelReducer from '@app/state-management/store/reducer/property-panel';
import * as layoutInfoReducer from '@app/state-management/store/reducer/layout-info';
import { ModuleList } from '@app/pages/private/base';
import * as widgetContentReducer from '@app/state-management/store/reducer/widget-content-detail';
import {
    SubLayoutInfoState,
    AdministrationDocumentSelectors,
    AppGlobalSelectors,
} from '@app/state-management/store/reducer';
import { FieldFormOnFocusModel } from '@app/state-management/store/models/administration-document/field-form-on-focus.model.payload';
import {
    DocumentTreeModel,
    DocumentTreeModeEnum,
} from '@app/models/administration-document/document-tree.payload.model';
import { TreeNode } from '@circlon/angular-tree-component';
import {
    GetDocumentTreeOptions,
    TreeTypeEnum,
} from '@app/state-management/store/models/administration-document/get-document-tree-options.payload';
import { DocumentContainerOcrStateModel } from '@app/state-management/store/models/administration-document/state/document-container-ocr.state.model';
import { filter, takeUntil, take } from 'rxjs/operators';
import { IconNames } from '@app/app-icon-registry.service';
import { DmsDashboardHandlerService } from '@app/pages/private/modules/mydm/services/dms-dashboard-handler.service';
import { BaseWidgetStructureTreeComponent } from '@xn-control/xn-document-tree/components/base-widget-structure-tree/base-widget-structure-tree.component';
import { ContextMenuAction } from '../../../../../models/context-menu/context-menu';
import { GetDocumentFilesByFolderAction } from '@app/pages/document-management/document-management.statemanagement/document-management.actions';
import {
    ClearSelectedFolderAction,
    SelectFolderToImportAction,
} from '@app/pages/import-upload/import-upload.statemanagement/import-upload.actions';
import { FolerTreeChange } from '@app/state-management/store/actions/app/app.actions';
import { PopupService } from '@app/xoonit-share/components/global-popup/services/popup.service';
import { WidgetMemberPermissionDialogComponent } from '@app/xoonit-share/components/widget-member-permission-dialog/widget-member-permission-dialog.component';
import { IconHeader } from '@app/xoonit-share/components/global-popup/models/popup-header.interface';
import { PopupCloseEvent } from '@app/xoonit-share/components/global-popup/popup-ref';

@Component({
    selector: 'widget-indexing-folder-tree',
    templateUrl: 'widget-indexing-folder-tree.component.html',
    styleUrls: ['widget-indexing-folder-tree.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidgetIndexingFolderTreeComponent
    extends BaseWidgetStructureTreeComponent
    implements OnInit, AfterViewInit, OnDestroy, OnChanges
{
    currentUser: User;
    private _params: any;
    resetWidget() {
        throw new Error('Method not implemented.');
    }

    filterDisplayFields(displayFields: FieldFilter[]) {
        throw new Error('Method not implemented.');
    }
    public svgIconUndo = IconNames.WIDGET_MYDM_FORM_Reset;

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
    public documentsFolder: DocumentTreeModel[] = [];
    public modeTree: TreeFolderStructModeEnum;
    public IconNamesEnum = IconNames;
    public isShowConfirmDialog = false;
    public callbackAcceptInDialog: any;

    private selectedTabHeader: TabSummaryModel;
    // private singleChoiceFilter: any = {};
    private willChangeTab: any = null;
    private editingWidgets: Array<EditingWidget> = [];
    private modulePrimaryKey = '';
    private selectedParkedItem: ParkedItemModel;
    private selectedSearchResult: SearchResultItemModel;
    private linkableWidget = false;
    private widgetListenKey = '';
    private activeSubModule: Module;
    private fieldFormOnFocus: FieldFormOnFocusModel;

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
    }
    @Input() selectedEntity: any;
    @Input() allowEdit: any;
    @Input() set editingTabData(editingTabData: any) {
        this.editingData = this.tabService.buildEditingData(
            editingTabData,
            this.ofModule ? this.ofModule.moduleName : '',
        );
    }
    @Input() setting: any;
    @Input() subTabSetting: any;

    @Output() onHeaderClick: EventEmitter<any> = new EventEmitter();
    @Output() collapsed: EventEmitter<boolean> = new EventEmitter();
    @Output() expanded: EventEmitter<boolean> = new EventEmitter();

    @ViewChildren('headerIconContainer') headerIconContainerList: QueryList<ElementRef>;

    @ViewChild('activeFolderTemplate')
    private activeFolderTemplate: TemplateRef<any>;

    @ViewChild('createSubFolderTemplate')
    private createSubFolderTemplate: TemplateRef<any>;

    @ViewChild('renameFolderTemplate')
    private renameFolderTemplate: TemplateRef<any>;

    @ViewChild('deleteFolderTemplate')
    private deleteFolderTemplate: TemplateRef<any>;

    @ViewChild('newRootFolderTemplate')
    private newRootFolderTemplate: TemplateRef<any>;

    @ViewChild('userPermissionTemplate')
    private userPermissionTemplate: TemplateRef<any>;

    constructor(
        protected router: Router,
        protected injector: Injector,
        protected containerRef: ViewContainerRef,
        private activatedRoute: ActivatedRoute,
        private cdRef: ChangeDetectorRef,
        protected propertyPanelService: PropertyPanelService,
        private store: Store<AppState>,
        private tabService: TabService,
        private tabSummaryActions: TabSummaryActions,
        private processDataActions: ProcessDataActions,
        private appErrorHandler: AppErrorHandler,
        private propertyPanelActions: PropertyPanelActions,
        private elmRef: ElementRef,
        private layoutInfoActions: LayoutInfoActions,
        private splitter: SplitterService,
        private moduleSettingActions: ModuleSettingActions,
        private dispatcher: ReducerManagerDispatcher,
        private gridActions: GridActions,
        private uti: Uti,
        private administrationActions: AdministrationDocumentActions,
        private administrationSelectors: AdministrationDocumentSelectors,
        @SkipSelf() private dmsDashboardHandler: DmsDashboardHandlerService,
        public appGlobalSelectors: AppGlobalSelectors,
        private globalSettingService: GlobalSettingService,
        private _userService: UserService,
        public popupService: PopupService,
    ) {
        super(router, injector, containerRef);

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
                setTimeout(() => {
                    const tree = action.payload as any[];
                    this.documentsFolder = DocumentHelper.mapToDocumentNode(
                        tree,
                        DocumentTreeTypeDisplayName.TREE_FOLDER,
                    );

                    this._listenStructureTreeSettingsChanged();
                    if (this._params) {
                        this._findDocumentSelected();
                    }
                    this.cdRef.detectChanges();
                }, 0);
            });

        this.shouldGetDocumentQuantity = false;
        this.modeTree = TreeFolderStructModeEnum.SELECTABLE_FOLDER;
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.modeTree) {
        }
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

        this._userService.currentUser.subscribe((user: User) => {
            this.appErrorHandler.executeAction(() => {
                this.currentUser = user;
                this.getTreeIndexing();
            });
        });

        this.dmsDashboardHandler.createFolderTreeDone(true);

        this.activatedRoute.queryParams.pipe(takeUntil(this.getUnsubscriberNotifier())).subscribe((param) => {
            this._params = param;
            if (this.documentsFolder.length) {
                this._findDocumentSelected();
            }
        });
    }
    public getTreeIndexing() {
        this.store.dispatch(
            this.administrationActions.getDocumentTree({
                shouldGetDocumentQuantity: this.shouldGetDocumentQuantity,
                idPerson: '',
                treeType: TreeTypeEnum.INDEXING,
                idLogin: this.currentUser?.id,
            } as GetDocumentTreeOptions),
        );
    }

    private _findDocumentSelected() {
        const { idDocumentContainerScans, idDocumentTree } = this._params;
        if (!idDocumentContainerScans || !idDocumentTree) return;

        const selectedFolder = this.xnDocumentTree.selectDocumentFolder(parseInt(idDocumentTree), true);
        if (!selectedFolder) return;
        selectedFolder.idDocumentContainerScans = idDocumentContainerScans;
        this.dblClickOnNode({ event: {}, node: { data: selectedFolder } });
        this.cdRef.detectChanges();
    }

    private subscribeCaptureModule() {
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
            .subscribe(() => {
                const selectedNode = this.xnDocumentTree?.selectedNode;
                if (!selectedNode) return;

                this.xnDocumentTree.toggleHighlightNodePath(selectedNode);
                this.xnDocumentTree.selectedNode = null;
                this.cdRef.detectChanges();
            });

        this.dispatcher
            .pipe(
                filter((action: CustomAction) => action.type === DocumentThumbnailActions.DOCUMENT_THUMBNAIL_NO_ITEM),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((_) => {
                // when there is no document thumbnail but we can CRUD folders on the tree
                this.modeTree = TreeFolderStructModeEnum.MANAGE_FOLDER;
                this.xnDocumentTree.clearSelectedNode();
                this.store.dispatch(this.administrationActions.clearSelectedFolderOfClassification());
            });

        this.administrationSelectors.documentContainerOcr$
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((documentContainerOcr) => {
                this._documentContainerOcr = documentContainerOcr;
            });
        this.administrationSelectors
            .actionSuccessOfSubtype$(AdministrationDocumentActionNames.CREATE_NEW_TREE_FOLDER)
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((action: CustomAction) => {
                const newFolder = action.payload as DocumentTreeModel;
                if (!newFolder) return;
                newFolder.mode = DocumentTreeModeEnum.VIEW;

                const parentNewNode = this.xnDocumentTree.getNodeByData(
                    Number(newFolder.idDocumentParentAfterCallApi) || null,
                );
                if (!parentNewNode) {
                    this.getTreeIndexing();
                    return;
                }

                const indexInRootNode = this.xnDocumentTree.treeComponent.treeModel.virtualRoot.data.children.findIndex(
                    (x) => x.idDocument === newFolder.idDocument,
                );
                if (indexInRootNode > -1)
                    this.xnDocumentTree.treeComponent.treeModel.virtualRoot.data.children.splice(indexInRootNode, 1);
                if (newFolder.order === 1) parentNewNode.data.children.unshift(newFolder as any);
                else parentNewNode.data.children.push(newFolder as any);

                this.xnDocumentTree.updateTree();
                this.cdRef.detectChanges();
            });
    }

    ngOnDestroy() {
        if (this.headerIconContainerList) {
            this.headerIconContainerList.forEach((item) => {
                item.nativeElement.removeEventListener('mouseenter', this.onTabIconMouseenter.bind(this), false);
                item.nativeElement.removeEventListener('mouseleave', this.onTabIconMouseleave.bind(this), false);
            });
        }

        // update status to false when destroy => so when re-create again we dispatch true for listeners to do stuffs
        this.dmsDashboardHandler.createFolderTreeDone(false);
        this.store.dispatch(new ClearSelectedFolderAction());
        Uti.unsubscribe(this);
        super.onDestroy();
    }

    private subscribeGlobalProperties() {
        this.globalPropertiesStateSubscription = this.globalPropertiesState.subscribe((globalProperties: any) => {
            this.appErrorHandler.executeAction(() => {
                if (globalProperties) {
                    this.globalDateFormat =
                        this.propertyPanelService.buildGlobalDateFormatFromProperties(globalProperties);
                    this.globalNumberFormat =
                        this.propertyPanelService.buildGlobalNumberFormatFromProperties(globalProperties);
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
                    'min-height': `calc(100vh - ${layoutInfo.headerHeight}px - 8px)`,
                    'max-height': `calc(100vh - ${layoutInfo.headerHeight}px - 8px)`,
                    width: '98%',
                };

                this.headerContainerStyle = {
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
                this.headerIconContainerList.forEach((item) => {
                    item.nativeElement.addEventListener('mouseenter', this.onTabIconMouseenter.bind(this));
                    item.nativeElement.addEventListener('mouseleave', this.onTabIconMouseleave.bind(this));
                });
            }
        }, 200);
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

    private changeIconColor(event, color) {
        if ($(event.target)) {
            $(event.target).find('h3').css('color', color);
        }
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

    private resetColumnFilter() {
        // this.store.dispatch(this.tabSummaryActions.clearSingleChoiceFilter(this.ofModule));
        this.store.dispatch(this.tabSummaryActions.unselectColumnFilter(this.ofModule));
        this.store.dispatch(this.tabSummaryActions.uncheckColumnFilterList(this.ofModule));
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

    public trackByTabField(node: { name: string; value: string }) {
        return node.value;
    }

    public clickOnNode($event: { event: Event; node: TreeNode }) {
        const folder = $event.node.data as DocumentTreeModel;
        if (folder.isCompany || folder.isUser) return;

        if (folder.canRead) this.store.dispatch(new GetDocumentFilesByFolderAction(folder));

        this.xnDocumentTree.selectDocumentFolder($event.node.data as DocumentTreeModel);

        folder.path = this.xnDocumentTree.getPathSelectedFolder();
        this.store.dispatch(
            new SelectFolderToImportAction({
                folder,
            }),
        );
        this.store.dispatch(new FolerTreeChange({ folder }));
        this.cdRef.detectChanges();
    }

    public dblClickOnNode($event: { event: any; node: any }) {
        const folder = $event.node.data as DocumentTreeModel;
        if (folder.isCompany || folder.isUser) return;

        if (folder.canRead) this.store.dispatch(new GetDocumentFilesByFolderAction(folder));

        this.xnDocumentTree.selectDocumentFolder($event.node.data as DocumentTreeModel);
        folder.path = this.xnDocumentTree.getPathSelectedFolder();
        this.store.dispatch(
            new SelectFolderToImportAction({
                folder,
            }),
        );
        this.store.dispatch(new FolerTreeChange({ folder }));
        this.cdRef.detectChanges();
    }

    private _listenStructureTreeSettingsChanged() {
        this.listenStructureTreeSettingsChanges()
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((structureTreeSettings) => {
                if (structureTreeSettings.isCollapsedTree) {
                    this.store.dispatch(
                        this.layoutInfoActions.setSplitAreasSize(
                            this.tabID,
                            { hideSplitter: true, sizes: [4.8, 95.2] },
                            this.ofModule,
                        ),
                    );
                } else {
                    this.store.dispatch(
                        this.layoutInfoActions.setSplitAreasSize(
                            this.tabID,
                            { hideSplitter: false, sizes: null },
                            this.ofModule,
                        ),
                    );
                }
            });
    }

    public rightClickOnTree(event) {
        const contextMenuActions: Array<ContextMenuAction> = [
            new ContextMenuAction({
                click: () => {
                    const currentIdLogin = Number(this.currentUser.id);
                    let idDocumentParentAfterCallApi;
                    const data = event.treeComponent.treeModel.virtualRoot.data;
                    const firstChild = data?.children[0];
                    if (firstChild?.isCompany) {
                        for (let index = 0; index < data.children.length; index++) {
                            const companyTree = data.children[index];
                            const userTree = companyTree.children.find((x) => Number(x.idLogin) === currentIdLogin);
                            if (userTree) {
                                idDocumentParentAfterCallApi = userTree.idDocument;
                                break;
                            }
                        }
                    } else if (firstChild?.isUser) {
                        const userTree = data.children.find((x) => Number(x.idLogin) === currentIdLogin);
                        if (userTree) idDocumentParentAfterCallApi = userTree.idDocument;
                    } else idDocumentParentAfterCallApi = IdDocumentTreeConstant.INDEXING; // 3 is default indexing tree

                    event.treeComponent.treeModel.virtualRoot.data.idDocumentParentAfterCallApi =
                        idDocumentParentAfterCallApi;
                    event.treeComponent.treeModel.virtualRoot.data.idDocumentParent = IdDocumentTreeConstant.INDEXING; // 3 is default indexing tree
                    event.treeComponent.treeModel.virtualRoot.data.idDocumentType = 5; // 5 is indexing tree
                    event.treeComponent.treeModel.virtualRoot.data.icon = this.IconNamesEnum.TREE_FOLDER;
                    event.treeComponent.treeModel.virtualRoot.data.idLogin = currentIdLogin;
                    this.newFolder(event);
                },
                enabled: true,
                visible: true,
                template: this.newRootFolderTemplate,
                contextTemplate: {
                    node: event.node,
                    treeComponent: event.treeComponent,
                },
            }),
            new ContextMenuAction({
                divider: true,
                visible: true,
            }),
        ];
        this.contextMenuSubject.next(contextMenuActions);
    }

    public rightClickOnNode(event) {
        event.event.preventDefault();

        const contextMenuActions = [];
        if (event.node?.data?.canEdit) {
            contextMenuActions.push(
                new ContextMenuAction({
                    click: () => {
                        if (event.node.data.isCompany || event.node.data.isUser)
                            event.node.data.idDocumentParentAfterCallApi = IdDocumentTreeConstant.INDEXING; // 3 is default indexing tree
                        this.addSubfolder(event);
                    },
                    enabled: true,
                    visible: true,
                    template: this.createSubFolderTemplate,
                    contextTemplate: {
                        node: event.node,
                        treeComponent: event.treeComponent,
                    },
                }),
            );
            if (!event.node.data.isCompany && !event.node.data.isUser) {
                contextMenuActions.push(
                    new ContextMenuAction({
                        click: () => {
                            this.renameFolder(event);
                        },
                        enabled: true,
                        visible: !event?.node?.data?.isReadOnly,
                        template: this.renameFolderTemplate,
                        contextTemplate: {
                            node: event.node,
                            treeComponent: event.treeComponent,
                        },
                    }),
                );
            }
        }
        if (event.node?.data?.canDelete) {
            contextMenuActions.push(
                new ContextMenuAction({
                    click: () => {
                        this.deleteFolder(event);
                    },
                    enabled: true,
                    visible: !event?.node?.data?.isReadOnly,
                    template: this.deleteFolderTemplate,
                    contextTemplate: {
                        node: event.node,
                        treeComponent: event.treeComponent,
                    },
                }),
            );
        }

        if (event.node?.data?.canShare && !event.node.data.isCompany && !event.node.data.isUser) {
            contextMenuActions.push(
                new ContextMenuAction({
                    click: () => {
                        this.showModalMemberPermission(event);
                    },
                    enabled: true,
                    visible: !event?.node?.data?.isReadOnly,
                    template: this.userPermissionTemplate,
                    contextTemplate: {
                        node: event.node,
                        treeComponent: event.treeComponent,
                    },
                }),
            );
        }

        if (contextMenuActions?.length) {
            contextMenuActions.push(
                new ContextMenuAction({
                    divider: true,
                    visible: true,
                }),
            );
        }

        if (event.node?.data?.canShare && !event.node?.data?.isUser && !event.node?.data?.isCompany) {
            contextMenuActions.unshift(
                new ContextMenuAction({
                    click: () => {
                        this.toggleVisibleFolder({
                            event: !event?.node?.data?.visible,
                            node: event.node,
                        });
                    },
                    enabled: true,
                    visible: true,
                    template: this.activeFolderTemplate,
                    contextTemplate: {
                        node: event.node,
                        treeComponent: event.treeComponent,
                    },
                }),
                new ContextMenuAction({
                    divider: true,
                    visible: true,
                }),
            );
        }

        this.contextMenuSubject.next(contextMenuActions);
    }

    private showModalMemberPermission(event) {
        const nodeData = event?.node?.data;
        const popupRef = this.popupService.open({
            content: WidgetMemberPermissionDialogComponent,
            hasBackdrop: true,
            header: {
                title: `${nodeData?.name}'s Permission`,
                iconClose: true,
                icon: <IconHeader>{
                    type: 'resource',
                    content: IconNames.MEMBER_PERMISSION,
                },
            },
            disableCloseOutside: true,
            minWidth: 750,
            minHeight: 600,
            defaultHeight: '600px',
            data: {
                data: nodeData,
                treeType: TreeTypeEnum.INDEXING,
            },
            optionResize: true,
            optionDrapDrop: true,
        });
        popupRef.afterClosed$.pipe(take(1)).subscribe(({ type, data }: PopupCloseEvent<any>) => {
            if (type === 'close' && data?.isSuccess) {
                console.log(`close`);
            }
        });
    }
}
