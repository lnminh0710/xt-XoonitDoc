import { CustomAction } from '@app/state-management/store/actions/base';
import { UserGuideActionNames, UserGuideSuccessAction, UserGuideFailedAction } from './user-guide.actions';
import { IUserGuideState } from './user-guide.state';

const initialState: IUserGuideState = {

};

export function userGuideReducer(state = initialState, action: CustomAction): IUserGuideState {
    switch (action.type) {

        case UserGuideActionNames.USER_GUIDE_SUCCESS_ACTION:
            return actionSuccessReducer(state, action as UserGuideSuccessAction);

        case UserGuideActionNames.USER_GUIDE_FAILED_ACTION:
            return actionFailedReducer(state, action as UserGuideFailedAction);

        default:
            return state;
    }
}

function actionSuccessReducer(state: IUserGuideState, action: UserGuideSuccessAction) {
    switch (action.subType) {
        default:
            return state;
    }
}

function actionFailedReducer(state: IUserGuideState, action: UserGuideFailedAction) {
    switch (action.subType) {
        default:
            return state;
    }
}
