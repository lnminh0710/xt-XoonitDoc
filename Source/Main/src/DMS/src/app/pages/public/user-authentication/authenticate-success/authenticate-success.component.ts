import { Component, OnDestroy } from '@angular/core';
import { GlobalSettingService, UserService, AuthenticationService } from '@app/services';
import { Configuration, GlobalSettingConstant, AuthenType } from '@app/app.constants';
import { UserAuthenticationComponent } from '../user.authentication';
import { Uti } from '@app/utilities';
import { Router } from '@angular/router';
import { ReducerManagerDispatcher, Store } from '@ngrx/store';
import { CustomAction, ModuleActions } from '@app/state-management/store/actions';
import { filter, takeUntil } from 'rxjs/operators';
import { AppState } from '@app/state-management/store';

@Component({
    selector: 'authenticate-success',
    templateUrl: './authenticate-success.component.html',
    styleUrls: ['./authenticate-success.component.scss'],
})
export class AuthenticateSuccessComponent extends UserAuthenticationComponent implements OnDestroy {
    public authenType: AuthenType;
    public ACTION_AUTHEN_TYPE = AuthenType;
    public message1: string;
    public message2: string;

    constructor(
        protected consts: Configuration,
        protected userService: UserService,
        protected authService: AuthenticationService,
        protected uti: Uti,
        protected router: Router,
        protected globalSettingSer: GlobalSettingService,
        protected globalSettingConstant: GlobalSettingConstant,
        private dispatcher: ReducerManagerDispatcher,
        protected moduleActions: ModuleActions,
        protected store: Store<AppState>,
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
        super.handleHasLogin();
        this.subscribeAction();
    }

    ngOnDestroy(): void {
        super.onDestroy();
    }

    public subscribeAction() {
        this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return action.type === ModuleActions.SEND_TYPE_ACTION_AUTHEN_SUCCESS;
                }),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((action: CustomAction) => {
                if (!action && !action.payload) {
                    this.redirectToLogin();
                    return;
                }

                this.authenType = action.payload;
                switch (action.payload) {
                    case AuthenType.NEW_PASSWORD:
                        this.message1 = 'Your account password has been successfully changed.';
                        this.message2 = 'Please login to Xoonit with your new password.';
                        break;
                    case AuthenType.RESEND_NEW_PASSWORD:
                        this.message1 = 'Email is resent successfully.';
                        this.message2 = 'Please check your email and create new password.';
                        break;
                    case AuthenType.FORGOT_PASSWORD:
                        this.message1 = 'Email is sent successfully!';
                        this.message2 = 'Please check your email and change password.';
                        break;
                    case AuthenType.SIGN_UP:
                        this.message1 = 'Your account has been successfully created.';
                        this.message2 = 'Please check your email to set the password.';
                        break;
                    default:
                        break;
                }
            });
    }

    public redirectToLogin() {
        this.router.navigate([this.consts.loginUrl]);
    }
}
