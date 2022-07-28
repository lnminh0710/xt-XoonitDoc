import { CommonModule } from '@angular/common';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
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
import { PublicComponent } from '../../public.component';
import { PublicRoutingModule } from '../../public.routes';
import * as uti from '@app/utilities';
import { AuthenticationService, GlobalSettingService, ResourceTranslationService, UserService } from '@app/services';
import { AuthenType, Configuration, GlobalSettingConstant } from '@app/app.constants';
import { LoginComponent } from '../login/login.component';
import { ChangePasswordComponent } from '../change-password/change-password.component';
import { AuthenticateSuccessComponent } from '../authenticate-success/authenticate-success.component';
import { UpdatePasswordComponent } from '../update-password/update-password.component';
import { UpdatePasswordExpireComponent } from '../update-password-expire/update-password-expire.component';
import { AccountDeniedComponent } from '../account-denied/account-denied.component';
import { RequestTrackingComponent } from '../request-tracking/request-tracking.component';
import { SignupComponent } from '../signup/signup.component';
import { BrowserModule } from '@angular/platform-browser';
import { CustomAction, ModuleActions } from '@app/state-management/store/actions';
import { ReducerManagerDispatcher, Store, StoreModule } from '@ngrx/store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ForgotPasswordComponent } from '../forgot-password/forgot-password.component';
import { AccountExpireComponent } from '../account-expire/account-expire.component';

describe('AuthenticateSuccessComponent', () => {
    let component: AuthenticateSuccessComponent;
    let fixture: ComponentFixture<AuthenticateSuccessComponent>;
    let store: Store<any>;
    let consts: Configuration;

    beforeEach(async(() => {
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
            ]
        }).compileComponents().then(() => {
            fixture = TestBed.createComponent(AuthenticateSuccessComponent);
            store = fixture.debugElement.injector.get(Store);
            consts = TestBed.inject(Configuration);
            component = fixture.componentInstance;

            localStorage.clear();
            sessionStorage.clear();

            fixture.detectChanges();
        });
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('redirectToLogin', () => {
        it('redirect to Login page', () => {
            // mock router
            let router = TestBed.inject(Router);
            let spy = spyOn(router, 'navigate');

            component.redirectToLogin();

            expect(spy).toHaveBeenCalledWith([consts.loginUrl]);
        });
    });

    describe('subscribeAction', () => {
        it('Send Type action authen success with type is new password', () => {
            const restModuleActions = TestBed.inject(ModuleActions);

            const res = <CustomAction>{
                type: ModuleActions.SEND_TYPE_ACTION_AUTHEN_SUCCESS,
                payload: AuthenType.NEW_PASSWORD
            }
            const message1 = 'Your account password has been successfully changed.'
            const message2 = 'Please login to Xoonit with your new password.'

            store.dispatch(res);
            spyOn(restModuleActions, 'sendTypeAuthenActionSuccess').and.returnValue(res);
            component.subscribeAction();

            expect(component.authenType).toEqual(res.payload);
            expect(component.message1).toEqual(message1);
            expect(component.message2).toEqual(message2);

        });

        it('Send Type action authen success with type is resend new password', () => {
            const restModuleActions = TestBed.inject(ModuleActions);

            const res = <CustomAction>{
                type: ModuleActions.SEND_TYPE_ACTION_AUTHEN_SUCCESS,
                payload: AuthenType.RESEND_NEW_PASSWORD
            }
            const message1 = 'Email is resent successfully.'
            const message2 = 'Please check your email and create new password.'

            store.dispatch(res);
            spyOn(restModuleActions, 'sendTypeAuthenActionSuccess').and.returnValue(res);
            component.subscribeAction();

            expect(component.authenType).toEqual(res.payload);
            expect(component.message1).toEqual(message1);
            expect(component.message2).toEqual(message2);

        });

        it('Send Type action authen success with type is forgot password', () => {
            const restModuleActions = TestBed.inject(ModuleActions);

            const res = <CustomAction>{
                type: ModuleActions.SEND_TYPE_ACTION_AUTHEN_SUCCESS,
                payload: AuthenType.FORGOT_PASSWORD
            }
            const message1 = 'Email is sent successfully!'
            const message2 = 'Please check your email and change password.'

            store.dispatch(res);
            spyOn(restModuleActions, 'sendTypeAuthenActionSuccess').and.returnValue(res);
            component.subscribeAction();

            expect(component.authenType).toEqual(res.payload);
            expect(component.message1).toEqual(message1);
            expect(component.message2).toEqual(message2);

        });

        it('Send Type action authen success with type is sign up', () => {
            const restModuleActions = TestBed.inject(ModuleActions);

            const res = <CustomAction>{
                type: ModuleActions.SEND_TYPE_ACTION_AUTHEN_SUCCESS,
                payload: AuthenType.SIGN_UP
            }
            const message1 = 'Your account has been successfully created.'
            const message2 = 'Please check your email to set the password.'

            store.dispatch(res);
            spyOn(restModuleActions, 'sendTypeAuthenActionSuccess').and.returnValue(res);
            component.subscribeAction();

            expect(component.authenType).toEqual(res.payload);
            expect(component.message1).toEqual(message1);
            expect(component.message2).toEqual(message2);

        });
    });
});
