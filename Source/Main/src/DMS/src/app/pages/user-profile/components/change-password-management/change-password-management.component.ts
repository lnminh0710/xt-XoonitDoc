import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Configuration, ErrorMessageTypeEnum, PasswordDisplay } from '@app/app.constants';
import { ControlData, ValidatorPattern } from '@app/models/control-model/control-data';
import { ErrorHandleMessageModel } from '@app/models/error-handle/error-handle-message.model';
import { BaseComponent } from '@app/pages/private/base';
import { AuthenticationService, UserService } from '@app/services';
import { AppState } from '@app/state-management/store';
import { ModuleActions } from '@app/state-management/store/actions';
import { Uti, XnErrorMessageHelper } from '@app/utilities';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { ToasterService } from 'angular2-toaster';
import { BehaviorSubject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

@Component({
    selector: 'change-password-management.',
    templateUrl: './change-password-management.component.html',
    styleUrls: ['./change-password-management.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangePasswordManagementComponent extends BaseComponent implements OnInit, AfterViewInit, OnDestroy {
    private placeholderChange$: BehaviorSubject<void> = new BehaviorSubject<void>(null);
    public isShowDialogNotice = false;
    public dialogNoticeClass = 'amd-dialog-notice';
    public dialogNoticeHeight = '160';
    public dialogNoticeWidth = '335';

    public ERR_MES_TYPE_ENUM = ErrorMessageTypeEnum;
    public changePassFormGroup: FormGroup;
    public PASSWORD_DISPLAY_CONSTANT = PasswordDisplay;

    public dataFields = {
        CURRENT_PASS: <ControlData>{ controlName: 'password', displayName: 'Current Password', placeholder$: this.placeholderChange$.pipe(map(() => this.translateService.instant('Current Password'))), order: 1 },
        NEW_PASS: <ControlData>{ controlName: 'newPass', displayName: 'New Password', placeholder$: this.placeholderChange$.pipe(map(() => this.translateService.instant('New Password'))), order: 2 },
        CONFIRM_PASS: <ControlData>{ controlName: 'confirmPass', displayName: 'Repeat New Password', placeholder$: this.placeholderChange$.pipe(map(() => this.translateService.instant('Repeat New Password'))), order: 3 },
    };
    public controlDataList: ControlData[] = [
        this.dataFields.CURRENT_PASS,
        this.dataFields.NEW_PASS,
        this.dataFields.CONFIRM_PASS,
    ];

    public isMatchingPass: boolean = false;
    public currentPasswordType = PasswordDisplay.PASSWORD;
    public newPasswordType = PasswordDisplay.PASSWORD;
    public confirmPasswordType = PasswordDisplay.PASSWORD;
    public isLoading = false;
    public errHandleMes = new ErrorHandleMessageModel();

    constructor(
        private authenticationService: AuthenticationService,
        protected userService: UserService,
        protected router: Router,
        protected consts: Configuration,
        protected uti: Uti,
        private fb: FormBuilder,
        protected xnErrorMessageHelper: XnErrorMessageHelper,
        private cdRef: ChangeDetectorRef,
        private toastrService: ToasterService,
        private moduleActions: ModuleActions,
        private store: Store<AppState>,
        private translateService: TranslateService
    ) {
        super(router);
    }
    ngOnDestroy(): void {
        super.onDestroy();
    }
    ngOnInit(): void {
        this.initForm();
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

    private initForm() {
        this.changePassFormGroup = this.fb.group({
            [this.dataFields.CURRENT_PASS.controlName]: [
                '',
                [Validators.required, Validators.pattern(ValidatorPattern.PASSWORD)],
            ],
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
        this.errHandleMes = new ErrorHandleMessageModel();
        const currentPass = this.changePassFormGroup.value[this.dataFields.CURRENT_PASS.controlName];
        const newPass = this.changePassFormGroup.value[this.dataFields.NEW_PASS.controlName];
        this.authenticationService
            .changePassword(currentPass, newPass)
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe(
                (response) => {
                    this.isLoading = false;
                    this.cdRef.detectChanges();

                    if (!response) {
                        this.errHandleMes.isError = true;
                        this.errHandleMes.message = 'System error, change password fail!';
                        this.cdRef.detectChanges();
                        return;
                    }

                    if (response.result === 'error-wrong-pass') {
                        this.errHandleMes.isError = true;
                        this.errHandleMes.message = response.message;
                        this.cdRef.detectChanges();
                        return;
                    }

                    this.uti.storeUserAuthentication(response);
                    this.isShowDialogNotice = true;
                    this.cdRef.detectChanges();
                },
                (error) => {
                    this.isLoading = false;
                    this.errHandleMes.isError = true;
                    this.errHandleMes.message = 'System error, change password fail!';
                    this.cdRef.detectChanges();
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

    public redirectToHome() {
        this.store.dispatch(this.moduleActions.clearActiveModule());
        this.router.navigate([this.consts.rootUrl]);
    }

    public changeSuccess() {
        this.router.navigate([Configuration.rootPrivateUrl]);
    }
}
