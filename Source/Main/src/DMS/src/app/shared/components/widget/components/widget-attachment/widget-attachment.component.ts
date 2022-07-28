import {
    Component,
    OnDestroy,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Output,
    EventEmitter,
    OnInit,
} from '@angular/core';
import { BaseComponent, ModuleList } from '@app/pages/private/base';
import { Router } from '@angular/router';
import {
    AdministrationDocumentActions,
    AdministrationDocumentActionNames,
    CustomAction,
    GlobalSearchActions,
} from '@app/state-management/store/actions';
import { AdministrationDocumentSelectors } from '@app/state-management/store/reducer';
import { Store } from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import { AttachmentDocumentResponseModel } from '@app/models/attachment-document-response.model';
import { ContactDetailMoldel } from '@app/models/contact-document.model';
import { ImageThumbnailModel } from '@app/pages/private/modules/image-control/models/image.model';
import {
    DocumentManagementActionNames,
    GetDocumentFilesByFolderAction,
    DocumentManagementSuccessAction,
    GetDocumentsByKeywordAction,
} from '@app/pages/document-management/document-management.statemanagement/document-management.actions';
import { DocumentManagementSelectors } from '@app/pages/document-management/document-management.statemanagement/document-management.selectors';
import { DocumentTreeModel } from '@app/models/administration-document/document-tree.payload.model';
import { isBoolean } from 'lodash-es';
import { DocumentFileInfoModel } from '@app/state-management/store/models/administration-document/state/document-file-info.state.model';
import { Actions, ofType } from '@ngrx/effects';
import { LocalStorageKey } from '@app/app.constants';
import { filter, takeUntil } from 'rxjs/operators';
import { Uti } from '../../../../../utilities';

@Component({
    selector: 'widget-attachment',
    templateUrl: './widget-attachment.component.html',
    styleUrls: ['./widget-attachment.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidgetAttachmentComponent extends BaseComponent implements OnInit, OnDestroy {
    @Output() dispatchData = new EventEmitter<any>();

    contactDetail: ContactDetailMoldel;
    data: AttachmentDocumentResponseModel[] = [];
    currentDoc: ImageThumbnailModel;
    isShowDialog = false;
    private currentIdRepDocumentGuiType: number;
    public selectedFolder: DocumentTreeModel;
    public isLoading: boolean;

    constructor(
        protected router: Router,
        protected store: Store<AppState>,
        private action$: Actions,
        protected administrationActions: AdministrationDocumentActions,
        protected administrationSelectors: AdministrationDocumentSelectors,
        private documentManagementSelectors: DocumentManagementSelectors,
        protected cdr: ChangeDetectorRef,
    ) {
        super(router);
        this.subscribeAction();
    }
    ngOnInit(): void {
        this.initAction();
    }

    ngOnDestroy(): void {
        super.onDestroy();
    }

    private subscribeAction() {
        this.action$
            .pipe(
                ofType(GlobalSearchActions.ROW_DOUBLE_CLICK),
                filter((action: CustomAction) => this.isValidPayloadContactDetail(action)),
                takeUntil(super.getUnsubscriberNotifier())
            )
            .subscribe((action: CustomAction) => {
                this.contactDetail = action.payload.data as ContactDetailMoldel;
                this.callActionGetAttachmentList(this.contactDetail);
                this.loadDocToWidgetDocumentProcessing({
                    idMainDocument: '',
                    idRepDocumentGuiType: '',
                    idDocumentContainerScans: '',
                } as AttachmentDocumentResponseModel);
            });

        this.administrationSelectors
            .actionSuccessOfSubtype$(AdministrationDocumentActionNames.GET_ATTACHMENT_BY_CONTACT)
            .pipe(
                takeUntil(super.getUnsubscriberNotifier())
            )
            .subscribe((action: CustomAction) => {
                this.data = [];
                if (!action && !action.payload) return;

                this.data = action.payload as AttachmentDocumentResponseModel[];
                this.cdr.detectChanges();
            });

        // subscribe action double click
        this.documentManagementSelectors
            .actionOfType$(DocumentManagementActionNames.GET_DOCUMENT_FILES_BY_FOLDER)
            .pipe(
                filter((action: GetDocumentFilesByFolderAction) => !!action.payload),
                takeUntil(this.getUnsubscriberNotifier())
            )
            .subscribe((action: GetDocumentFilesByFolderAction) => {
                const folder = action.payload;
                if (this.selectedFolder && this.selectedFolder.idDocument === folder.idDocument) return;

                this.store.dispatch(
                    new GetDocumentsByKeywordAction({
                        fieldName: 'idDocumentTree',
                        folder: folder,
                        index: ModuleList.Contact.searchIndexKey,
                        moduleId: ModuleList.Contact.idSettingsGUI,
                        pageIndex: 0,
                        pageSize: 1000,
                        searchPattern: '*',
                        fieldNames: ['idPerson'],
                        fieldValues: [this.contactDetail.idPerson],
                    }),
                );
                this.selectedFolder = folder;
                this.currentIdRepDocumentGuiType = this.selectedFolder.idDocumentType;

                this.isLoading = true;
                this.cdr.detectChanges();
            });

        // subscribe get document by folder
        this.documentManagementSelectors
            .actionSuccessOfSubtype$(DocumentManagementActionNames.GET_DOCUMENTS_BY_KEYWORD)
            .pipe(
                filter((action: DocumentManagementSuccessAction) => !!action.payload),
                takeUntil(this.getUnsubscriberNotifier())
            )
            .subscribe((action: DocumentManagementSuccessAction) => {
                this.isLoading = false;
                this.data = (action.payload.results as any[]).map((data) => {
                    data.isActive = isBoolean(data.isActive)
                        ? data.isActive
                        : data.isActive.toLowerCase() === 'true'
                        ? true
                        : false;
                    data.isDeleted = isBoolean(data.isDeleted)
                        ? data.isDeleted
                        : data.isDeleted.toLowerCase() === 'true'
                        ? true
                        : false;
                    data.idRepDocumentGuiType = this.currentIdRepDocumentGuiType;
                    return data;
                });
                this.cdr.detectChanges();
            });
    }

    viewDocument(doc: AttachmentDocumentResponseModel) {
        this.setDocumentFileInfo(doc.idMainDocument, doc.idRepDocumentGuiType);
        this.currentDoc = new ImageThumbnailModel();
        this.currentDoc.IdDocumentContainerScans = doc.idDocumentContainerScans;
        this.isShowDialog = true;
    }

    loadDocToWidgetDocumentProcessing(doc: AttachmentDocumentResponseModel) {
        this.setDocumentFileInfo(doc.idMainDocument, doc.idRepDocumentGuiType);
        this.dispatchData.emit([
            {
                key: 'IdDocumentContainerScans',
                value: doc.idDocumentContainerScans,
            },
        ]);
    }

    initAction() {
        const actions = JSON.parse(
            window.localStorage.getItem(LocalStorageKey.buildKey(LocalStorageKey.LocalStorageGSStepKey, Uti.defineBrowserTabId())),
        ) as CustomAction[];
        if (actions && this.isValidPayloadContactDetail(actions[0])) {
            this.contactDetail = actions[0].payload.data as ContactDetailMoldel;
            this.callActionGetAttachmentList(this.contactDetail);
            this.loadDocToWidgetDocumentProcessing({
                idMainDocument: '',
                idRepDocumentGuiType: '',
                idDocumentContainerScans: '',
            } as AttachmentDocumentResponseModel);
        }
    }

    private setDocumentFileInfo(idMainDocument: string, idRepDocumentGuiType: string) {
        if (idMainDocument && idRepDocumentGuiType) {
            this.store.dispatch(
                this.administrationActions.setDocFileInfoToCaptureAction({
                    idMainDocument: idMainDocument,
                    idRepDocumentGuiType: idRepDocumentGuiType,
                } as DocumentFileInfoModel),
            );
        }
    }

    private isValidPayloadContactDetail(action: CustomAction) {
        return (
            action.payload &&
            action.payload.selectedModule &&
            action.payload.selectedModule.idSettingsGUI === ModuleList.Contact.idSettingsGUI
        );
    }

    private callActionGetAttachmentList(contactDetail: ContactDetailMoldel) {
        this.store.dispatch(this.administrationActions.getAttachmentByContact(contactDetail.idPerson));
    }
}
