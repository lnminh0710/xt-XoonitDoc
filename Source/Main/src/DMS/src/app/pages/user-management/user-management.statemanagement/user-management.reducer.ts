import { CustomAction } from '@app/state-management/store/actions';
import {
    UserManagementActionNames,
    UserManagementFailedAction,
    UserManagementSuccessAction,
} from './user-management.actions';
import { IUserManagementState } from './user-management.state';

const initialState: IUserManagementState = {};

export function userManagementReducer(state = initialState, action: CustomAction): IUserManagementState {
    switch (action.type) {
        case UserManagementActionNames.USER_MANAGEMENT_SUCCESS_ACTION:
            return actionSuccessReducer(state, action as UserManagementSuccessAction);

        case UserManagementActionNames.USER_MANAGEMENT_FAILED_ACTION:
            return actionFailedReducer(state, action as UserManagementFailedAction);

        default:
            return state;
    }
}

function actionSuccessReducer(state: IUserManagementState, action: UserManagementSuccessAction) {
    switch (action.subType) {
        default:
            return state;
    }
}

function actionFailedReducer(state: IUserManagementState, action: UserManagementFailedAction) {
    switch (action.subType) {
        default:
            return state;
    }
}
