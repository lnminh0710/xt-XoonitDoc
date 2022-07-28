import { Injectable } from '@angular/core';
import { Actions } from '@ngrx/effects';
import { createFeatureSelector, Store } from '@ngrx/store';
import { BaseSelector } from '@app/state-management/store/reducer/base-selector.selector';
import { ExportActionNames } from './export.actions';
import { IExportState } from './export.state';


export const exportState = createFeatureSelector<IExportState>(
    // is a property name of reducers.exportState
    'exportState'
);

@Injectable()
export class ExportSelectors extends BaseSelector {

    constructor(
        private store: Store<IExportState>,
        protected actions: Actions,
    ) {
        super(actions, ExportActionNames.EXPORT_SUCCESS_ACTION, ExportActionNames.EXPORT_FAILED_ACTION);
    }
}
