import { DocumentActions } from '@app/state-management/store/actions';
import { CustomAction } from '@app/state-management/store/actions/base';
import * as baseReducer from '@app/state-management/store/reducer/reducer.base';

export interface SubDocumentState {
    scanningStatusData: any;
    scanningStatusCallReload: any;
    scanningStatusCallSkip: any;
}

export const initialSubDocumentState: SubDocumentState = {
    scanningStatusData: [],
    scanningStatusCallReload: null,
    scanningStatusCallSkip: null
};

export interface DocumentState {
    features: { [id: string]: SubDocumentState }
}

const initialState: DocumentState = {
    features: {}
};

export function documentReducer(state = initialState, action: CustomAction): DocumentState {
    switch (action.type) {
        case DocumentActions.DOCUMENT_SCANNING_STATUS_DATA: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                scanningStatusData: action.payload
            });
            return Object.assign({}, state);
        }
        case DocumentActions.DOCUMENT_SCANNING_STATUS_CALL_RELOAD: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                scanningStatusCallReload: {
                    reload: action.payload,
                },
            });
            return Object.assign({}, state);
        }
        case DocumentActions.DOCUMENT_SCANNING_STATUS_CALL_SKIP: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                scanningStatusCallSkip: {
                    skip: action.payload,
                },
            });
            return Object.assign({}, state);
        }
        case DocumentActions.DOCUMENT_SCANNING_STATUS_CLEAR_ALL_DATA: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                scanningStatusData: [],
                scanningStatusCallReload: null,
                scanningStatusCallSkip: null
            });
            return Object.assign({}, state);
        }

        default: {
            return state;
        }
    }
}
