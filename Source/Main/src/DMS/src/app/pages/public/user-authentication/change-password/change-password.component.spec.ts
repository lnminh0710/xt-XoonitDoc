import { CommonModule } from '@angular/common';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { AuthenType, Configuration, GlobalSettingConstant, PasswordDisplay } from '@app/app.constants';
import { LoginComponent } from '../login/login.component';
import { AuthenticateSuccessComponent } from '../authenticate-success/authenticate-success.component';
import { UpdatePasswordComponent } from '../update-password/update-password.component';
import { UpdatePasswordExpireComponent } from '../update-password-expire/update-password-expire.component';
import { AccountDeniedComponent } from '../account-denied/account-denied.component';
import { AccountExpireComponent } from '../account-expire/account-expire.component';
import { RequestTrackingComponent } from '../request-tracking/request-tracking.component';
import { SignupComponent } from '../signup/signup.component';
import { BrowserModule } from '@angular/platform-browser';
import { CustomAction, ModuleActions } from '@app/state-management/store/actions';
import { Store, StoreModule } from '@ngrx/store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs/observable/of';
import { ChangePasswordComponent } from './change-password.component';
import { ForgotPasswordComponent } from '../forgot-password/forgot-password.component';
import { UserToken } from '@app/models';
import { throwError } from 'rxjs';

describe('ChangePasswordComponent', () => {
    let component: ChangePasswordComponent;
    let fixture: ComponentFixture<ChangePasswordComponent>;
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
            fixture = TestBed.createComponent(ChangePasswordComponent);
            store = fixture.debugElement.injector.get(Store);
            consts = TestBed.inject(Configuration);

            component = fixture.componentInstance;
            component.changePassFormGroup = new FormGroup({
                newPass: new FormControl(''),
                confirmPass: new FormControl(''),
              });

            localStorage.clear();
            sessionStorage.clear();

            fixture.detectChanges();
        });
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('subscribeAction', () => {
        it('subscribe Action send token update password', () => {
            const restModuleActions = TestBed.inject(ModuleActions);

            const res = <CustomAction>{
                type: ModuleActions.SEND_TOKEN_UPDATE_PASSWORD,
                payload: <UserToken>{
                    token: 'abc',
                    type: AuthenType.NEW_PASSWORD,
                }
            }

            store.dispatch(res);
            spyOn(restModuleActions, 'sendTokenUpdatePasswordAction').and.returnValue(res);
            component.subscribeAction();
            expect(component.userToken).toEqual(res.payload);
        });
    });

    describe('onSubmit', () => {
        it('change password invalid and return Undefined', () => {
            const result = component.submit();
            expect(result).toBeUndefined();
            expect(component.changePassFormGroup.invalid).toBeTruthy();

        });

        it('change password valid', () => {
            const restModuleActions = TestBed.inject(ModuleActions);

            const res = <CustomAction>{
                type: ModuleActions.SEND_TOKEN_UPDATE_PASSWORD,
                payload: <UserToken>{
                    token: 'abc',
                    type: AuthenType.NEW_PASSWORD,
                }
            }

            store.dispatch(res);
            spyOn(restModuleActions, 'sendTokenUpdatePasswordAction').and.returnValue(res);
            component.subscribeAction();

            // mock service
            const restService = TestBed.inject(AuthenticationService);
            const data = { item: { result: true } };
            spyOn(restService, 'newPassword').and.returnValue(of(data));
            // mock router
            let router = TestBed.inject(Router);
            let spy = spyOn(router, 'navigate');


            component.changePassFormGroup.patchValue({
                newPass: '12345Zeus!',
                confirmPass: '12345Zeus!'
            });

            spyOn(component, 'loginSuccess');
            component.submit();
            component.loginSuccess(data.item);

            expect(component.loginSuccess).toHaveBeenCalled();
        });


        it('change password valid, call service has exception and call redirect action', () => {
            const restModuleActions = TestBed.inject(ModuleActions);

            const res = <CustomAction>{
                type: ModuleActions.SEND_TOKEN_UPDATE_PASSWORD,
                payload: <UserToken>{
                    token: 'abc',
                    type: AuthenType.NEW_PASSWORD,
                }
            }

            store.dispatch(res);
            spyOn(restModuleActions, 'sendTokenUpdatePasswordAction').and.returnValue(res);
            component.subscribeAction();

            // mock service
            const restService = TestBed.inject(AuthenticationService);
            const data = 'error';
            spyOn(restService, 'newPassword').and.returnValue((throwError(data)));

            // mock router
            let router = TestBed.inject(Router);
            let spy = spyOn(router, 'navigate');


            component.changePassFormGroup.patchValue({
                newPass: '12345Zeu',
                confirmPass: '123'
            });
            component.submit();

            expect(spy).toHaveBeenCalledWith([consts.accountDenied]);
            expect(component.isLoginSuccess).toBeFalsy();
        });
    });

    describe('redirectToLogin', () => {
        it('redirect To Login', () => {
            let router = TestBed.inject(Router);
            let spy = spyOn(router, 'navigate');

            component.redirectToLogin();

            expect(spy).toHaveBeenCalledWith([consts.loginUrl]);
        });
    });

    // checkMatchingPass
    describe('checkMatchingPass', () => {
        it('check matching Pass is success', () => {
            component.changePassFormGroup.patchValue({
                newPass: '12345Zeus!',
                confirmPass: '12345Zeus!'
            });
            component.checkMatchingPass();
            expect(component.isMatchingPass).toBeTruthy();
        });

        it('check matching Pass is failed', () => {
            component.changePassFormGroup.patchValue({
                newPass: '12345Zeus!',
                confirmPass: '12345Zz!'
            });
            component.checkMatchingPass();
            expect(component.isMatchingPass).toBeFalsy();
        });
    });

    // showHidePassword
    describe('showHidePassword', () => {
        it('show Hide Password', () => {
            const currentpwd = 'newPasswordType';
            component.showHidePassword(currentpwd);
            expect(component.newPasswordType).toEqual(PasswordDisplay.TEXT);
        });
    });
});
