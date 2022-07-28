import {
    Component, Input, Output, EventEmitter,
    OnInit, OnDestroy, Injector
} from '@angular/core';
import { Validators } from '@angular/forms';
import { UpdatePasswordResultMessageEnum
} from '@app/app.constants';
import { Uti } from '@app/utilities';
import { UserManagementFormBase } from '@app/shared/components/xn-form/user-management/um-form-base/um-form-base';
import { ToasterService } from 'angular2-toaster/angular2-toaster';
import { Router } from '@angular/router';
import {
    AuthenticationService,
    ValidationService
} from '@app/services';

@Component({
    selector: 'um-change-password-form',
    styleUrls: ['./change-password-form.component.scss'],
    templateUrl: './change-password-form.component.html'
})
export class ChangePasswordFormComponent extends UserManagementFormBase implements OnInit, OnDestroy {
    public passwordIsMatched = true;
    public oldPasswordIsWrong = false;

    @Output() outputData: EventEmitter<any> = new EventEmitter();
    constructor(
        private toasterService: ToasterService,
        private authenticationService: AuthenticationService,
        protected router: Router,
        private uti: Uti,
        protected injector: Injector
    ) {
        super(injector, router);
    }

    public ngOnInit() {
        this.createForm();
        this.isRenderForm = true;
    }

    public ngOnDestroy() {
        Uti.unsubscribe(this);
    }

    public isValid(): boolean {
        return this.formGroup.valid && this.passwordIsMatched;
    }

    public submit() {
        this.formGroup['submitted'] = true;
        try {
            if (!this.isValid()) {
                this.setFormOutputData(false);
                return;
            }

            this.updatePasswrod();

        } catch (ex) {
            this.setFormOutputData(true);
        }
    }

    public prepareSubmitData() {
        this.formGroup.updateValueAndValidity();
        const model = this.formGroup.value;
        return {
        };
    }


    public passwordKeyPess() {
        // let path = this.consts.passwordPath;
        this.formGroup.updateValueAndValidity();
        let formValue = this.formGroup.value;
        if (!formValue.password || !formValue.rePassword) {
            this.passwordIsMatched = true;
        }
        else {
            this.passwordIsMatched = (formValue.password == formValue.rePassword);
        }
    }

    /**
     * PRIVATE METHODS
     */

    private createForm() {
        this.initForm({
            currentPassword: ['', Validators.required],
            password: ['', Validators.required, ValidationService.passwordValidator],
            rePassword: ['', Validators.required, ValidationService.passwordValidator],
        }, true);
    }

    private updatePasswrod() {
        this.formGroup.updateValueAndValidity();
        this.authenticationService.changePassword(this.formGroup.value.currentPassword, this.formGroup.value.password)
            .subscribe(
            data => this.changePasswordSuccess(data.item),
            error => this.serviceError(error));
    }

    private changePasswordSuccess(response: any) {
        this.appErrorHandler.executeAction(() => {
            switch(response.result) {
                case UpdatePasswordResultMessageEnum.INVALID : {
                    this.oldPasswordIsWrong = true;
                    break;
                }
                case UpdatePasswordResultMessageEnum.FAILED : {
                    this.toasterService.pop('error', 'Message', 'Password is not updated');
                    break;
                }
                case UpdatePasswordResultMessageEnum.SUCCESS : {
                    this.toasterService.pop('success', 'Success', 'Password is updated');
                    this.resetForm();
                    break;
                }
                default: break;
            }            
        });
    }

    private serviceError(data) {
        this.setFormOutputData(true);
    }

    private resetForm() {
        this.passwordIsMatched = true;
        this.oldPasswordIsWrong = false;
        Uti.resetValueForForm(this.formGroup);
    }
}
