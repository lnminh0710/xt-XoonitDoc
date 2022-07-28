import { Injectable } from '@angular/core';
import { Actions } from '@ngrx/effects';
import { createFeatureSelector, Store } from '@ngrx/store';
import { IScanningInputState } from './scanning-input.state';
import { ScanningInputActionNames } from './scanning-input.actions';
import { BaseSelector } from '@app/state-management/store/reducer/base-selector.selector';


export const scanningInputState = createFeatureSelector<IScanningInputState>(
    // is a property name of reducers.administrationDocumentState
    'scanningInputState'
);

@Injectable()
export class ScanningInputSelectors extends BaseSelector {

    constructor(
        private store: Store<any>,
        protected actions: Actions,
    ) {
        super(actions, ScanningInputActionNames.SCANNING_INPUT_SUCCESS_ACTION, ScanningInputActionNames.SCANNING_INPUT_FAILED_ACTION);
    }
}
