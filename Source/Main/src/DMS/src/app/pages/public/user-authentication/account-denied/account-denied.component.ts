import { Component } from '@angular/core';
import { Configuration, GlobalSettingConstant } from '@app/app.constants';
import { UserAuthenticationComponent } from '../user.authentication';
import { UserService, GlobalSettingService, AuthenticationService } from '@app/services';
import { Uti } from '@app/utilities';
import { Router } from '@angular/router';
import { ModuleActions } from '@app/state-management/store/actions';
import { Store } from '@ngrx/store';
import { AppState } from '@app/state-management/store';

@Component({
    selector: 'account-denied',
    templateUrl: './account-denied.component.html',
    styleUrls: ['./account-denied.component.scss'],
})
export class AccountDeniedComponent extends UserAuthenticationComponent {
    constructor(
        protected consts: Configuration,
        protected userService: UserService,
        protected authService: AuthenticationService,
        protected uti: Uti,
        protected router: Router,
        protected globalSettingSer: GlobalSettingService,
        protected globalSettingConstant: GlobalSettingConstant,
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
    }
}
