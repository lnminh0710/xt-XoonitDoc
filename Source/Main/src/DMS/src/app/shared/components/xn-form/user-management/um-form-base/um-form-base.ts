import { Injectable, ViewChild, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { FormBase } from '@app/shared/components/xn-form/form-base';
import { Observable, Subscription } from 'rxjs';
import { SubCommonState } from '@app/state-management/store/reducer/xn-common';
import { FormOutputModel } from '@app/models';
import { ControlFocusComponent } from '@app/shared/components/xn-form';

export abstract class UserManagementFormBase extends FormBase {
    public dispatcherSubscription: Subscription;

    public listComboBox: any;

    @ViewChild('focusControl') focusControl: ControlFocusComponent;

    constructor(protected injector: Injector, protected router: Router) {
        super(injector, router);
    }

    public isDirty(): boolean {
        this.formGroup.updateValueAndValidity();
        return this.formGroup.dirty;
    }

    public isValid(): boolean {
        this.formGroup.updateValueAndValidity();
        return this.formGroup.valid;
    }
}
