import { Injectable, Injector } from '@angular/core';
import { Observable, of } from 'rxjs';
import 'rxjs/add/operator/map';
import { UserAuthentication, User, UserSignUp } from '@app/models';
import { BaseService } from '../base.service';
import { Configuration } from '../../app.constants';
import { Uti } from '../../utilities';
import { HttpHeaders } from '@angular/common/http';
import { map, tap, take } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable()
export class AuthenticationService extends BaseService {
    protected consts: Configuration;
    static _consts: Configuration = new Configuration();
    private _scheduleRefreshTokenTimer: any;

    constructor(injector: Injector, private jwtHelperService: JwtHelperService) {
        super(injector);
        this.consts = Uti._consts;
    }

    // cache data
    public lastGetAll: Array<any>;
    public lastGet: any;

    public checkAvatarUrlValid(url: string): Observable<any> {
        const options = {};
        options['responseType'] = 'blob';

        return this.getV2(url, options);
    }

    public login(user: User): Observable<any> {
        return this.post<UserAuthentication>(
            this.serUrl.serviceAuthenticateUrl,
            JSON.stringify({ Email: user.email, Password: user.password }),
        );
    }

    public loginByUserId(idLogin: string): Observable<any> {
        return this.get<UserAuthentication>(this.serUrl.loginByUserIdUrl, { idLogin: idLogin });
    }

    public forgotPassword(email: string): Observable<any> {
        return this.post<any>(
            this.serUrl.serviceForgotPasswordUrl,
            JSON.stringify({ Email: email, CurrentDateTime: new Date().toLocaleString() }),
        );
    }

    public resetPassword(password: string, token?: string): Observable<any> {
        return this.post<any>(
            this.serUrl.serviceUpdatePasswordUrl,
            JSON.stringify({ NewPassword: password }),
            {},
            token,
        );
    }

    public changePassword(password: string, newPassword: string): Observable<any> {
        return this.post<any>(
            this.serUrl.changePasswordUrl,
            JSON.stringify({ password, newPassword, currentDateTime: new Date().toLocaleString() }),
        ).pipe(
            map((result: any) => {
                return result.item;
            }),
        );
    }

    public sendExpireMessage(loginName: string, message: string): Observable<any> {
        const options = this.addHeaderForSendExpireMessage(loginName, message);
        return this.post<any>(this.serUrl.serviceSendNotificationUrl, '', '', options);
    }

    private addHeaderForSendExpireMessage(loginName: string, message: string) {
        // this.headers.append('loginName', loginName);
        // this.headers.append('content', message);
        return {
            headers: new HttpHeaders({
                loginName: loginName,
                content: message,
            }),
        };
    }

    public checkToken(token: any) {
        return this.post<any>(this.serUrl.checkTokenUrl, JSON.stringify({ AccessToken: token })).pipe(
            map((result: any) => {
                return result.item;
            }),
        );
    }

    public getAccessToken() {
        return localStorage.getItem(this.consts.localStorageAccessToken);
    }

    public isTokenValid(token: string) {
        return !this.isTokenExpired(token);
    }

    public isTokenInvalid(token: string) {
        return this.isTokenExpired(token);
    }

    public refreshToken(): Observable<any> {
        localStorage.removeItem(this.consts.localStorageAccessToken);
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) {
            return of(null);
        }

        const options: any = {
            observe: 'body',
            responseType: 'json',
            headers: new HttpHeaders({
                Authorization: `Bearer ${refreshToken}`,
            }),
        };
        return this.httpClient.post(this.consts.refreshTokenUrl, null, options).pipe(
            tap((json: any) => {
                const item = json['item'];
                if (!item['access_token'] || !item['refresh_token']) {
                    localStorage.removeItem(this.consts.localStorageAccessToken);
                    localStorage.removeItem(this.consts.localStorageRefreshToken);
                } else {
                    localStorage.setItem(this.consts.localStorageAccessToken, item['access_token']);
                    localStorage.setItem(this.consts.localStorageRefreshToken, item['refresh_token']);

                    this.setScheduleToRefreshToken();
                }
            }),
        );
    }

    public setScheduleToRefreshToken() {
        const accessToken = localStorage.getItem(Configuration.LOCAL_STORAGE_ACCESS_TOKEN);
        const dateExpiration = this.jwtHelperService.getTokenExpirationDate(accessToken);

        const offsetMiliseconds = 2 * 60 * 1000; // 2 minutes
        var timeNow = new Date().getTime();
        const scheduleTime: number = dateExpiration.getTime() - timeNow;

        let interval = scheduleTime - offsetMiliseconds;
        if (interval < offsetMiliseconds) {
            interval = offsetMiliseconds;
        } else if (interval > 2147483647) {
            //setTimeout and setInterval (in milliseconds) maximum is 2147483647 ms or 24.855 days.
            //This is due to setTimeout using a 32 bit int to store the delay so the max value allowed would be
            interval = 2147483647;
        }

        this.clearScheduleRefreshToken();
        this._scheduleRefreshTokenTimer = setTimeout(() => {
            this.refreshToken()
                .pipe(take(1))
                .subscribe((_) => {});
        }, interval);
    }

    public logout() {
        // remove user from local storage to log user out
        this.uti.clearStorage();
        this.clearScheduleRefreshToken();
    }

    private isTokenExpired(token: string) {
        if (!token) return true;
        return this.jwtHelperService.isTokenExpired(token, this.consts.expiredTokenOffsetSeconds);
    }

    public signup(signUpAccount: UserSignUp): Observable<any> {
        signUpAccount.currentDateTime = new Date().toLocaleString();
        return this.post<UserAuthentication>(this.serUrl.signupUrl, JSON.stringify(signUpAccount));
    }

    public newUser(signUpAccount: UserSignUp): Observable<any> {
        signUpAccount.currentDateTime = new Date().toLocaleString();
        return this.post<UserAuthentication>(this.serUrl.newUserUrl, JSON.stringify(signUpAccount));
    }

    public getRefreshToken() {
        return localStorage.getItem(this.consts.localStorageRefreshToken);
    }

    private clearScheduleRefreshToken() {
        clearTimeout(this._scheduleRefreshTokenTimer);
        this._scheduleRefreshTokenTimer = null;
    }

    public resendEmailNewPass(token: string): Observable<any> {
        const _options = {
            headers: new HttpHeaders({
                Authorization: `Bearer ${token}`,
            }),
        };
        return this.post<any>(
            this.serUrl.serviceResendEmailNewPasswordUrl,
            JSON.stringify({ CurrentDateTime: new Date().toLocaleString() }),
            null,
            _options,
        );
    }

    public newPassword(password: string, token: string): Observable<any> {
        const _options = {
            headers: new HttpHeaders({
                Authorization: `Bearer ${token}`,
            }),
        };
        return this.post<any>(
            this.serUrl.serviceUpdatePasswordUrl,
            JSON.stringify({ NewPassword: password, CurrentDateTime: new Date().toLocaleString() }),
            null,
            _options,
        );
    }

    public getUserFromAccessToken() {
        const accessToken = localStorage.getItem(Configuration.LOCAL_STORAGE_ACCESS_TOKEN);
        const payload = this.jwtHelperService.decodeToken(accessToken);
        if (!payload) {
            return null;
        }

        const appInfoToken = payload.appinfo;
        let user = null;
        if (appInfoToken && appInfoToken.length > 0) {
            try {
                const userInfo = JSON.parse(appInfoToken);
                user = new User({
                    id: userInfo.IdLogin,
                    firstname: userInfo.FirstName || '',
                    fullName: userInfo.FullName || '',
                    email: userInfo.Email || '',
                    preferredLang: userInfo.IdRepLanguage || null,
                    loginPicture: userInfo.LoginPicture || '',
                    loginMessage: payload.message,
                    lastname: userInfo.LastName,
                    idCloudConnection: userInfo.IdCloudConnection,
                    idApplicationOwner: userInfo.IdApplicationOwner,
                    isSuperAdmin: userInfo.IsSuperAdmin,
                    isAdmin: userInfo.IsAdmin,
                    initials: userInfo.Initials,
                    idPerson: userInfo.IdPerson || '',
                    company: userInfo.Company || '',
                    phoneNr: userInfo.PhoneNr || '',
                    dateOfBirth: userInfo.DateOfBirth || '',
                    roleName: userInfo.RoleName || '',
                    avatarDefault: userInfo.AvatarDefault || '',
                    roles: userInfo.Roles || '',
                });
            } catch (error) {}
        }

        return user;
    }
}
