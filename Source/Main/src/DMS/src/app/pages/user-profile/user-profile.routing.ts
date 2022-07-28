import { Routes } from '@angular/router';
import { UserProfileComponent } from './user-profile.component';
import { PrivateLoadResolve } from '../private/private-load.resolve';
import { ChangePasswordManagementComponent } from './components/change-password-management';

export const userProfileRoutes: Routes = [
    {
        path: '',
        component: UserProfileComponent,
        resolve: { '': PrivateLoadResolve },
        children: [
            {
                path: '',
                component: ChangePasswordManagementComponent,
            },
        ],
    },
];
