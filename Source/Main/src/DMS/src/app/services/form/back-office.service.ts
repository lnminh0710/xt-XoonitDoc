import { Injectable, Injector } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Customer, PersonModel } from '@app/models';
import { BaseService } from '../base.service';
import { map } from 'rxjs/operators';

@Injectable()
export class BackOfficeService extends BaseService {
    constructor(injector: Injector) {
        super(injector);
    }

    public getEmailTemplates(param: string): Observable<any> {
        return of({}).pipe(
            map((object) => {
                return object;
            }),
        );
    }

    public getEmailPlaceholder(): Observable<any> {
        return of({}).pipe(
            map((object) => {
                return object;
            }),
        );
    }

    public saveEmailTemplate(data: any): Observable<any> {
        return of({ returnValue: 1 }).pipe(
            map((object) => {
                return object;
            }),
        );
    }

    public saveBackOfficeEmail(data: any): Observable<any> {
        return of({ returnValue: 1 }).pipe(
            map((object) => {
                return object;
            }),
        );
    }

    public createRefundPayment(data: any): Observable<any> {
        return of({ returnValue: 1 }).pipe(
            map((object) => {
                return object;
            }),
        );
    }

    public saveUnblockOrder(idSalesOrder: any, isDelete?: boolean): Observable<any> {
        return this.post<any>(this.serUrl.saveUnblockOrder, JSON.stringify({}), {
            idSalesOrder: idSalesOrder,
            isDelete: isDelete,
        }).pipe(
            map((result: any) => {
                return result.item;
            }),
        );
    }

    public confirmGoodsReceiptPosted(idWarehouseMovement): Observable<any> {
        return this.post<any>(
            this.serUrl.confirmGoodsReceiptPosted,
            JSON.stringify({ ConfirmGoodsReceiptPosted: { IdWarehouseMovement: idWarehouseMovement } }),
        );
    }
}
