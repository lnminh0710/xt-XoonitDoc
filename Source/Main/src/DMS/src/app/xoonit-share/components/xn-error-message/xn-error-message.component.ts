import { Component, OnDestroy, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ErrorMessageTypeEnum } from '@app/app.constants';
import { BaseComponent } from '@app/pages/private/base';

@Component({
    selector: 'xn-error-message',
    templateUrl: './xn-error-message.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class XnErrorMessageComponent extends BaseComponent implements OnDestroy {
    public ERROR_MES_TYPE_ENUM = ErrorMessageTypeEnum;
    public displayMessageError = '';

    @Input() fieldName: string = '';
    @Input() typeErr: ErrorMessageTypeEnum;
    @Input() errMes: string = '';

    private _condition = false;
    @Input() set condition(data: boolean) {
        this._condition = data;

        if (!this._condition) {
            this.displayMessageError = '';
            this.cdr.detectChanges();
            return;
        }

        switch (this.typeErr) {
            case ErrorMessageTypeEnum.ERROR_LOGIN:
                this.displayMessageError = `Wrong email or password. Try again or click Forgot password to reset it.`;
                break;
            case ErrorMessageTypeEnum.PATTERN_EMAIL:
                this.displayMessageError = `Format email address is wrong.`;
                break;
            case ErrorMessageTypeEnum.PATTERN_FOLDER:
                this.displayMessageError = `Folder name contain invalid character.`;
                break;
            case ErrorMessageTypeEnum.PATTERN_PASSWORD:
                this.displayMessageError = `Passwords is 9 letters and more characters with a mix of letters, number & symbols`;
                break;
            case ErrorMessageTypeEnum.PASSWORD_NOT_MATCH:
                this.displayMessageError = `Passwords is not match`;
                break;
            case ErrorMessageTypeEnum.CUSTOM_MESSAGE:
                this.displayMessageError = this.errMes;
                break;
            default:
                this.displayMessageError = '';
                break;
        }
        this.cdr.detectChanges();
    }
    get condition(): boolean {
        return this._condition;
    }

    constructor(protected router: Router, private cdr: ChangeDetectorRef) {
        super(router);
    }

    ngOnDestroy(): void {
        super.onDestroy();
    }
}
