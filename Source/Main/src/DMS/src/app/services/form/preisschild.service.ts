import { Injectable, Injector } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from '../base.service';

@Injectable()
export class PreissChildService extends BaseService {
    constructor(injector: Injector) {
        super(injector);
    }

    public createPriceTag(params: any): Observable<any> {
        return this.post<any>(this.serUrl.priceTag, params);
    }

    public getPriceTag(IdPriceTag: any): Observable<any> {
        return this.get<any>(this.serUrl.priceTag, { IdPriceTag });
    }

    public getAttachmentByPriceTag(IdPriceTag: any): Observable<any> {
        return this.get<any>(this.serUrl.priceTagAttachment, { IdPriceTag });
    }
    
}
