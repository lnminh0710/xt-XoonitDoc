import { Routes } from '@angular/router';
import { PrivateLoadResolve } from '../private/private-load.resolve';
import { UserV2Component } from './user-v2.component';

export const userV2Routes: Routes = [
    {
        path: '',
        component: UserV2Component,
        resolve: { '': PrivateLoadResolve },
    },
];
