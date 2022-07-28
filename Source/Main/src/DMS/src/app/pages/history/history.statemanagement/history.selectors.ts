import { Injectable } from '@angular/core';
import { Actions } from '@ngrx/effects';
import { createFeatureSelector, Store } from '@ngrx/store';
import { BaseSelector } from '@app/state-management/store/reducer/base-selector.selector';
import { IHistoryPageState } from './history.state';
import { HistoryActionNames } from './history.actions';
import { Observable } from 'rxjs';
import { DocumentTreeModel } from '@app/models/administration-document/document-tree.payload.model';

export const historyState = createFeatureSelector<IHistoryPageState>(
    // is a property name of reducers.historyState
    'historyPageReducer',
);

@Injectable()
export class HistorySelectors extends BaseSelector {
    public docTypes$: Observable<DocumentTreeModel[]>;

    constructor(private store: Store<IHistoryPageState>, protected actions: Actions) {
        super(actions, HistoryActionNames.HISTORY_SUCCESS_ACTION, HistoryActionNames.HISTORY_FAILED_ACTION);
    }
}
