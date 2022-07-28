import { CustomAction } from '@app/state-management/store/actions/base';
import { ICloudIntegrationState } from './document-management.state';
import { CloudIntegrationActionNames, CloudIntegrationSuccessAction, CloudIntegrationFailedAction } from './cloud-integration.actions';

const initialState: ICloudIntegrationState = {

};

export function cloudIntegrationReducer(state = initialState, action: CustomAction): ICloudIntegrationState {
    switch (action.type) {

        case CloudIntegrationActionNames.CLOUD_INTEGRATION_SUCCESS_ACTION:
            return actionSuccessReducer(state, action as CloudIntegrationSuccessAction);

        case CloudIntegrationActionNames.CLOUD_INTEGRATION_FAILED_ACTION:
            return actionFailedReducer(state, action as CloudIntegrationFailedAction);

        default:
            return state;
    }
}

function actionSuccessReducer(state: ICloudIntegrationState, action: CloudIntegrationSuccessAction) {
    switch (action.subType) {
        default:
            return state;
    }
}

function actionFailedReducer(state: ICloudIntegrationState, action: CloudIntegrationFailedAction) {
    switch (action.subType) {
        default:
            return state;
    }
}
