import { Injectable } from '@angular/core';
import { BaseSelector } from '@app/state-management/store/reducer/base-selector.selector';
import { Actions } from '@ngrx/effects';
import { createFeatureSelector, Store } from '@ngrx/store';
import { IUserV2State } from './user-v2.state';
import { UserV2ActionNames } from './user-v2.actions';

export const scanningInputState = createFeatureSelector<IUserV2State>('userManagementState');

@Injectable()
export class UserV2Selectors extends BaseSelector {
    constructor(private store: Store<IUserV2State>, protected actions: Actions) {
        super(
            actions,
            UserV2ActionNames.USER_MANAGEMENT_SUCCESS_ACTION,
            UserV2ActionNames.USER_MANAGEMENT_FAILED_ACTION,
        );
    }
}
