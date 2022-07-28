import { Injectable, Inject, forwardRef } from '@angular/core';
import { User } from '@app/models';
import { ReplaySubject } from 'rxjs';
import { AuthenticationService } from '@app/services';
import { Uti, LocalStorageHelper, LocalStorageProvider, SessionStorageProvider } from '@app/utilities';
import { Configuration, LocalSettingKey } from '@app/app.constants';

@Injectable()
export class UserService {
    private _currentUser: User;
    public currentUser: ReplaySubject<User> = new ReplaySubject<User>(1);

    constructor(
        @Inject(forwardRef(() => AuthenticationService)) private authenticationService: AuthenticationService,
        private uti: Uti,
        private configuration: Configuration,
    ) {}

    /**
     * setCurrentUser
     * @param user
     */
    public setCurrentUser(user: User) {
        this._currentUser = user;
        this.currentUser.next(user);
    }

    public getCurrentUser(): User {
        return this._currentUser;
    }

    /**
     * getLanguage
     */
    public getLanguage() {
        if (!this._currentUser) {
            // default english
            return '4';
        }
        let idRepLanguage = this._currentUser.preferredLang;
        const language = LocalStorageHelper.toInstance(SessionStorageProvider).getItem(LocalSettingKey.LANGUAGE);
        if (language && language.idRepLanguage) {
            idRepLanguage = language.idRepLanguage;
        }
        return idRepLanguage;
    }

    /**
     * Latest UserInfo
     */
    public setLatestUserInfo() {
        localStorage.setItem(this.configuration.localStorageLatestUserInfo, JSON.stringify(this._currentUser));
    }

    public getLatestUserInfo(): User {
        if (!this._currentUser) return null;

        const latestUserInfoString = localStorage.getItem(this.configuration.localStorageLatestUserInfo);
        if (!latestUserInfoString) return this._currentUser;

        const latestUserInfo = <User>JSON.parse(latestUserInfoString);

        this._currentUser.firstname = latestUserInfo.firstname ? latestUserInfo.firstname : this._currentUser.firstname;
        this._currentUser.lastname = latestUserInfo.lastname ? latestUserInfo.lastname : this._currentUser.lastname;
        this._currentUser.phoneNr = latestUserInfo.phoneNr ? latestUserInfo.phoneNr : this._currentUser.phoneNr;
        this._currentUser.dateOfBirth = latestUserInfo.dateOfBirth
            ? latestUserInfo.dateOfBirth
            : this._currentUser.dateOfBirth;

        return this._currentUser;
    }

    /**
     * loginByUserId
     */
    public loginByUserId(reload?: boolean, callBack?: Function) {
        if (!this._currentUser || !this._currentUser.id) return;

        this.authenticationService.loginByUserId(this._currentUser.id).subscribe(
            (data) => this.loginByUserIdSuccess(data.item, reload, callBack),
            (error) => this.loginByUserIdError(error),
        );
    }

    /**
     * userAuthentication
     * @param userAuthentication
     */
    private loginByUserIdSuccess(userAuthentication: any, reload: boolean, callBack?: Function) {
        if (userAuthentication && userAuthentication.access_token && userAuthentication.expires_in) {
            this.uti.storeUserAuthentication(userAuthentication);
            const userInfo = this.uti.getUserInfo();
            this.setCurrentUser(userInfo);
            if (reload) {
                location.reload();
            } else if (callBack) {
                callBack();
            }
        }
    }

    /**
     * loginByUserIdError
     * @param error
     */
    private loginByUserIdError(error: any) {}
}
