import { Routes } from '@angular/router';
import { PrivateLoadResolve } from '../private/private-load.resolve';
import { UserManagementComponent } from './user-management.component';

export const userManagementRoutes: Routes = [
    {
        path: '',
        component: UserManagementComponent,
        resolve: { '': PrivateLoadResolve },
    },
];
