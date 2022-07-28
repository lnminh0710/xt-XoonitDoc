import { CustomAction } from '@app/state-management/store/actions/base';
import { IImportUploadState } from './import-upload.state';
import { ImportUploadActionNames, ImportUploadSuccessAction, ImportUploadFailedAction, SelectFolderToImportAction } from './import-upload.actions';
import { ActionReducerMap } from '@ngrx/store';

const initialState: IImportUploadState = {
    selectedFolder: null,
};

export function importUploadReducer(state = initialState, action: CustomAction): IImportUploadState {
    switch (action.type) {

        case ImportUploadActionNames.IMPORT_UPLOAD_SUCCESS_ACTION:
            return actionSuccessReducer(state, action as ImportUploadSuccessAction);

        case ImportUploadActionNames.IMPORT_UPLOAD_FAILED_ACTION:
            return actionFailedReducer(state, action as ImportUploadFailedAction);

        case ImportUploadActionNames.SELECT_FOLDER_TO_IMPORT:
            return {
                ...state,
                selectedFolder: (action as SelectFolderToImportAction).payload.folder
            }

        case ImportUploadActionNames.CLEAR_SELECTED_FOLDER:
            return {
                ...state,
                selectedFolder: null
            }

        default:
            return state;
    }
}

function actionSuccessReducer(state: IImportUploadState, action: ImportUploadSuccessAction) {
    switch (action.subType) {
        default:
            return state;
    }
}

function actionFailedReducer(state: IImportUploadState, action: ImportUploadFailedAction) {
    switch (action.subType) {
        default:
            return state;
    }
}
