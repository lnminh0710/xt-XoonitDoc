import { Action } from '@ngrx/store';
import { BackofficeActions } from '@app/state-management/store/actions';
import { CustomAction } from '@app/state-management/store/actions/base';
import * as baseReducer from '@app/state-management/store/reducer/reducer.base';

export interface SubBackofficeState {
    requestDownloadPdf: any;
    requestGoToTrackingPage: any;
    requestOpenReturnRefundModule: any;
    selectedEntity: any;
}

export const initialSubBackofficeState: SubBackofficeState = {
    requestDownloadPdf: null,
    requestGoToTrackingPage: null,
    requestOpenReturnRefundModule: null,
    selectedEntity: null
};

export interface BackofficeState {
    features: { [id: string]: SubBackofficeState }
}

const initialState: BackofficeState = {
    features: {}
};

export function backofficeReducer(state = initialState, action: CustomAction): BackofficeState {
    switch (action.type) {
        case BackofficeActions.REQUEST_DOWNLOAD_PDF: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                requestDownloadPdf: {
                    selectedEntity: action.payload
                }
            });
            return Object.assign({}, state);
        }

        case BackofficeActions.REQUEST_GO_TO_TRACKING_PAGE: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                requestGoToTrackingPage: {
                    selectedEntity: action.payload
                }
            });
            return Object.assign({}, state);
        }

        case BackofficeActions.REQUEST_OPEN_RETURN_REFUND_MODULE: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                requestOpenReturnRefundModule: {
                    selectedEntity: action.payload
                }
            });
            return Object.assign({}, state);
        }

        case BackofficeActions.STORE_SELECTED_ENTITY: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                selectedEntity: action.payload
            });
            return Object.assign({}, state);
        }

        default: {
            return state;
        }
    }
};