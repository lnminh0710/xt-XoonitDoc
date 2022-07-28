import { Component, ChangeDetectorRef, Input, Output, EventEmitter, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { BaseComponent, ModuleList } from '@app/pages/private/base';
import { Router } from '@angular/router';
import { DocumentManagementSelectors } from '@app/pages/document-management/document-management.statemanagement/document-management.selectors';
import {
    DocumentManagementActionNames,
    GetDocumentsByKeywordAction,
    GetDocumentFilesByFolderAction,
    DocumentManagementSuccessAction,
} from '@app/pages/document-management/document-management.statemanagement/document-management.actions';
import { Store } from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import { DocumentTreeModel } from '@app/models/administration-document/document-tree.payload.model';
import { WidgetDetail, TabSummaryModel, GlobalSettingModel, ModuleSettingModel } from '@app/models';
import { isBoolean } from 'lodash-es';
import {
    AdministrationDocumentActions,
    TabSummaryActions,
    ModuleSettingActions,
    CloudActions,
} from '@app/state-management/store/actions';
import { DocumentFileInfoModel } from '@app/state-management/store/models/administration-document/state/document-file-info.state.model';
import { PerfectScrollbarConfigInterface, PerfectScrollbarDirective } from 'ngx-perfect-scrollbar';
import { Subject, Observable, zip, Subscription } from 'rxjs';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { GlobalSettingService, AppErrorHandler, ModuleSettingService } from '@app/services';
import { DocumentMyDMType, ModuleType, GlobalSettingConstant, MenuModuleId } from '@app/app.constants';
import { ExplorerFileModel } from '@app/models/administration-document/document-form/document-tree-media.model';
import * as tabSummaryReducer from '@app/state-management/store/reducer/tab-summary';
import { String, Uti } from '@app/utilities';
import { AdministrationDocumentSelectors } from '@app/state-management/store/reducer';
import { takeUntil, filter, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import * as moduleSettingReducer from '@app/state-management/store/reducer/module-setting';
import { isEmpty, isEqual, cloneDeep } from 'lodash-es';

const VIEW_TYPE = {
    GRID: 'grid',
    LIST: 'list',
};
@Component({
    selector: 'widget-file-explorer',
    templateUrl: './widget-file-explorer.component.html',
    styleUrls: ['./widget-file-explorer.component.scss'],
})
export class WidgetFileExplorerComponent extends BaseComponent implements OnInit, OnDestroy {
    @Input() widgetDetail: WidgetDetail;
    @Output() dispatchData = new EventEmitter<any>();

    @ViewChild(PerfectScrollbarDirective) scrollbar: PerfectScrollbarDirective;
    @ViewChild(InfiniteScrollDirective) infiniteScroll: InfiniteScrollDirective;

    @ViewChild('horizontalSplit') horizontalSplit: any;

    // TODO: set Page size by screen width, current version will load all
    // private PAGE_SIZE_DEFAULT = 16;
    // TODO: load all document
    private PAGE_SIZE_DEFAULT = 999;

    //#region PUBLIC PROPERTIES
    public files: ExplorerFileModel[];
    public filesDisplay: ExplorerFileModel[];

    public selectedFolder: DocumentTreeModel;
    public selectedFile: any;
    public isLoading: boolean;
    public currentPage: number;
    public currentPageSize: number;
    public allowLoadFilesMore: boolean;
    public throttleSubject = new Subject<Event>();
    public perfectScrollbarConfig = <PerfectScrollbarConfigInterface>{
        suppressScrollX: false,
    };

    currentPath = '';
    public heightPercentFileListSelector: number;
    searchText = '';
    searchTextChanged: Subject<string> = new Subject<string>();
    public VIEW_TYPE_CONSTANT = VIEW_TYPE;
    public currentViewType = VIEW_TYPE.GRID;
    //#endregion

    /* Edit document*/
    isShowDialog = false;
    dialogClass = 'widget-file-explorer-container';
    dialogHeight = '900';
    dialogWidth = '1800';

    private moduleSetting: ModuleSettingModel[];
    public splitterConfig = {
        leftHorizontal: 20,
        rightHorizontal: 80,
        subRightLeftHorizontal: 0,
        subRightRightHorizontal: 100,
    };
    public tabList: TabSummaryModel[];
    public tabSetting: any;
    private _isChangedFolder: boolean;
    private _updatedData: {
        data: any[];
        previousDocumentType: DocumentMyDMType;
        currentDocumentType: DocumentMyDMType;
    };

    idMainDocument: number;
    idDocumentTypeEnum: number;
    /* Edit document*/

    private moduleSettingState: Observable<ModuleSettingModel[]>;
    private moduleSettingStateSubscription: Subscription;

    constructor(
        protected router: Router,
        private cdRef: ChangeDetectorRef,
        private store: Store<AppState>,
        private documentManagementSelectors: DocumentManagementSelectors,
        protected administrationActions: AdministrationDocumentActions,
        protected administrationSelectors: AdministrationDocumentSelectors,
        private globalSettingService: GlobalSettingService,
        private moduleSettingService: ModuleSettingService,
        private appErrorHandler: AppErrorHandler,
        private tabSummaryActions: TabSummaryActions,
        private moduleSettingActions: ModuleSettingActions,
        private globalSettingConstant: GlobalSettingConstant,
        private cloudActions: CloudActions,
    ) {
        super(router);
        this.isLoading = false;
        this.currentPageSize = this.PAGE_SIZE_DEFAULT;
        this.allowLoadFilesMore = true;

        this.moduleSettingState = this.store.select(
            (state) => moduleSettingReducer.getModuleSettingState(state, this.ofModule.moduleNameTrim).moduleSetting,
        );

        this.onSubcribeAction();
    }

    ngOnInit(): void {
        this.getModuleSetting();
        this.subcribeModuleSettingState();
    }

    public ngOnDestroy() {
        super.onDestroy();
        Uti.unsubscribe(this);
    }

    private onSubcribeAction() {
        this.documentManagementSelectors
            .actionOfType$(DocumentManagementActionNames.GET_DOCUMENT_FILES_BY_FOLDER)
            .pipe(
                filter((action: GetDocumentFilesByFolderAction) => !!action.payload),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((action: GetDocumentFilesByFolderAction) => {
                const folder = action.payload;
                if (this.selectedFolder && this.selectedFolder.idDocument === folder.idDocument) return;

                this.changeCurrentPageSizeByWidgetWidth();

                this.currentPath = folder.path;
                this.files = null;
                this.filesDisplay = null;
                this.heightPercentFileListSelector = 110;
                this.allowLoadFilesMore = true;
                this.selectedFolder = folder;
                this.currentPage = 1;
                this.getFiles(this.selectedFolder, this.currentPage, this.currentPageSize);

                this.isLoading = true;
                this.cdRef.detectChanges();
            });

        this.documentManagementSelectors
            .actionSuccessOfSubtype$(DocumentManagementActionNames.GET_DOCUMENTS_BY_KEYWORD)
            .pipe(
                filter((action: DocumentManagementSuccessAction) => !!action.payload),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((action: DocumentManagementSuccessAction) => {
                this.isLoading = false;
                this.searchText = '';
                if (!action.payload.results || !action.payload.results.length) {
                    // load out of documents;
                    this.allowLoadFilesMore = false;
                    return;
                }
                this.files = this.files || [];
                (action.payload.results as any[]).forEach((data) => {
                    data.isActive = isBoolean(data.isActive)
                        ? data.isActive
                        : data.isActive && data.isActive.toLowerCase() === 'true'
                        ? true
                        : false;
                    data.isDeleted = isBoolean(data.isDeleted)
                        ? data.isDeleted
                        : data.isDeleted && data.isDeleted.toLowerCase() === 'true'
                        ? true
                        : false;

                    this.files.push(data);
                });

                this.filesDisplay = this.files;
                this.cdRef.detectChanges();
            });

        this.searchTextChanged
            .pipe(debounceTime(500), distinctUntilChanged(), takeUntil(super.getUnsubscriberNotifier()))
            .subscribe((text) => {
                if (!this.files) return;
                this.searchText = text;

                if (!this.searchText) {
                    this.filesDisplay = this.files;
                    this.cdRef.detectChanges();
                    return;
                }

                const searchTextLowerCase = this.searchText.toLowerCase();
                this.filesDisplay = this.files.filter(
                    (x) =>
                        (x.fullText && x.fullText.toLowerCase().includes(searchTextLowerCase)) ||
                        (x.contacts && x.contacts.toLowerCase().includes(searchTextLowerCase)) ||
                        (x.mediaName && x.mediaName.toLowerCase().includes(searchTextLowerCase)),
                );

                this.cdRef.detectChanges();
            });

        this.store
            .select(
                (state) =>
                    moduleSettingReducer.getModuleSettingState(state, ModuleList.Processing.moduleNameTrim)
                        .moduleSetting,
            )
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((moduleSettingState: ModuleSettingModel[]) => {
                this.appErrorHandler.executeAction(() => {
                    if (!isEmpty(moduleSettingState) && moduleSettingState.length) {
                        if (!isEqual(moduleSettingState, this.moduleSetting)) {
                            this.moduleSetting = cloneDeep(moduleSettingState);
                            const jsonSettings = this.moduleSettingService.parseJsonSettings(this.moduleSetting);
                            if (jsonSettings) {
                                this.tabSetting = jsonSettings;
                            }
                        }
                    } else {
                        this.moduleSetting = [];
                        this.tabSetting = null;
                    }
                });
            });

        this.store
            .select((state) => tabSummaryReducer.getTabSummaryState(state, ModuleList.Processing.moduleNameTrim).tabs)
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((tabHeaderDataModel: TabSummaryModel[]) => {
                this.appErrorHandler.executeAction(() => {
                    if (this.tabList && this.tabList.length) {
                        this.tabList.forEach((tab) => tab.badgeColorChanged && tab.badgeColorChanged.unsubscribe());
                    }
                    this.tabList = tabHeaderDataModel;

                    if (this._isChangedFolder && this.tabList && this.tabList.length) {
                        this.fillUpdatedDataWhenChangeFolder();
                    }
                });
            });
    }

    close() {
        this.isShowDialog = false;
    }

    onDbclick(file: ExplorerFileModel) {
        //TODO: show dialog edit document
        // this.isShowDialog = true;
        // if (!file.idRepDocumentGuiType && file.idMainDocument) return;
        // this.idDocumentTypeEnum = parseInt(file.idRepDocumentGuiType);
        // this.idMainDocument = parseInt(file.idMainDocument);
        // this.getDocumentDetailByType();
    }

    private changeCurrentPageSizeByWidgetWidth() {
        // TODO: set Page size by screen width, current version will load all
        // const width = document.getElementsByClassName('widget-file-explorer-container')[0]['offsetWidth'];
        // if (800 < width && width < 1000) {
        //     this.currentPageSize = 30;
        // } else if (1000 < width && width < 1200) {
        //     this.currentPageSize = 48;
        // } else {
        //     this.currentPageSize = this.PAGE_SIZE_DEFAULT;
        // }
    }

    public onClickFile(file: ExplorerFileModel) {
        this.selectedFile = file;
        this.store.dispatch(
            this.administrationActions.setDocFileInfoToCaptureAction({
                idMainDocument: file.idMainDocument,
                idRepDocumentGuiType: file.idRepDocumentGuiType,
            } as DocumentFileInfoModel),
        );

        this.store.dispatch(this.cloudActions.viewPdf(file));

        this.dispatchData.emit([
            {
                key: 'IdDocumentContainerScans',
                value: file.idDocumentContainerScans,
            },
        ]);
        // this.store.dispatch(new OpenFileIntoViewerAction(this.widgetDetail.id, file, this.selectedFolder));
    }

    public getFiles(folder: DocumentTreeModel, page: number, pageSize: number) {
        this.store.dispatch(
            new GetDocumentsByKeywordAction({
                fieldName: 'idDocumentTree',
                folder: folder,
                index: 'maindocument',
                moduleId: ModuleList.Document.idSettingsGUI,
                pageIndex: page,
                pageSize: pageSize,
                searchPattern: 'Both_*X*',
                fieldNames: [],
                fieldValues: [],
            }),
        );

        this.isLoading = true;
        this.cdRef.detectChanges();
    }

    public doScrollUp($event) {
        this.allowLoadFilesMore = false;
    }

    public doScrollDown($event) {
        this.allowLoadFilesMore = true;
    }

    public doScrollReachEnd($event: Event) {
        if (!this.allowLoadFilesMore || !this.filesDisplay || !this.filesDisplay.length) {
            return;
        }
        this.loadFilesMore();
    }

    public loadFilesMore() {
        if (!this.allowLoadFilesMore) return;

        if (this.isLoading && this.allowLoadFilesMore) return;

        this.currentPage += 1;
        this.getFiles(this.selectedFolder, this.currentPage, this.currentPageSize);
        this.appendHeight();
    }

    public appendHeight() {
        this.heightPercentFileListSelector += 10;
        this.scrollbar.scrollToTop(20);
    }

    onSearchFile(text: string) {
        this.searchTextChanged.next(text);
    }

    public dragEnd(event: any) {
        this.splitterConfig = {
            ...this.splitterConfig,
            leftHorizontal: this.horizontalSplit.displayedAreas[0].size,
            rightHorizontal: this.horizontalSplit.displayedAreas[1].size,
        };

        this.saveSplitterSettings();
    }

    private saveSplitterSettings() {
        this.globalSettingService
            .getAllGlobalSettings(ModuleList.Processing.idSettingsGUI)
            .subscribe((getAllGlobalSettings) => {
                let verticalTabSplitterSettings = getAllGlobalSettings.find(
                    (x) => x.globalName == 'VerticalTabSplitter',
                );
                if (
                    !verticalTabSplitterSettings ||
                    !verticalTabSplitterSettings.idSettingsGlobal ||
                    !verticalTabSplitterSettings.globalName
                ) {
                    verticalTabSplitterSettings = new GlobalSettingModel({
                        globalName: 'VerticalTabSplitter',
                        globalType: 'VerticalTabSplitter',
                        description: 'Vertical Tab Splitter',
                        isActive: true,
                    });
                }
                verticalTabSplitterSettings.idSettingsGUI = ModuleList.Processing.idSettingsGUI;
                verticalTabSplitterSettings.jsonSettings = JSON.stringify(this.splitterConfig);
                verticalTabSplitterSettings.isActive = true;

                this.globalSettingService.saveGlobalSetting(verticalTabSplitterSettings).subscribe((data) => {
                    this.globalSettingService.saveUpdateCache(
                        ModuleList.Processing.idSettingsGUI.toString(),
                        verticalTabSplitterSettings,
                        data,
                    );
                });
            });
    }

    private getDocumentDetailByType() {
        switch (this.idDocumentTypeEnum) {
            case DocumentMyDMType.Invoice:
                this.store.dispatch(this.administrationActions.getCapturedInvoiceDocumentDetail(this.idMainDocument));
                break;

            case DocumentMyDMType.Contract:
                this.store.dispatch(this.administrationActions.getCapturedContractDocumentDetail(this.idMainDocument));
                break;

            case DocumentMyDMType.OtherDocuments:
                this.store.dispatch(this.administrationActions.getCapturedOtherDocumentDetail(this.idMainDocument));
                break;

            default:
                return;
        }
    }

    private fillUpdatedDataWhenChangeFolder() {
        this._isChangedFolder = false;
        this.store.dispatch(this.administrationActions.fillUpdatedDataAfterFolder({ data: this._updatedData.data }));
    }

    // private loadTabsByDocumentType() {
    //     const param = {
    //         module: ModuleList.Capture,
    //         idObject: this.idMainDocument,
    //         idRepDocumentType: this.idDocumentTypeEnum,
    //         documentType: DocumentHelper.parseDocumentTypeToDocumentProcessingTypeEnum(this.idDocumentTypeEnum),
    //     };
    //     this.store.dispatch(this.tabSummaryActions.loadTabsByIdDocumentType(param));
    // }

    public changeViewMode(viewType: string) {
        this.currentViewType = viewType;
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
}
