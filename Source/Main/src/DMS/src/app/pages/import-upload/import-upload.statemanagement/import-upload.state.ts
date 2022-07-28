import { DocumentTreeModel } from '@app/models/administration-document/document-tree.payload.model';
import { importUploadReducer } from './import-upload.reducer';
import { ActionReducerMap } from '@ngrx/store';
import { AppState } from '@app/state-management/store';

export interface IImportUploadState {
    selectedFolder: DocumentTreeModel;
}

export interface State extends AppState {
    importUploadState: IImportUploadState;
}
