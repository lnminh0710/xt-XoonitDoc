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
import { Configuration, GlobalSettingConstant } from '@app/app.constants';
import { ChangePasswordComponent } from '../change-password/change-password.component';
import { AuthenticateSuccessComponent } from '../authenticate-success/authenticate-success.component';
import { UpdatePasswordComponent } from '../update-password/update-password.component';
import { UpdatePasswordExpireComponent } from '../update-password-expire/update-password-expire.component';
import { AccountDeniedComponent } from '../account-denied/account-denied.component';
import { AccountExpireComponent } from '../account-expire/account-expire.component';
import { RequestTrackingComponent } from '../request-tracking/request-tracking.component';
import { SignupComponent } from '../signup/signup.component';
import { BrowserModule, By } from '@angular/platform-browser';
import { ModuleActions } from '@app/state-management/store/actions';
import { Store, StoreModule } from '@ngrx/store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoginComponent } from './login.component';
import { ForgotPasswordComponent } from '../forgot-password/forgot-password.component';
import { of } from 'rxjs';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let store: Store<any>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        LoginComponent,
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
        ForgotPasswordComponent
      ],
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
        BrowserAnimationsModule,
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
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    store = fixture.debugElement.injector.get(Store);
    component = fixture.componentInstance;

    localStorage.clear();
    sessionStorage.clear();

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('[Email-Check] - should check users email address is invalid', () => {
    const email = component.signInFormGroup.controls[component.dataFields.EMAIL.controlName];
    expect(email.valid).toBeFalsy();
    expect(email.pristine).toBeTruthy();
    expect(email.errors['required']).toBeTruthy();
    email.setValue('abc');

    expect(email.errors['pattern']).toBeTruthy();
  });

  it('[Email-Check] - should check users email address is entered', () => {
    const email = component.signInFormGroup.controls[component.dataFields.EMAIL.controlName];
    email.setValue('abc@gmail.com');
    expect(email.errors).toBeNull();
  });

  it('[Password-Check] - should check password error', () => {
    const pwd = component.signInFormGroup.controls[component.dataFields.PASSWORD.controlName];
    expect(pwd.errors['required']).toBeTruthy();
    pwd.setValue('1234');

    expect(pwd.errors['pattern']).toBeTruthy();

  });

  it('[Password-Check] - should check password valid', () => {
    const pwd = component.signInFormGroup.controls[component.dataFields.PASSWORD.controlName];
    pwd.setValue('Zeus!2015');

    expect(pwd.errors).toBeNull();
    expect(pwd.valid).toBeTruthy();

  });

  it('[Form-Check] - should check form is valid or not if no values entered', () => {
    expect(component.signInFormGroup.valid).toBeFalsy();

  });

  it('[Form-Check] - should check form is valid or not when values entered', () => {
    component.signInFormGroup.controls[component.dataFields.EMAIL.controlName].setValue('abc@gmail.com');
    component.signInFormGroup.controls[component.dataFields.PASSWORD.controlName].setValue('Zeus!2015');

    expect(component.signInFormGroup.valid).toBeTruthy();
  });

  it('[Form-Submit] - should check form is submitted', () => {
    // check form is invalid
    expect(component.signInFormGroup.invalid).toBeTruthy();
    const btn = fixture.debugElement.query(By.css('.btn-signIn'));

    // check btn disabled
    expect(btn.nativeElement.disabled).toBeTruthy();

    component.signInFormGroup.controls[component.dataFields.EMAIL.controlName].setValue('tuan.nguyen@xoontec.com');
    component.signInFormGroup.controls[component.dataFields.PASSWORD.controlName].setValue('12345#Zeus');
    fixture.detectChanges();

    // check btn enabled
    expect(btn.nativeElement.disabled).toBeFalsy();

    const restService = TestBed.inject(AuthenticationService);
    const data = {
      "statusCode": 1,
      "resultDescription": null,
      "item": {
        "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwdFo5S1lhS3VzV0NZSFM1cGZ2YnkrTG1mdXVzSnpsRW1rTkFWeFpIWDhOS01WUHhBb3U1S25WanpGVzN1Mk1WZ3RCbXBvL1lERkpzclFFSDJZbEV0N1Vjc2FnOUVDVnhBL0R1cDBuVnk4MEdzSVhTc3U0NXE5cThsU1NqWE0yMnRsUXY5SGtaQlY3bTRJbFNYL3htQlg3bjRUM1BMVTdhWktBWXNQdE9ZR0djNnZBOThUSlFGTmdWUi9MZWZSZ2NqMEhKTy84VFI5dkdNbk5VRVNNbi84anp0RFp0d2dNLzRsdlppVy9xWGpoclBNSm45U0x1cFFmcTNlVjdiSURaK0ZURmc2SnJ5akVKdDNpTk1LSXNVemUxNmVlNER1dVVLZC9VWmw1Z2E4b1M5SjI3U2dTRFRwNC9YbElMNEM4M0NUTkRWT2htc0RXSjh3eTZOcVIzNmlZV2NPdlhiRmovWWZ6S0VBNndXWWZoZTg0TFhDZG5WTXZwcVd1YWFjYW5ja1MwWlM4M25yRmpLVFQyNSt2RG92MDNyZ0pUdmpxTklPVUhkcWVoQ255ZUJKWXlBMzBDaGc4SGNML3ZaM0lGZWFxN1F4QT0iLCJqdGkiOiJlYmFiMjQzMS05NjZhLTQwMGMtOTNjOS0zZWVkYmEwMzdjOTgiLCJpYXQiOjE2MjI5OTc5MDYsImFwcGluZm8iOiJ7XHJcbiAgXCJGdWxsTmFtZVwiOiBudWxsLFxyXG4gIFwiTW9kdWxlTmFtZVwiOiBcIlwiLFxyXG4gIFwiUk1SZWFkXCI6IFwiMVwiLFxyXG4gIFwiTWVzc2FnZVwiOiBudWxsLFxyXG4gIFwiVmFsaWRUb1wiOiBudWxsLFxyXG4gIFwiTWVzc2FnZVR5cGVcIjogbnVsbCxcclxuICBcIkxvZ2luUGljdHVyZVwiOiBcIi9hcGkvRmlsZU1hbmFnZXIvR2V0RmlsZT9uYW1lPTYzNzUyNjM2MDIxMDc4NDY0OC5qcGcmbW9kZT1Qcm9maWxlXCIsXHJcbiAgXCJVc2VyR3VpZFwiOiBcImM3ZDdlMTVlLTYwZWItNDkzNi1hMTQ2LWYyMjY2NzA0ZDhjN1wiLFxyXG4gIFwiSWRDbG91ZENvbm5lY3Rpb25cIjogXCIyMDZcIixcclxuICBcIkluaXRpYWxzXCI6IFwiMVwiLFxyXG4gIFwiSXNCbG9ja2VkXCI6IGZhbHNlLFxyXG4gIFwiSXNMb2dpbkFjdGl2ZWRcIjogdHJ1ZSxcclxuICBcIkVuY3J5cHRlZFwiOiBcIjRERkY0RUEzNDBGMEE4MjNGMTVEM0Y0RjAxQUI2MkVBRTBFNURBNTc5Q0NCODUxRjhEQjlERkU4NEM1OEIyQjM3Qjg5OTAzQTc0MEUxRUUxNzJEQTc5M0E2RTc5RDU2MEU1RjdGOUJEMDU4QTEyQTI4MDQzM0VENkZBNDY1MTBBXCIsXHJcbiAgXCJJbmZvQ2xvdWRcIjogXCJ7XFxcIkNvbm5lY3Rpb25TdHJpbmdcXFwiOlxcXCJ7XFxcXFxcXCJVc2VyRW1haWxcXFxcXFxcIjpcXFxcXFxcInRhbS50aGFuQHhvb250ZWMuY29tXFxcXFxcXCIsXFxcXFxcXCJTaGFyZWRGb2xkZXJcXFxcXFxcIjpcXFxcXFxcInd3d3dcXFxcXFxcIixcXFxcXFxcIlNoYXJlZExpbmtcXFxcXFxcIjpudWxsLFxcXFxcXFwiU2hhcmVkRm9sZGVySWRcXFxcXFxcIjpcXFxcXFxcIjAxRzVIWlRKVFI0SUFDWU9NVUVORkxOREVLWVNHWjZCQUdcXFxcXFxcIixcXFxcXFxcIkZpbGVTZXJ2ZXJGb2xkZXJcXFxcXFxcIjpudWxsLFxcXFxcXFwiU2Z0cENvbm5lY3Rpb25cXFxcXFxcIjpudWxsLFxcXFxcXFwiRnRwQ29ubmVjdGlvblxcXFxcXFwiOm51bGwsXFxcXFxcXCJDbG91ZFVzZXJJZFxcXFxcXFwiOm51bGwsXFxcXFxcXCJPbmVEcml2ZURyaXZlSWRcXFxcXFxcIjpudWxsLFxcXFxcXFwiQ2xvdWRUb2tlblxcXFxcXFwiOntcXFxcXFxcInRva2VuX3R5cGVcXFxcXFxcIjpcXFxcXFxcIkJlYXJlclxcXFxcXFwiLFxcXFxcXFwiZXhwaXJlc19pblxcXFxcXFwiOlxcXFxcXFwiMzU5OVxcXFxcXFwiLFxcXFxcXFwicmVzb3VyY2VcXFxcXFxcIjpudWxsLFxcXFxcXFwic2NvcGVcXFxcXFxcIjpcXFxcXFxcIm9wZW5pZCBwcm9maWxlIGVtYWlsIGh0dHBzOi8vZ3JhcGgubWljcm9zb2Z0LmNvbS9GaWxlcy5SZWFkV3JpdGUgaHR0cHM6Ly9ncmFwaC5taWNyb3NvZnQuY29tL0ZpbGVzLlJlYWRXcml0ZS5BbGwgaHR0cHM6Ly9ncmFwaC5taWNyb3NvZnQuY29tL01haWwuUmVhZCBodHRwczovL2dyYXBoLm1pY3Jvc29mdC5jb20vVXNlci5SZWFkXFxcXFxcXCIsXFxcXFxcXCJhY2Nlc3NfdG9rZW5cXFxcXFxcIjpcXFxcXFxcImV5SjBlWEFpT2lKS1YxUWlMQ0p1YjI1alpTSTZJbVJZTm5SYVdITTNha1k0VmsxVmNITjNiWGc1ZDJOTGFGZExTbVp1UkRGd1JHSmpjbGhDVmpOSU5Xc2lMQ0poYkdjaU9pSlNVekkxTmlJc0luZzFkQ0k2SW01UGJ6TmFSSEpQUkZoRlN6RnFTMWRvV0hOc1NGSmZTMWhGWnlJc0ltdHBaQ0k2SW01UGJ6TmFSSEpQUkZoRlN6RnFTMWRvV0hOc1NGSmZTMWhGWnlKOS5leUpoZFdRaU9pSm9kSFJ3Y3pvdkwyZHlZWEJvTG0xcFkzSnZjMjltZEM1amIyMGlMQ0pwYzNNaU9pSm9kSFJ3Y3pvdkwzTjBjeTUzYVc1a2IzZHpMbTVsZEM4eU5qY3lObUppWmkxa05XRmtMVFJpWWpndFlXRTVPQzFrT0dJM05ERm1aVE5sTVRVdklpd2lhV0YwSWpveE5qRTNNRGM0TWpJMExDSnVZbVlpT2pFMk1UY3dOemd5TWpRc0ltVjRjQ0k2TVRZeE56QTRNakV5TkN3aVlXTmpkQ0k2TUN3aVlXTnlJam9pTVNJc0ltRmpjbk1pT2xzaWRYSnVPblZ6WlhJNmNtVm5hWE4wWlhKelpXTjFjbWwwZVdsdVptOGlMQ0oxY200NmJXbGpjbTl6YjJaME9uSmxjVEVpTENKMWNtNDZiV2xqY205emIyWjBPbkpsY1RJaUxDSjFjbTQ2YldsamNtOXpiMlowT25KbGNUTWlMQ0pqTVNJc0ltTXlJaXdpWXpNaUxDSmpOQ0lzSW1NMUlpd2lZellpTENKak55SXNJbU00SWl3aVl6a2lMQ0pqTVRBaUxDSmpNVEVpTENKak1USWlMQ0pqTVRNaUxDSmpNVFFpTENKak1UVWlMQ0pqTVRZaUxDSmpNVGNpTENKak1UZ2lMQ0pqTVRraUxDSmpNakFpTENKak1qRWlMQ0pqTWpJaUxDSmpNak1pTENKak1qUWlMQ0pqTWpVaVhTd2lZV2x2SWpvaVJUSmFaMWxRYWxWS2RXcFZOMnhwYUcxb1lYVjRTMW8yWWk4eFMyMVZjVGRMZWpSdVNXbFpTVzVEZVdGWVVIQTJWbmxGUVNJc0ltRnRjaUk2V3lKd2QyUWlYU3dpWVhCd1gyUnBjM0JzWVhsdVlXMWxJam9pVFhsRWJVRndjQ0lzSW1Gd2NHbGtJam9pWkRVNU5EVmlZemt0TkdFME15MDBOMlkyTFRreE5EUXRNR1E1TWpNd05UQmlNemhrSWl3aVlYQndhV1JoWTNJaU9pSXhJaXdpWm1GdGFXeDVYMjVoYldVaU9pSlVhTU9pYmlCV3hJTnVJaXdpWjJsMlpXNWZibUZ0WlNJNklsVERvbTBpTENKcFpIUjVjQ0k2SW5WelpYSWlMQ0pwY0dGa1pISWlPaUl4TVRNdU1UWXhMalF6TGpJME9DSXNJbTVoYldVaU9pSlV3Nkp0SUZSb3c2SnVJRmJFZzI0aUxDSnZhV1FpT2lJM09XSTFZalE0T1MweVlUTXlMVFE0TUdNdE9USmlPQzFpT0RCbE4yRXdNakZtWkRVaUxDSndiR0YwWmlJNklqTWlMQ0p3ZFdsa0lqb2lNVEF3TXpJd01EQTNNVVpGT0RBeE9DSXNJbkpvSWpvaU1DNUJWRUZCZGpKMGVVcHhNMVoxUlhWeGJVNXBNMUZtTkMxR1kyeGliRTVXUkZOMldraHJWVkZPYTJwQ1VYTTBNSGRCU3pBdUlpd2ljMk53SWpvaVJtbHNaWE11VW1WaFpGZHlhWFJsSUVacGJHVnpMbEpsWVdSWGNtbDBaUzVCYkd3Z1RXRnBiQzVTWldGa0lHOXdaVzVwWkNCd2NtOW1hV3hsSUZWelpYSXVVbVZoWkNCbGJXRnBiQ0lzSW5OcFoyNXBibDl6ZEdGMFpTSTZXeUpyYlhOcElsMHNJbk4xWWlJNklscG5OM3A2VTBOUE5ISmtNbmhpUVdKWFgxSjNka290ZUhOdWMxWklkbTAyWVdKRWF6VlBMWEJ4Y1dNaUxDSjBaVzVoYm5SZmNtVm5hVzl1WDNOamIzQmxJam9pUlZVaUxDSjBhV1FpT2lJeU5qY3lObUppWmkxa05XRmtMVFJpWWpndFlXRTVPQzFrT0dJM05ERm1aVE5sTVRVaUxDSjFibWx4ZFdWZmJtRnRaU0k2SW5SaGJTNTBhR0Z1UUhodmIyNTBaV011WTI5dElpd2lkWEJ1SWpvaWRHRnRMblJvWVc1QWVHOXZiblJsWXk1amIyMGlMQ0oxZEdraU9pSlhPREV5Vm05QlMyMXJTMk14V0RSUVkwMWZYMEZCSWl3aWRtVnlJam9pTVM0d0lpd2lkMmxrY3lJNld5SmlOemxtWW1ZMFpDMHpaV1k1TFRRMk9Ea3RPREUwTXkwM05tSXhPVFJsT0RVMU1Ea2lYU3dpZUcxelgzTjBJanA3SW5OMVlpSTZJa3huUjNKalZFRkhSRlV4Wmtrd2MwSmZTVmhpTUVkTGFHdG1iblpMU2pCRVZXeGZZblZTUjFWWlJWVWlmU3dpZUcxelgzUmpaSFFpT2pFMU1UY3pNemMxTnpGOS5JdWdobm9rTHRkNUdCODRXVG5jYnloZ3V1UVJDSjRMbHAzcTVEeFFyUHRIQVZQcVV2MFdZTFgxR015dC1MSGlOQXU2RkdjZE10MHozZUhFbWpSSFg5ckVEQzkzbktHWTdac01pX2NWYlVuUFA1NUcwWmh2T1RTejZIQ2J6eU9Kc2RwOURWdVo2YjdQX01BVjFHaDhCR0llWlhFV3E2RHA2a1RWMGhnbjJrQ0VNSnZuM01FRjFjYnlmSk5xSXRLTDJ0bVVDRWZTR1Y0Z19tQWRzdm9JVzdFTzN1eGkwZkQyeE5BTGpPT2ZZOFAtYXdXbW5SUVppR3ptOGV1aXJFZjZjYzBjZmZaZUVHaG5tc2p1Q0ZPVWx0LWNvU0s1VFdlZUNDYTZJdjJJbFhUdVRoRGxhMWROSGZUaG9VOGlZSmVfYXdVOVA5X0F6NlFGSlpxUmpNNWxaSUFcXFxcXFxcIixcXFxcXFxcInJlZnJlc2hfdG9rZW5cXFxcXFxcIjpcXFxcXFxcIjAuQVRBQXYydHlKcTNWdUV1cW1OaTNRZjQtRmNsYmxOVkRTdlpIa1VRTmtqQlFzNDB3QUswLkFnQUJBQUFBQUFELS1ETEEzVk83UXJkZGdKZzdXZXZyQWdEc193UUE5UF9ZWWNtQ0pfd001SXF4dV82ajBHNWNTbXJNVzNfbDd4SUtwZnd1cEhjN3JZcG5mQWZzbkcwdmdCMS0zdU56djJpdjQybHZmUGhtU2cxWFN4Zk1rVkp6Wk1ZUzRzTXJaWFhWdkpPYk94RDBpSlluM29JTmdDZjNHMjFWTXFYb3pZeWpUeF94cWhXRzVGTnYwa3Jla19lMGZGSFpPT1ZXX2E0Qkd4RHQzamhZUEFVVDBEcmhQMEJxUC1FUVQ0TmlpMFYyUXNOREpCWEk1aGFfNTdwVjZZVmM4Z3JUbVBfOXF3VjBuZW41ZzNWb0Y3aDVZQU5oUW9fVEU4eTgwQmhHdnRNOElLT3l0Y0J0dmxSSW9HbUg0SW1XSVVnTFhVZVFSTmNUQUNuVTlqZ0t5eGJwaXZOb3pMOTRwb0djdmpDRVpBR255ZURpNG9mUEhpLVVsQS1QUk9wN25QOHYwcVRRTkJwVHF0T1NhSWlhdzU0a25WR0FyZmh5TW5vX0w1MC0tb1FtY3FrZzFjVkJaTnBwV1JFakRIS1JtSEhvYldsNFBwcFlXT1FTb3ZMalFQS0tUQkRhVHNBNDdkajQxQ2dya3owRHFJNmdfM1JrNnhRcmtfYkhZcW02NG11RGVxZXZPSVhscHViSXVKR2g3NWNQVjlPdDZibzR4dllRanZMWHZmZ0JtQUNhc0pHeFoxak1QZ203dHNaWlk1aFh0b0dLdGtVZ18zSGxkZmNRcTVRbVdRQzc4Q3pIUjN5dnN1cjVEb1J6UlhNUW5wYm8ydFhibjA5eDdpSTBnbE85ZTQ3dlptQk9YVFpadDJXeG5icTBnUnNpY1Y1aWZHR0duWEdoa3FWSzVRMDM2S01mWGZtOWU0dHFzNVJySGR4VnpxQ1BCZGZUX1FWRXg3eUhXM2ZHZWZlb2R4ZlFqQ2JnOWUySWtuNkpxOVR2YzVuc1Q5SjNpd3RyUGwwM2VvMDdEbTdmazdpTVNMUVRSbGhiRnR1dVJWemtYVVFYRjJHV1BjOTg3bzBNY0pWWG03VlA1UG0zeFI0aERwWWU2bE90RlFVRFZ1MUZDb1lvemwzb21mSGhiekVhNTBaZzNlOUFET29CXzZvX2NVSGRCMjZfTEpwTGs4SFNMLXl1TmU0RWd2STFwXy1uZXNYM1RfNF9TRVhFVWNOSGJFY1AzQk1ycVNtRUdGaGlYdVcxcEFNeVgzcWI0SUo0Z1FjU3ZLLW1JaEJnOGNiREo0Z3V0VjBGMTd3UlJCSW9rdExrYmMxM2Z5SkhcXFxcXFxcIixcXFxcXFxcImlkX3Rva2VuXFxcXFxcXCI6XFxcXFxcXCJleUowZVhBaU9pSktWMVFpTENKaGJHY2lPaUpTVXpJMU5pSXNJbXRwWkNJNkltNVBiek5hUkhKUFJGaEZTekZxUzFkb1dITnNTRkpmUzFoRlp5SjkuZXlKaGRXUWlPaUprTlRrME5XSmpPUzAwWVRRekxUUTNaall0T1RFME5DMHdaRGt5TXpBMU1HSXpPR1FpTENKcGMzTWlPaUpvZEhSd2N6b3ZMMnh2WjJsdUxtMXBZM0p2YzI5bWRHOXViR2x1WlM1amIyMHZNalkzTWpaaVltWXRaRFZoWkMwMFltSTRMV0ZoT1RndFpEaGlOelF4Wm1VelpURTFMM1l5TGpBaUxDSnBZWFFpT2pFMk1UY3dOemd5TWpRc0ltNWlaaUk2TVRZeE56QTNPREl5TkN3aVpYaHdJam94TmpFM01EZ3lNVEkwTENKaGFXOGlPaUpCVkZGQmVTODRWRUZCUVVGYWJ6bDRMMWxHZUhaV01HcExTWGRMVjJaRkwyd3hVbmh1VFN0dmNUWnpOSEptU1hCTU1VZ3lVSEpxV0daV2NUQjZURGRrYVhGak1WTm9RWEY2TDBoVElpd2libUZ0WlNJNklsVERvbTBnVkdqRG9tNGdWc1NEYmlJc0ltOXBaQ0k2SWpjNVlqVmlORGc1TFRKaE16SXRORGd3WXkwNU1tSTRMV0k0TUdVM1lUQXlNV1prTlNJc0luQnlaV1psY25KbFpGOTFjMlZ5Ym1GdFpTSTZJblJoYlM1MGFHRnVRSGh2YjI1MFpXTXVZMjl0SWl3aWNtZ2lPaUl3TGtGVVFVRjJNblI1U25FelZuVkZkWEZ0VG1relVXWTBMVVpqYkdKc1RsWkVVM1phU0d0VlVVNXJha0pSY3pRd2QwRkxNQzRpTENKemRXSWlPaUpNWjBkeVkxUkJSMFJWTVdaSk1ITkNYMGxZWWpCSFMyaHJabTUyUzBvd1JGVnNYMkoxVWtkVldVVlZJaXdpZEdsa0lqb2lNalkzTWpaaVltWXRaRFZoWkMwMFltSTRMV0ZoT1RndFpEaGlOelF4Wm1VelpURTFJaXdpZFhScElqb2lWemd4TWxadlFVdHRhMHRqTVZnMFVHTk5YMTlCUVNJc0luWmxjaUk2SWpJdU1DSjkuaURBMmZRNXJ6ZUV6TTRHeUxmeVdKOXZmTzFKVE9BaVA3WlNubjAzbF8tZTgteEp4VFFTdjRGd05nNzJzalUxb1NtMUVEVzRHQ1lyUURBRXI4czI3azlmVUlmRWhKQUtVNW16ekxoemFqaUpZaE54Tjh1NS1XZTROaEkyUUhUMERXVHEtcm9INFZnckczaGxLVl9Wa2trOW56QjgxcFVJTkgzOHpiT0FodXFDN015cXloMGlVdFJVMzZXQXQ0V0NfWWlva3BDR1RNUWNMcXlUV281QVhZQU9YXzZrMTdxT3hjRnBXelVnOUxkcWpsVzhPSE9qU2d5Sy1ER2VoeEw5MWt6VFliaFAwMmYtUDNUaWlHRkFTQ3pnajF4Q1AtQ1d2Q2hCa3VUZE5qc21md2hlUVRuTGRfa3FJZHl2QWlWdndvUzl3eFJmalF3TWhyd0Vxa1Vlc1dRXFxcXFxcXCIsXFxcXFxcXCJleHBpcmVkX2RhdGVfdGltZVxcXFxcXFwiOlxcXFxcXFwiMDAwMS0wMS0wMVQwMDowMDowMFxcXFxcXFwifSxcXFxcXFxcIkRyaXZlVHlwZVxcXFxcXFwiOlxcXFxcXFwiYnVzaW5lc3NcXFxcXFxcIn1cXFwiLFxcXCJVc2VyRW1haWxcXFwiOlxcXCJ0YW0udGhhbkB4b29udGVjLmNvbVxcXCIsXFxcIlByb3ZpZGVyTmFtZVxcXCI6XFxcIk9uZURyaXZlXFxcIixcXFwiSWRDbG91ZFByb3ZpZGVyc1xcXCI6MyxcXFwiSWRDbG91ZENvbm5lY3Rpb25cXFwiOjIwNixcXFwiQ2xpZW50SWRcXFwiOlxcXCIwMUc1SFpUSlRSNElBQ1lPTVVFTkZMTkRFS1lTR1o2QkFHXFxcIn1cIixcclxuICBcIkFjdGl2ZUNsb3VkXCI6IG51bGwsXHJcbiAgXCJJZEFwcFVzZXJcIjogXCIxMzFcIixcclxuICBcIklkUGVyc29uXCI6IFwiMVwiLFxyXG4gIFwiQ29tcGFueVwiOiBcIlRyaWV0IEFBIGNvbXBhbnlcIixcclxuICBcIkZpcnN0TmFtZVwiOiBcInRhbVwiLFxyXG4gIFwiTGFzdE5hbWVcIjogXCJ0dlwiLFxyXG4gIFwiRW1haWxcIjogXCJ0YW0udGhhbkB4b29udGVjLmNvbVwiLFxyXG4gIFwiUGFzc3dvcmRcIjogbnVsbCxcclxuICBcIk5ld1Bhc3N3b3JkXCI6IG51bGwsXHJcbiAgXCJJZExvZ2luXCI6IFwiNDQ0XCIsXHJcbiAgXCJJZFJlcExhbmd1YWdlXCI6IFwiNFwiLFxyXG4gIFwiSWRBcHBsaWNhdGlvbk93bmVyXCI6IFwiNDMzXCIsXHJcbiAgXCJDdXJyZW50RGF0ZVRpbWVcIjogbnVsbCxcclxuICBcIlBob25lTnJcIjogbnVsbCxcclxuICBcIkRhdGVPZkJpcnRoXCI6IG51bGwsXHJcbiAgXCJSb2xlTmFtZVwiOiBcIlN1cGVyIEFkbWluaXN0cmF0b3JcIixcclxuICBcIlBhc3N3b3JkSGFzaFwiOiBudWxsLFxyXG4gIFwiQWNjZXNzVG9rZW5FeHBpcmVcIjogMFxyXG59IiwibmJmIjoxNjIyOTk3OTA2LCJleHAiOjE2MjQ3MjU5MDYsImlzcyI6IlhlbmFVSVRva2VuU2VydmVyIiwiYXVkIjoiaHR0cDovL2xvY2FsaG9zdDo1MDAwLyJ9.wKf2wnMPJK2wZQyLEF0liKhVw_60_ISO1i402NFyFig",
        expires_in: "1728000",
        result: "Successfully",
        token_type: "Bearer"
      }
    };
    spyOn(restService, 'login').and.returnValue(of(data));

    // mock store dispatch
    const moduleAction = TestBed.inject(ModuleActions);
    spyOn(store, 'dispatch');


    component.login();
    // fixture.detectChanges();

    expect(component.userAuthenticationFail).toBeFalsy();
    expect(component.isLoginSuccess).toBeTruthy();
    expect(store.dispatch).toHaveBeenCalledWith(jasmine.objectContaining({ type: ModuleActions.CLEAR_ACTIVE_MODULE }));
    expect(store.dispatch).toHaveBeenCalledWith(jasmine.objectContaining({ type: ModuleActions.LOGIN_SUCCESS }));
  });
});
