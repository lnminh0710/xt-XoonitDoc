import { Injectable, Injector} from '@angular/core';
import { Observable } from 'rxjs';
import { PersonModel, ApiResultResponse } from '@app/models';
import { BaseService } from '../base.service';
import { Uti } from '@app/utilities';
import { map } from 'rxjs/operators';

@Injectable()
export class WareHuoseMovementService extends BaseService {
    constructor(injector: Injector) {
        super(injector);
    }

    public sortingGoods(idWarehouseMovement?: number): Observable<any> {
        return this.get<any>(this.serUrl.sortingGoods, {
            idWarehouseMovement: idWarehouseMovement
        });
    }

    public stockedArticles(idWarehouseMovementGoodsIssue?: number): Observable<any> {
        return this.get<any>(this.serUrl.stockedArticles, {
            idWarehouseMovementGoodsIssue: idWarehouseMovementGoodsIssue
        });
    }

    public searchArticles(searchString: string, idPersonFromWarehouse?: number): Observable<any> {
        return this.get<any>(this.serUrl.searchArticles, {
            searchString: searchString,
            idPersonFromWarehouse: idPersonFromWarehouse
        }).pipe(map((result: any) => {
            return result.item;
        }));
    }

    public saveWarehouseMovement(data: any): Observable<any> {
        return this.post<any>(this.serUrl.saveWarehouseMovement, JSON.stringify(data)).pipe(map((result: any) => {
            return result.item;
        }));
    }

    public saveGoodsReceiptPosted(data: any): Observable<any> {
        return this.post<any>(this.serUrl.saveGoodsReceiptPosted, JSON.stringify(data)).pipe(map((result: any) => {
            return result.item;
        }));
    }

    public confirmGoodsReceiptPosted(data: any): Observable<any> {
        return this.post<any>(this.serUrl.confirmGoodsReceiptPosted, JSON.stringify(data)).pipe(map((result: any) => {
            return result.item;
        }));
    }
}
