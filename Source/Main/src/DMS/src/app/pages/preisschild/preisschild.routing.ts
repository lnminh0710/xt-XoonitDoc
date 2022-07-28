import { Routes } from '@angular/router';
import { PreissChildComponent } from './preisschild.component';
import { PrivateLoadResolve } from '../private/private-load.resolve';

export const preisschildRoutes: Routes = [
    {
        path: '',
        component: PreissChildComponent,
        resolve: { '': PrivateLoadResolve },
    },
];
