import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    TemplateRef,
    ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ErrorMessageTypeEnum, MessageModal, PasswordDisplay } from '@app/app.constants';
import { ControlData, ValidatorPattern } from '@app/models/control-model/control-data';
import { BaseComponent } from '@app/pages/private/base';
import { UserProfileService } from '@app/services';
import { XnErrorMessageHelper } from '@app/utilities';
import { PopupRef } from '@app/xoonit-share/components/global-popup/popup-ref';
import { PopupService } from '@app/xoonit-share/components/global-popup/services/popup.service';
import { ToasterService } from 'angular2-toaster';

@Component({
    selector: 'popup-reset-password',
    templateUrl: './widget-reset-password-v2.component.html',
    styleUrls: ['./widget-reset-password-v2.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidgetResetPassV2Component extends BaseComponent implements OnInit, OnDestroy {
    public user: any = null;
    public isAuto: boolean = true;

    public ERR_MES_TYPE_ENUM = ErrorMessageTypeEnum;
    public PASSWORD_DISPLAY_CONSTANT = PasswordDisplay;
    public resetPassFormGroup: FormGroup;

    public dataFields = {
        NEW_PASS: <ControlData>{ controlName: 'newPass', displayName: 'New Password' },
    };
    public newPasswordType = PasswordDisplay.PASSWORD;
    public newPassResult = '';

    @ViewChild('ResetSuccessWithoutPassContent') ResetSuccessWithoutPassContent: TemplateRef<any>;
    @ViewChild('ResetSuccessWithPassContent') ResetSuccessWithPassContent: TemplateRef<any>;
    @ViewChild('LoadingTemplate') LoadingTemplate: TemplateRef<any>;

    constructor(
        protected router: Router,
        private cdRef: ChangeDetectorRef,
        public popupRef: PopupRef,
        public popupService: PopupService,
        private fb: FormBuilder,
        protected xnErrorMessageHelper: XnErrorMessageHelper,
        private userProfileService: UserProfileService,
        private toastrService: ToasterService,
    ) {
        super(router);
    }

    ngOnInit(): void {
        this.user = this.popupRef.params.data?.user || null;
        this.initForm();
    }
    ngOnDestroy(): void {
        super.onDestroy();
    }

    private initForm() {
        this.resetPassFormGroup = this.fb.group({
            [this.dataFields.NEW_PASS.controlName]: [
                { value: '', disabled: this.isAuto },
                [Validators.required, Validators.pattern(ValidatorPattern.PASSWORD)],
            ],
        });
    }

    public setAuto(value: boolean) {
        this.isAuto = value;
        if (value) this.resetPassFormGroup.controls[this.dataFields.NEW_PASS.controlName].disable();
        else this.resetPassFormGroup.controls[this.dataFields.NEW_PASS.controlName].enable();
        this.cdRef.detectChanges();
    }
    public showHidePassword(type: string) {
        this[type] = this[type] === PasswordDisplay.PASSWORD ? PasswordDisplay.TEXT : PasswordDisplay.PASSWORD;
    }
    public closeDialog(isSuccess: boolean = false) {
        this.popupRef.close({ isSuccess });
    }

    public submit() {
        if (!this.isAuto && !this.resetPassFormGroup?.valid) return;

        const popupRefLoading = this.popupService.open({
            content: this.LoadingTemplate,
            hasBackdrop: true,
            header: null,
            disableCloseOutside: true,
            customBackground: 'transparent',
        });
        this.newPassResult = '';
        const data = {
            idLogin: this.user.IdLogin,
            idPerson: this.user.IdPerson,
            isAutoGenerate: this.isAuto,
            newPassword: this.isAuto
                ? ''
                : this.resetPassFormGroup.controls[this.dataFields.NEW_PASS.controlName].value,
        };

        this.userProfileService
            .resetPassUser(data)
            .takeUntil(super.getUnsubscriberNotifier())
            .subscribe(
                (res: any) => {
                    popupRefLoading.close();
                    const data = res?.item;
                    if (!data) {
                        this.toastrService.pop(
                            MessageModal.MessageType.error,
                            'System',
                            `Reset Password fail, has some error, please try again!`,
                        );
                        return;
                    }
                    if (data !== '200') this.newPassResult = data;

                    this.popupService.open({
                        content:
                            data === '200' ? this.ResetSuccessWithoutPassContent : this.ResetSuccessWithPassContent,
                        hasBackdrop: true,
                        header: null,
                        disableCloseOutside: true,
                        minWidth: 200,
                        minHeight: data === '200' ? 110 : 160,
                        defaultHeight: data === '200' ? '110px' : '160px',
                    });
                },
                (error) => {
                    popupRefLoading.close();
                    console.error(error);
                },
            );
    }
}
