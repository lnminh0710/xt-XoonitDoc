import { Routes } from '@angular/router';
import { ScanningInputComponent } from './scanning-input.component';
import { PrivateLoadResolve } from '../private/private-load.resolve';

export const scanningInputRoutes: Routes = [
    {
        path: '',
        component: ScanningInputComponent,
        resolve: { '': PrivateLoadResolve },
    },
];
