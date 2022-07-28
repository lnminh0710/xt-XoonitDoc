import { CustomAction } from '@app/state-management/store/actions/base';
import { HistoryActionNames, HistorySuccessAction, HistoryFailedAction } from './history.actions';
import { IHistoryPageState } from './history.state';

const initialState: IHistoryPageState = {};

export function historyReducer(state = initialState, action: CustomAction): IHistoryPageState {
    switch (action.type) {
        case HistoryActionNames.HISTORY_SUCCESS_ACTION:
            return actionSuccessReducer(state, action as HistorySuccessAction);

        case HistoryActionNames.HISTORY_FAILED_ACTION:
            return actionFailedReducer(state, action as HistoryFailedAction);

        default:
            return state;
    }
}

function actionSuccessReducer(state: IHistoryPageState, action: HistorySuccessAction) {
    switch (action.subType) {
        default:
            return state;
    }
}

function actionFailedReducer(state: IHistoryPageState, action: HistoryFailedAction) {
    switch (action.subType) {
        default:
            return state;
    }
}
