import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './user-authentication/login/login.component';
import { ForgotPasswordComponent } from './user-authentication/forgot-password/forgot-password.component';
import { ChangePasswordComponent } from './user-authentication/change-password/change-password.component';
import { AuthenticateSuccessComponent } from './user-authentication/authenticate-success/authenticate-success.component';
import { UpdatePasswordComponent } from './user-authentication/update-password/update-password.component';
import { UpdatePasswordExpireComponent } from './user-authentication/update-password-expire/update-password-expire.component';
import { AccountDeniedComponent } from './user-authentication/account-denied/account-denied.component';
import { AccountExpireComponent } from './user-authentication/account-expire/account-expire.component';
import { RequestTrackingComponent } from './user-authentication/request-tracking/request-tracking.component';
import { PublicComponent } from './public.component';
import { SignupComponent } from './user-authentication/signup/signup.component';

const PUBLIC_ROUTES: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'login/:token', component: LoginComponent },
    { path: 'forgotpassword', component: ForgotPasswordComponent },
    { path: 'resetpassword', component: UpdatePasswordComponent },
    { path: 'invalid', component: UpdatePasswordExpireComponent },
    { path: 'changepassword', component: ChangePasswordComponent },
    { path: 'success', component: AuthenticateSuccessComponent },
    { path: 'accountdenied', component: AccountDeniedComponent },
    { path: 'accountexpire', component: AccountExpireComponent },
    { path: 'accountexpire/:loginName', component: AccountExpireComponent },
    { path: 'requesttracking', component: RequestTrackingComponent },
    { path: 'signup', component: SignupComponent }
];

const routes: Routes = [{ path: '', component: PublicComponent, children: PUBLIC_ROUTES }];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class PublicRoutingModule {}
