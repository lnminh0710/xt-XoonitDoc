import { Routes } from '@angular/router';
import { PrivateLoadResolve } from '../private/private-load.resolve';
import { MyContactComponent } from './my-contact.component';

export const myContactRoutes: Routes = [
    {
        path: '',
        component: MyContactComponent,
        resolve: { '': PrivateLoadResolve }
    }
];
