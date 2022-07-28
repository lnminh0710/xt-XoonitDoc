import { Injectable } from '@angular/core';
import { Actions } from '@ngrx/effects';
import { createFeatureSelector, Store, createSelector } from '@ngrx/store';
import { BaseSelector } from '@app/state-management/store/reducer/base-selector.selector';
import { IImportUploadState } from './import-upload.state';
import { ImportUploadActionNames } from './import-upload.actions';
import { Observable } from 'rxjs';
import { DocumentTreeModel } from '@app/models/administration-document/document-tree.payload.model';


export const importUploadState = createFeatureSelector<IImportUploadState>(
    // is the same token of StoreModule.forFeature('importUploadReducer', importUploadReducer),
    'importUploadReducer'
);

const getSelectedFolder = createSelector(
    importUploadState,
    (state: IImportUploadState) => {
        return state.selectedFolder;
    }
);

@Injectable()
export class ImportUploadSelectors extends BaseSelector {
    public selectedFolder$: Observable<DocumentTreeModel>;

    constructor(
        private store: Store<IImportUploadState>,
        protected actions: Actions,
    ) {
        super(actions, ImportUploadActionNames.IMPORT_UPLOAD_SUCCESS_ACTION, ImportUploadActionNames.IMPORT_UPLOAD_FAILED_ACTION);
        this.selectedFolder$ = this.store.select(getSelectedFolder);
    }
}
