import { FormGroup } from '@angular/forms';
import { Injectable } from '@angular/core';
import { PasswordDisplay } from '@app/app.constants';

@Injectable()
export class XnErrorMessageHelper {
    public isRequired(formgroup: FormGroup, controlName: string): boolean {
        if (!controlName) return true;

        return (
            (formgroup.controls[controlName].dirty || formgroup.controls[controlName].touched) &&
            formgroup.controls[controlName].errors &&
            formgroup.controls[controlName].errors.required
        );
    }

    public isInvalidPattern(formgroup: FormGroup, controlName: string): boolean {
        if (!controlName) return true;

        return formgroup.controls[controlName].touched && formgroup.get(controlName).hasError('pattern');
    }

    public isMatchPass(formgroup: FormGroup, controlName: string, isMatch: boolean): boolean {
        if (!controlName) return true;

        return formgroup.controls[controlName].touched && !isMatch;
    }

    public changePasswordType(currentType: string): string {
        return currentType === PasswordDisplay.PASSWORD ? PasswordDisplay.TEXT : PasswordDisplay.PASSWORD;
    }
}
