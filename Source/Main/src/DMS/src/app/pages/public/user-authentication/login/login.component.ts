import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthenticationService, GlobalSettingService, UserService } from '@app/services';
import {
    Configuration,
    GlobalSettingConstant,
    ErrorMessageTypeEnum,
    PasswordDisplay,
    AuthenType,
} from '@app/app.constants';
import { Uti, XnErrorMessageHelper } from '@app/utilities';
import { UserAuthenticationComponent } from '../user.authentication';
import { ModuleActions } from '@app/state-management/store/actions';
import { AppState } from '@app/state-management/store';
import { Store } from '@ngrx/store';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ControlData, ValidatorPattern } from '@app/models/control-model/control-data';
import { UserToken } from '@app/models';
import { takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs/internal/Subject';

@Component({
    selector: 'login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
})
export class LoginComponent extends UserAuthenticationComponent implements OnInit, OnDestroy {
    public PASSWORD_DISPLAY_CONSTANT = PasswordDisplay;
    public ERR_MES_TYPE_ENUM = ErrorMessageTypeEnum;

    public signInFormGroup: FormGroup;
    public dataFields = {
        EMAIL: <ControlData>{ controlName: 'email', displayName: this.translateService.instant('LOGIN__EmailAddress'), order: 1 },
        PASSWORD: <ControlData>{ controlName: 'password', displayName: this.translateService.instant('LOGIN__Password'), order: 2 },
    };
    public controlDataList: ControlData[] = [this.dataFields.EMAIL, this.dataFields.PASSWORD];

    public passType = PasswordDisplay.PASSWORD;
    public isLoading = false;
    public forgotpasswordUrl: string;
    public signupdUrl: string;
    public isLoginSuccess = false;

    constructor(
        protected consts: Configuration,
        protected userService: UserService,
        protected uti: Uti,
        protected router: Router,
        private route: ActivatedRoute,
        protected globalSettingSer: GlobalSettingService,
        protected globalSettingConstant: GlobalSettingConstant,
        private authenticationService: AuthenticationService,
        protected moduleActions: ModuleActions,
        protected store: Store<AppState>,
        protected xnErrorMessageHelper: XnErrorMessageHelper,
        private fb: FormBuilder,
        protected configuration: Configuration,
        protected translateService: TranslateService,
    ) {
        super(
            consts,
            userService,
            authenticationService,
            uti,
            router,
            globalSettingSer,
            globalSettingConstant,
            configuration,
            moduleActions,
            store,
        );
    }

    ngOnDestroy(): void {
        super.onDestroy();
    }

    ngOnInit() {
        this.isLoginSuccess = false;
        this.checkQueryParam();
    }

    ngAfterViewInit() {
        this.translateService.onLangChange
            .pipe(
                takeUntil(this.getUnsubscriberNotifier())
            )
            .subscribe(() => {
                this.setPlaceholder();
            });
    }

    private setPlaceholder() {
        this.dataFields.EMAIL.displayName = this.translateService.instant('LOGIN__EmailAddress');
        this.dataFields.PASSWORD.displayName = this.translateService.instant('LOGIN__Password');;
    }

    private checkQueryParam() {
        this.route.queryParams.pipe(takeUntil(this.getUnsubscriberNotifier())).subscribe((params) => {
            const token = params['token'];
            if (!token) {
                this.onInitFunction();
                return;
            }

            this.isLoading = true;
            this.authenticationService
                .checkToken(token)
                .pipe(takeUntil(this.getUnsubscriberNotifier()))
                .subscribe((res) => {
                    this.isLoading = false;

                    if (!res) {
                        this.onInitFunction();
                        return;
                    }

                    this.authenticationService.logout();
                    this.userService.setCurrentUser(null);

                    if (!res.isValid) {
                        this.onInitFunction(true);
                        return;
                    }

                    if (res.isExpired) {
                        this.router.navigate([this.consts.accountExpireUrl]);
                        this.store.dispatch(
                            this.moduleActions.sendTokenUpdatePasswordAction(<UserToken>{
                                token,
                                type: AuthenType.RESEND_NEW_PASSWORD,
                            }),
                        );
                    } else if (res.isConfirmEmail || res.isForgot) {
                        const type = res.isConfirmEmail ? AuthenType.NEW_PASSWORD : AuthenType.FORGOT_PASSWORD;
                        this.router.navigate([this.consts.changePasswordUrl]);
                        this.store.dispatch(
                            this.moduleActions.sendTokenUpdatePasswordAction(<UserToken>{
                                token,
                                type: type,
                            }),
                        );
                    } else {
                        this.router.navigate([this.consts.accountDenied]);
                    }
                });
        });
    }

    public login() {
        if (!this.signInFormGroup.valid || this.isLoading) return;

        this.isLoading = true;
        const model = this.signInFormGroup.value;
        this.authenticationService
            .login(model)
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe(
                (data) => {
                    this.isLoading = false;

                    if (data.statusCode !== 1 || !data.item || !data.item.access_token) {
                        this.loginError();
                        return;
                    }

                    super.loginSuccess(data.item);
                    if (!this.userAuthenticationFail) this.handleLoginSuccess();
                },
                (error) => this.loginError(error),
            );
    }

    private handleLoginSuccess() {
        this.isLoginSuccess = true;
        this.store.dispatch(this.moduleActions.clearActiveModule());
        this.store.dispatch(this.moduleActions.loginSuccess());
    }

    private loginError(error?: any) {
        this.authenticationService.logout();
        this.userAuthenticationFail = true;
        this.isLoading = false;
        this.isLoginSuccess = false;
    }

    private onInitFunction(isInvalidToken = false) {
        // get return url from route parameters or default to '/'
        if (this.uti.checkLogin()) {
            this.handleLoginSuccess();
        } else {
            // reset login status
            if (isInvalidToken) {
                this.router.navigate([this.consts.accountDenied]);
            } else {
                this.authenticationService.logout();
            }
        }

        this.onInitForm();
        this.forgotpasswordUrl = this.consts.forgotpasswordUrl;
        this.signupdUrl = this.consts.signupUrl;
    }

    private onInitForm() {
        this.signInFormGroup = this.fb.group({
            [this.dataFields.EMAIL.controlName]: [
                '',
                [Validators.required, Validators.pattern(ValidatorPattern.EMAIL)],
            ],
            [this.dataFields.PASSWORD.controlName]: [
                '',
                [Validators.required, Validators.pattern(ValidatorPattern.PASSWORD)],
            ],
        });
    }

    public showHidePassword() {
        this.passType = this.xnErrorMessageHelper.changePasswordType(this.passType);
    }
}
