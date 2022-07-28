import { Injectable } from '@angular/core';
import { Actions } from '@ngrx/effects';
import { createFeatureSelector, Store } from '@ngrx/store';
import { BaseSelector } from '@app/state-management/store/reducer/base-selector.selector';
import { PrivateActionNames } from './private.actions';
import { IPrivateState } from './private.state';


export const scanningInputState = createFeatureSelector<IPrivateState>(
    // is a property name of reducers.administrationDocumentState
    'privateState'
);

@Injectable()
export class PrivateSelectors extends BaseSelector {

    constructor(
        private store: Store<any>,
        protected actions: Actions,
    ) {
        super(actions, PrivateActionNames.PRIVATE_SUCCESS_ACTION, PrivateActionNames.PRIVATE_FAILED_ACTION);
    }
}
