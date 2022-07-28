import { Routes } from '@angular/router';
import { PrivateLoadResolve } from '../private/private-load.resolve';
import { ImportUploadComponent } from './import-upload.component';

export const importUploadRoutes: Routes = [
    {
        path: '',
        component: ImportUploadComponent,
        resolve: { '': PrivateLoadResolve },
    },
];
