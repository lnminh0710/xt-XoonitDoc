import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthenticationService, UserService, GlobalSettingService } from '@app/services';
import { Configuration, GlobalSettingConstant, ErrorMessageTypeEnum, PasswordDisplay } from '@app/app.constants';
import { Uti } from '@app/utilities/uti';
import { UserAuthenticationComponent } from '../user.authentication';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { XnErrorMessageHelper } from '@app/utilities';
import { ReducerManagerDispatcher, Store } from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import { ModuleActions, CustomAction } from '@app/state-management/store/actions';
import { ControlData, ValidatorPattern } from '@app/models/control-model/control-data';
import { UserToken } from '@app/models';
import { filter, map, takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'change-password',
    templateUrl: './change-password.component.html',
    styleUrls: ['./change-password.component.scss'],
})
export class ChangePasswordComponent extends UserAuthenticationComponent implements OnInit, AfterViewInit, OnDestroy {
    private placeholderChange$: BehaviorSubject<void> = new BehaviorSubject<void>(null);
    public ERR_MES_TYPE_ENUM = ErrorMessageTypeEnum;
    public changePassFormGroup: FormGroup;
    public PASSWORD_DISPLAY_CONSTANT = PasswordDisplay;

    public dataFields = {
        NEW_PASS: <ControlData>{ controlName: 'newPass', displayName: 'New Password', placeholder$: this.placeholderChange$.pipe(map(() => this.translateService.instant('New Password'))), order: 1 },
        CONFIRM_PASS: <ControlData>{ controlName: 'confirmPass', displayName: 'Repeat New Password', placeholder$: this.placeholderChange$.pipe(map(() => this.translateService.instant('Repeat New Password'))), order: 2 },
    };
    public controlDataList: ControlData[] = [this.dataFields.NEW_PASS, this.dataFields.CONFIRM_PASS];

    public isMatchingPass: boolean = false;
    public newPasswordType = PasswordDisplay.PASSWORD;
    public confirmPasswordType = PasswordDisplay.PASSWORD;
    public userToken: UserToken;
    public isLoading = false;
    public isLoginSuccess = false;

    constructor(
        private authenticationService: AuthenticationService,
        protected router: Router,
        protected consts: Configuration,
        protected uti: Uti,
        protected userService: UserService,
        protected authService: AuthenticationService,
        protected globalSettingSer: GlobalSettingService,
        protected globalSettingConstant: GlobalSettingConstant,
        private fb: FormBuilder,
        protected xnErrorMessageHelper: XnErrorMessageHelper,
        private dispatcher: ReducerManagerDispatcher,
        protected store: Store<AppState>,
        protected moduleActions: ModuleActions,
        private translateService: TranslateService
    ) {
        super(
            consts,
            userService,
            authService,
            uti,
            router,
            globalSettingSer,
            globalSettingConstant,
            consts,
            moduleActions,
            store,
        );
        this.subscribeAction();
    }

    ngAfterViewInit() {
        this.translateService.onLangChange
            .pipe(
                takeUntil(this.getUnsubscriberNotifier())
            )
            .subscribe(() => {
                this.placeholderChange$.next(null);
            });
    }

    ngOnDestroy(): void {
        super.onDestroy();
    }

    ngOnInit() {
        this.isLoginSuccess = false;
        if (!this.userToken || !this.userToken.token) {
            super.handleHasLogin();
            return;
        }
        this.initForm();
    }

    public subscribeAction() {
        this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return action.type === ModuleActions.SEND_TOKEN_UPDATE_PASSWORD;
                }),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((action: CustomAction) => {
                if (!action && !action.payload) {
                    this.redirectToLogin();
                    return;
                }
                this.userToken = action.payload as UserToken;
            });
    }

    private initForm() {
        this.changePassFormGroup = this.fb.group({
            [this.dataFields.NEW_PASS.controlName]: [
                '',
                [Validators.required, Validators.pattern(ValidatorPattern.PASSWORD)],
            ],
            [this.dataFields.CONFIRM_PASS.controlName]: ['', []],
        });
    }

    submit() {
        if (!this.changePassFormGroup.valid) return;

        this.isLoading = true;
        const newPass = this.changePassFormGroup.value[this.dataFields.NEW_PASS.controlName];
        this.authenticationService
            .newPassword(newPass, this.userToken.token)
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe(
                (response) => {
                    this.isLoading = false;

                    const data = response && response.item ? response.item : null;
                    if (!data) {
                        this.router.navigate([this.consts.accountDenied]);
                        return;
                    }

                    super.loginSuccess(data);
                    if (!this.userAuthenticationFail) {
                        this.isLoginSuccess = true;
                        this.store.dispatch(this.moduleActions.clearActiveModule());
                        this.store.dispatch(this.moduleActions.loginSuccess());
                    }
                },
                (error) => {
                    this.isLoading = false;
                    this.isLoginSuccess = false;
                    this.router.navigate([this.consts.accountDenied]);
                },
            );
    }

    public checkMatchingPass() {
        this.isMatchingPass =
            this.changePassFormGroup.controls[this.dataFields.NEW_PASS.controlName].value ===
            this.changePassFormGroup.controls[this.dataFields.CONFIRM_PASS.controlName].value;
    }

    public showHidePassword(type: string) {
        this[type] = this[type] === PasswordDisplay.PASSWORD ? PasswordDisplay.TEXT : PasswordDisplay.PASSWORD;
    }

    public redirectToLogin() {
        //window.location.href = this.consts.loginUrl;
        this.router.navigate([this.consts.loginUrl]);
        // location.reload();
    }
}
