import { CustomAction } from '@app/state-management/store/actions/base';
import { IMyContactState } from './my-contact.state';
import { MyContactSuccessAction, MyContactFailedAction, MyContactActionNames } from './my-contact.actions';

const initialState: IMyContactState = {

};

export function myContactReducer(state = initialState, action: CustomAction): IMyContactState {
    switch (action.type) {

        case MyContactActionNames.MY_CONTACT_SUCCESS_ACTION:
            return actionSuccessReducer(state, action as MyContactSuccessAction);

        case MyContactActionNames.MY_CONTACT_FAILED_ACTION:
            return actionFailedReducer(state, action as MyContactFailedAction);

        default:
            return state;
    }
}

function actionSuccessReducer(state: IMyContactState, action: MyContactSuccessAction) {
    switch (action.subType) {
        default:
            return state;
    }
}

function actionFailedReducer(state: IMyContactState, action: MyContactFailedAction) {
    switch (action.subType) {
        default:
            return state;
    }
}
