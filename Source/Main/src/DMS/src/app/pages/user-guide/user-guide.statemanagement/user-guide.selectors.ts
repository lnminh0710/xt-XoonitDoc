import { Injectable } from '@angular/core';
import { Actions } from '@ngrx/effects';
import { createFeatureSelector, Store } from '@ngrx/store';
import { BaseSelector } from '@app/state-management/store/reducer/base-selector.selector';
import { IUserGuideState } from './user-guide.state';
import { UserGuideActionNames } from './user-guide.actions';


export const userGuideState = createFeatureSelector<IUserGuideState>(
    // is a property name of reducers.userGuideState
    'userGuideState'
);

@Injectable()
export class UserGuideSelectors extends BaseSelector {

    constructor(
        private store: Store<IUserGuideState>,
        protected actions: Actions,
    ) {
        super(actions, UserGuideActionNames.USER_GUIDE_SUCCESS_ACTION, UserGuideActionNames.USER_GUIDE_FAILED_ACTION);
    }
}
