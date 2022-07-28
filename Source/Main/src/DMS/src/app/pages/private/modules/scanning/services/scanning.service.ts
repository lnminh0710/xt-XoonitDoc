import { Injectable, Injector } from '@angular/core';
import { BaseService } from '@app/services';
import { Observable } from 'rxjs';
import { ApiResultResponse } from '@app/models';

@Injectable()
export class ScanningService extends BaseService {

    constructor(injector: Injector) {
        super(injector);
    }

    public getThumbnails(): Observable<ApiResultResponse> {
        const params: any = {};
        const url = this.serUrl.getThumbnails;

        return this.get<any>(url, params);
    }

    public uploadImageScan(params: any): Observable<ApiResultResponse> {
        const url = this.serUrl.uploadImageScan;
        return this.post<any>(url, params);
    }

    public getScanSetting(): Observable<ApiResultResponse> {
        const url = this.serUrl.getScanSetting;
        return this.get<any>(url);
    }

    public setScanSetting(params: any): Observable<ApiResultResponse> {
        const url = this.serUrl.saveScanSetting;
        return this.post<any>(url, params);
    }
}
