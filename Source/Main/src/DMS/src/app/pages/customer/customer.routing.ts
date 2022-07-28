import { Routes } from '@angular/router';
import { PrivateLoadResolve } from '../private/private-load.resolve';
import { CustomerComponent } from './customer.component';

export const customerRoutes: Routes = [
    {
        path: '',
        component: CustomerComponent,
        resolve: { '': PrivateLoadResolve },
    },
];
