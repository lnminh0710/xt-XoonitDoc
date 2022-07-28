import { Routes } from '@angular/router';
import { EmailComponent } from './email.component';
import { PrivateLoadResolve } from '../private/private-load.resolve';

export const emailRoutes: Routes = [
    {
        path: '',
        component: EmailComponent,
        resolve: { '': PrivateLoadResolve }
    },
];
