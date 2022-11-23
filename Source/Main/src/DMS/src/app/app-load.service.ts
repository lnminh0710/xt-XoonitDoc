import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/toPromise';
import { Configuration, UserRoles } from './app.constants';
import * as Raven from 'raven-js';
import { JwtHelperService } from '@auth0/angular-jwt';
import { UserService, AuthenticationService } from './services';
import { Uti } from './utilities';
import { take } from 'rxjs/operators';
import sha512 from 'crypto-js/sha512';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Injectable()
export class AppLoadService {
    constructor(
        private httpClient: HttpClient,
        private jwtHelperService: JwtHelperService,
        private userService: UserService,
        private authService: AuthenticationService,
        private uti: Uti,
        private router: Router,
    ) {}
    checkCookie() {
        var cookieEnabled = navigator.cookieEnabled;
        if (!cookieEnabled) {
            document.cookie = 'testcookie';
            cookieEnabled = document.cookie.indexOf('testcookie') != -1;
        }
        return cookieEnabled;
    }

    initializeApp(): Promise<any> {
        if (!this.checkCookie()) {
            return;
        }

        return new Promise((resolve, reject) => {
            // console.log(`initializeApp:: inside promise`);
            this.httpClient
                .get(environment.fakeServer + '/api/common/GetPublicSetting')
                .toPromise()
                .then((settings) => {
                    // success
                    // console.log(`Settings from API: `, settings);
                    Configuration.PublicSettings = settings['item'];
                    // console.log(`PublicSettings: `, Configuration.PublicSettings);

                    if (Configuration.PublicSettings.websiteTitle) {
                        document.title = Configuration.PublicSettings.websiteTitle;
                    }

                    // With this stage, there are many errors with Selection Project, so we will not write sentry
                    if (!Configuration.PublicSettings.isSelectionProject) {
                        // https://docs.sentry.io/platforms/javascript/angular/
                        const sentry = Configuration.PublicSettings.sentry;
                        if (sentry && sentry.clientDsn) {
                            Raven.config(sentry.clientDsn).install();
                        } else {
                            console.log(`Please config sentry with clientDsn`);
                        }
                    }

                    if (Uti.detectIOSDevice()) {
                        this.router.navigate(['/apple-app-site-association']);
                    }

                    this.initialRoles();
                    this.checkAccessToken();

                    resolve();

                    //// get ip
                    // this.httpClient.get('https://jsonip.com/?callbackg')
                    //    .toPromise()
                    //    .then(data => {//success
                    //        if (data && data['ip']) {
                    //            Configuration.PublicSettings.clientIpAddress = data['ip'];
                    //        }

                    //        resolve();

                    //    }).catch((error) => {
                    //        //Always resolve whether an error occurs
                    //        resolve();

                    //        this.handleError(error);
                    //    });
                })
                .catch(this.handleError());
        }); // Promise
    }

    private handleError(data?: any) {
        return (error: any) => {
            console.log(error);
        };
    }

    private getRefreshToken() {
        const refreshToken = localStorage.getItem(Configuration.LOCAL_STORAGE_REFRESH_TOKEN);
        const isRefreshTokenExpired = this.jwtHelperService.isTokenExpired(refreshToken);
        if (isRefreshTokenExpired) {
            this.userService.setCurrentUser(null);
            this.uti.clearStorage();
        } else {
            this.authService
                .refreshToken()
                .pipe(take(1))
                .subscribe((_) => {
                    this.setUserInfo();
                });
        }
    }

    private setUserInfo() {
        const user = this.authService.getUserFromAccessToken();
        if (user) {
            this.userService.setCurrentUser(user);
        }
    }

    private initialRoles() {
        Object.keys(UserRoles).forEach((keyEnum) => {
            UserRoles[keyEnum] = (sha512(UserRoles[keyEnum]).toString() as string).toUpperCase();
        });
    }

    private checkAccessToken() {
        const accessToken = localStorage.getItem(Configuration.LOCAL_STORAGE_ACCESS_TOKEN);
        if (accessToken) {
            const isAccessTokenExpired = this.jwtHelperService.isTokenExpired(accessToken);
            if (isAccessTokenExpired) {
                console.log('initializeApp: Token Expired');
                this.getRefreshToken();
            } else {
                this.setUserInfo();
                this.authService.setScheduleToRefreshToken();
            }
        }
    }
}
