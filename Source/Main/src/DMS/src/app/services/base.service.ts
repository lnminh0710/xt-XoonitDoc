import { Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
// import { JwtHttp } from 'angular2-jwt-refresh';
import { Observable, Subscription, Subject, throwError } from 'rxjs';
import { SerializationHelper, LocalStorageProvider } from '@app/utilities';
import { Configuration, ServiceUrl, LocalSettingKey } from '@app/app.constants';
import { UserAuthentication, LanguageSettingModel } from '@app/models';
import { Uti, SessionStorageProvider, LocalStorageHelper, String } from '@app/utilities';
import { CacheService } from './cache.service';
import { ToasterService } from 'angular2-toaster/angular2-toaster';
import {
    HttpRequest,
    HttpHeaders,
    HttpClient,
    HttpParams,
    HttpEvent,
    HttpEventType,
    HttpResponse,
} from '@angular/common/http';
import { filter, map, catchError, finalize, takeUntil, timeoutWith, debounceTime } from 'rxjs/operators';
import { isObject } from 'lodash-es';

@Injectable()
export class BaseService {
    // protected headers: Headers;
    protected requestOptions: {
        headers?:
            | HttpHeaders
            | {
                  [header: string]: string | string[];
              };
        observe?: 'body' | 'response' | 'events';
        params?:
            | HttpParams
            | {
                  [param: string]: string | string[];
              };
        reportProgress?: boolean;
        responseType?: 'json' | 'arraybuffer' | 'blob' | 'text';
        withCredentials?: boolean;
    };
    protected modelName: string;
    protected serUrl: ServiceUrl;
    protected uti: Uti;

    private responseEventTypes: string;
    private timeOutSpec = 60000;
    static finishProgressTimer: any;
    static startProgressbarCount = 0;

    static toggleSlimLoadingBarSource = new Subject<any>();
    static toggleSlimLoadingBar$ = BaseService.toggleSlimLoadingBarSource.asObservable();

    // private jwtHttp: JwtHttp;
    protected httpClient: HttpClient;
    protected router: Router;
    protected config: Configuration;
    // protected baseOptions: RequestOptions;

    static cacheService: CacheService = new CacheService();
    static toasterService: ToasterService;

    constructor(protected injector: Injector) {
        // this.jwtHttp = this.injector.get(JwtHttp);
        this.httpClient = this.injector.get(HttpClient);
        this.router = this.injector.get(Router);
        this.config = this.injector.get(Configuration);

        this.serUrl = new ServiceUrl();
        this.uti = new Uti();
        this.modelName = '';
        // this.headers = new Headers();
        // this.headers.append('Content-Type', 'application/json');
        // this.headers.append('Accept', 'application/json');
        // this.headers.append('Cache-Control', 'no-cache');
        // this.headers.append('Pragma', 'no-cache');
        this.requestOptions = this.getDefaultOptions();
        // this.baseOptions = new RequestOptions({ headers: this.headers });

        //can set many types. Ex: [Exception][Abc]
        this.responseEventTypes = '[Exception]';
    }

    protected getDefaultOptions(): {
        headers?:
            | HttpHeaders
            | {
                  [header: string]: string | string[];
              };
        observe: 'response';
        params?:
            | HttpParams
            | {
                  [param: string]: string | string[];
              };
        reportProgress?: boolean;
        responseType?: 'json';
        withCredentials?: boolean;
    } {
        return {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'Cache-Control': 'no-cache',
                Pragma: 'no-cache',
            }),
            observe: 'response',
            responseType: 'json',
            withCredentials: true,
        };
    }

    // private getAuthorization(token?: string) {
    //     this.addLanguageToHeader();
    //     if (token) {
    //         if (this.headers.has('Authorization')) {
    //             this.headers.delete('Authorization');
    //         }
    //         this.headers.append('Authorization', token);
    //         return;
    //     }
    //     const currentUserJson = localStorage.getItem(this.config.localStorageCurrentUser);
    //     const currentUserAuthentication = SerializationHelper.toInstance(new UserAuthentication(), currentUserJson);
    //     const authorizationString = currentUserAuthentication.token_type + ' ' + currentUserAuthentication.access_token;

    //     if (this.headers.has('Authorization')) {
    //         this.headers.delete('Authorization');
    //     }
    //     this.headers.append('Authorization', authorizationString);
    // }

    private addLanguageToHeader() {
        const language = LocalStorageHelper.toInstance(LocalStorageProvider).getItem(
            LocalSettingKey.LANGUAGE,
        ) as LanguageSettingModel;
        if (language) {
            if ((this.requestOptions.headers as HttpHeaders as HttpHeaders).has('IdRepLanguage') === true) {
                (this.requestOptions.headers as HttpHeaders).delete('IdRepLanguage');
            }
            if ((this.requestOptions.headers as HttpHeaders).has('TranslateModuleType')) {
                (this.requestOptions.headers as HttpHeaders).delete('TranslateModuleType');
            }
            (this.requestOptions.headers as HttpHeaders).append('IdRepLanguage', language.idRepLanguage);
            (this.requestOptions.headers as HttpHeaders).append('TranslateModuleType', language.translateModuleType);
        }
    }

    protected addHeader(key: string, value: string) {
        if ((this.requestOptions.headers as HttpHeaders).has(key)) {
            (this.requestOptions.headers as HttpHeaders).delete(key);
        }
        (this.requestOptions.headers as HttpHeaders).append(key, value);
    }

    private setModuleName(moduleName) {
        if (!moduleName) {
            return;
        }
        if ((this.requestOptions.headers as HttpHeaders).has('module_name')) {
            (this.requestOptions.headers as HttpHeaders).delete('module_name');
        }
        (this.requestOptions.headers as HttpHeaders).append('module_name', moduleName);
    }

    private buildGetUrl(currentUrl: string, param?: any): string {
        if (!param || Uti.isNullUndefinedEmptyObject(param)) {
            return currentUrl;
        }
        const keyNames = Object.keys(param);
        currentUrl += currentUrl.indexOf('?') > -1 ? '&' : '?';
        for (const key of keyNames) {
            currentUrl +=
                key.replace(this.config.avoidPropetyRemoveText, '') +
                '=' +
                (param[key] == null || param[key] == undefined ? '' : param[key]) +
                '&';
        }
        return currentUrl.substr(0, currentUrl.length - 1);
    }

    private writeTimeTraceLog(response: any, clientStartTime: Date, clientEndTime: Date) {
        if (!this.config.enableTimeTraceLog) return;

        const uniqueServTime = response.headers._headers.get('x-elapsedtime-uniqueservice');
        const xenaApiTime = response.headers._headers.get('x-elapsedtime-xenaapi');
        const url = response.url;
        const status = response.status;
        const clientTime = String.Format(
            'start: {0} - end: {1} - total: {2}ms',
            String.Format(
                '{0}/{1}/{2} {3}:{4}:{5}:{6}',
                clientStartTime.getDate(),
                clientStartTime.getMonth(),
                clientStartTime.getFullYear(),
                clientStartTime.getHours(),
                clientStartTime.getMinutes(),
                clientStartTime.getSeconds(),
                clientStartTime.getMilliseconds(),
            ),
            String.Format(
                '{0}/{1}/{2} {3}:{4}:{5}:{6}',
                clientEndTime.getDate(),
                clientEndTime.getMonth(),
                clientEndTime.getFullYear(),
                clientEndTime.getHours(),
                clientEndTime.getMinutes(),
                clientEndTime.getSeconds(),
                clientEndTime.getMilliseconds(),
            ),
            clientEndTime.getTime() - clientStartTime.getTime(),
        );
        console.log({
            'unique service': uniqueServTime ? uniqueServTime[0] : '',
            'xena api': xenaApiTime ? xenaApiTime[0] : '',
            client: clientTime,
            url: url,
            status: status,
        });
    }

    private logWhenTimeout(url: string): any {
        return 'Timeout exceeded of request: ' + url;
    }

    public getTracking<T>(url: string): Observable<T> {
        // this.getAuthorization();
        const startTime = new Date();
        return this.httpClient.get(url, { ...this.getDefaultOptions() }).pipe(
            timeoutWith(this.timeOutSpec, throwError(this.logWhenTimeout(url))),
            catchError((error) => {
                return this.handleError(error);
            }),
            map((response: any) => {
                const endTime = new Date();
                this.writeTimeTraceLog(response, startTime, endTime);

                const responseJson = response.body as T;
                this.processManualError(responseJson);
                return responseJson;
            }),
        );
    }

    protected get<T>(
        url: string,
        param?: any,
        token?: string,
        options?: any,
        moduleName?: string,
        deboundTime?: number,
        dontParseJson?: boolean,
    ): Observable<T> {
        this.setModuleName(moduleName);
        // this.getAuthorization(token);
        url = this.buildGetUrl(url, param);
        deboundTime = deboundTime || 10000;
        const startTime = new Date();

        const _options = this._mergeRequestOptions(this.getDefaultOptions(), options);

        return this.httpClient.get(url, _options).pipe(
            debounceTime(deboundTime),
            timeoutWith(this.timeOutSpec, throwError(this.logWhenTimeout(url))),
            map((response: any) => {
                const endTime = new Date();
                this.writeTimeTraceLog(response, startTime, endTime);

                if (dontParseJson) return response as any;

                const responseJson = response.body as T;
                this.processManualError(responseJson);
                return responseJson;
            }),
            catchError((error) => {
                return this.handleError(error);
            }),
        );
    }

    protected getV2<T>(
        url: string,
        options?: any,
        param?: any,
        deboundTime?: number,
        dontParseJson?: boolean,
    ): Observable<T> {
        // this.getAuthorization();
        url = this.buildGetUrl(url, param);
        deboundTime = deboundTime || 10000;
        const startTime = new Date();

        const _options = this._mergeRequestOptions(this.getDefaultOptions(), options);

        return this.httpClient.get(url, _options).pipe(
            debounceTime(deboundTime),
            timeoutWith(this.timeOutSpec, throwError(this.logWhenTimeout(url))),
            catchError((error) => {
                return this.handleError(error);
            }),
            map((response: any) => {
                const endTime = new Date();
                this.writeTimeTraceLog(response, startTime, endTime);

                const responseJson = response.body as T;
                this.processManualError(responseJson);
                return responseJson;
            }),
        );
    }

    protected getXML<T>(url: string): Observable<T> {
        const startTime = new Date();

        return this.httpClient.get(url, { ...this.getDefaultOptions() }).pipe(
            timeoutWith(this.timeOutSpec, throwError(this.logWhenTimeout(url))),
            catchError((error) => {
                return this.handleError(error);
            }),
            map((response: any) => {
                const endTime = new Date();
                this.writeTimeTraceLog(response, startTime, endTime);

                const responseXML = response as T;
                return responseXML;
            }),
        );
    }

    protected post<T>(
        url: string,
        bodyJson?: any,
        param?: any,
        options?: any,
        dontParseJson?: boolean,
        ignoreBarProcess?: boolean,
    ): Observable<T> {
        // this.getAuthorization(token);
        url = this.buildGetUrl(url, param);
        const startTime = new Date();

        if (!ignoreBarProcess && !this.ignoreProgressBarProcess(url)) {
            this.startProgressbar(url);
        }

        const _options = this._mergeRequestOptions(this.getDefaultOptions(), options);

        return this.httpClient.post(url, bodyJson, _options).pipe(
            timeoutWith(this.timeOutSpec, throwError(this.logWhenTimeout(url))),
            catchError((error) => {
                return this.handleError(error);
            }),
            map((response: any) => {
                const endTime = new Date();
                this.writeTimeTraceLog(response, startTime, endTime);

                if (dontParseJson) return response as any;

                const responseJson = response.body as T;
                this.processManualError(responseJson);
                return responseJson;
            }),
            finalize(() => {
                if (!this.ignoreProgressBarProcess(url)) {
                    this.finishProgessbar(url);
                }
            }),
        );
    }

    protected upload<T>(
        url: string,
        bodyJson?: any,
        param?: any,
        options?: any,
        dontParseJson?: boolean,
    ): Observable<T> {
        // this.getAuthorization(token);
        url = this.buildGetUrl(url, param);
        const startTime = new Date();

        if (!this.ignoreProgressBarProcess(url)) {
            this.startProgressbar(url);
        }

        return this.httpClient.post(url, bodyJson, options).pipe(
            timeoutWith(this.timeOutSpec, throwError(this.logWhenTimeout(url))),
            catchError((error) => {
                return this.handleError(error);
            }),
            map((response: any) => {
                const endTime = new Date();
                this.writeTimeTraceLog(response, startTime, endTime);

                if (dontParseJson) return response as any;

                const responseJson = response.body as T;
                this.processManualError(responseJson);
                return responseJson;
            }),
            finalize(() => {
                if (!this.ignoreProgressBarProcess(url)) {
                    this.finishProgessbar(url);
                }
            }),
        );
    }

    protected put<T>(url: string, bodyJson?: string, param?: any, options?: any, token?: string): Observable<T> {
        // this.getAuthorization(token);
        url = this.buildGetUrl(url, param);
        const startTime = new Date();

        const _options = this._mergeRequestOptions(this.getDefaultOptions(), options);

        return this.httpClient.put(url, bodyJson, _options).pipe(
            timeoutWith(this.timeOutSpec, throwError(this.logWhenTimeout(url))),
            catchError((error) => {
                return this.handleError(error);
            }),
            map((response: any) => {
                const endTime = new Date();
                this.writeTimeTraceLog(response, startTime, endTime);

                const responseJson = response.body as T;
                this.processManualError(responseJson);
                return responseJson;
            }),
        );
    }

    protected delete<T>(url: string, param?: any, options?: any, token?: string): Observable<T> {
        // this.getAuthorization(token);
        url = this.buildGetUrl(url, param);
        const startTime = new Date();

        const _options = this._mergeRequestOptions(this.getDefaultOptions(), options);

        return this.httpClient.delete(url, _options).pipe(
            timeoutWith(this.timeOutSpec, throwError(this.logWhenTimeout(url))),
            catchError((error) => {
                return this.handleError(error);
            }),
            map((response: any) => {
                const endTime = new Date();
                this.writeTimeTraceLog(response, startTime, endTime);

                const responseJson = response.body as T;
                this.processManualError(responseJson);
                return responseJson;
            }),
        );
    }

    private processManualError(responseJson: any) {
        if (!responseJson || !BaseService.toasterService) return;
        if (responseJson.statusCode != 1 || !responseJson['item'] || !responseJson['item'].hasOwnProperty('eventType'))
            return;

        //only process for statusCode = 1 (success)
        let eventType = responseJson['item']['eventType'];
        let userErrorMessage = responseJson['item']['userErrorMessage'];
        if (!eventType || this.responseEventTypes.indexOf('[' + eventType + ']') !== -1) {
            let message = 'System error, please contact administrator for supporting';
            if (userErrorMessage && userErrorMessage.length) {
                message = userErrorMessage;
            }
            BaseService.toasterService.pop('error', 'System Error', message);

            console.log('System error:', responseJson);
            throw new Error('System error with eventType: ' + eventType);
        }
    }

    private handleError(error: any) {
        //status, statusText
        if (error) {
            /*
             BadRequest = 400,
             Unauthorized = 401,
             PaymentRequired = 402,
             Forbidden = 403,
             NotFound = 404
             */
            switch (error.status) {
                case 401:
                case 403:
                    // remove user from local storage to log user out
                    // localStorage.clear();
                    // sessionStorage.clear();

                    // this.router.navigate(['auth/login']);

                    // if you've caught / handled the error, you don't want to rethrow it unless you also want downstream consumers to have to handle it as well.
                    return Observable.of(error);
                case 500:
                    // default:
                    if (BaseService.toasterService) {
                        BaseService.toasterService.pop(
                            'error',
                            'System Error',
                            'System error, please contact administrator for supporting',
                        );
                    }
                    break;
            }
        }

        console.log(error);
        return throwError(error);
    }

    private ignoreProgressBarProcess(url) {
        let ignoreUrls = [
            'GlobalSetting',
            'UpdateWidgetSetting',
            'SavePageSetting',
            'SaveOrderFailed',
            'DeleteOrderFailed',
            'DeleteAllOrderFailed',
        ];

        for (let i = 0; i < ignoreUrls.length; i++) {
            if (url.indexOf(ignoreUrls[i]) >= 0) {
                return true;
            }
        }
        return false;
    }

    private startProgressbar(url) {
        if (BaseService.startProgressbarCount === 0) {
            BaseService.startProgressbarCount++;
            BaseService.toggleSlimLoadingBarSource.next({
                status: 'START',
                action: url,
            });
        }
    }

    private finishProgessbar(url) {
        clearTimeout(BaseService.finishProgressTimer);
        BaseService.finishProgressTimer = setTimeout(() => {
            BaseService.startProgressbarCount = 0;
            BaseService.toggleSlimLoadingBarSource.next({
                status: 'COMPLETE',
                action: url,
            });
        }, 1000);
    }

    private _mergeRequestOptions(
        defaultOptions: {
            headers?:
                | HttpHeaders
                | {
                      [header: string]: string | string[];
                  };
            observe?: 'body' | 'response' | 'events';
            params?:
                | HttpParams
                | {
                      [param: string]: string | string[];
                  };
            reportProgress?: boolean;
            responseType?: 'json' | 'arraybuffer' | 'blob' | 'text';
            withCredentials?: boolean;
        },
        overrideOptions: any,
    ) {
        if (!overrideOptions) return defaultOptions;

        if (overrideOptions.headers) {
            if (overrideOptions.headers instanceof HttpHeaders) {
                (overrideOptions.headers as HttpHeaders).keys().forEach((key: string) => {
                    defaultOptions.headers = (defaultOptions.headers as HttpHeaders).set(
                        key,
                        (overrideOptions.headers as HttpHeaders).get(key),
                    );
                });
            } else if (isObject(overrideOptions.headers)) {
                Object.keys(overrideOptions.headers).forEach((key: string) => {
                    defaultOptions.headers = (defaultOptions.headers as HttpHeaders).set(
                        key,
                        overrideOptions.headers[key],
                    );
                });
            }
        }

        const _options = {
            ...defaultOptions,
            ...overrideOptions,
        };
        _options.headers = defaultOptions.headers;
        return _options;
    }
}
