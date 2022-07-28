import { Component, OnInit, OnDestroy } from '@angular/core';
import { BaseComponent } from '../private/base';
import { Router } from '@angular/router';
import { AppState } from '@app/state-management/store';
import { Store } from '@ngrx/store';
import { ImportUploadSelectors } from './import-upload.statemanagement/import-upload.selectors';
import { filter, takeUntil } from 'rxjs/operators';
import {
    ImportUploadActionNames,
    ImportUploadDoneAction,
    SaveDocumentCaptureWhenImportingDoneAction,
} from './import-upload.statemanagement/import-upload.actions';
import { DocumentTreeModel } from '@app/models/administration-document/document-tree.payload.model';
import { MainDocumentModel } from '@app/models/administration-document/document-form/main-document.model';
import { DocumentTreeMediaModel } from '@app/models/administration-document/document-form/document-tree-media.model';

@Component({
    selector: 'import-upload',
    templateUrl: './import-upload.component.html',
    styleUrls: ['./import-upload.component.scss'],
})
export class ImportUploadComponent extends BaseComponent implements OnInit, OnDestroy {
    private _selectedFolder: DocumentTreeModel;

    constructor(
        protected router: Router,
        private appStore: Store<AppState>,
        private importUploadSelectors: ImportUploadSelectors,
    ) {
        super(router);

        this.registerSubscriptions();
    }

    ngOnInit(): void {
    }

    ngOnDestroy(): void {
        super.onDestroy();
    }

    private registerSubscriptions(): void {
        this.importUploadSelectors.selectedFolder$
            .pipe(
                filter((selectedFolder) => !!selectedFolder),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((selectedFolder: DocumentTreeModel) => {
                this._selectedFolder = selectedFolder;
            });

        this.importUploadSelectors
            .actionOfType$(ImportUploadActionNames.IMPORT_UPLOAD_DONE)
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((action: ImportUploadDoneAction) => {
                if (action.payload.fileUploadProgress.documentId <= 0) return;

                const mainDocumentData = <MainDocumentModel>{
                    idDocumentContainerScans: action.payload.idDocumentContainerScans.toString(),
                    idMainDocument: null,
                    mainDocumentTree: {
                        idDocumentTree: action.payload.fileUploadProgress.documentId.toString(),
                        oldFolder: null,
                        newFolder: null,
                    },
                    searchKeyWords: null,
                    toDoNotes: null,
                };

                const documentTreeMediaData = <DocumentTreeMediaModel>{
                    mediaName: action.payload.fileUploadProgress.file.name,
                    idDocumentTree: action.payload.fileUploadProgress.documentId.toString(),
                    cloudMediaPath: action.payload.fileUploadProgress.documentPath,
                    idDocumentTreeMedia: null,
                    idRepTreeMediaType: '1',
                };

                this.appStore.dispatch(
                    new SaveDocumentCaptureWhenImportingDoneAction({
                        mainDocumentData,
                        documentTreeMediaData,
                        fileUpload: action.payload.fileUploadProgress,
                    }),
                );
            });
    }
}
