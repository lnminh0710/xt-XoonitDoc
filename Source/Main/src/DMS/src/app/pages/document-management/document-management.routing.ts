import { Routes } from '@angular/router';
import { PrivateLoadResolve } from '../private/private-load.resolve';
import { DocumentManagementComponent } from './document-management.component';

export const documentManagementRoutes: Routes = [
    {
        path: '',
        component: DocumentManagementComponent,
        resolve: { '': PrivateLoadResolve }
    }
];
