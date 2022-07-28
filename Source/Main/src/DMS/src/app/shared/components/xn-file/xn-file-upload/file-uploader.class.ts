import {
    FileLikeObject
} from './file-like-object.class';
import {
    FileItem
} from './file-item.class';
import {
    FileType
} from './file-type.class';

function isFile(value: any): boolean {
    return (File && value instanceof File);
}
export interface Headers {
    name: string;
    value: string;
}

export interface ParsedResponseHeaders {
    [headerFieldName: string]: string
}

export interface FilterFunction {
    name: string,
    fn: (item?: FileLikeObject, options?: FileUploaderOptions) => boolean
}

export interface FileUploaderOptions {
    allowedMimeType?: Array < string > ;
    allowedFileType?: Array < string > ;
    autoUpload?: boolean;
    isHTML5?: boolean;
    filters?: Array < FilterFunction > ;
    headers?: Array < Headers > ;
    method?: string;
    authToken?: string;
    maxFileSize?: number;
    queueLimit?: number;
    removeAfterUpload?: boolean;
    url?: string;
    disableMultipart?: boolean;
    itemAlias?: string;
    authTokenHeader?: string;
    additionalParameter?: {
        [key: string]: any
    };
    // If true, only read data from client without uploading.
    readDataMode?: boolean;
}

export class FileUploader {

    public authToken: string;
    public isUploading = false;
    public queue: Array < FileItem > = [];
    public progress = 0;
    public _nextIndex = 0;
    public autoUpload: any;
    public authTokenHeader: string;

    public options: FileUploaderOptions = {
        autoUpload: false,
        isHTML5: true,
        filters: [],
        removeAfterUpload: false,
        disableMultipart: false,
        readDataMode: false
    };

    protected _failFilterIndex: number;

    public constructor(options: FileUploaderOptions) {
        this.setOptions(options);
    }

    public setOptions(options: FileUploaderOptions): void {
        this.options = Object.assign(this.options, options);

        this.authToken = options.authToken;
        this.authTokenHeader = options.authTokenHeader || 'Authorization';
        this.autoUpload = options.autoUpload;
        this.options.filters.unshift({
            name: 'queueLimit',
            fn: this._queueLimitFilter
        });

        if (this.options.maxFileSize) {
            this.options.filters.unshift({
                name: 'fileSize',
                fn: this._fileSizeFilter
            });
        }

        if (this.options.allowedFileType) {
            this.options.filters.unshift({
                name: 'fileType',
                fn: this._fileTypeFilter
            });
        }

        if (this.options.allowedMimeType) {
            this.options.filters.unshift({
                name: 'mimeType',
                fn: this._mimeTypeFilter
            });
        }

        for (let i = 0; i < this.queue.length; i++) {
            this.queue[i].url = this.options.url;
        }
    }

    public addToQueue(files: File[], options?: FileUploaderOptions, filters?: FilterFunction[] | string): void {
        const list: File[] = [];
        for (const file of files) {
            list.push(file);
        }
        const arrayOfFilters = this._getFilters(filters);
        const count = this.queue.length;
        const addedFileItems: FileItem[] = [];
        this.removeUploadedFilesFromQueue();
        list.map((some: File) => {
            if (!options) {
                options = this.options;
            }

            const temp = new FileLikeObject(some);
            if (this._isValidFile(temp, arrayOfFilters, options)) {
                const fileItem = new FileItem(this, some, options);
                addedFileItems.push(fileItem);
                this.queue.push(fileItem);
                this._onAfterAddingFile(fileItem);
            } else {
                const filter = arrayOfFilters[this._failFilterIndex];
                this._onWhenAddingFileFailed(temp, filter, options);
            }
        });
        if (this.queue.length !== count) {
            this._onAfterAddingAll(addedFileItems);
            this.progress = this._getTotalProgress();
        }
        this._render();
        if (this.options.autoUpload) {
            this.uploadAll();
        }
    }

    public removeFromQueue(value: FileItem): void {
        const index = this.getIndexOfItem(value);
        const item = this.queue[index];
        if (item.isUploading) {
            item.cancel();
        }
        this.queue.splice(index, 1);
        this.progress = this._getTotalProgress();
    }

    public removeUploadedFilesFromQueue(): void {
        const temp = this.queue.filter((item) => !item.isSuccess);
        this.queue = temp;
    }

    public clearQueue(): void {
        while (this.queue.length) {
            this.queue[0].remove();
        }
        this.progress = 0;
    }

    public uploadItem(value: FileItem): void {
        const index = this.getIndexOfItem(value);
        const item = this.queue[index];
        item._prepareToUploading();
        if (this.isUploading) {
            return;
        }
        this.isUploading = true;
        if (this.options.readDataMode) {
            this.readDataFile(item);
        } else {
            const transport = this.options.isHTML5 ? '_xhrTransport' : '_iframeTransport';
            (this as any)[transport](item);
        }
    }

    public cancelItem(value: FileItem): void {
        const index = this.getIndexOfItem(value);
        const item = this.queue[index];
        const prop = this.options.isHTML5 ? item._xhr : item._form;
        if (item && item.isUploading) {
            prop.abort();
        }
    }

    public uploadAll(): void {
        const items = this.getNotUploadedItems().filter((item: FileItem) => !item.isUploading);
        if (!items.length) {
            return;
        }
        items.map((item: FileItem) => item._prepareToUploading());
        items[0].upload();
    }

    public cancelAll(): void {
        const items = this.getNotUploadedItems();
        items.map((item: FileItem) => item.cancel());
    }

    public isFile(value: any): boolean {
        return isFile(value);
    }

    public isFileLikeObject(value: any): boolean {
        return value instanceof FileLikeObject;
    }

    public getIndexOfItem(value: any): number {
        return typeof value === 'number' ? value : this.queue.indexOf(value);
    }

    public getNotUploadedItems(): Array < any > {
        return this.queue.filter((item: FileItem) => !item.isUploaded);
    }

    public getReadyItems(): Array < any > {
        return this.queue
            .filter((item: FileItem) => (item.isReady && !item.isUploading))
            .sort((item1: any, item2: any) => item1.index - item2.index);
    }

    public destroy(): void {
        return void 0;
        /*forEach(this._directives, (key) => {
         forEach(this._directives[key], (object) => {
         object.destroy();
         });
         });*/
    }

    public onAfterAddingAll(fileItems: any): any {
        return {
            fileItems
        };
    }

    public onBuildItemForm(fileItem: FileItem, form: any): any {
        return {
            fileItem,
            form
        };
    }

    public onAfterAddingFile(fileItem: FileItem): any {
        return {
            fileItem
        };
    }

    public onWhenAddingFileFailed(item: FileLikeObject, filter: any, options: any): any {
        return {
            item,
            filter,
            options
        };
    }

    public onBeforeUploadItem(fileItem: FileItem): any {
        return {
            fileItem
        };
    }

    public onProgressItem(fileItem: FileItem, progress: any): any {
        return {
            fileItem,
            progress
        };
    }

    public onProgressAll(progress: any): any {
        return {
            progress
        };
    }

    public onSuccessItem(item: FileItem, response: string, status: number, headers: ParsedResponseHeaders): any {
        return {
            item,
            response,
            status,
            headers
        };
    }

    public onErrorItem(item: FileItem, response: string, status: number, headers: ParsedResponseHeaders): any {
        return {
            item,
            response,
            status,
            headers
        };
    }

    public onCancelItem(item: FileItem, response: string, status: number, headers: ParsedResponseHeaders): any {
        return {
            item,
            response,
            status,
            headers
        };
    }

    public onCompleteItem(item: FileItem, response: string, status: number, headers: ParsedResponseHeaders): any {
        return {
            item,
            response,
            status,
            headers
        };
    }

    public onCompleteAll(): any {
        return void 0;
    }

    public _mimeTypeFilter(item: FileLikeObject): boolean {
        return !(this.options.allowedMimeType && this.options.allowedMimeType.indexOf(item.type) === -1);
    }

    public _fileSizeFilter(item: FileLikeObject): boolean {
        return !(this.options.maxFileSize && item.size > this.options.maxFileSize);
    }

    public _fileTypeFilter(item: FileLikeObject): boolean {
        return !(this.options.allowedFileType &&
            this.options.allowedFileType.indexOf(FileType.getMimeClass(item)) === -1);
    }

    public _onErrorItem(item: FileItem, response: string, status: number, headers: ParsedResponseHeaders): void {
        item._onError(response, status, headers);
        this.onErrorItem(item, response, status, headers);
    }

    public _onCompleteItem(item: FileItem, response: string, status: number, headers: ParsedResponseHeaders): void {
        item._onComplete(response, status, headers);
        this.onCompleteItem(item, response, status, headers);
        const nextItem = this.getReadyItems()[0];
        this.isUploading = false;
        if (nextItem) {
            nextItem.upload();
            return;
        }
        this.onCompleteAll();
        this.progress = this._getTotalProgress();
        this._render();
    }

    protected _headersGetter(parsedHeaders: ParsedResponseHeaders): any {
        return (name: any): any => {
            if (name) {
                return parsedHeaders[name.toLowerCase()] || void 0;
            }
            return parsedHeaders;
        };
    }

    protected readDataFile(item: FileItem) {
        const reader = new FileReader();
        this._onBeforeUploadItem(item);
        reader.onload = () => {
            const response = reader.result;
            this._onSuccessItem(item, response as string, 200, null);
            this._onCompleteItem(item, response as string, 200, null);
        }

        const mimeType = FileType.getMimeClass(item._file);
        if (mimeType == 'text') {
            reader.readAsText(item._file);
        } else {
            reader.readAsBinaryString(item._file);
        }
    }

    protected _xhrTransport(item: FileItem): any {
        const xhr = item._xhr = new XMLHttpRequest();
        let sendable: any;
        this._onBeforeUploadItem(item);
        // todo
        /*item.formData.map(obj => {
         obj.map((value, key) => {
         form.append(key, value);
         });
         });*/
        if (typeof item._file.size !== 'number') {
            throw new TypeError('The file specified is no longer valid');
        }
        if (!this.options.disableMultipart) {
            sendable = new FormData();
            this._onBuildItemForm(item, sendable);

            sendable.append(item.alias, item._file, item.file.name);

            if (this.options.additionalParameter !== undefined) {
                Object.keys(this.options.additionalParameter).forEach((key: string) => {
                    sendable.append(key, this.options.additionalParameter[key]);
                });
            }
        } else {
            sendable = item._file;
        }

        xhr.upload.onprogress = (event: any) => {
            const progress = Math.round(event.lengthComputable ? event.loaded * 100 / event.total : 0);
            this._onProgressItem(item, progress);
        };
        xhr.onload = () => {
            const headers = this._parseHeaders(xhr.getAllResponseHeaders());
            const response = this._transformResponse(xhr.response, headers);
            const gist = this._isSuccessCode(xhr.status) ? 'Success' : 'Error';
            const method = '_on' + gist + 'Item';
            (this as any)[method](item, response, xhr.status, headers);
            this._onCompleteItem(item, response, xhr.status, headers);
        };
        xhr.onerror = () => {
            const headers = this._parseHeaders(xhr.getAllResponseHeaders());
            const response = this._transformResponse(xhr.response, headers);
            this._onErrorItem(item, response, xhr.status, headers);
            this._onCompleteItem(item, response, xhr.status, headers);
        };
        xhr.onabort = () => {
            const headers = this._parseHeaders(xhr.getAllResponseHeaders());
            const response = this._transformResponse(xhr.response, headers);
            this._onCancelItem(item, response, xhr.status, headers);
            this._onCompleteItem(item, response, xhr.status, headers);
        };
        xhr.open(item.method, item.url, true);
        xhr.withCredentials = item.withCredentials;
        if (this.options.headers) {
            for (const header of this.options.headers) {
                xhr.setRequestHeader(header.name, header.value);
            }
        }
        if (item.headers.length) {
            for (const header of item.headers) {
                xhr.setRequestHeader(header.name, header.value);
            }
        }
        if (this.authToken) {
            xhr.setRequestHeader(this.authTokenHeader, this.authToken);
        }
        xhr.send(sendable);
        this._render();
    }

    protected _getTotalProgress(value: number = 0): number {
        if (this.options.removeAfterUpload) {
            return value;
        }
        const notUploaded = this.getNotUploadedItems().length;
        const uploaded = notUploaded ? this.queue.length - notUploaded : this.queue.length;
        const ratio = 100 / this.queue.length;
        const current = value * ratio / 100;
        return Math.round(uploaded * ratio + current);
    }

    protected _getFilters(filters: FilterFunction[] | string): FilterFunction[] {
        if (!filters) {
            return this.options.filters;
        }
        if (Array.isArray(filters)) {
            return filters;
        }
        if (typeof filters === 'string') {
            const names = filters.match(/[^\s,]+/g);
            return this.options.filters
                .filter((filter: any) => names.indexOf(filter.name) !== -1);
        }
        return this.options.filters;
    }

    protected _render(): any {
        return void 0;
    }

    protected _queueLimitFilter(): boolean {
        return this.options.queueLimit === undefined || this.queue.length < this.options.queueLimit;
    }

    protected _isValidFile(file: FileLikeObject, filters: FilterFunction[], options: FileUploaderOptions): boolean {
        this._failFilterIndex = -1;
        return !filters.length ? true : filters.every((filter: FilterFunction) => {
            this._failFilterIndex++;
            return filter.fn.call(this, file, options);
        });
    }

    protected _isSuccessCode(status: number): boolean {
        return (status >= 200 && status < 300) || status === 304;
    }

    /* tslint: disable */
    protected _transformResponse(response: string, headers: ParsedResponseHeaders): string {
        // todo:  ?
        /*var headersGetter = this._headersGetter(headers);
         forEach($http.defaults.transformResponse, (transformFn) => {
         response = transformFn(response, headersGetter);
         });*/
        return response;
    }

    /* tslint: enable */
    protected _parseHeaders(headers: string): ParsedResponseHeaders {
        const parsed: any = {};
        let key: any;
        let val: any;
        let i: any;
        if (!headers) {
            return parsed;
        }
        headers.split('\n').map((line: any) => {
            i = line.indexOf(': ');
            key = line.slice(0, i).trim().toLowerCase();
            val = line.slice(i + 1).trim();
            if (key) {
                parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
            }
        });
        return parsed;
    }

    /*protected _iframeTransport(item: FileItem) {
     // todo:  implement it later
     }*/

    protected _onWhenAddingFileFailed(item: FileLikeObject, filter: any, options: any): void {
        this.onWhenAddingFileFailed(item, filter, options);
    }

    protected _onAfterAddingFile(item: FileItem): void {
        this.onAfterAddingFile(item);
    }

    protected _onAfterAddingAll(items: any): void {
        this.onAfterAddingAll(items);
    }

    protected _onBeforeUploadItem(item: FileItem): void {
        item._onBeforeUpload();
        this.onBeforeUploadItem(item);
    }

    protected _onBuildItemForm(item: FileItem, form: any): void {
        item._onBuildForm(form);
        this.onBuildItemForm(item, form);
    }

    protected _onProgressItem(item: FileItem, progress: any): void {
        const total = this._getTotalProgress(progress);
        this.progress = total;
        item._onProgress(progress);
        this.onProgressItem(item, progress);
        this.onProgressAll(total);
        this._render();
    }

    /* tslint: disable */
    protected _onSuccessItem(item: FileItem, response: string, status: number, headers: ParsedResponseHeaders): void {
        item._onSuccess(response, status, headers);
        this.onSuccessItem(item, response, status, headers);
    }

    /* tslint: enable */
    protected _onCancelItem(item: FileItem, response: string, status: number, headers: ParsedResponseHeaders): void {
        item._onCancel(response, status, headers);
        this.onCancelItem(item, response, status, headers);
    }
}
