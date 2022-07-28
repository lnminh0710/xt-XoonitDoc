import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { AuthenticationService, CommonService, GlobalSettingService, ResourceTranslationService, UserService } from '@app/services';
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
import { ForgotPasswordComponent } from '../forgot-password/forgot-password.component';
import { Uti } from '@app/utilities';

describe('SignupComponent', () => {
    let component: SignupComponent;
    let fixture: ComponentFixture<SignupComponent>;
    let store: Store<any>;
    let consts: Configuration;

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
                SignupComponent,
                PublicComponent,
                LoginComponent,
                ChangePasswordComponent,
                AuthenticateSuccessComponent,
                UpdatePasswordComponent,
                UpdatePasswordExpireComponent,
                AccountDeniedComponent,
                AccountExpireComponent,
                RequestTrackingComponent,
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
        })
        fixture = TestBed.createComponent(SignupComponent);
        store = fixture.debugElement.injector.get(Store);
        consts = TestBed.inject(Configuration);
        component = fixture.componentInstance;

        localStorage.clear();
        sessionStorage.clear();

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngAfterViewInit', () => {
        it('set placeholder when change language', () => {
            // mock service
            const restService = TestBed.inject(TranslateService);
            const data = '';
            spyOn(restService, <any>'onLangChange').and.callFake(() => {
                expect(component.dataFields.FIRST_NAME.displayName).toBe('First Name');
                expect(component.dataFields.LAST_NAME.displayName).toBe('Last Name');
                expect(component.dataFields.EMAIL.displayName).toBe('Email');
                expect(component.dataFields.PHONE_NUMBER.displayName).toBe('Phone Number');
            });

            component.ngAfterViewInit();
        });
    });

    describe('subscibeBirthDateChange', () => {
        it('subscribe MONTH_OF_BIRTH and month not change, dayList length equal 31', () => {
            component.subscibeBirthDateChange();
            component.signUpForm.controls[component.dataFields.MONTH_OF_BIRTH.controlName].setValue('')

            expect(component.dayList.length).toEqual(31);
        });
        it('subscribe MONTH_OF_BIRTH and month is 4,6,9,11, dayList length equal 30', () => {
            component.subscibeBirthDateChange();
            component.signUpForm.controls[component.dataFields.MONTH_OF_BIRTH.controlName].setValue(4)

            expect(component.dayList.length).toEqual(30);
        });
        it('subscribe MONTH_OF_BIRTH and month is 2 and year % 4, dayList length equal 29', () => {
            component.signUpForm.controls[component.dataFields.YEAR_OF_BIRTH.controlName].setValue(2000)
            component.subscibeBirthDateChange();
            component.signUpForm.controls[component.dataFields.MONTH_OF_BIRTH.controlName].setValue(2)

            expect(component.dayList.length).toEqual(29);
        });
        it('subscribe MONTH_OF_BIRTH and month is 2 and year not % 4, dayList length equal 28', () => {
            component.signUpForm.controls[component.dataFields.YEAR_OF_BIRTH.controlName].setValue(1999)
            component.subscibeBirthDateChange();
            component.signUpForm.controls[component.dataFields.MONTH_OF_BIRTH.controlName].setValue(2)

            expect(component.dayList.length).toEqual(28);
        });
        it('subscribe YEAR_OF_BIRTH and year not change, dayList length equal 31', () => {
            component.subscibeBirthDateChange();
            component.signUpForm.controls[component.dataFields.YEAR_OF_BIRTH.controlName].setValue('')

            expect(component.dayList.length).toEqual(31);
        });
        it('subscribe YEAR_OF_BIRTH and year change and month = 3, dayList length equal 31', () => {
            component.signUpForm.controls[component.dataFields.MONTH_OF_BIRTH.controlName].setValue(3)
            component.subscibeBirthDateChange();
            component.signUpForm.controls[component.dataFields.YEAR_OF_BIRTH.controlName].setValue(2000)

            expect(component.dayList.length).toEqual(31);
        });
        it('subscribe YEAR_OF_BIRTH and year change, year % 4 and month = 2, dayList length equal 31', () => {
            component.subscibeBirthDateChange();
            component.signUpForm.controls[component.dataFields.MONTH_OF_BIRTH.controlName].setValue(2)
            component.signUpForm.controls[component.dataFields.YEAR_OF_BIRTH.controlName].setValue(2000)

            expect(component.dayList.length).toEqual(29);
        });
        it('subscribe YEAR_OF_BIRTH and year change, year not % 4 and month = 2, dayList length equal 31', () => {
            component.subscibeBirthDateChange();
            component.signUpForm.controls[component.dataFields.MONTH_OF_BIRTH.controlName].setValue(2)
            component.signUpForm.controls[component.dataFields.YEAR_OF_BIRTH.controlName].setValue(1999)

            expect(component.dayList.length).toEqual(28);
        });
    });

    describe('onSubmit', () => {
        it('signUpForm invalid, return undefined', () => {
            const result = component.onSubmit();
            expect(result).toBeUndefined();
        });
        it('signUpForm valid, signup error, errHandleMes.isError is true', () => {
            const data = {
                [component.dataFields.FIRST_NAME.controlName]: 'a',
                [component.dataFields.LAST_NAME.controlName]: 'b',
                [component.dataFields.EMAIL.controlName]: 'ab@test.com',
                [component.dataFields.LANGUAGE.controlName]: '1',
                [component.dataFields.PREFIX_PHONE_NUMBER.controlName]: '84',
                [component.dataFields.PHONE_NUMBER.controlName]: '123456',
                [component.dataFields.MONTH_OF_BIRTH.controlName]: '1',
                [component.dataFields.DAY_OF_BIRTH.controlName]: '1',
                [component.dataFields.YEAR_OF_BIRTH.controlName]: '1999',
                [component.dataFields.CONFIRM_CONDITION.controlName]: true,
            };
            component.signUpForm.patchValue(data);

            // mock service
            let service = TestBed.inject(AuthenticationService);
            spyOn(service, 'signup').and.throwError('');

            component.onSubmit();
            expect(component.errHandleMes.isError).toBeTruthy();
        });
        it('signUpForm valid but response null, isError is true', () => {
            // mock form group
            const data = {
                [component.dataFields.FIRST_NAME.controlName]: 'a',
                [component.dataFields.LAST_NAME.controlName]: 'b',
                [component.dataFields.EMAIL.controlName]: 'ab@test.com',
                [component.dataFields.LANGUAGE.controlName]: '1',
                [component.dataFields.PREFIX_PHONE_NUMBER.controlName]: '84',
                [component.dataFields.PHONE_NUMBER.controlName]: '123456',
                [component.dataFields.MONTH_OF_BIRTH.controlName]: '1',
                [component.dataFields.DAY_OF_BIRTH.controlName]: '1',
                [component.dataFields.YEAR_OF_BIRTH.controlName]: '1999',
                [component.dataFields.CONFIRM_CONDITION.controlName]: true,
            };
            component.signUpForm.patchValue(data);
            // mock service
            let service = TestBed.inject(AuthenticationService);
            spyOn(service, 'signup').and.returnValue(of(null));

            component.onSubmit();
            expect(component.errHandleMes.isError).toBeTruthy();
        });
        it('signUpForm valid but statusCode != 1, isError is true', () => {
            // mock form group
            const data = {
                [component.dataFields.FIRST_NAME.controlName]: 'a',
                [component.dataFields.LAST_NAME.controlName]: 'b',
                [component.dataFields.EMAIL.controlName]: 'ab@test.com',
                [component.dataFields.LANGUAGE.controlName]: '1',
                [component.dataFields.PREFIX_PHONE_NUMBER.controlName]: '84',
                [component.dataFields.PHONE_NUMBER.controlName]: '123456',
                [component.dataFields.MONTH_OF_BIRTH.controlName]: '1',
                [component.dataFields.DAY_OF_BIRTH.controlName]: '1',
                [component.dataFields.YEAR_OF_BIRTH.controlName]: '1999',
                [component.dataFields.CONFIRM_CONDITION.controlName]: true,
            };
            component.signUpForm.patchValue(data);
            // mock service
            let service = TestBed.inject(AuthenticationService);
            spyOn(service, 'signup').and.returnValue(of({ item: { statusCode: 2 } }));

            component.onSubmit();
            expect(component.errHandleMes.isError).toBeTruthy();
        });

        it('signUpForm valid response valid, redirect authenSuccessUrl', () => {
            // mock form group
            const data = {
                [component.dataFields.FIRST_NAME.controlName]: 'a',
                [component.dataFields.LAST_NAME.controlName]: 'b',
                [component.dataFields.EMAIL.controlName]: 'ab@test.com',
                [component.dataFields.LANGUAGE.controlName]: '1',
                [component.dataFields.PREFIX_PHONE_NUMBER.controlName]: '84',
                [component.dataFields.PHONE_NUMBER.controlName]: '123456',
                [component.dataFields.MONTH_OF_BIRTH.controlName]: '1',
                [component.dataFields.DAY_OF_BIRTH.controlName]: '1',
                [component.dataFields.YEAR_OF_BIRTH.controlName]: '1999',
                [component.dataFields.CONFIRM_CONDITION.controlName]: true,
            };
            component.signUpForm.patchValue(data);
            // mock service
            let service = TestBed.inject(AuthenticationService);
            spyOn(service, 'signup').and.returnValue(of({ item: { statusCode: 1 } }));
            // mock router
            let router = TestBed.inject(Router);
            let spy = spyOn(router, 'navigate');


            component.onSubmit();
            expect(spy).toHaveBeenCalledWith([consts.authenSuccessUrl]);
        });
    });

    describe('setPrefixPhoneNumber', () => {
        it('subscribe prefix and value not change, hasPrefixPhoneNumber is false', () => {
            // mock form group
            component.setPrefixPhoneNumber();
            component.signUpForm.controls[component.dataFields.PREFIX_PHONE_NUMBER.controlName].setValue('')

            expect(component.hasPrefixPhoneNumber).toBeFalsy();
        });
        it('subscribe prefix and value change, hasPrefixPhoneNumber  is true', () => {
            // mock form group
            component.setPrefixPhoneNumber();
            component.signUpForm.controls[component.dataFields.PREFIX_PHONE_NUMBER.controlName].setValue('1')

            expect(component.hasPrefixPhoneNumber).toBeTruthy();
        });
    });

    describe('getLanguageList', () => {
        it('call getLanguageList and throw error andlanguagesList length is 0', () => {
            // mock service
            let service = TestBed.inject(CommonService);
            spyOn(service, 'getMainLanguages').and.throwError('');

            component.getLanguageList();

            expect(component.languagesList.length).toEqual(0);
        });
        it('call getLanguageList and response.statusCode = 0 return languagesList length is 0', () => {
            // mock service
            let service = TestBed.inject(CommonService);
            spyOn(service, 'getMainLanguages').and.returnValue(of({ statusCode: 0 }));

            component.getLanguageList();

            expect(component.languagesList.length).toEqual(0);
        });
        it('call getLanguageList and response.item invalid return languagesList length is 0', () => {
            // mock service
            let service = TestBed.inject(CommonService);
            spyOn(service, 'getMainLanguages').and.returnValue(of({ statusCode: 1, item: { data: [[], []] } }));

            component.getLanguageList();

            expect(component.languagesList.length).toEqual(0);
        });
        it('call getLanguageList and response.item valid return languagesList.length = 1', () => {
            // mock service
            let service = TestBed.inject(CommonService);
            spyOn(service, 'getMainLanguages').and.returnValue(of({ statusCode: 1, item: { data: [[], [{ value: 1 }]] } }));

            component.getLanguageList();

            expect(component.languagesList.length).toEqual(1);
        });
    });

    describe('numberOnly', () => {
        it('call numberOnly return true', () => {
            // mock Uti
            spyOn(Uti, 'pressKeyNumberOnly').and.returnValue(true);

            const result = component.numberOnly('1');

            expect(result).toBeTruthy();
        });
    });

    describe('touchedListPrefixPhone', () => {
        it('call touchedListPrefixPhone with PREFIX_PHONE_NUMBER has value and isEmptyPhonePrefix is false', () => {
            component.signUpForm.controls[component.dataFields.PREFIX_PHONE_NUMBER.controlName].setValue('84');

            component.touchedListPrefixPhone();

            expect(component.isEmptyPhonePrefix).toBeFalsy();
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