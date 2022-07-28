import { Injectable } from '@angular/core';
import { Actions } from '@ngrx/effects';
import { createFeatureSelector, Store } from '@ngrx/store';
import { BaseSelector } from '@app/state-management/store/reducer/base-selector.selector';
import { ICloudIntegrationState } from './document-management.state';
import { CloudIntegrationActionNames } from './cloud-integration.actions';


export const cloudIntegrationState = createFeatureSelector<ICloudIntegrationState>(
    // is a property name of reducers.cloudIntegrationState
    'cloudIntegrationState'
);

@Injectable()
export class CloudIntegrationSelectors extends BaseSelector {

    constructor(
        private store: Store<ICloudIntegrationState>,
        protected actions: Actions,
    ) {
        super(actions, CloudIntegrationActionNames.CLOUD_INTEGRATION_SUCCESS_ACTION, CloudIntegrationActionNames.CLOUD_INTEGRATION_FAILED_ACTION);
    }
}
