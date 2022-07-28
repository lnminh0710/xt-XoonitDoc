import { Injectable, Injector } from '@angular/core';
import { ApiResultResponse } from '@app/models';
import { Observable } from 'rxjs';
import { BaseService } from '../base.service';

@Injectable()
export class AttachmentViewerService extends BaseService {

    constructor(injector: Injector) {
        super(injector);
    }

    public getPdfFile(name: string) {
        const options = {};
        options['responseType'] = 'blob';
    
        return this.getV2<any>(
            `${this.serUrl.getAttachmentFile}?name=${name.replace(/&/gi, "%26")}`,
            options,
        );
    }

    public sendMail(params: any): Observable<ApiResultResponse> {
        const url = this.serUrl.sendMailDocument;

        return this.post<any>(url, params);
    }
}
