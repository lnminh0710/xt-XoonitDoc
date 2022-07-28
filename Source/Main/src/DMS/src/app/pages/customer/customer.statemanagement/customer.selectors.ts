import { Injectable } from '@angular/core';
import { Actions } from '@ngrx/effects';
import { createFeatureSelector, Store } from '@ngrx/store';
import { BaseSelector } from '@app/state-management/store/reducer/base-selector.selector';
import { CustomerActionNames } from './customer.actions';
import { ICustomerState } from './customer.state';

export const customerState = createFeatureSelector<ICustomerState>(
    // is a property name of reducers.exportState
    'customerState',
);

@Injectable()
export class CustomerSelectors extends BaseSelector {
    constructor(private store: Store<ICustomerState>, protected actions: Actions) {
        super(actions, CustomerActionNames.CUSTOMER_SUCCESS_ACTION, CustomerActionNames.CUSTOMER_FAILED_ACTION);
    }
}
