import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Configuration, ServiceUrl } from '@app/app.constants';
import { User, UserSignUp } from '@app/models';
import { JwtHelperService } from '@auth0/angular-jwt';
import { AuthenticationService } from './authentication.service';

describe('AuthenticationService', () => {
    let service: AuthenticationService;
    let client: HttpTestingController;
    let serviceUrl: ServiceUrl;
    let consts: Configuration;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                RouterTestingModule,
            ],
            providers: [
                AuthenticationService,
                Injector,
                { provide: JwtHelperService, useFactory: () => new JwtHelperService() },
                Configuration,
                ServiceUrl
            ]
        });

        service = TestBed.inject(AuthenticationService);
        client = TestBed.inject(HttpTestingController);
        serviceUrl = TestBed.inject(ServiceUrl);
        consts = TestBed.inject(Configuration);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('login', () => {
        it('call login success', done => {
            // mock service fuction
            const data = <User>{ email: 'tamtv@test.com', password: '123456' }
            const result = { isSuccess: true };
            service.login(data).subscribe((res) => {
                expect(res).toEqual(result);
                done();
            });

            const req = client.expectOne(serviceUrl.serviceAuthenticateUrl)
            expect(req.request.method).toBe('POST');
            req.flush(result);
        });
    });

    describe('loginByUserId', () => {
        it('call loginByUserId success', done => {
            // mock service fuction
            const data = '1';
            const result = { isSuccess: true }
            service.loginByUserId(data).subscribe((res) => {
                expect(res).toEqual(result);
                done();
            });

            const req = client.expectOne(`${serviceUrl.loginByUserIdUrl}?idLogin=${data}`)
            expect(req.request.method).toBe('GET');
            req.flush(result);
        });
    });

    describe('forgotPassword', () => {
        it('call forgotPassword success', done => {
            // mock service fuction
            const data = 'tamtv@test.com';
            const result = { isSuccess: true }
            service.forgotPassword(data).subscribe((res) => {
                expect(res).toEqual(result);
                done();
            });

            const req = client.expectOne(serviceUrl.serviceForgotPasswordUrl)
            expect(req.request.method).toBe('POST');
            req.flush(result);
        });
    });

    describe('resetPassword', () => {
        it('call resetPassword success', done => {
            // mock service fuction
            const pass = '123456';
            const token = '';
            const result = { isSuccess: true }
            service.resetPassword(pass, token).subscribe((res) => {
                expect(res).toEqual(result);
                done();
            });

            const req = client.expectOne(serviceUrl.serviceUpdatePasswordUrl)
            expect(req.request.method).toBe('POST');
            req.flush(result);
        });
    });

    describe('changePassword', () => {
        it('call changePassword success', done => {
            // mock service fuction
            const pass = '123456';
            const newPass = '456789';
            const result = { item: true }
            service.changePassword(pass, newPass).subscribe((res) => {
                expect(res).toEqual(result.item);
                done();
            });

            const req = client.expectOne(serviceUrl.changePasswordUrl)
            expect(req.request.method).toBe('POST');
            req.flush(result);
        });
    });

    describe('sendExpireMessage', () => {
        it('call sendExpireMessage success', done => {
            // mock service fuction
            const loginName = '123456';
            const sendExpireMessage = '';
            const result = { isSuccess: true }
            service.sendExpireMessage(loginName, sendExpireMessage).subscribe((res) => {
                expect(res).toEqual(result);
                done();
            });

            const req = client.expectOne(serviceUrl.serviceSendNotificationUrl)
            expect(req.request.method).toBe('POST');
            req.flush(result);
        });
    });

    describe('checkToken', () => {
        it('call checkToken success', done => {
            // mock service fuction
            const token = '';
            const result = { item: true }
            service.checkToken(token).subscribe((res) => {
                expect(res).toEqual(result.item);
                done();
            });

            const req = client.expectOne(serviceUrl.checkTokenUrl)
            expect(req.request.method).toBe('POST');
            req.flush(result);
        });
    });

    describe('getAccessToken', () => {
        it('call getAccessToken success', () => {
            const data = 'localStorageAccessToken';
            // mock localStorage
            spyOn(localStorage, 'getItem').and.returnValue(data);
            const storage = service.getAccessToken();
            expect(storage).toEqual(data);
        });
    });

    describe('isTokenValid', () => {
        it('token invalid call isTokenValid return false', () => {
            const data = '';
            const result = service.isTokenValid(data);
            expect(result).toBeFalsy();
        });
        it('token valid call isTokenValid return true', () => {
            // mock localStorage
            const jwtHelperService = TestBed.inject(JwtHelperService);
            spyOn(jwtHelperService, 'isTokenExpired').and.returnValue(false);

            const data = 'token';
            const result = service.isTokenValid(data);
            expect(result).toBeTruthy();
        });
    });

    describe('isTokenInvalid', () => {
        it('token invalid call isTokenInvalid return true', () => {
            const data = '';
            const result = service.isTokenInvalid(data);
            expect(result).toBeTruthy();
        });
        it('token valid call isTokenInvalid return false', () => {
            // mock localStorage
            const jwtHelperService = TestBed.inject(JwtHelperService);
            spyOn(jwtHelperService, 'isTokenExpired').and.returnValue(false);

            const data = 'token';
            const result = service.isTokenInvalid(data);
            expect(result).toBeFalsy();
        });
    });

    describe('refreshToken', () => {
        it('get refreshToken is null and return null', done => {
            // mock localStorage
            spyOn(localStorage, 'getItem').and.returnValue('');
            service.refreshToken().subscribe((res) => {
                expect(res).toBeNull();
                done();
            });
        });

        it('get refreshToken is not null but access_token null so remove localStorageAccessToken and localStorageRefreshToken', done => {
            // mock localStorage
            let spy = spyOn(localStorage, 'removeItem');
            spyOn(localStorage, 'getItem').and.returnValue('refreshToken');

            const data = { item: {} }
            service.refreshToken().subscribe((res) => {
                expect(res.item['access_token']).toBeUndefined();
                expect(spy).toHaveBeenCalledWith(consts.localStorageAccessToken);
                expect(spy).toHaveBeenCalledWith(consts.localStorageRefreshToken);
                done();
            });

            const req = client.expectOne(consts.refreshTokenUrl)
            expect(req.request.method).toBe('POST');
            req.flush(data);
        });

        it('get refreshToken is not null but refresh_token null so remove localStorageAccessToken and localStorageRefreshToken', done => {
            // mock localStorage
            let spy = spyOn(localStorage, 'removeItem');
            spyOn(localStorage, 'getItem').and.returnValue('refreshToken');

            const data = { item: { access_token: 'access_token' } }
            service.refreshToken().subscribe((res) => {
                expect(res.item['refresh_token']).toBeUndefined();
                expect(spy).toHaveBeenCalledWith(consts.localStorageAccessToken);
                expect(spy).toHaveBeenCalledWith(consts.localStorageRefreshToken);
                done();
            });

            const req = client.expectOne(consts.refreshTokenUrl)
            expect(req.request.method).toBe('POST');
            req.flush(data);
        });

        it('get refreshToken is not null and access_token, refresh_token valid so setItem localStorageAccessToken and localStorageRefreshToken', done => {
            // mock localStorage
            const store = { [consts.localStorageRefreshToken]: consts.localStorageRefreshToken, [Configuration.LOCAL_STORAGE_ACCESS_TOKEN]: Configuration.LOCAL_STORAGE_ACCESS_TOKEN };
            spyOn(localStorage, 'getItem').and.callFake(function (key) {
                return store[key];
            });
            // mock localStorage
            const jwtHelperService = TestBed.inject(JwtHelperService);
            const dateExpiration = new Date(new Date().getDate() + 100)
            spyOn(jwtHelperService, 'getTokenExpirationDate').and.returnValue(dateExpiration);

            const data = { item: { access_token: 'access_token', refresh_token: 'refresh_token' } }
            service.refreshToken().subscribe((res) => {
                expect(res.item['access_token']).toEqual('access_token');
                expect(res.item['refresh_token']).toEqual('refresh_token');
                done();
            });

            const req = client.expectOne(consts.refreshTokenUrl)
            expect(req.request.method).toBe('POST');
            req.flush(data);
        });
    });

    describe('logout', () => {
        it('call logout sucess and localStorage.clear(), sessionStorage.clear() is called', () => {
            let spyLocalStorage = spyOn(localStorage, 'clear');
            let spySessionStorage = spyOn(sessionStorage, 'clear');
            service.logout();
            expect(spyLocalStorage).toHaveBeenCalled();
            expect(spySessionStorage).toHaveBeenCalled();
        });
    });

    describe('signup', () => {
        it('call signup success', done => {
            // mock service fuction
            const result = { item: true }
            service.signup(<UserSignUp>{ email: 'tamtv@test', password: '123456' }).subscribe((res) => {
                expect(res).toEqual(result);
                done();
            });

            const req = client.expectOne(serviceUrl.signupUrl)
            expect(req.request.method).toBe('POST');
            req.flush(result);
        });
    });

    describe('newUser', () => {
        it('call newUser success', done => {
            // mock service fuction
            const result = { item: true }
            service.newUser(<UserSignUp>{ email: 'tamtv@test', password: '123456' }).subscribe((res) => {
                expect(res).toEqual(result);
                done();
            });

            const req = client.expectOne(serviceUrl.newUserUrl)
            expect(req.request.method).toBe('POST');
            req.flush(result);
        });
    });

    describe('resendEmailNewPass', () => {
        it('call resendEmailNewPass success', done => {
            // mock service fuction
            const token = 'token';
            const result = { item: true }
            service.resendEmailNewPass(token).subscribe((res) => {
                expect(res).toEqual(result);
                done();
            });

            const req = client.expectOne(serviceUrl.serviceResendEmailNewPasswordUrl)
            expect(req.request.method).toBe('POST');
            req.flush(result);
        });
    });

    describe('newPassword', () => {
        it('call newPassword success', done => {
            // mock service fuction
            const token = 'token';
            const pass = 'pass';
            const result = { item: true }
            service.newPassword(pass, token).subscribe((res) => {
                expect(res).toEqual(result);
                done();
            });

            const req = client.expectOne(serviceUrl.serviceUpdatePasswordUrl)
            expect(req.request.method).toBe('POST');
            req.flush(result);
        });
    });

    describe('getUserFromAccessToken', () => {
        it('accessToken invalid and return null', () => {
            // mock jwtHelperService
            const jwtHelperService = TestBed.inject(JwtHelperService);
            spyOn(jwtHelperService, 'decodeToken').and.returnValue('');

            const res = service.getUserFromAccessToken();
            expect(res).toBeNull();
        });
        it('accessToken valid and return user data', () => {
            const data = { IdLogin: '1', };
            const accessToken = {
                appinfo: JSON.stringify(data)
            }
            // mock jwtHelperService
            const jwtHelperService = TestBed.inject(JwtHelperService);
            spyOn(jwtHelperService, 'decodeToken').and.returnValue(accessToken);

            const res = service.getUserFromAccessToken();
            expect(res.id).toEqual(data.IdLogin);
        });
    });
});