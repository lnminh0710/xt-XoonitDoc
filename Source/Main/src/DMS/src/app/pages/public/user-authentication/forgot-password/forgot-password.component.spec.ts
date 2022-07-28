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
import { ForgotPasswordComponent } from './forgot-password.component';
import * as uti from '@app/utilities';
import { AuthenticationService, GlobalSettingService, ResourceTranslationService, UserService } from '@app/services';
import { Configuration, GlobalSettingConstant } from '@app/app.constants';
import { LoginComponent } from '../login/login.component';
import { ChangePasswordComponent } from '../change-password/change-password.component';
import { AuthenticateSuccessComponent } from '../authenticate-success/authenticate-success.component';
import { UpdatePasswordComponent } from '../update-password/update-password.component';
import { UpdatePasswordExpireComponent } from '../update-password-expire/update-password-expire.component';
import { AccountDeniedComponent } from '../account-denied/account-denied.component';
import { AccountExpireComponent } from '../account-expire/account-expire.component';
import { RequestTrackingComponent } from '../request-tracking/request-tracking.component';
import { SignupComponent } from '../signup/signup.component';
import { BrowserModule } from '@angular/platform-browser';
import { ModuleActions } from '@app/state-management/store/actions';
import { Store, StoreModule } from '@ngrx/store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs/observable/of';

describe('ForgotPasswordComponent', () => {
    let component: ForgotPasswordComponent;
    let fixture: ComponentFixture<ForgotPasswordComponent>;
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
            fixture = TestBed.createComponent(ForgotPasswordComponent);
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

    describe('onSubmit', () => {
        it('forgotPassForm invalid and return Undefined', () => {
            const result = component.onSubmit();
            expect(result).toBeUndefined();
        });
        it('forgotPassForm valid, call service has exception and call redirect action', () => {
            // mock service
            const restService = TestBed.inject(AuthenticationService);
            const data = 'error';
            spyOn(restService, 'forgotPassword').and.throwError(data);
            // mock router
            let router = TestBed.inject(Router);
            let spy = spyOn(router, 'navigate');

            component.forgotPassForm.patchValue({
                email: 'tamtv@test.demo'
            });
            component.onSubmit();

            expect(spy).toHaveBeenCalledWith([consts.accountDenied]);
        });
        it('forgotPassForm valid, call service return invalid data and call redirect action', () => {
            // mock service
            const restService = TestBed.inject(AuthenticationService);
            const data = '';
            spyOn(restService, 'forgotPassword').and.returnValue(of(data));
            // mock router
            let router = TestBed.inject(Router);
            let spy = spyOn(router, 'navigate');

            component.forgotPassForm.patchValue({
                email: 'tamtv@test.demo'
            });
            component.onSubmit();

            expect(spy).toHaveBeenCalledWith([consts.accountDenied]);
        });
        it('forgotPassForm valid, call service return itemm is -invalid- and set errHandleMes', () => {
            // mock service
            const restService = TestBed.inject(AuthenticationService);
            const data = { item: { result: 'invalid', message: 'error' } };
            spyOn(restService, 'forgotPassword').and.returnValue(of(data));

            component.forgotPassForm.patchValue({
                email: 'tamtv@test.demo'
            });
            const result = component.onSubmit();

            expect(component.errHandleMes.isError).toEqual(true);
            expect(component.errHandleMes.message).toEqual('error');
            expect(result).toBeUndefined();
        });
        it('forgotPassForm valid, call service success', () => {
            // mock service
            const restService = TestBed.inject(AuthenticationService);
            const data = { item: { result: true } };
            spyOn(restService, 'forgotPassword').and.returnValue(of(data));
            // mock router
            let router = TestBed.inject(Router);
            let spy = spyOn(router, 'navigate');
            // mock store dispatch
            const moduleAction = TestBed.inject(ModuleActions);
            spyOn(store, 'dispatch');

            component.forgotPassForm.patchValue({
                email: 'tamtv@test.demo'
            });
            component.onSubmit();

            expect(spy).toHaveBeenCalledWith([consts.authenSuccessUrl]);
            expect(store.dispatch).toHaveBeenCalledWith(jasmine.objectContaining({ type: ModuleActions.SEND_TYPE_ACTION_AUTHEN_SUCCESS }));
        });
    });

    describe('backToLogin', () => {
        it('redirect is called', () => {
            // mock router
            let router = TestBed.inject(Router);
            let spy = spyOn(router, 'navigate');

            component.backToLogin();

            expect(spy).toHaveBeenCalledWith([consts.loginUrl]);
        });
    });
});