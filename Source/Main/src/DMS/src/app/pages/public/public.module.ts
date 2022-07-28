import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PublicRoutingModule } from './public.routes';
import { PublicComponent } from './public.component';
import * as uti from '@app/utilities';
import { GlobalSettingService } from '@app/services';
import { Configuration, GlobalSettingConstant } from '@app/app.constants';
import { LoginComponent } from './user-authentication/login/login.component';
import { ForgotPasswordComponent } from './user-authentication/forgot-password/forgot-password.component';
import { ChangePasswordComponent } from './user-authentication/change-password/change-password.component';
import { AuthenticateSuccessComponent } from './user-authentication/authenticate-success/authenticate-success.component';
import { UpdatePasswordComponent } from './user-authentication/update-password/update-password.component';
import { UpdatePasswordExpireComponent } from './user-authentication/update-password-expire/update-password-expire.component';
import { AccountDeniedComponent } from './user-authentication/account-denied/account-denied.component';
import { AccountExpireComponent } from './user-authentication/account-expire/account-expire.component';
import { RequestTrackingComponent } from './user-authentication/request-tracking/request-tracking.component';
import { InternationalPhoneModule } from 'ng4-intl-phone';
import { SignupComponent } from './user-authentication/signup/signup.component';
import { MatFormFieldModule } from '@xn-control/light-material-ui/form-field';
import { MatCheckboxModule } from '@xn-control/light-material-ui/checkbox';
import { MatRadioModule } from '@xn-control/light-material-ui/radio';
import { MatButtonModule } from '@xn-control/light-material-ui/button';
import { MatSelectModule } from '@xn-control/light-material-ui/select';
import { MatInputModule } from '@xn-control/light-material-ui/input';
import { MatIconModule } from '@xn-control/light-material-ui/icon';
import { XnErrorMessageModule } from '@app/xoonit-share/components/xn-error-message/xn-error-message.module';
import { XnEnterBreakDownDirectiveModule } from '@app/xoonit-share/directives/xn-enter-break-down/xn-enter-break-down.module';
import { XnTranslationModule } from '@app/shared/components/translation/xn-translation.module';
import { LanguageSelectorModule } from '@app/xoonit-share/components/language-selector/language-selector.module';

let library_modules = [
    CommonModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatRadioModule,
    MatButtonModule,
    MatSelectModule,
    MatInputModule,
    MatIconModule,
    InternationalPhoneModule,
    XnTranslationModule,
    LanguageSelectorModule,
];

let widgets = [];

let services = [
    uti.SerializationHelper,
    uti.Uti,
    uti.XnErrorMessageHelper,
    GlobalSettingService,
    Configuration,
    GlobalSettingConstant,
];

let pages = [
    LoginComponent,
    ForgotPasswordComponent,
    ChangePasswordComponent,
    AuthenticateSuccessComponent,
    UpdatePasswordComponent,
    UpdatePasswordExpireComponent,
    AccountDeniedComponent,
    AccountExpireComponent,
    RequestTrackingComponent,
    SignupComponent
];

@NgModule({
    bootstrap: [PublicComponent],
    declarations: [PublicComponent, ...widgets, ...pages],
    imports: [...library_modules, PublicRoutingModule, XnErrorMessageModule, XnEnterBreakDownDirectiveModule],
    providers: [...services],
})
export class PublicModule { }
