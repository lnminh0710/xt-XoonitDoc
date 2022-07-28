import { Injectable, Injector} from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from '../base.service';

@Injectable()
export class BlockedOrderService extends BaseService {
    constructor(injector: Injector) {
        super(injector);
    }

    public getTextTemplate(idRepSalesOrderStatus?: number): Observable<any> {
        return this.get<any>(this.serUrl.getTextTemplate, {
            idRepSalesOrderStatus: idRepSalesOrderStatus
        });
    }

    public getMailingListOfPlaceHolder(): Observable<any> {
        return this.get<any>(this.serUrl.getMailingListOfPlaceHolder);
    }

    public saveTextTemplate(emailTemplateModel: any): Observable<any> {
        return this.post<any>(this.serUrl.saveTextTemplate, JSON.stringify(emailTemplateModel));
    }
}
