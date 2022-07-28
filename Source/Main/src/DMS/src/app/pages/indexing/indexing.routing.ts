import { Routes } from '@angular/router';
import { IndexingComponent } from './indexing.component';
import { PrivateLoadResolve } from '../private/private-load.resolve';

export const indexingRoutes: Routes = [
    {
        path: '',
        component: IndexingComponent,
        resolve: { '': PrivateLoadResolve },
    },
];
