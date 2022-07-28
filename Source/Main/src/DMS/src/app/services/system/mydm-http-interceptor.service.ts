import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, Subject, Subscriber } from 'rxjs';
import { AuthenticationService } from './authentication.service';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { Configuration, LocalSettingKey } from '@app/app.constants';
import { of, throwError } from 'rxjs';
import { LocalStorageHelper, SessionStorageProvider } from '../../utilities';

@Injectable()
export class MyDmHttpInterceptor implements HttpInterceptor {
    private isRefreshing: boolean;
    private refreshTokenSubject$: BehaviorSubject<any> = new BehaviorSubject<any>(null);

    private onXhrSendRequestSubject$: BehaviorSubject<XMLHttpRequest> = new BehaviorSubject<XMLHttpRequest>(null);
    private refreshTokenXhrSubject$: BehaviorSubject<string> = new BehaviorSubject<string>(null);
    private onXhrUploadDoneSubject$: Subject<boolean> = new Subject<boolean>();

    private _coreXhrSendPrototype: Function;
    private _coreXhrOpenPrototype: Function;

    public readonly onXhrSendRequest$: Observable<XMLHttpRequest> = this.onXhrSendRequestSubject$.asObservable();
    public readonly refreshTokenXhr$: Observable<string> = this.refreshTokenXhrSubject$.asObservable();
    public readonly onXhrUploadDone$: Observable<boolean> = this.onXhrUploadDoneSubject$.asObservable();

    constructor(
        private authService: AuthenticationService,
        private consts: Configuration
    ) {
        this.isRefreshing = false;
        this.createXhrUploadInterceptor();
    }

    public intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        let clonedRequest = request;
        const accessToken = this.authService.getAccessToken();
        
        const isCallGraphApi = request.headers.get('CallGraphApi');
        if (accessToken && (!isCallGraphApi || isCallGraphApi !== 'true')) {
            clonedRequest = this.addToken(request, accessToken);
        }
        clonedRequest = this.addLanguageToHeader(clonedRequest);
        return next.handle(clonedRequest).pipe(
            catchError((error) => {
                if (error instanceof HttpErrorResponse && error.status === 401) {
                    if (error.url.indexOf('RefreshToken') >= 0) {
                        this.authService.logout();
                        //debugger
                        location.href = this.consts.loginUrl;
                        location.reload();
                        return of(error);
                    }
                    return this.handleUnauthorized(clonedRequest, next);
                } else {
                    return throwError(error);
                }
            }),
        );
    }

    private handleUnauthorized(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
        if (!this.isRefreshing) {
            this.isRefreshing = true;
            this.refreshTokenSubject$.next(null);

            return this.authService.refreshToken().pipe(
                switchMap((res: Response) => {
                    const json = res;
                    const item = json['item'];
                    this.isRefreshing = false;
                    this.refreshTokenSubject$.next(item['access_token']);
                    const clonedRequest = this.addToken(request, item['access_token']);
                    return next.handle(clonedRequest);
                }),
                catchError((err) => {
                    const refreshToken = this.authService.getRefreshToken();
                    if (refreshToken) {
                        this.authService.logout();
                        location.href = this.consts.loginUrl;
                        location.reload();
                    }                    
                    return of(err);
                }),
            );
        }

        return this.refreshTokenSubject$.pipe(
            filter((token) => token != null),
            take(1),
            switchMap((jwt) => {
                const clonedRequest = this.addToken(request, jwt);
                return next.handle(clonedRequest);
            }),
        );
    }

    private addToken(request: HttpRequest<any>, token: string) {
        const headers = request.headers.set('Authorization', `Bearer ${token}`);
        return request.clone({
            headers,
        });
    }

    private addLanguageToHeader(request: HttpRequest<any>) {
        let language = LocalStorageHelper.toInstance(SessionStorageProvider).getItem(LocalSettingKey.LANGUAGE);
        if (language) {
            if (request.headers.has('IdRepLanguage')) {
                request.headers.delete('IdRepLanguage');
            }
            const headers = request.headers.set('IdRepLanguage', language.idRepLanguage);
            return request.clone({
                headers,
            });
        }
        return request;
    }

    private createXhrUploadInterceptor() {
        this.overrideXhrUploadOpen();
        this.overrideXhrUploadSend();
    }

    private overrideXhrUploadOpen() {
        const _self = this;
        this._coreXhrOpenPrototype = XMLHttpRequest.prototype.open;

        XMLHttpRequest.prototype.open = function (method: string, url: string) {
            const _xhr = this as XMLHttpRequest;

            // add callback openGetter for get object for reopen connection xhr when renew xhr instance
            _xhr['openGetter'] = () => {
                return {
                    method: method,
                    url: url,
                };
            };

            _self._coreXhrOpenPrototype.apply(this, arguments);
        };
    }

    private overrideXhrUploadSend() {
        const _self = this;
        this._coreXhrSendPrototype = XMLHttpRequest.prototype.send;

        XMLHttpRequest.prototype.send = function (body: any) {
            const _xhr = this as XMLHttpRequest;

            // if event listeners of XMLHttpRequestUpload has not registered. So this request IS NOT upload
            if (!Object.keys(_xhr.upload).length) {
                // observer.next(null);
                _self._coreXhrSendPrototype.apply(this, arguments);
                return;
            }

            // add callback bodyGetter for get body when renew xhr instance
            _xhr['bodyGetter'] = () => {
                return body;
            };

            if (!_xhr.withCredentials) return;
            const accessToken = _self.authService.getAccessToken();
            _xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);

            // arguments when caller call xhr.send(body);
            // save it as variable _agurments to pass it all the way down
            const _arguments = arguments;

            // return observable for caller. observe.next when upload OKAY
            return Observable.create((observer: Subscriber<XMLHttpRequest>) => {
                _xhr.addEventListener(
                    'readystatechange',
                    (e) => {
                        switch (_xhr.readyState) {
                            case XMLHttpRequest.DONE:
                                _self
                                    .handleXhrResponse(_xhr, _arguments)
                                    .pipe(take(1))
                                    .subscribe((data) => {
                                        observer.next(data);
                                    });
                                return;
                        }
                    },
                    false,
                );

                _self._coreXhrSendPrototype.apply(this, _arguments);
            });
        };
    }

    private handleXhrResponse(xhr: XMLHttpRequest, data: IArguments): Observable<XMLHttpRequest> {
        // if OKAY
        if (xhr.status !== 401) {
            return of(xhr);
        }

        // case Unauthorized
        // renew Xhr
        const newXhr = new XMLHttpRequest();
        newXhr['openGetter'] = xhr['openGetter'];
        newXhr['bodyGetter'] = xhr['bodyGetter'];

        // send retryOutOfSession event to caller call xhr.send(body) to set new xhr
        // to resend xhr again when get new access_token
        const event = new CustomEvent('retryOutOfSession', { detail: newXhr });
        xhr.dispatchEvent(event);

        if (this.isRefreshing) {
            // when on refreshing new access_token
            return this.refreshTokenXhr$.pipe(
                filter((token) => token != null),
                switchMap((token) => {
                    // return observable to caller call handleXhrResponse
                    return this.resendXhrRequestWithNewToken(newXhr, token, data, event);
                }),
            );
        } else {
            // when unauthorized then call refreshToken request
            this.isRefreshing = true;
            this.refreshTokenXhrSubject$.next(null);
            // return observable to caller call handleXhrResponse
            return this.handleXhrUnauthorized(newXhr, data, event);
        }
    }

    private handleXhrUnauthorized(xhr: XMLHttpRequest, data: IArguments, event: Event): Observable<XMLHttpRequest> {
        return this.authService.refreshToken().pipe(
            switchMap((res: Response) => {
                // new access_token
                const item = res['item'];
                this.isRefreshing = false;
                this.refreshTokenXhrSubject$.next(item['access_token']);
                return this.resendXhrRequestWithNewToken(xhr, item['access_token'], data, event);
            }),
        );
    }

    private resendXhrRequestWithNewToken(
        xhr: XMLHttpRequest,
        token: string,
        data: IArguments,
        event: Event,
    ): Observable<XMLHttpRequest> {
        return Observable.create((observer: Subscriber<any>) => {
            // return observable to caller call resendXhrRequestWithNewToken
            const openGetter = xhr['openGetter']();
            xhr.open(openGetter.method, openGetter.url, true);
            xhr.setRequestHeader('Authorization', `Bearer ${token}`);

            xhr.addEventListener(
                'readystatechange',
                (e) => {
                    switch (xhr.readyState) {
                        case XMLHttpRequest.DONE:
                            observer.next(xhr);
                            return;
                    }
                },
                false,
            );

            this._coreXhrSendPrototype.apply(xhr, data);
        });
    }
}
