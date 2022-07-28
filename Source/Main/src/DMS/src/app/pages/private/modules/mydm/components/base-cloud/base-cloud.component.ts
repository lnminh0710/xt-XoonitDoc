import { Directive } from '@angular/core';

import { Configuration, GlobalSettingConstant, LocalSettingKey } from '@app/app.constants';
import { UserService, GlobalSettingService, AuthenticationService } from '@app/services';
import { Uti, LocalStorageHelper, SessionStorageProvider, LocalStorageProvider } from '@app/utilities';
import { Router } from '@angular/router';
import { LanguageSettingModel } from '@app/models';
import { GlobalSearchActions } from '@app/state-management/store/actions';
import { Store } from '@ngrx/store';
import { AppState } from '@app/state-management/store';
@Directive()
export abstract class BaseCloudComponent {
    constructor(
        protected consts: Configuration,
        protected userService: UserService,
        protected authService: AuthenticationService,
        protected uti: Uti,
        protected router: Router,

        protected globalSearchActions: GlobalSearchActions,
        protected store: Store<AppState>,
    ) {}

    public storeTokenWhenChangeCloud(userAuthentication: any) {
        if (userAuthentication && userAuthentication.access_token && userAuthentication.expires_in) {
            this.uti.storeUserAuthentication(userAuthentication);

            // const userInfo = this.uti.getUserInfo();
            const userInfo = this.authService.getUserFromAccessToken();
            this.userService.setCurrentUser(userInfo);
            LocalStorageHelper.toInstance(LocalStorageProvider).setItem(
                LocalSettingKey.LANGUAGE,
                new LanguageSettingModel({
                    idRepLanguage: userInfo.preferredLang,
                    translateModuleType: '5',
                }),
            );
            return;
        } else {
            // remove user detail in localStorage
            localStorage.removeItem(this.consts.localStorageCurrentUser);
        }
    }
    public closeAllTabsGlobalSearch() {
        this.store.dispatch(this.globalSearchActions.closeAllTabs());
    }
}
