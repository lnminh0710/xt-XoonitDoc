import { Subject, Observable, from, of } from 'rxjs';

export interface FileUploadProgressOptions {
    setRequestHeader: () => { [key: string]: string };
    url: string;
    withCredentials: boolean;
    body?: any;
}

export enum FileUploadStatusEnum {
    UPLOADED = 1,
    UPLOADING = 2,
    FAILED = 3,
    CANCELLED = 4,
    INVALID = 5,
    READY_TO_UPLOAD = 6,
    OUT_OF_SESSION = 7,
}

export class FileUploadProgress {
    private _url: string;
    private _xhr: XMLHttpRequest;
    private _withCredentials: boolean;
    private _body: any;
    private _headers: { [key: string]: string };
    private _onErrorSubject: Subject<any> = new Subject<any>();
    private _onCancelledSubject: Subject<any> = new Subject<any>();
    private _onCompletedSubject: Subject<any> = new Subject<any>();
    private _invalid: boolean;
    private _response: any;
    private _status: FileUploadStatusEnum;
    private _abort: boolean;
    private _bufferProgressPercent: number;
    private _intervalTimer: NodeJS.Timer;

    public file: File;
    public originValid: boolean;
    public set invalid(val: boolean) {
        if (val) {
            this._status = FileUploadStatusEnum.INVALID;
        } else {
            this._status = FileUploadStatusEnum.READY_TO_UPLOAD;
        }
        this._invalid = val;
        // if (this._invalid) {
        //     this.isReadyToUpload = false;
        // } else {
        //     this.isReadyToUpload = true;
        // }
    }

    public get invalid(): boolean {
        return this._invalid;
    }

    public get response(): any {
        return this._response;
    }

    public get status(): FileUploadStatusEnum {
        return this._status;
    }

    public get isAborted(): boolean {
        return this._abort;
    }

    // public isUploadedDone?: boolean;
    // public isFailedUpload?: boolean;
    // public isUploading?: boolean;
    // public isCancelled: boolean;
    // public isReadyToUpload: boolean;
    public progressPercent = 0;

    constructor(options: FileUploadProgressOptions) {
        this._url = options.url;
        this._body = options.body;
        this._withCredentials = options.withCredentials;
        this._xhr = new XMLHttpRequest();
        this._xhr.withCredentials = options.withCredentials;
        this.initXHR(options);
    }

    public updateProgressPercent = (percent: number) => {
        this.progressPercent = percent;
    };

    private upload(body?: any): Observable<boolean> {
        if (this._abort) {
            return of(false);
        }

        this._body = body || this._body;
        this._xhr.open('POST', this._url, true);
        this.setXhrHeaderRequest(this._xhr, this._headers);
        const observable = this._xhr.send(this._body) as void | Observable<XMLHttpRequest>;
        if (observable instanceof Observable) {
            observable.subscribe((xhr: XMLHttpRequest) => {
                this.stopCalculatingProgressBar();
                this._handleResponse(xhr);
            });
            return of(true);
        }
        return of(true);
    }

    public uploadAsync(body?: any): Observable<FileUploadProgress> {
        return from<Promise<FileUploadProgress>>(
            new Promise((_resolve, _reject) => {
                this.upload(body).subscribe((canUpload) => {
                    if (!canUpload) {
                        _reject(this);
                    }
                });

                this._onCompletedSubject.subscribe(() => {
                    _resolve(this);
                });
                this._onCancelledSubject.subscribe(() => {
                    _reject(this);
                });
                this._onErrorSubject.subscribe(() => {
                    _reject(this);
                });
            }),
        );
    }

    public abort() {
        switch (this._status) {
            case FileUploadStatusEnum.UPLOADING:
                this._status = FileUploadStatusEnum.CANCELLED;
                break;

            // case FileUploadStatusEnum.INVALID:
            // case FileUploadStatusEnum.UPLOADED:
            //     return;

            default:
                return;
        }

        this._abort = true;
        this._xhr.abort();
    }

    public clear() {
        this._onCompletedSubject.unsubscribe();
        this._onCancelledSubject.unsubscribe();
        this._onErrorSubject.unsubscribe();
        this.removeListeners(this._xhr);
        clearInterval(this._intervalTimer);
    }

    public retryToUpload() {
        this.renewXhr();
        this.resetStatus();
        this.upload(this._body);
    }

    public resetStatus(progressPercent?: number) {
        // this.isCancelled = false;
        // this.isUploadedDone = false;
        // this.isUploading = false;
        // this.isFailedUpload = false;
        // this._invalid = false;
        if (this.isAborted || this.status === FileUploadStatusEnum.FAILED) {
            this.renewXhr();
            this._abort = this.isAborted ? false : this._abort;
        }
        this._status = FileUploadStatusEnum.READY_TO_UPLOAD;
        this.progressPercent = progressPercent && progressPercent > 0 ? progressPercent : 0;
    }

    private renewXhr() {
        this._xhr = null;
        const _xhr = new XMLHttpRequest();
        this._xhr = _xhr;
        this._xhr.withCredentials = this._withCredentials;
        this.addListeners(this._xhr);
    }

    private initXHR(options: FileUploadProgressOptions) {
        if (options.setRequestHeader) {
            this._headers = options.setRequestHeader();
        }

        this.addListeners(this._xhr);
    }

    private setXhrHeaderRequest(xhr: XMLHttpRequest, headers: { [key: string]: string }) {
        if (!headers) return;

        for (const key in headers) {
            if (headers.hasOwnProperty(key)) {
                const headerValue = headers[key];
                xhr.setRequestHeader(key, headerValue);
            }
        }
    }

    private addListeners(xhr: XMLHttpRequest) {
        xhr.upload.addEventListener('loadstart', this.beginUploading.bind(this));
        xhr.upload.addEventListener('progress', this.onProgressUploading.bind(this));
        xhr.addEventListener('load', this.uploadDone.bind(this));
        xhr.addEventListener('error', this.onErrorUploading.bind(this, xhr));
        xhr.addEventListener('abort', this.cancelUpload.bind(this));
        xhr.addEventListener('retryOutOfSession', this.retryOutOfSession.bind(this));
    }

    private removeListeners(xhr: XMLHttpRequest) {
        xhr.upload.removeEventListener('loadstart', this.beginUploading.bind(this));
        xhr.upload.removeEventListener('progress', this.onProgressUploading.bind(this));
        xhr.removeEventListener('load', this.uploadDone.bind(this));
        xhr.removeEventListener('error', this.onErrorUploading.bind(this, xhr));
        xhr.removeEventListener('abort', this.cancelUpload.bind(this));
        xhr.removeEventListener('retryOutOfSession', this.retryOutOfSession.bind(this));
    }

    protected beginUploading(event: ProgressEvent) {
        this.resetStatus();
        // this.isReadyToUpload = false;
        // this.isUploading = true;
        this._status = FileUploadStatusEnum.UPLOADING;
        // console.log(`file-upload-progress.model: beginUploading ${this.file.name}`, { event: event });
        this._intervalTimer = setInterval(() => {
            this.calcProgressBar();
        }, 100);
    }

    protected onProgressUploading(event: ProgressEvent) {
        const percent = (event.loaded * 100) / event.total;
        // this.progressPercent = Math.round(percent);
        this._bufferProgressPercent = Math.round(percent);
        // console.log(`file-upload-progress.model: onProgressUploading ${this.file.name}: ${this.progressPercent}`, { event: event });
    }

    protected uploadDone(event: ProgressEvent) {
        this.stopCalculatingProgressBar();
        const xhr = event.target as XMLHttpRequest;
        this._handleResponse(xhr);
    }

    protected onErrorUploading(xhr: XMLHttpRequest) {
        this.resetStatus(this.progressPercent);
        // this.isFailedUpload = true;

        if (xhr.status === 401) {
            // unauthorized
            this._status = FileUploadStatusEnum.OUT_OF_SESSION;
        } else {
            this._status = FileUploadStatusEnum.FAILED;
            this._onErrorSubject.next(this);
        }

        // console.log(`file-upload-progress.model: onErrorUploading ${this.file.name}`, { event: event });
        // this._onErrorSubject.next(this);
    }

    protected cancelUpload(event: ProgressEvent) {
        this.stopCalculatingProgressBar();
        // this.resetStatus(this.progressPercent);
        // this.isCancelled = true;
        this._status = FileUploadStatusEnum.CANCELLED;
        this.progressPercent = 0;
        // console.log(`file-upload-progress.model: cancelUpload ${this.file.name}`, { event: event });
        this._onCancelledSubject.next(this);
    }

    // in case unauthorized (may be access_token has expired)
    private retryOutOfSession(event: CustomEvent<XMLHttpRequest>) {
        // clear all old listeners
        this.removeListeners(this._xhr);

        // set to new xhr instance
        // update status to OUT_OF_SESSION
        // renew listeners for new instance xhr
        const renewXhr = event.detail as XMLHttpRequest;
        this._status = FileUploadStatusEnum.OUT_OF_SESSION;
        this._xhr = renewXhr;
        this.addListeners(this._xhr);
    }

    private calcProgressBar() {
        if (this.status === FileUploadStatusEnum.UPLOADING) {
            if (this.progressPercent >= this._bufferProgressPercent || this.progressPercent === 95) {
                // console.log(`%c file-upload-progress.model: this.progressPercent = ${this.progressPercent} || this.progressPercent >= this._bufferProgressPercent ${this._bufferProgressPercent}) so waiting until it finishes`, 'color: orange');
                return;
            }
            if (this.progressPercent < this._bufferProgressPercent) {
                this.progressPercent += 1;
            } else {
            }
            return;
        }
    }

    private stopCalculatingProgressBar() {
        clearInterval(this._intervalTimer);
    }

    private _handleResponse(xhr: XMLHttpRequest) {
        try {
            this._response = JSON.parse(xhr.response);
            if (!this._isValidResponse(this._response)) {
                this.onErrorUploading(xhr);
                return;
            }
        } catch (error) {
            if (xhr.status !== 200) {
                this.onErrorUploading(xhr);
                return;
            }
        }

        this.progressPercent = 100;

        // delay to update to show transition width to 100 (this.progressPercent). Then update status file to UPLOADED
        setTimeout(() => {
            this.resetStatus(this.progressPercent);
            // this.isUploadedDone = true;
            this._status = FileUploadStatusEnum.UPLOADED;
            // console.log(`file-upload-progress.model: uploadDone ${this.file.name}`, { event: event });
            this._onCompletedSubject.next(this);
        }, 500);
    }

    private _isValidResponse(response: any) {
        if (response.statusCode !== 1) {
            return false;
        }
        return true;
    }
}
