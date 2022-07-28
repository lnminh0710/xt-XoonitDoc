import { UserAuthentication } from '@app/models/user-auth';
import { Configuration, GlobalSettingConstant, LocalSettingKey } from '@app/app.constants';
import { UserService, GlobalSettingService, AuthenticationService } from '@app/services';
import { Uti, LocalStorageHelper, LocalStorageProvider } from '@app/utilities';
import { Router } from '@angular/router';
import { User, GlobalSettingModel, Message, LanguageSettingModel } from '@app/models';
import { BaseComponent } from '@app/pages/private/base';
import { ModuleActions } from '@app/state-management/store/actions';
import { Store } from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import { SaveStructureTreeSettingsGlobalAction } from '@app/state-management/store/actions/app-global/app-global.actions';

export abstract class UserAuthenticationComponent extends BaseComponent {
    public rootUrl = this.consts.loginUrl;
    public model: any = {};
    public userAuthenticationFail = false;
    public currentUserInfo: User;
    public currentUserGlobalSetting: GlobalSettingModel;

    constructor(
        protected consts: Configuration,
        protected userService: UserService,
        protected authService: AuthenticationService,
        protected uti: Uti,
        protected router: Router,
        protected globalSettingSer: GlobalSettingService,
        protected globalSettingConstant: GlobalSettingConstant,
        protected configuration: Configuration,
        protected moduleActions: ModuleActions,
        protected store: Store<AppState>,
    ) {
        super(router);
    }

    public loginSuccess(userAuthentication: any) {
        if (this.haveMessage(userAuthentication)) return;
        if (userAuthentication && userAuthentication.access_token && userAuthentication.expires_in) {
            this.uti.storeUserAuthentication(userAuthentication);

            this.userAuthenticationFail = false;
            const userInfo = this.authService.getUserFromAccessToken();
            // set currentUser to local storage
            this.userService.setCurrentUser(userInfo);

            LocalStorageHelper.toInstance(LocalStorageProvider).setItem(
                LocalSettingKey.LANGUAGE,
                new LanguageSettingModel({
                    idRepLanguage: userInfo.preferredLang,
                    translateModuleType: '5',
                }),
            );
            this.globalSettingSer.getAllGlobalSettings().subscribe((data: any) => {
                if (data && data.length) {
                    const found = data.find((x) => x.globalName === this.globalSettingConstant.structureTreeSettings);
                    if (!found) {
                        return;
                    }

                    const setting = JSON.parse(found.jsonSettings);
                    this.store.dispatch(new SaveStructureTreeSettingsGlobalAction(setting));
                }
            });
            return;
        } else {
            // remove user detail in localStorage
            localStorage.removeItem(this.consts.localStorageCurrentUser);
            this.userAuthenticationFail = true;
        }
    }

    private haveMessage(userAuthentication: UserAuthentication): boolean {
        if (!userAuthentication.message_type || isNaN(parseInt(userAuthentication.message_type))) return;
        localStorage.removeItem(this.consts.localStorageCurrentUser);
        localStorage.setItem(this.consts.localStorageCurrentUserExpire, JSON.stringify(userAuthentication));
        switch (parseInt(userAuthentication.message_type)) {
            // Account is near expired
            case 1: {
                localStorage.setItem(this.consts.localStorageCurrentUser, JSON.stringify(userAuthentication));
                localStorage.setItem(this.consts.localStorageAccessToken, userAuthentication.access_token);
                localStorage.setItem(this.consts.localStorageRefreshToken, userAuthentication.refresh_token);
                localStorage.setItem(this.consts.localStorageExpiresIn, userAuthentication.expires_in);
                this.userAuthenticationFail = false;
                this.currentUserInfo = this.uti.getUserInfo();
                this.userService.setCurrentUser(this.currentUserInfo);
                this.saveNearExpireMessage();
                setTimeout(() => {
                    this.router.navigate([this.consts.rootUrl]);
                }, 2000);
                break;
            }
            // Account is expired
            case 2: {
                if (this.model && this.model.loginName)
                    this.router.navigate([this.consts.accountExpireUrl + '/' + this.model.loginName]);
                break;
            }
            // Account is denied
            case 3: {
                this.router.navigate([this.consts.accountDenied]);
                break;
            }
        }
        return true;
    }

    private saveNearExpireMessage() {
        this.globalSettingSer.getAllGlobalSettings().subscribe(
            (data) => this.saveNearExpireMessageSuccess(data),
            (error) => this.saveNearExpireMessageError(error),
        );
    }

    private saveNearExpireMessageSuccess(globalSettingModels: GlobalSettingModel[]) {
        // let this.currentUserGlobalSetting = globalSettingModels.find(x => x.globalName == this.globalSettingConstant.settingUserNoticeMessage + this.currentUserInfo.loginName && !!(x.isActive))
        this.currentUserGlobalSetting = globalSettingModels.find(
            (x) => x.globalName == this.globalSettingConstant.settingUserNoticeMessage + this.currentUserInfo.loginName,
        );
        if (
            !this.currentUserGlobalSetting ||
            !this.currentUserGlobalSetting.idSettingsGlobal ||
            !this.currentUserGlobalSetting.globalName
        ) {
            this.currentUserGlobalSetting = new GlobalSettingModel({
                globalName: this.globalSettingConstant.settingUserNoticeMessage + this.currentUserInfo.loginName,
                description: 'List Notice Message each user',
                jsonSettings: JSON.stringify([
                    new Message({
                        type: '1',
                        content: this.currentUserInfo.loginMessage,
                        isRead: false,
                    }),
                ]),
                isActive: true,
            });
        } else {
            let currentUserNoticeMessage = JSON.parse(this.currentUserGlobalSetting.jsonSettings) as Message[];
            let loginNearExpireMessage = currentUserNoticeMessage.find(
                (x) => x.content == this.currentUserInfo.loginMessage,
            );
            if (!$.isEmptyObject(loginNearExpireMessage)) return;
            currentUserNoticeMessage.push(
                new Message({
                    type: '1',
                    content: this.currentUserInfo.loginMessage,
                    isRead: false,
                }),
            );
            this.currentUserGlobalSetting.idSettingsGUI = -1;
            this.currentUserGlobalSetting.jsonSettings = JSON.stringify(currentUserNoticeMessage);
        }

        this.globalSettingSer.saveGlobalSetting(this.currentUserGlobalSetting).subscribe(
            (data) => this.saveGlobalSettingSuccess(data),
            (error) => this.saveNearExpireMessageError(error),
        );
    }
    private saveGlobalSettingSuccess(data: any) {
        this.globalSettingSer.saveUpdateCache('-1', this.currentUserGlobalSetting, data);
    }
    private saveNearExpireMessageError(error: any) {
        console.log(error);
    }

    public handleHasLogin() {
        const currentUser = this.uti.getUserInfo();
        if (currentUser && currentUser.id) {
            this.store.dispatch(this.moduleActions.clearActiveModule());
            this.store.dispatch(this.moduleActions.loginSuccess());
        } else {
            this.userService.setCurrentUser(null);
            this.store.dispatch(this.moduleActions.clearActiveModule());
            this.authService.logout();
        }
    }

    public redirectToRootPage() {
        this.router.navigate([this.rootUrl]);
    }
}
