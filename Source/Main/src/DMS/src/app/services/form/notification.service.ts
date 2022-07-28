import { Injectable, Injector } from '@angular/core';
import { Observable, of } from 'rxjs';
import { BaseService } from '../base.service';
import { ApiResultResponse } from '@app/models';
import { Configuration } from '@app/app.constants';
import { map } from 'rxjs/operators';

@Injectable()
export class NotificationService extends BaseService {
    constructor(injector: Injector) {
        super(injector);
    }

    public getNotifications(data: any): Observable<ApiResultResponse> {
        if (Configuration.PublicSettings.isSelectionProject) return of(null);

        return this.get<any>(this.serUrl.getNotifications, data);
    }

    public createNotification(data: any): Observable<any> {
        return this.post<any>(this.serUrl.createNotification, JSON.stringify(data));
    }

    public setArchivedNotifications(data: any): Observable<any> {
        return this.post<any>(this.serUrl.setArchivedNotifications, JSON.stringify(data));
    }

    public getApproveInvoices(options: any): Observable<any> {
        return this.get<any>(this.serUrl.getApproveInvoices, options).pipe(
            map((data: ApiResultResponse) => {
                if (data.statusCode !== 1) return null;
                return data.item;
            }),
        );
    }

    public getApproveInvoiceCounter(options: any): Observable<any> {
        return this.get<any>(this.serUrl.approveInvoiceCounter, options).pipe(
            map((data: ApiResultResponse) => {
                if (data.statusCode !== 1) return null;
                return data.item;
            }),
        );
    }
}
