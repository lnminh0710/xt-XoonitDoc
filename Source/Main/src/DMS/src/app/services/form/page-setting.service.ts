import { Injectable, Injector } from '@angular/core';
import { BaseService } from '../base.service';
import { Observable } from 'rxjs';
import { PageSetting } from '@app/models';
import { map } from 'rxjs/operators';

@Injectable()
export class PageSettingService extends BaseService {
    constructor(injector: Injector) {
        super(injector);
    }

    public getPageSettingById(pageId: string): Observable<PageSetting> {
        return this.get<PageSetting>(this.serUrl.getPageSettingById, {
            pageId: pageId,
        }).pipe(
            map((result: any) => {
                return result.item;
            }),
        );
    }

    public savePageSetting(pageSetting: PageSetting): Observable<any> {
        return this.post<any>(this.serUrl.savePageSetting, JSON.stringify(pageSetting)).pipe(
            map((result: any) => {
                return result.item;
            }),
        );
    }
}
