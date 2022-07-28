import { Injectable, Injector } from '@angular/core';
import { Observable } from 'rxjs';
import { Customer, PersonModel } from '@app/models';
import { BaseService } from '../base.service';
import { map } from 'rxjs/operators';

@Injectable()
export class StockCorrectionService extends BaseService {
    constructor(injector: Injector) {
        super(injector);
    }

    public getWarehouseArticle(articleNr: string, warehouseId?: number): Observable<any> {
        return this.get<any>(this.serUrl.getWarehouseArticle, {
            articleNr: articleNr,
            warehouseId: warehouseId,
        }).pipe(
            map((result: any) => {
                return result.item;
            }),
        );
    }

    public saveStockCorrection(stockCorrectionModel: any): Observable<any> {
        return this.post<any>(this.serUrl.saveStockCorrection, JSON.stringify(stockCorrectionModel)).pipe(
            map((result: any) => {
                return result.item;
            }),
        );
    }
}
