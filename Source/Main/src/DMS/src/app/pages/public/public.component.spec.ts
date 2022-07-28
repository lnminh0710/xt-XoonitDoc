import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { XnTranslationModule } from '@app/shared/components/translation/xn-translation.module';
import { XnEnterBreakDownDirectiveModule } from '@app/shared/directives/xn-enter-break-down';
import { LanguageSelectorModule } from '@app/xoonit-share/components/language-selector/language-selector.module';
import { XnErrorMessageModule } from '@app/xoonit-share/components/xn-error-message/xn-error-message.module';
import { MatButtonModule } from '@xn-control/light-material-ui/button';
import { MatCheckboxModule } from '@xn-control/light-material-ui/checkbox';
import { MatFormFieldModule } from '@xn-control/light-material-ui/form-field';
import { MatIconModule } from '@xn-control/light-material-ui/icon';
import { MatInputModule } from '@xn-control/light-material-ui/input';
import { MatRadioModule } from '@xn-control/light-material-ui/radio';
import { MatSelectModule } from '@xn-control/light-material-ui/select';
import { InternationalPhoneModule } from 'ng4-intl-phone';
import * as uti from '@app/utilities';
import { AuthenticationService, CommonService, GlobalSettingService, ResourceTranslationService, UserService } from '@app/services';
import { Configuration, GlobalSettingConstant } from '@app/app.constants';
import { BrowserModule } from '@angular/platform-browser';
import { ModuleActions } from '@app/state-management/store/actions';
import { Store, StoreModule } from '@ngrx/store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PublicComponent } from './public.component';
import { PublicRoutingModule } from './public.routes';
import { LoginComponent } from './user-authentication/login/login.component';
import { ChangePasswordComponent } from './user-authentication/change-password/change-password.component';
import { AuthenticateSuccessComponent } from './user-authentication/authenticate-success/authenticate-success.component';
import { UpdatePasswordComponent } from './user-authentication/update-password/update-password.component';
import { UpdatePasswordExpireComponent } from './user-authentication/update-password-expire/update-password-expire.component';
import { AccountDeniedComponent } from './user-authentication/account-denied/account-denied.component';
import { AccountExpireComponent } from './user-authentication/account-expire/account-expire.component';
import { RequestTrackingComponent } from './user-authentication/request-tracking/request-tracking.component';
import { SignupComponent } from './user-authentication/signup/signup.component';
import { ForgotPasswordComponent } from './user-authentication/forgot-password/forgot-password.component';

describe('PublicComponent', () => {
    let component: PublicComponent;
    let fixture: ComponentFixture<PublicComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                CommonModule,
                FormsModule,
                RouterModule,
                BrowserModule,
                RouterTestingModule,
                HttpClientTestingModule,
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
                PublicRoutingModule,
                XnErrorMessageModule,
                XnEnterBreakDownDirectiveModule,
                StoreModule.forRoot({}),
                TranslateModule.forRoot({}),
                BrowserAnimationsModule
            ],
            declarations: [
                PublicComponent,
                LoginComponent,
                ChangePasswordComponent,
                AuthenticateSuccessComponent,
                UpdatePasswordComponent,
                UpdatePasswordExpireComponent,
                AccountDeniedComponent,
                AccountExpireComponent,
                RequestTrackingComponent,
                SignupComponent,
                ForgotPasswordComponent,
            ],
            providers: [
                uti.Uti,
                uti.XnErrorMessageHelper,
                GlobalSettingService,
                GlobalSettingConstant,
                Configuration,
                { provide: JwtHelperService, useFactory: () => new JwtHelperService() },
                AuthenticationService,
                UserService,
                ModuleActions,
                Store,
                TranslateService,
                ResourceTranslationService,
                CommonService
            ]
        });
        fixture = TestBed.createComponent(PublicComponent);

        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});