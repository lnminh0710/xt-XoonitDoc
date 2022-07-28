import { CustomAction } from '@app/state-management/store/actions/base';
import { IScanningInputState } from './scanning-input.state';
import { ScanningInputSuccessAction, ScanningInputFailedAction, ScanningInputActionNames } from './scanning-input.actions';

const initialState: IScanningInputState = {

};

export function scanningInputReducer(state = initialState, action: CustomAction): IScanningInputState {
    switch (action.type) {

        case ScanningInputActionNames.SCANNING_INPUT_SUCCESS_ACTION:
            return actionSuccessReducer(state, action as ScanningInputSuccessAction);

        case ScanningInputActionNames.SCANNING_INPUT_FAILED_ACTION:
            return actionFailedReducer(state, action as ScanningInputFailedAction);

        default:
            return state;
    }
}

function actionSuccessReducer(state: IScanningInputState, action: ScanningInputSuccessAction) {
    switch (action.subType) {
        default:
            return state;
    }
}

function actionFailedReducer(state: IScanningInputState, action: ScanningInputFailedAction) {
    switch (action.subType) {
        default:
            return state;
    }
}
