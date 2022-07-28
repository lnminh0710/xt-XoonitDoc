import { Injectable } from '@angular/core';
import { Actions } from '@ngrx/effects';
import { createFeatureSelector, Store, createSelector } from '@ngrx/store';
import { BaseSelector } from '@app/state-management/store/reducer/base-selector.selector';
import { IDocumentManagementState } from './document-management.state';
import { DocumentManagementActionNames } from './document-management.actions';
import { Observable } from 'rxjs';

export const documentManagementState = createFeatureSelector<IDocumentManagementState>(
    // is a property name of reducers.administrationDocumentState
    'documentManagementReducer',
);

const getDataGlobalSearch = createSelector(
    documentManagementState,
    (state: IDocumentManagementState) => state.dataGlobalSearch,
);

@Injectable()
export class DocumentManagementSelectors extends BaseSelector {
    public dataGlobalSearch$: Observable<any>;

    constructor(private store: Store<IDocumentManagementState>, protected actions: Actions) {
        super(
            actions,
            DocumentManagementActionNames.DOCUMENT_MANAGEMENT_SUCCESS_ACTION,
            DocumentManagementActionNames.DOCUMENT_MANAGEMENT_FAILED_ACTION,
        );
        this.dataGlobalSearch$ = this.store.select(getDataGlobalSearch);
    }
}
