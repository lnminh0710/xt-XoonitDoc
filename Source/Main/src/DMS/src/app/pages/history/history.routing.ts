import { Routes } from '@angular/router';
import { PrivateLoadResolve } from '../private/private-load.resolve';
import { HistoryComponent } from './history.component';

export const historyRoutes: Routes = [
    {
        path: '',
        component: HistoryComponent,
        resolve: { '': PrivateLoadResolve },
    },
];
