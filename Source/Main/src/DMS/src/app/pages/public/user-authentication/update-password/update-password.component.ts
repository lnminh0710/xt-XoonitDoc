import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AuthenticationService } from '@app/services';
import { Configuration } from '@app/app.constants';

@Component({
    selector: 'update-password',
    templateUrl: './update-password.component.html',
    styleUrls: ['./update-password.component.scss']
})
export class UpdatePasswordComponent implements OnInit {

    model: any = {};
    loading = false;
    returnUrl: string;
    token: string;
    passwordIsCorrect = true;
    passwordIsMatched = true;
    updatePassswordSuccess = false;
    updatePassswordFailed = false;
    checking = false;
    showCheckingIndicator = false;
    isTokenValid = null;
    loginUrl: string;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private authenticationService: AuthenticationService,
        private consts: Configuration) { }

    ngOnInit() {
        this.loginUrl = this.consts.loginUrl;

        // get token
        this.token = this.consts.tokenType + " " + this.route.snapshot.queryParams[this.consts.urlPramToken];

        this.checking = true;
        this.showCheckingIndicator = true;
        this.authenticationService.checkToken(this.route.snapshot.queryParams[this.consts.urlPramToken]).subscribe(
            (result) => {
                if (result) {
                    setTimeout(() => {
                        this.showCheckingIndicator = false;
                        this.isTokenValid = result.isValid;
                        setTimeout(() => {
                            this.checking = false;
                            localStorage.clear();
                        }, 1000);
                    }, 2000);
                }
            }, (error) => {
                this.checking = false;
                this.showCheckingIndicator = false;
                this.isTokenValid = false;
            });
    }

    submit() {
        if (!this.passwordIsCorrect || !this.passwordIsMatched) {
            return;
        }
        this.loading = true;
        this.authenticationService.resetPassword(this.model.newPassword, this.token)
            .subscribe(
                data => this.resetPasswordSuccess(data.item),
                error => this.resetPasswordError(error));
    }

    resetPasswordSuccess(data: any) {
        switch (data.result) {
            case this.consts.updateSuccess: {
                this.updatePassswordSuccess = true;
                break;
            }
            case this.consts.updateFailed: {
                this.updatePassswordFailed = true;
                this.loading = false;
                break;
            }
        }
    }

    resetPasswordError(error: any) {
        // remove user detail in localStorage
        this.updatePassswordFailed = true;
        this.loading = false;
    }

    passwordKeyPess() {
        let path = this.consts.passwordPath;
        if (!this.model.newPassword && !this.model.reNewPassword) {
            this.passwordIsCorrect = true;
        }
        else {
            this.passwordIsCorrect = path.test(this.model.newPassword) && path.test(this.model.reNewPassword);
        }
        this.passwordIsMatched = (this.model.newPassword == this.model.reNewPassword);
    }
}
