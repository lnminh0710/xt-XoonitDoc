import { CustomAction } from '@app/state-management/store/actions';

export enum CloudIntegrationActionNames {
    CLOUD_INTEGRATION_SUCCESS_ACTION = '[CLOUD_INTEGRATION] Success Action',
    CLOUD_INTEGRATION_FAILED_ACTION = '[CLOUD_INTEGRATION] Failed Action',
}

export class CloudIntegrationSuccessAction implements CustomAction {
    public type = CloudIntegrationActionNames.CLOUD_INTEGRATION_SUCCESS_ACTION;

    constructor(public subType: string, public payload?: any) { }
}

export class CloudIntegrationFailedAction implements CustomAction {
    public type = CloudIntegrationActionNames.CLOUD_INTEGRATION_FAILED_ACTION;

    constructor(public subType: string, public payload?: any) { }
}
