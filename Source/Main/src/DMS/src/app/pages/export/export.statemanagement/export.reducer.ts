import { CustomAction } from '@app/state-management/store/actions/base';
import { ExportActionNames, ExportSuccessAction, ExportFailedAction } from './export.actions';
import { IExportState } from './export.state';

const initialState: IExportState = {

};

export function exportReducer(state = initialState, action: CustomAction): IExportState {
    switch (action.type) {

        case ExportActionNames.EXPORT_SUCCESS_ACTION:
            return actionSuccessReducer(state, action as ExportSuccessAction);

        case ExportActionNames.EXPORT_FAILED_ACTION:
            return actionFailedReducer(state, action as ExportFailedAction);

        default:
            return state;
    }
}

function actionSuccessReducer(state: IExportState, action: ExportSuccessAction) {
    switch (action.subType) {
        default:
            return state;
    }
}

function actionFailedReducer(state: IExportState, action: ExportFailedAction) {
    switch (action.subType) {
        default:
            return state;
    }
}
