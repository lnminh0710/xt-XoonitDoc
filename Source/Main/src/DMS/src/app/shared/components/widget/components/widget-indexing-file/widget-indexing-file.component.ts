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
    ElementRef,
    HostListener,
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
import { concat, isBoolean, find, findIndex, get, set, upperFirst } from 'lodash-es';
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
var timeoutSave;
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

    @ViewChild(InfiniteScrollDirective) infiniteScroll: InfiniteScrollDirective;

    @ViewChild('horizontalSplit') horizontalSplit: any;
    @ViewChild('confirmDelete') confirmDelete: TemplateRef<any>;
    @ViewChild('xnAgGrid') xnAgGrid: XnAgGridComponent;
    @ViewChild('gridContainer') gridContainer: ElementRef;

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
    public currentViewType = VIEW_TYPE.LIST;
    //#endregion

    //#region infinite load
    public noMoreData = true;
    pageIndex: number = 1;
    private _tableDataSource: any = [];
    globalSetting: any;
    onScroll() {
        if (!this.isLoading && !this.noMoreData) {
            this.isLoading = true;
            this.pageIndex += 1;
            this.cdRef.detectChanges();
            this.getFiles(this.selectedFolder);
        }
    }
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
    public totalItem = 0;

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
        this.refreshListData();

        this.cdRef.detectChanges();
    }

    private _buildTableConfig(data) {
        const config = this.datatableService.buildEditableDataSource(data);
        config.columns = config.columns.filter(
            (_c) => get(_c, ['setting', 'Setting', 0, 'DisplayField', 'Hidden']) != '1',
        );

        return config;
    }

    private getAttachmentOfCar() {
        this.preissChildService.getAttachmentByPriceTag(this.idPriceTag).subscribe((res) => {
            this.isLoading = false;
            this.searchText = '';
            const resData = get(res, ['item', 1], []);
            this.store.dispatch(this.administrationActions.setSelectedDocument(null));
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

        this.documentImageOcrService.getDocumentOfTree(folder.idDocument + '', this.pageIndex).subscribe((res) => {
            this.isLoading = false;
            this.searchText = '';
            const resData = get(res, [1], []);
            if (this.fileList.columns.length) {
                const fileList = this._buildTableConfig(res);
                if (this.currentViewType === VIEW_TYPE.LIST)
                    this.xnAgGrid.api.applyTransaction({
                        add: fileList.data,
                    });
                this._tableDataSource = concat(this._tableDataSource, fileList.data);
            } else {
                const fileList = this._buildTableConfig(res);
                this._tableDataSource = fileList.data;
                this.fileList = fileList;
            }
            this.noMoreData = false;
            if (!resData || !resData.length) {
                // load out of documents;
                this.noMoreData = true;
                this.allowLoadFilesMore = false;
                this.cdRef.detectChanges();
                return;
            }
            resData.forEach((data) => {
                data.DocumentName = data.DocumentName || data.FileName;
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
            setTimeout(() => {
                this._checkContainerHeight();
            }, 500);
        });

        this.cdRef.detectChanges();
    }
    private _checkContainerHeight() {
        const container = this.gridContainer.nativeElement;
        if (this.currentViewType === VIEW_TYPE.GRID) {
            if (container.clientHeight >= container.scrollHeight) {
                this.onScroll();
            }
        } else {
            const selector = container.querySelector('.ag-body-viewport');
            if (selector && selector.clientHeight >= selector.scrollHeight) {
                this.onScroll();
            }
        }
    }

    public refreshListData() {
        this.filesUpload = [];
        this.files = [];
        this.pageIndex = 1;
        if (this.xnAgGrid?.api) {
            this.xnAgGrid.api.setRowData([]);
        }
        this._tableDataSource = [];
        this.fileList.data = [];
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

    onSearchFile(text: string) {
        this.searchTextChanged.next(text);
    }

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
        if (viewType === VIEW_TYPE.LIST && this._tableDataSource.length) {
            this.fileList.data = this._tableDataSource;
        }
        this.currentViewType = viewType;
        this.saveGlobalSetting(viewType);
        this._checkContainerHeight();
    }

    private needToSaveCacheGlobalSetting: boolean = false;
    private getModuleSetting() {
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
                        this.globalSetting = cloneDeep(moduleSettingItem);

                        if (moduleSettingItem && moduleSettingItem.idSettingsGlobal && moduleSettingItem.globalName) {
                            moduleSettingItem = JSON.parse(moduleSettingItem.jsonSettings);
                            if (moduleSettingItem) {
                                isLoadModuleSetting = false;
                                const afterMergeModule = Uti.mergeModuleSetting(
                                    moduleSettingDefault['item'],
                                    moduleSettingItem['item'],
                                );
                                this.globalSetting.jsonSettings = moduleSettingItem;

                                // this.moduleSetting[0].jsonSettings = JSON.parse(this.moduleSetting[0].jsonSettings);
                                this._applySettingModule(afterMergeModule);
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

    private _applySettingModule(afterMergeModule: any) {
        try {
            let jsonSetting = get(afterMergeModule, [0, 'jsonSettings'], '{}');
            jsonSetting = JSON.parse(jsonSetting);
            this.currentViewType = jsonSetting.ViewMode || VIEW_TYPE.LIST;
        } catch (error) {}
    }

    private saveGlobalSetting(viewType) {
        if (timeoutSave) clearTimeout(timeoutSave);
        timeoutSave = setTimeout(() => {
            this.globalSettingService.getAllGlobalSettings(this.ofModule.idSettingsGUI).subscribe((response) => {
                const globalSettingName = String.Format(
                    '{0}_{1}',
                    this.globalSettingConstant.moduleLayoutSetting,
                    String.hardTrimBlank(this.ofModule.moduleName),
                );
                let globalSetting: any = response.find(
                    (x) => x.globalName && x.idSettingsGlobal && x.globalName === globalSettingName,
                );
                const globalSettingJson = JSON.parse(globalSetting.jsonSettings);
                const jsonSettings = JSON.parse(get(globalSettingJson, ['item', 0, 'jsonSettings']));
                jsonSettings.ViewMode = viewType;
                set(globalSettingJson, ['item', 0, 'jsonSettings'], JSON.stringify(jsonSettings));
                globalSetting.idSettingsGUI = this.ofModule.idSettingsGUI;
                globalSetting.jsonSettings = JSON.stringify(globalSettingJson);
                globalSetting.isActive = true;

                this.globalSettingService.saveGlobalSetting(globalSetting).subscribe((data) => {
                    this.globalSettingService.saveUpdateCache(
                        this.ofModule.idSettingsGUI.toString(),
                        globalSetting,
                        data,
                    );
                });
            });
        }, 1000);
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

    public showConfirmDeleteFile(data?: any) {
        if (data) {
            this.selectedFiles = this.xnAgGrid.api.getSelectedRows();
            if (
                !this.selectedFiles.find(
                    (_selected) => _selected.IdDocumentContainerFiles === data.idDocumentContainerFiles,
                )
            ) {
                const row = {};
                for (const key in data) {
                    if (Object.prototype.hasOwnProperty.call(data, key)) {
                        const element = data[key];
                        row[upperFirst(key)] = element;
                    }
                }
                this.selectedFiles.push(row);
            }
        }

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
