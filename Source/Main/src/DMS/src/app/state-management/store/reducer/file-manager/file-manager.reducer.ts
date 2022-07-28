import { FileManagerState } from './file-manager.state';
import { CustomAction, FileManagerActionNames } from '@app/state-management/store/actions';

export const initialState: FileManagerState = {
}

export function fileManagerReducer(state = initialState, action: CustomAction): FileManagerState {
    switch (action.type) {
        case FileManagerActionNames.FILE_MANAGER_SUCCESS:
            return actionSuccessReducer(state, action);
        default:
            return state;
    }
}

function actionSuccessReducer(state: FileManagerState, action: any) {
    switch (action.type) {
        default:
            return state;
    }
}