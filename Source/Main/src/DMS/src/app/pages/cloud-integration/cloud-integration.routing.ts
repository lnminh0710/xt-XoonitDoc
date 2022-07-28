import { Routes } from '@angular/router';
import { CloudIntegrationComponent } from './cloud-integration.component';
import { PrivateLoadResolve } from '../private/private-load.resolve';

export const cloudIntegrationRoutes: Routes = [
    {
        path: '',
        component: CloudIntegrationComponent,
        resolve: { '': PrivateLoadResolve }
    }
];
