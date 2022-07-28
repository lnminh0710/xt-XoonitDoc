import { Injectable, Injector } from '@angular/core';
import { BaseService } from '@app/services';
import { Observable } from 'rxjs';
import { ApiResultResponse } from '@app/models';
import { CloudTypeEnum } from '../models/cloud-configuration.model';

@Injectable()
export class CloudConfigurationService extends BaseService {
    constructor(injector: Injector) {
        super(injector);
    }

    public getAllClouds(): Observable<ApiResultResponse> {
        const params: any = {};
        const url = this.serUrl.getAllCloud;

        return this.get<any>(url, params);
    }

    public getCloudConnection(cloudId: any): Observable<ApiResultResponse> {
        const params: any = { idCloudProviders: cloudId };
        const url = this.serUrl.GetCloudConnection;

        return this.get<any>(url, params);
    }

    public saveCloudConnection(params: any): Observable<ApiResultResponse> {
        const url = this.serUrl.SaveCloudConnection;

        return this.post<any>(url, params);
    }

    public testCloudConnection(params: any): Observable<ApiResultResponse> {
        const url = this.serUrl.testCloudConnection;

        return this.post<any>(url, params);
    }

    public getStatusCloudConnection(): Observable<ApiResultResponse> {
        const url = this.serUrl.getStatusCloudConnection;
        return this.get<any>(url);
    }

    public getFileFromCloud(options: any): any {
        const url = this.serUrl.getFileFromCloud;
        // const options: any = {
        //     CloudFilePath:
        //         '{\"typeCloud\":\"mycloud\",\"viewDocInfo\":\"{\\\"SharedCode\\\":\\\"S00967E0BA7EE14B6C456B6C2FA8B42115F6809CBB6\\\",\\\"ItemId\\\":\\\"01HAQPWYFPD27KVGJFOBEKSBV6SVWCDK72\\\"}\"}',
        //     CloudmediaPath: 'My History',
        //     CloudmediaName: 'Scan_001559.tiff.pdf',
        // };

        return this.post<any>(url, options, null, null, true);
    }

    public getCloudConfigurationSetting(cloudType: CloudTypeEnum): Observable<ApiResultResponse> {
        return this.get<any>(this.serUrl.getConfigurationCloud, { cloudType });
    }
}
