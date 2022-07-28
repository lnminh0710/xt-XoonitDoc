import { Routes } from '@angular/router';
import { PrivateLoadResolve } from '../private/private-load.resolve';
import { ExportComponent } from './export.component';

export const exportRoutes: Routes = [
    {
        path: '',
        component: ExportComponent,
        resolve: { '': PrivateLoadResolve },
    },
];
