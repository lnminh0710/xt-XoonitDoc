import { OnInit, Component, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import {
    Configuration,
    GlobalSettingConstant,
    PasswordDisplay,
    ErrorMessageTypeEnum,
    AuthenType,
} from '@app/app.constants';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { AuthenticationService, UserService, GlobalSettingService, CommonService } from '@app/services';
import { UserSignUp } from '@app/models';
import { UserAuthenticationComponent } from '../user.authentication';
import { Uti, XnErrorMessageHelper } from '@app/utilities';
import { Router } from '@angular/router';
import { ModuleActions } from '@app/state-management/store/actions';
import { AppState } from '@app/state-management/store';
import { Store } from '@ngrx/store';
import { takeUntil } from 'rxjs/operators';
import { ControlData, ValidatorPattern } from '@app/models/control-model/control-data';
import { ErrorHandleMessageModel } from '@app/models/error-handle/error-handle-message.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'signup',
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignupComponent extends UserAuthenticationComponent implements OnInit, OnDestroy, AfterViewInit {
    public ERR_MES_TYPE_ENUM = ErrorMessageTypeEnum;

    public signUpForm: FormGroup;
    public dataFields = {
        FIRST_NAME: <ControlData>{ controlName: 'firstName', displayName: 'First Name', order: 1 },
        LAST_NAME: <ControlData>{ controlName: 'lastName', displayName: 'Last Name', order: 2 },
        EMAIL: <ControlData>{ controlName: 'email', displayName: 'Email', order: 3 },
        LANGUAGE: <ControlData>{ controlName: 'idRepLanguage', displayName: 'Choose Language', order: 4 },
        PREFIX_PHONE_NUMBER: <ControlData>{ controlName: 'prefixPhoneNumber', displayName: '', order: 5 },
        PHONE_NUMBER: <ControlData>{ controlName: 'phoneNr', displayName: 'Phone Number', order: 6 },
        MONTH_OF_BIRTH: <ControlData>{ controlName: 'monthOfBirth', displayName: 'Month', order: 7 },
        DAY_OF_BIRTH: <ControlData>{ controlName: 'dayOfBirth', displayName: 'Day', order: 8 },
        YEAR_OF_BIRTH: <ControlData>{ controlName: 'yearhOfBirth', displayName: 'Year', order: 9 },
        CONFIRM_CONDITION: <ControlData>{
            controlName: 'confirmTermCondition',
            displayName: 'I have read and agree to the terms of use',
            order: 10,
        },
    };

    public controlDataList: ControlData[] = [
        this.dataFields.FIRST_NAME,
        this.dataFields.LAST_NAME,
        this.dataFields.EMAIL,
        this.dataFields.LANGUAGE,
        this.dataFields.PREFIX_PHONE_NUMBER,
        this.dataFields.PHONE_NUMBER,
        this.dataFields.MONTH_OF_BIRTH,
        this.dataFields.DAY_OF_BIRTH,
        this.dataFields.YEAR_OF_BIRTH,
        this.dataFields.CONFIRM_CONDITION,
    ];

    private dayListDefault = this.setDayList();
    public dayList = [...this.dayListDefault];
    public monthList = this.setMonthList();
    public yearList = this.setYearList();
    public languagesList = [];
    public hasPrefixPhoneNumber = false;
    public isLoading = false;
    public isEmptyPhonePrefix = false;
    public errHandleMes = new ErrorHandleMessageModel();
    public placeholder: { [key: string]: string } = { recipients: '', subject: '' };

    constructor(
        private fb: FormBuilder,
        private authenticationService: AuthenticationService,
        protected configuration: Configuration,
        protected userService: UserService,
        protected authService: AuthenticationService,
        private commonService: CommonService,
        protected uti: Uti,
        protected router: Router,
        protected globalSettingSer: GlobalSettingService,
        protected globalSettingConstant: GlobalSettingConstant,
        protected moduleActions: ModuleActions,
        protected store: Store<AppState>,
        private cdr: ChangeDetectorRef,
        protected xnErrorMessageHelper: XnErrorMessageHelper,
        private translateService: TranslateService,
    ) {
        super(
            configuration,
            userService,
            authService,
            uti,
            router,
            globalSettingSer,
            globalSettingConstant,
            configuration,
            moduleActions,
            store,
        );
        this.handleHasLogin();
    }

    ngOnInit(): void {
        this.getLanguageList();
        this.initForm();
        this.setPlaceholder();
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

    ngOnDestroy(): void {
        super.onDestroy();
    }

    private setPlaceholder() {
        this.placeholder = {
            firstName: this.translateService.instant('SIGNUP__First_Name'),
            lastName: this.translateService.instant('SIGNUP__Last_Name'),
            email: this.translateService.instant('SIGNUP__Email'),
            phoneNumber: this.translateService.instant('SIGNUP__Phone_Number'),
        }
    }

    initForm() {
        this.signUpForm = this.fb.group({
            [this.dataFields.FIRST_NAME.controlName]: ['', [Validators.required]],
            [this.dataFields.LAST_NAME.controlName]: ['', [Validators.required]],
            [this.dataFields.EMAIL.controlName]: [
                '',
                [Validators.required, Validators.pattern(ValidatorPattern.EMAIL)],
            ],
            [this.dataFields.LANGUAGE.controlName]: ['', [Validators.required]],
            [this.dataFields.PREFIX_PHONE_NUMBER.controlName]: ['', []],
            [this.dataFields.PHONE_NUMBER.controlName]: ['', []],
            [this.dataFields.MONTH_OF_BIRTH.controlName]: ['', []],
            [this.dataFields.DAY_OF_BIRTH.controlName]: ['', []],
            [this.dataFields.YEAR_OF_BIRTH.controlName]: ['', []],
            [this.dataFields.CONFIRM_CONDITION.controlName]: ['', [Validators.required]],
        });

        this.subscibeBirthDateChange();
        this.setPrefixPhoneNumber();
    }

    subscibeBirthDateChange() {
        this.signUpForm.controls[this.dataFields.MONTH_OF_BIRTH.controlName].valueChanges.subscribe((value) => {
            if (!value) return;

            this.dayList = [...this.dayListDefault];
            if ([4, 6, 9, 11].includes(value)) {
                this.dayList.pop();
            } else if (value === 2) {
                const quantityItemRemoveFromLast =
                    this.signUpForm.controls[this.dataFields.YEAR_OF_BIRTH.controlName].value &&
                        this.signUpForm.controls[this.dataFields.YEAR_OF_BIRTH.controlName].value % 4 === 0
                        ? 2
                        : 3;
                this.dayList.length = this.dayList.length - quantityItemRemoveFromLast;
            }
        });
        this.signUpForm.controls[this.dataFields.YEAR_OF_BIRTH.controlName].valueChanges.subscribe((value) => {
            if (!value || this.signUpForm.controls[this.dataFields.MONTH_OF_BIRTH.controlName].value !== 2) return;

            this.dayList = [...this.dayListDefault];
            const quantityItemRemoveFromLast = value % 4 === 0 ? 2 : 3;
            this.dayList.length = this.dayList.length - quantityItemRemoveFromLast;
        });
    }

    setPrefixPhoneNumber() {
        this.signUpForm.controls[this.dataFields.PREFIX_PHONE_NUMBER.controlName].valueChanges
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((val) => {
                if (!val) return;

                this.hasPrefixPhoneNumber = true;
                this.cdr.detectChanges();
            });
    }

    onSubmit() {
        this.isLoading = true;
        this.cdr.detectChanges();
        this.errHandleMes = new ErrorHandleMessageModel();
        if (!this.signUpForm.valid) return;

        const formData = this.signUpForm.value;
        const phoneNumber =
            formData[this.dataFields.PREFIX_PHONE_NUMBER.controlName] +
            formData[this.dataFields.PHONE_NUMBER.controlName];
        const dateofBirth =
            formData[this.dataFields.DAY_OF_BIRTH.controlName] &&
                formData[this.dataFields.MONTH_OF_BIRTH.controlName] &&
                formData[this.dataFields.YEAR_OF_BIRTH.controlName]
                ? `${formData[this.dataFields.MONTH_OF_BIRTH.controlName]}/${formData[this.dataFields.DAY_OF_BIRTH.controlName]
                }/${formData[this.dataFields.YEAR_OF_BIRTH.controlName]}`
                : null;

        const userSignUp = {
            firstName: formData[this.dataFields.FIRST_NAME.controlName],
            lastName: formData[this.dataFields.LAST_NAME.controlName],
            email: formData[this.dataFields.EMAIL.controlName],
            dateOfBirth: dateofBirth,
            phoneNr: phoneNumber,
            idRepLanguage: formData[this.dataFields.LANGUAGE.controlName],
        } as UserSignUp;

        try {
            this.authenticationService
                .signup(userSignUp)
                .pipe(takeUntil(this.getUnsubscriberNotifier()))
                .subscribe(
                    (data) => {
                        this.isLoading = false;
                        this.cdr.detectChanges();
                        if (!data) {
                            this.errHandleMes.isError = true;
                            this.errHandleMes.message = 'Have system error! Please try again!';
                            this.cdr.detectChanges();
                            return;
                        }

                        if (data && data.item && data.item.statusCode && data.item.statusCode !== 1) {
                            this.errHandleMes.isError = true;
                            this.errHandleMes.message = data.item.resultDescription;
                            this.cdr.detectChanges();
                            return;
                        }

                        this.router.navigate([this.consts.authenSuccessUrl]);
                        this.store.dispatch(this.moduleActions.sendTypeAuthenActionSuccess(AuthenType.SIGN_UP));
                    },
                );
        } catch (error) {
            this.isLoading = false;
            this.errHandleMes.isError = true;
            this.errHandleMes.message = 'Have system error! Please try again!';
            this.cdr.detectChanges();
        }

    }

    public numberOnly(event): boolean {
        return Uti.pressKeyNumberOnly(event);
    }

    public getLanguageList() {
        try {
            this.commonService
                .getMainLanguages()
                .pipe(takeUntil(this.getUnsubscriberNotifier()))
                .subscribe(
                    (response) => {
                        if (response.statusCode !== 1) return null;

                        if (
                            !response.item &&
                            !response.item.data &&
                            !response.item.data.length &&
                            !response.item.data[1] &&
                            !response.item.data[1].length
                        )
                            return null;

                        this.languagesList = response.item.data[1];
                    },
                );
        } catch (error) {
            console.log(error);
        }
    }

    public touchedListPrefixPhone() {
        this.isEmptyPhonePrefix = !this.signUpForm.controls.prefixPhoneNumber.value;
        this.cdr.detectChanges();
    }

    public backToLogin() {
        this.router.navigate([this.consts.loginUrl]);
    }

    private setYearList() {
        const currentYear = new Date().getFullYear();
        const minYearBirth = new Date().getFullYear() - 150;
        let years = [];
        for (let index = minYearBirth; index <= currentYear; index++) {
            years.push(index);
        }
        return years;
    }

    private setMonthList() {
        return [
            { key: 1, value: 'January' },
            { key: 2, value: 'February' },
            { key: 3, value: 'March' },
            { key: 4, value: 'April' },
            { key: 5, value: 'May' },
            { key: 6, value: 'June' },
            { key: 7, value: 'July' },
            { key: 8, value: 'August' },
            { key: 9, value: 'September' },
            { key: 10, value: 'Octorber' },
            { key: 11, value: 'November' },
            { key: 12, value: 'December' },
        ];
    }

    private setDayList() {
        let days = [];
        for (let index = 1; index <= 31; index++) {
            days.push(index);
        }
        return days;
    }
}
