import { CustomAction } from '@app/state-management/store/actions';
import { IUserV2State } from './user-v2.state';
import { UserManagementFailedAction, UserManagementSuccessAction, UserV2ActionNames } from './user-v2.actions';

const initialState: IUserV2State = {};

export function userV2Reducer(state = initialState, action: CustomAction): IUserV2State {
    switch (action.type) {
        case UserV2ActionNames.USER_MANAGEMENT_SUCCESS_ACTION:
            return actionSuccessReducer(state, action as UserManagementSuccessAction);

        case UserV2ActionNames.USER_MANAGEMENT_FAILED_ACTION:
            return actionFailedReducer(state, action as UserManagementFailedAction);

        default:
            return state;
    }
}

function actionSuccessReducer(state: IUserV2State, action: UserManagementSuccessAction) {
    switch (action.subType) {
        default:
            return state;
    }
}

function actionFailedReducer(state: IUserV2State, action: UserManagementFailedAction) {
    switch (action.subType) {
        default:
            return state;
    }
}
