import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { CloudIntegrationActionNames } from './cloud-integration.actions';

@Injectable()
export class CloudIntegrationEffects {
    constructor(
        private actions$: Actions,
    ) { }
}
