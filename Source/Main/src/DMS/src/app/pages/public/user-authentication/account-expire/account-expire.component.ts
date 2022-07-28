import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService, UserService, GlobalSettingService } from '@app/services';
import { Configuration, GlobalSettingConstant } from '@app/app.constants';
import { Uti } from '@app/utilities/uti';
import { UserAuthenticationComponent } from '../user.authentication';
import { UserToken } from '@app/models';
import { ReducerManagerDispatcher, Store } from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import { ModuleActions, CustomAction } from '@app/state-management/store/actions';
import { takeUntil, filter } from 'rxjs/operators';

@Component({
    selector: 'account-expire',
    templateUrl: './account-expire.component.html',
    styleUrls: ['./account-expire.component.scss'],
})
export class AccountExpireComponent extends UserAuthenticationComponent implements OnInit, OnDestroy {
    public userToken: UserToken;
    public isLoading = false;

    constructor(
        protected consts: Configuration,
        protected userService: UserService,
        protected authService: AuthenticationService,
        protected uti: Uti,
        protected router: Router,
        protected globalSettingSer: GlobalSettingService,
        protected globalSettingConstant: GlobalSettingConstant,
        private dispatcher: ReducerManagerDispatcher,
        private authenticationService: AuthenticationService,
        protected store: Store<AppState>,
        protected moduleActions: ModuleActions,
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
        this.subscribeAction();
    }
    ngOnDestroy(): void {
        super.onDestroy();
    }
    ngOnInit(): void {
        if (!this.userToken || !this.userToken.token) {
            this.redirectToRootPage();
        }
    }

    private subscribeAction() {
        this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return action.type === ModuleActions.SEND_TOKEN_UPDATE_PASSWORD;
                }),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((action: CustomAction) => {
                if (!action && !action.payload) {
                    this.redirectToRootPage();
                    return;
                }
                this.userToken = action.payload as UserToken;
            });
    }

    public resendEmail() {
        if (!this.userToken && !this.userToken.token) return;

        this.isLoading = true;
        this.authenticationService
            .resendEmailNewPass(this.userToken.token)
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe(
                (response) => {
                    this.isLoading = false;

                    const data = response ? response.item : null;
                    if (!data) {
                        this.router.navigate([this.consts.accountDenied]);
                        return;
                    }

                    this.router.navigate([this.consts.authenSuccessUrl]);
                    this.store.dispatch(this.moduleActions.sendTypeAuthenActionSuccess(this.userToken.type));
                },
                (error) => {
                    this.router.navigate([this.consts.accountDenied]);
                },
            );
    }
}
