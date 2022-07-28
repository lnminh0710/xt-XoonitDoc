import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthenticationService, UserService, GlobalSettingService } from '@app/services';
import { Configuration, GlobalSettingConstant, ErrorMessageTypeEnum, AuthenType } from '@app/app.constants';
import { UserAuthenticationComponent } from '../user.authentication';
import { Uti, XnErrorMessageHelper } from '@app/utilities';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ControlData, ValidatorPattern } from '@app/models/control-model/control-data';
import { ModuleActions } from '@app/state-management/store/actions';
import { Store } from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import { ErrorHandleMessageModel } from '@app/models/error-handle/error-handle-message.model';
import { takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs/internal/Subject';

@Component({
    selector: 'forgot-password',
    templateUrl: './forgot-password.component.html',
    styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent extends UserAuthenticationComponent implements OnInit, OnDestroy {
    public ERR_MES_TYPE_ENUM = ErrorMessageTypeEnum;

    public forgotPassForm: FormGroup;
    public dataFields = {
        EMAIL: <ControlData>{
            controlName: 'email', displayName: this.translateService.instant('FORGOT_PASSWORD__Email'), order: 1
        },
    };
    public controlDataList: ControlData[] = [this.dataFields.EMAIL];

    public isLoading = false;
    public errHandleMes = new ErrorHandleMessageModel();

    constructor(
        protected route: ActivatedRoute,
        protected authenticationService: AuthenticationService,
        protected consts: Configuration,
        protected userService: UserService,
        protected uti: Uti,
        protected router: Router,
        protected globalSettingSer: GlobalSettingService,
        protected globalSettingConstant: GlobalSettingConstant,
        protected moduleActions: ModuleActions,
        protected store: Store<AppState>,
        private fb: FormBuilder,
        protected xnErrorMessageHelper: XnErrorMessageHelper,
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
            consts,
            moduleActions,
            store,
        );
        super.handleHasLogin();
    }

    ngOnInit() {
        this.onInitForm();
    }

    ngOnDestroy(): void {
        super.onDestroy();
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
    }

    onInitForm() {
        this.forgotPassForm = this.fb.group({
            [this.dataFields.EMAIL.controlName]: [
                '',
                [Validators.required, Validators.pattern(ValidatorPattern.EMAIL)],
            ],
        });
    }

    onSubmit() {
        if (!this.forgotPassForm.valid) return;

        this.isLoading = true;
        this.errHandleMes.isError = false;
        this.errHandleMes.message = '';
        const model = this.forgotPassForm.value;
        try {
            this.authenticationService
                .forgotPassword(model[this.dataFields.EMAIL.controlName])
                .pipe(takeUntil(this.getUnsubscriberNotifier()))
                .subscribe(
                    (result) => {
                        this.isLoading = false;
                        const data = result && result.item ? result.item : null;
                        if (!data) {
                            this.router.navigate([this.consts.accountDenied]);
                            return;
                        }

                        if (data.result === 'invalid') {
                            this.errHandleMes.isError = true;
                            this.errHandleMes.message = data.message;
                            return;
                        }

                        this.router.navigate([this.consts.authenSuccessUrl]);
                        this.store.dispatch(this.moduleActions.sendTypeAuthenActionSuccess(AuthenType.FORGOT_PASSWORD));
                    }
                );
        } catch (error) {
            this.isLoading = false;
            this.router.navigate([this.consts.accountDenied]);
        }

    }

    public backToLogin() {
        this.router.navigate([this.consts.loginUrl]);
    }
}
