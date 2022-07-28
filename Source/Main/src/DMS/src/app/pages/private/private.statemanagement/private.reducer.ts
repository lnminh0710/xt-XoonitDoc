import { CustomAction } from '@app/state-management/store/actions/base';
import { PrivateActionNames, PrivateSuccessAction, PrivateFailedAction } from './private.actions';
import { IPrivateState } from './private.state';

const initialState: IPrivateState = {

};

export function privateReducer(state = initialState, action: CustomAction): IPrivateState {
    switch (action.type) {

        case PrivateActionNames.PRIVATE_SUCCESS_ACTION:
            return actionSuccessReducer(state, action as PrivateSuccessAction);

        case  PrivateActionNames.PRIVATE_FAILED_ACTION:
            return actionFailedReducer(state, action as PrivateFailedAction);

        default:
            return state;
    }
}

function actionSuccessReducer(state: IPrivateState, action: PrivateSuccessAction) {
    switch (action.subType) {
        default:
            return state;
    }
}

function actionFailedReducer(state: IPrivateState, action: PrivateFailedAction) {
    switch (action.subType) {
        default:
            return state;
    }
}
