import { Routes } from '@angular/router';
import { PrivateLoadResolve } from '../private/private-load.resolve';
import { DocumentProcessingComponent } from './document-processing.component';

export const documentProcessingRoutes: Routes = [
    {
        path: '',
        component: DocumentProcessingComponent,
        resolve: { '': PrivateLoadResolve }
    }
];
