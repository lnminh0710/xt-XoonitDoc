import { CustomAction } from '@app/state-management/store/actions/base';
import { IDocumentManagementState } from './document-management.state';
import {
    DocumentManagementActionNames,
    DocumentManagementSuccessAction,
    DocumentManagementFailedAction,
} from './document-management.actions';

const initialState: IDocumentManagementState = { dataGlobalSearch: {} };

export function documentManagementReducer(state = initialState, action: CustomAction): IDocumentManagementState {
    switch (action.type) {
        case DocumentManagementActionNames.GET_DOCUMENTS_BY_KEYWORD:
            return state;

        case DocumentManagementActionNames.SAVE_DATA_GLOBAL_SEARCH_ACTION: {
            return {
                ...state,
                dataGlobalSearch: { ...action.payload },
            };
        }
        case DocumentManagementActionNames.DOCUMENT_MANAGEMENT_SUCCESS_ACTION:
            return actionSuccessReducer(state, action as DocumentManagementSuccessAction);

        case DocumentManagementActionNames.DOCUMENT_MANAGEMENT_FAILED_ACTION:
            return actionFailedReducer(state, action as DocumentManagementFailedAction);

        default:
            return state;
    }
}

function actionSuccessReducer(state: IDocumentManagementState, action: DocumentManagementSuccessAction) {
    switch (action.subType) {
        default:
            return state;
    }
}

function actionFailedReducer(state: IDocumentManagementState, action: DocumentManagementFailedAction) {
    switch (action.subType) {
        default:
            return state;
    }
}
