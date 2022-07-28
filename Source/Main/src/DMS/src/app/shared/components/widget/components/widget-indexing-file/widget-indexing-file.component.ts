import {
    Component,
    ChangeDetectorRef,
    Input,
    Output,
    EventEmitter,
    ViewChild,
    OnInit,
    OnDestroy,
    TemplateRef,
} from '@angular/core';
import { BaseComponent, ModuleList } from '@app/pages/private/base';
import { Router } from '@angular/router';
import { DocumentManagementSelectors } from '@app/pages/document-management/document-management.statemanagement/document-management.selectors';
import {
    DocumentManagementActionNames,
    GetDocumentsByKeywordAction,
    GetDocumentFilesByFolderAction,
    DocumentManagementSuccessAction,
} from '@app/pages/document-management/document-management.statemanagement/document-management.actions';
import { ReducerManagerDispatcher, Store } from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import { DocumentTreeModel } from '@app/models/administration-document/document-tree.payload.model';
import { WidgetDetail, TabSummaryModel, GlobalSettingModel, ModuleSettingModel, ControlGridModel } from '@app/models';
import { isBoolean, find, findIndex, get } from 'lodash-es';
import {
    AdministrationDocumentActions,
    TabSummaryActions,
    ModuleSettingActions,
    CloudActions,
    AdministrationDocumentActionNames,
    CustomAction,
    PreissChildActions,
} from '@app/state-management/store/actions';
import { DocumentFileInfoModel } from '@app/state-management/store/models/administration-document/state/document-file-info.state.model';
import { PerfectScrollbarConfigInterface, PerfectScrollbarDirective } from 'ngx-perfect-scrollbar';
import { Subject, Observable, zip, Subscription } from 'rxjs';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import {
    GlobalSettingService,
    AppErrorHandler,
    ModuleSettingService,
    DatatableService,
    PreissChildService,
    DocumentService,
} from '@app/services';
import {
    DocumentMyDMType,
    ModuleType,
    GlobalSettingConstant,
    MenuModuleId,
    LocalStorageKey,
    Configuration,
    MessageModal,
    IdRepDocumentGuiTypeConstant,
} from '@app/app.constants';
import { ExplorerFileModel } from '@app/models/administration-document/document-form/document-tree-media.model';
import * as tabSummaryReducer from '@app/state-management/store/reducer/tab-summary';
import { String, Uti } from '@app/utilities';
import { AdministrationDocumentSelectors } from '@app/state-management/store/reducer';
import { takeUntil, filter, debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import * as moduleSettingReducer from '@app/state-management/store/reducer/module-setting';
import { isEmpty, isEqual, cloneDeep } from 'lodash-es';
import { DocumentImageOcrService } from '@app/pages/private/modules/image-control/services';
import { AttachDocument } from '@app/models/email';
import { IconNames } from '@app/app-icon-registry.service';
import { ColDef } from 'ag-grid-community';
import { PopupService } from '@app/xoonit-share/components/global-popup/services/popup.service';
import { HeaderNoticeRef } from '@app/xoonit-share/components/global-popup/components/header-popup/header-notice-ref';
import { ToasterService } from 'angular2-toaster';
import { XnAgGridComponent } from '@xn-control/xn-ag-grid/pages/ag-grid-container/xn-ag-grid.component';

const VIEW_TYPE = {
    GRID: 'grid',
    LIST: 'list',
};
@Component({
    selector: 'widget-indexing-file',
    templateUrl: './widget-indexing-file.component.html',
    styleUrls: ['./widget-indexing-file.component.scss'],
})
export class WidgetIndexingFileComponent extends BaseComponent implements OnInit, OnDestroy {
    public IconNamesEnum = IconNames;

    @Input() widgetDetail: WidgetDetail;
    @Input() globalProperties: any;
    @Output() dispatchData = new EventEmitter<any>();
    public isFullScreen = false;
    @Output() onMaximizeWidget = new EventEmitter<any>();

    @ViewChild(PerfectScrollbarDirective) scrollbar: PerfectScrollbarDirective;
    @ViewChild(InfiniteScrollDirective) infiniteScroll: InfiniteScrollDirective;

    @ViewChild('horizontalSplit') horizontalSplit: any;
    @ViewChild('confirmDelete') confirmDelete: TemplateRef<any>;
    @ViewChild('xnAgGrid') xnAgGrid: XnAgGridComponent;

    // TODO: set Page size by screen width, current version will load all
    // private PAGE_SIZE_DEFAULT = 16;
    // TODO: load all document
    private PAGE_SIZE_DEFAULT = 999;

    //#region PUBLIC PROPERTIES
    public files: ExplorerFileModel[];
    public filesDisplay: ExplorerFileModel[];

    public selectedFolder: DocumentTreeModel;
    public isShowUpload: boolean;
    public selectedFile: any;
    public selectedFiles: any[] = [];
    public selectedFilesKey: any[] = [];
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
    dialogClass = 'widget-indexing-file-container';
    dialogHeight = '900';
    dialogWidth = '1800';
    public svgIconUndo = IconNames.WIDGET_MYDM_FORM_Reset;

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
    fileList = <ControlGridModel>{
        columns: [],
        data: [],
        totalResults: 0,
    };
    filesUpload: any;
    idPriceTag: any;

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
        private documentImageOcrService: DocumentImageOcrService,
        private documentService: DocumentService,
        private datatableService: DatatableService,
        private dispatcher: ReducerManagerDispatcher,
        private preissChildService: PreissChildService,
        protected popupService: PopupService,
        private toasterService: ToasterService,
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

    ngAfterViewInit(): void {
        const formElem = document.getElementById('form-upload-file');
        if (!formElem) return;

        'drag dragstart'.split(' ').forEach((eventName) => {
            formElem.addEventListener(eventName, (e: DragEvent) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        'dragenter dragover'.split(' ').forEach((eventName) => {
            formElem.addEventListener(eventName, (e: DragEvent) => {
                e.preventDefault();
                e.stopPropagation();

                formElem.classList.add('is-dragging-over');
            });
        });

        'dragleave dragend'.split(' ').forEach((eventName) => {
            formElem.addEventListener(eventName, (e: DragEvent) => {
                e.preventDefault();
                e.stopPropagation();

                formElem.classList.remove('is-dragging-over');
            });
        });

        formElem.addEventListener('drop', (e: DragEvent) => {
            const droppedFiles = e.dataTransfer.files;
            formElem.classList.remove('is-dragging-over');

            this.dropFiles(droppedFiles);
        });
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
                if (this.selectedFolder && this.selectedFolder.idDocument === folder.idDocument) {
                    if (
                        folder.idDocumentContainerScans &&
                        this.selectedFile?.IdDocumentContainerScans !== folder.idDocumentContainerScans
                    )
                        this.onClickFile(
                            find(this.files, ['IdDocumentContainerScans', +folder.idDocumentContainerScans]),
                        );

                    return;
                }

                this.loadDocumentByFolder(folder);
            });
        this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return action.type === PreissChildActions.SELECT_CAR;
                }),
                map((action: CustomAction) => action.payload),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((payload: any) => {
                // call api get attachment here
                this.idPriceTag = payload?.info?.IdPriceTag;

                if (!payload?.info?.IdPriceTag) {
                    this.selectedFolder = null;
                    return;
                }
                this.selectedFolder = {
                    name: get(payload, ['property', 'car.name'], ''),
                    idDocument: payload.info.IdPriceTag,
                    canRead: true,
                    canEdit: true,
                } as DocumentTreeModel;
                this.getAttachmentOfCar();
            });

        this.administrationSelectors
            .actionSuccessOfSubtype$(AdministrationDocumentActionNames.RENAME_TREE_FOLDER)
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((action: CustomAction) => {
                const folder = cloneDeep(action.payload as DocumentTreeModel);

                if (this.selectedFolder && this.selectedFolder.idDocument !== folder.idDocument) return;
                this.loadDocumentByFolder(folder);
            });

        this.administrationSelectors
            .actionSuccessOfSubtype$(AdministrationDocumentActionNames.DELETE_TREE_FOLDER)
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((action: CustomAction) => {
                const folder = action.payload;

                if (this.selectedFolder && this.selectedFolder?.idDocument !== folder?.data?.idDocument) return;
                this.currentPath = '';
                this.files = null;
                this.filesDisplay = null;
                this.selectedFile = null;
                this.selectedFiles = [];
                this.selectedFilesKey = [];
                this.heightPercentFileListSelector = 110;
                this.allowLoadFilesMore = true;
                this.selectedFolder = null;
                this.currentPage = 1;
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

    private loadDocumentByFolder(folder: DocumentTreeModel) {
        this.changeCurrentPageSizeByWidgetWidth();

        this.currentPath = folder.name;
        this.files = null;
        this.filesDisplay = null;
        this.selectedFile = null;
        this.selectedFiles = [];
        this.selectedFilesKey = [];
        this.heightPercentFileListSelector = 110;
        this.allowLoadFilesMore = true;
        this.selectedFolder = cloneDeep(folder);
        this.currentPage = 1;
        this.isLoading = true;
        this.getFiles(this.selectedFolder);

        this.cdRef.detectChanges();
    }

    private getAttachmentOfCar() {
        this.preissChildService.getAttachmentByPriceTag(this.idPriceTag).subscribe((res) => {
            this.isLoading = false;
            this.searchText = '';
            const resData = get(res, ['item', 1], []);
            if (!resData || !resData.length) {
                // load out of documents;
                this.allowLoadFilesMore = false;
                this.files = [];
                this.filesDisplay = [];
                this.fileList = this.datatableService.buildEditableDataSource(res.item);
                this.cdRef.detectChanges();
                return;
            }
            this.files = [];
            this.fileList = this.datatableService.buildEditableDataSource(res.item);
            // this.fileList = { columns: [], data: [], totalResults: 0 };
            resData.forEach((data) => {
                const reg = new RegExp(`(.*?)${Configuration.PublicSettings.publicFolder}`, 'ig');
                data.FilePath = data.FilePath || data.MediaRelativePath.replace(reg, '');
                data.FileName = data.FileName || data.MediaName;
                data.DocumentName = data.DocumentName || data.FileName;
                data.IdDocumentContainerFiles = data.IdDocumentContainerFiles || data.IdDocumentTreeMedia;
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

                data.extension = this._getExtension(data.FileName);
                this.files.push(data);
            });

            this.filesDisplay = this.files;
            this.cdRef.detectChanges();
        });
    }

    private dropFiles(files: any) {
        if (!files || !files.length || !this.selectedFolder) return;
        this.filesUpload = files;
        this.isShowUpload = true;
    }

    private changeCurrentPageSizeByWidgetWidth() {
        // TODO: set Page size by screen width, current version will load all
        // const width = document.getElementsByClassName('widget-indexing-file-container')[0]['offsetWidth'];
        // if (800 < width && width < 1000) {
        //     this.currentPageSize = 30;
        // } else if (1000 < width && width < 1200) {
        //     this.currentPageSize = 48;
        // } else {
        //     this.currentPageSize = this.PAGE_SIZE_DEFAULT;
        // }
    }

    public onRowClick(event, isDbClick: boolean) {
        let data = {};
        if (!isDbClick) {
            event.forEach((item) => {
                data[item.key] = item.value;
                return item;
            });
        } else data = event;

        this.onClickFile(data, true);
        setTimeout(() => {
            this.selectedFiles = this.xnAgGrid.api.getSelectedRows();
            this.selectedFilesKey = this.selectedFiles.map((x) => x.IdDocumentContainerFiles);
        }, 0);
    }

    public onClickFile(file: any, reset?: boolean, event?: any) {
        if (reset) {
            localStorage.setItem(LocalStorageKey.LocalStorageGSCaptureSearchText, '');
        }
        if (!file) return;

        const isChangeSelectedFile = this.handleSelectFileWithCtrlShift(file, event);
        if (!isChangeSelectedFile) return;

        this.store.dispatch(this.administrationActions.showDocumentViewer(this.selectedFile));
        this.store.dispatch(
            this.administrationActions.setSelectedDocument(
                new AttachDocument({
                    fileName: this.selectedFile?.FileName,
                    scannedPath: this.selectedFile?.FilePath,
                    idDocumentContainerScans: this.selectedFile?.IdDocumentContainerScans,
                    idDocumentContainerFiles: this.selectedFile?.IdDocumentContainerFiles,
                }),
            ),
        );

        this.dispatchData.emit([
            {
                key: 'IdDocumentContainerScans',
                value: file.idDocumentContainerScans,
            },
        ]);
    }

    private handleSelectFileWithCtrlShift(file: any, event: any): boolean {
        let isChangeSelectedFile = true;

        if (!file) {
            this.selectedFile = null;
            this.selectedFiles = [];
            this.selectedFilesKey = [];
            return isChangeSelectedFile;
        }
        if (!event || (!event?.ctrlKey && !event?.shiftKey)) {
            this.selectedFile = file;
            this.selectedFiles = [file];
            this.selectedFilesKey = this.selectedFiles.map((x) => x.IdDocumentContainerFiles);
            return isChangeSelectedFile;
        }
        if (event.ctrlKey) {
            const index = this.selectedFiles.findIndex(
                (x) => x.IdDocumentContainerFiles === file.IdDocumentContainerFiles,
            );
            if (index > -1)
                this.selectedFiles = this.selectedFiles.filter(
                    (x) => x.IdDocumentContainerFiles !== file.IdDocumentContainerFiles,
                );
            else {
                this.selectedFile = file;
                this.selectedFiles.push(file);
            }
        }
        if (event.shiftKey) {
            const indexNewSelectedFile = this.files.findIndex(
                (x) => x['IdDocumentContainerFiles'] === file.IdDocumentContainerFiles,
            );
            if (!this.selectedFile && indexNewSelectedFile === 0) {
                this.selectedFile = file;
                this.selectedFiles = [file];
            } else {
                const indexCurrentSelectedFile = this.selectedFile
                    ? this.files.findIndex(
                          (x) => x['IdDocumentContainerFiles'] === this.selectedFile.IdDocumentContainerFiles,
                      )
                    : 0;

                let startIndex =
                    indexNewSelectedFile > indexCurrentSelectedFile ? indexCurrentSelectedFile : indexNewSelectedFile;
                const endIndex =
                    indexNewSelectedFile > indexCurrentSelectedFile ? indexNewSelectedFile : indexCurrentSelectedFile;

                this.selectedFiles = [];
                for (startIndex; startIndex < endIndex + 1; startIndex++)
                    this.selectedFiles.push(this.files[startIndex]);
            }
        }

        if (this.selectedFiles?.length === 1) this.selectedFile = this.selectedFiles[0];

        if (!this.selectedFiles?.length) this.selectedFile = null;

        this.selectedFilesKey = this.selectedFiles.map((x) => x.IdDocumentContainerFiles);
        return isChangeSelectedFile;
    }

    public getFiles(folder: DocumentTreeModel) {
        this.selectedFile = null;
        this.selectedFiles = [];
        this.selectedFilesKey = [];

        this.documentImageOcrService.getDocumentOfTree(folder.idDocument + '').subscribe((res) => {
            this.isLoading = false;
            this.searchText = '';
            const resData = get(res, [1], []);
            this.fileList = this.datatableService.buildEditableDataSource(res);
            if (!resData || !resData.length) {
                // load out of documents;
                this.allowLoadFilesMore = false;
                this.files = [];
                this.filesDisplay = [];
                this.cdRef.detectChanges();
                return;
            }
            this.files = [];
            resData.forEach((data) => {
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

                data.extension = this._getExtension(data.FileName);
                if (data.IdDocumentContainerScans == folder.idDocumentContainerScans) this.onClickFile(data);
                this.files.push(data);
            });

            this.filesDisplay = this.files;
            this.cdRef.detectChanges();
        });

        this.cdRef.detectChanges();
    }

    public refreshListData() {
        this.filesUpload = [];
        if (this.ofModule.idSettingsGUI === MenuModuleId.preissChild) this.getAttachmentOfCar();
        else this.getFiles(this.selectedFolder);
    }

    public expandWidget() {
        this.isFullScreen = !this.isFullScreen;
        this.onMaximizeWidget.emit({
            isMaximized: this.isFullScreen,
        });
    }
    private _getExtension(fileName: any): any {
        const extension = Uti.getFileExtension(fileName);
        let isImage = extension.match(/(jpg|jpeg|png|gif|tiff|ico)$/i);
        if (isImage) {
            return 'image';
        }
        let isDoc = extension.match(/(doc|docx)$/i);
        if (isDoc) {
            return 'doc';
        }
        let isExcel = extension.match(/(xls|xlsx|xlsm|csv)$/i);
        if (isExcel) {
            return 'xls';
        }
        let isPDF = extension.match(/(pdf)$/i);
        if (isPDF) {
            return 'pdf';
        }
        let isPowerpoint = extension.match(/(ppt|pptx)$/i);
        if (isPowerpoint) {
            return 'ppt';
        }
        let isZip = extension.match(/(zip)$/i);
        if (isZip) {
            return 'zip';
        }
        let isMedia = extension.match(/(mp3|mp4)$/i);
        if (isMedia) {
            return 'media';
        }
        return extension;
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
        this.getFiles(this.selectedFolder);
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
        if (this.selectedFiles?.length) {
            setTimeout(() => {
                switch (viewType) {
                    case this.VIEW_TYPE_CONSTANT.LIST:
                        this.selectedFiles.forEach((element) => {
                            this.xnAgGrid.setSelectedRow(element);
                        });
                        break;
                    case this.VIEW_TYPE_CONSTANT.GRID:
                        this.selectedFilesKey = this.selectedFiles.map((x) => x.IdDocumentContainerFiles);
                        break;
                    default:
                        break;
                }
            }, 0);
        }
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

    public showConfirmDeleteFile() {
        this.popupService.open({
            content: this.confirmDelete,
            hasBackdrop: true,
            header: new HeaderNoticeRef({
                iconClose: true,
                title: 'Delete Confirm',
            }),
            disableCloseOutside: true,
        });
    }

    public deleteFile(closeFunc: any) {
        if (!this.selectedFiles?.length) {
            this.toasterService.pop(
                MessageModal.MessageType.warning,
                'System',
                'Please select one or more file to delete',
            );
            closeFunc();
            return;
        }

        const data = [];
        this.selectedFiles.forEach((element) => {
            data.push({
                IdDocumentContainerScans: element.IdDocumentContainerScans,
                IdRepDocumentGuiType: IdRepDocumentGuiTypeConstant.INDEXING,
                IsDeleted: 1,
                IdLogin: this.selectedFolder?.idLogin,
            });
        });
        const submitData = {
            JSONDocumentContainerScans: {
                DocumentContainerScans: data,
            },
        };

        this.documentService
            .removeDocumentFile(submitData)
            .takeUntil(super.getUnsubscriberNotifier())
            .subscribe((response: any) => {
                const res = response?.item;
                if (!res || !res.returnID || res.returnID === '-1') {
                    this.toasterService.pop(
                        MessageModal.MessageType.error,
                        'System',
                        'Delete file(s) has error, please try again!',
                    );
                    return;
                }

                this.refreshListData();
                this.toasterService.pop(MessageModal.MessageType.success, 'System', 'Delete file(s) success!');
                closeFunc();
            });
    }
}
