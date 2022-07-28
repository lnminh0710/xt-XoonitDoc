import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    TemplateRef,
    ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IconNames } from '@app/app-icon-registry.service';
import { ControlGridModel, SearchResultItemModel } from '@app/models';
import { DocumentTreeModel } from '@app/models/administration-document/document-tree.payload.model';
import {
    DocumentManagementActionNames,
    GetDocumentFilesByFolderAction,
} from '@app/pages/document-management/document-management.statemanagement/document-management.actions';
import { DocumentManagementSelectors } from '@app/pages/document-management/document-management.statemanagement/document-management.selectors';
import { BaseComponent } from '@app/pages/private/base';
import { DatatableService, DocumentService } from '@app/services';
import { filter, takeUntil } from 'rxjs/operators';
import { DocumentImageOcrService } from '@app/pages/private/modules/image-control/services';
import { ReducerManagerDispatcher, Store } from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import { AdministrationDocumentActions, CustomAction } from '@app/state-management/store/actions';
import { Observable } from 'rxjs';
import * as processDataReducer from '@app/state-management/store/reducer/process-data';
import { XnAgGridComponent } from '@xn-control/xn-ag-grid/pages/ag-grid-container/xn-ag-grid.component';
import { AppActionNames } from '@app/state-management/store/actions/app/app.actions';
import { ColDef } from 'ag-grid-community';
import { ToasterService } from 'angular2-toaster';
import { IdDocumentTreeConstant, IdRepDocumentGuiTypeConstant, MenuModuleId, MessageModal } from '@app/app.constants';
import { PopupService } from '../global-popup/services/popup.service';
import { HeaderNoticeRef } from '../global-popup/components/header-popup/header-notice-ref';

@Component({
    selector: 'widget-email-list',
    templateUrl: './widget-email-list.component.html',
    styleUrls: ['./widget-email-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidgetEmailListComponent extends BaseComponent implements OnInit, OnDestroy, AfterViewInit {
    public IconNamesEnum = IconNames;
    public ID_REP_DOC_GUID_TYPE_CONSTANT = IdRepDocumentGuiTypeConstant;

    @Input() globalProperties: any;
    public isFullScreen = false;
    @Output() onMaximizeWidget = new EventEmitter<any>();

    @ViewChild(XnAgGridComponent) xnAgGrid: XnAgGridComponent;
    @ViewChild('confirmMove') confirmMove: TemplateRef<any>;

    private _selectedSearchResultState$: Observable<SearchResultItemModel>;

    public selectedFolder: DocumentTreeModel;
    public selectedIdDocumentContainerScans: string;
    public selectedFile: any;
    public fileList = <ControlGridModel>{
        columns: [],
        data: [],
        totalResults: 0,
    };
    public isLoading: boolean;

    private moveEventData: any;

    public isShowUpload: boolean;
    public filesUpload: any;

    constructor(
        protected router: Router,
        private activatedRoute: ActivatedRoute,
        protected cdRef: ChangeDetectorRef,
        private datatableService: DatatableService,
        private documentManagementSelectors: DocumentManagementSelectors,
        private documentImageOcrService: DocumentImageOcrService,
        private documentService: DocumentService,
        private store: Store<AppState>,
        private reducerMgrDispatcher: ReducerManagerDispatcher,
        protected administrationActions: AdministrationDocumentActions,
        private toastrService: ToasterService,
        protected popupService: PopupService,
    ) {
        super(router);
    }
    ngOnInit(): void {
        this._selectedSearchResultState$ = this.store.select(
            (state) => processDataReducer.getProcessDataState(state, this.ofModule.moduleNameTrim).selectedSearchResult,
        );
        this.onSubscribe();
    }
    ngOnDestroy(): void {
        super.onDestroy();
    }

    ngAfterViewInit(): void {
        const formElem = document.getElementById('form-upload-file');
        console.log(formElem);
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

    private onSubscribe() {
        this.activatedRoute.queryParams.pipe(takeUntil(this.getUnsubscriberNotifier())).subscribe((params) => {
            this.selectedIdDocumentContainerScans = params['idDocumentContainerScans'];
        });
        this._selectedSearchResultState$
            .pipe(
                filter((selectedSearchResultState) => !!selectedSearchResultState),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((selectedSearchResultState: SearchResultItemModel) => {
                this.selectedFile = selectedSearchResultState as any;
                if (!this.fileList.data?.length) return;

                this.selecteRowAction();
            });
        this.documentManagementSelectors
            .actionOfType$(DocumentManagementActionNames.GET_DOCUMENT_FILES_BY_FOLDER)
            .pipe(
                filter((action: GetDocumentFilesByFolderAction) => !!action.payload),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((action: GetDocumentFilesByFolderAction) => {
                const folder = action.payload;
                this.selectedFolder = folder;
                this.getFiles(this.selectedFolder);
            });
        this.reducerMgrDispatcher
            .pipe(
                filter((action: CustomAction) => action.type === AppActionNames.EXPAND_COLLASPE_FOLDER_TREE),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((action: CustomAction) => {
                if (!this.xnAgGrid) return;

                this.xnAgGrid.addDropZones();
            });
    }

    private selecteRowAction() {
        setTimeout(() => {
            const idDocumentContainerScans = this.selectedFile
                ? this.selectedFile.idDocumentContainerScans
                : Number(this.selectedIdDocumentContainerScans);
            const index = this.fileList.data.findIndex((x) => x.IdDocumentContainerScans === idDocumentContainerScans);
            if (index > -1) this.xnAgGrid.selectRowIndex(index);
        }, 0);
    }
    public getFiles(folder?: DocumentTreeModel) {
        this.store.dispatch(this.administrationActions.selectEmailItemAction(null));
        const selectedFolder = folder ? folder : this.selectedFolder;
        if (!selectedFolder) return;

        this.isLoading = true;
        this.cdRef.detectChanges();
        const idDoc = selectedFolder.isUser ? IdDocumentTreeConstant.EMAIL : selectedFolder.idDocument;
        this.documentImageOcrService
            .getDocumentOfEmailTree(idDoc.toString(), selectedFolder.idLogin)
            .subscribe((res) => {
                this.isLoading = false;
                this.fileList = this.datatableService.buildEditableDataSource(res);
                this.cdRef.detectChanges();

                if (!this.fileList.data?.length) return;
                this.selecteRowAction();
            });
    }

    public onRowClick(event, isDbClick: boolean) {
        let data = {};
        if (!isDbClick) {
            event.forEach((item) => {
                data[item.key] = item.value;
                return item;
            });
        } else data = event;

        this.store.dispatch(this.administrationActions.selectEmailItemAction(data));
    }

    public expandWidget() {
        this.isFullScreen = !this.isFullScreen;
        this.onMaximizeWidget.emit({
            isMaximized: this.isFullScreen,
        });
    }

    public showConfirmDrop(event) {
        if (!this.selectedFolder?.canDelete || this.selectedFolder?.idDocument == event?.treeData?.idDocumentTree)
            return;

        this.moveEventData = event;
        this.popupService.open({
            content: this.confirmMove,
            hasBackdrop: true,
            header: new HeaderNoticeRef({
                iconClose: true,
                title: 'Confirmation',
            }),
            disableCloseOutside: true,
        });
    }

    public onDropAction(closeFunc) {
        if (!this.moveEventData?.rowsData?.length || !this.moveEventData?.treeData?.idDocumentTree) {
            this.toastrService.pop(MessageModal.MessageType.error, 'System', `Please select email you want to move.`);
            closeFunc();
            return;
        }

        const data = [];
        this.moveEventData.rowsData.forEach((element) => {
            data.push({
                IdDocumentTree: this.moveEventData.treeData.isUser
                    ? IdDocumentTreeConstant.EMAIL
                    : this.moveEventData.treeData.idDocumentTree,
                IdLogin: this.moveEventData.treeData.idLogin,
                IdDocumentTreeOld: this.selectedFolder.isUser
                    ? IdDocumentTreeConstant.EMAIL
                    : this.selectedFolder.idDocument,
                IdLoginOld: this.selectedFolder.idLogin,
                IdDocumentContainerScans: element.data.IdDocumentContainerScans,
                IdRepDocumentGuiType: this.ID_REP_DOC_GUID_TYPE_CONSTANT.EMAIL,
            });
        });
        const submitData = {
            JSONDocumentTree: {
                DocumentTree: data,
            },
        };
        this.documentService
            .changeFolderForFile(submitData)
            .takeUntil(super.getUnsubscriberNotifier())
            .subscribe((response: any) => {
                const res = response?.item;
                if (!res || !res.returnID || res.returnID === '-1') {
                    this.toastrService.pop(
                        MessageModal.MessageType.error,
                        'System',
                        'Drag file(s) has error, please try again!',
                    );
                    return;
                }

                this.getFiles();
                this.moveEventData = null;
                this.toastrService.pop(MessageModal.MessageType.success, 'System', 'Drag file(s) success!');
                closeFunc();
            });
    }
    private dropFiles(files: any) {
        if (!files || !files.length || !this.selectedFolder) return;
        this.filesUpload = files;
        this.isShowUpload = true;
        this.cdRef.detectChanges();
    }

    public refreshListData() {
        this.filesUpload = [];
        this.getFiles(this.selectedFolder);
    }
}
