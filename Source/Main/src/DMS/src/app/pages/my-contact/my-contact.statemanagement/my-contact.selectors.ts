import { Injectable } from '@angular/core';
import { Actions } from '@ngrx/effects';
import { createFeatureSelector, Store } from '@ngrx/store';
import { BaseSelector } from '@app/state-management/store/reducer/base-selector.selector';
import { IMyContactState } from './my-contact.state';
import { MyContactActionNames } from './my-contact.actions';


export const scanningInputState = createFeatureSelector<IMyContactState>(
    // is a property name of reducers.administrationDocumentState
    'myContactState'
);

@Injectable()
export class MyContactSelectors extends BaseSelector {

    constructor(
        private store: Store<IMyContactState>,
        protected actions: Actions,
    ) {
        super(actions, MyContactActionNames.MY_CONTACT_SUCCESS_ACTION, MyContactActionNames.MY_CONTACT_FAILED_ACTION);
    }
}
