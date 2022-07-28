import { Routes } from '@angular/router';
import { PrivateLoadResolve } from '../private/private-load.resolve';
import { UserGuideComponent } from './user-guide.component';
import { UserGuideHomeComponent } from './components/user-guide-home/user-guide-home.component';


export const userGuideRoutes: Routes = [
    {
        path: '',
        component: UserGuideComponent,
        resolve: { '': PrivateLoadResolve },
        children: [
            {
                path: '',
                component: UserGuideHomeComponent,
            },
        ]
    }
];
