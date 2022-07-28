import { Injectable } from '@angular/core';
import { BaseSelector } from '@app/state-management/store/reducer/base-selector.selector';
import { Actions } from '@ngrx/effects';
import { createFeatureSelector, Store } from '@ngrx/store';
import { UserManagementActionNames } from './user-management.actions';
import { IUserManagementState } from './user-management.state';

export const scanningInputState = createFeatureSelector<IUserManagementState>('userManagementState');

@Injectable()
export class UserManagementSelectors extends BaseSelector {
    constructor(private store: Store<IUserManagementState>, protected actions: Actions) {
        super(
            actions,
            UserManagementActionNames.USER_MANAGEMENT_SUCCESS_ACTION,
            UserManagementActionNames.USER_MANAGEMENT_FAILED_ACTION,
        );
    }
}
