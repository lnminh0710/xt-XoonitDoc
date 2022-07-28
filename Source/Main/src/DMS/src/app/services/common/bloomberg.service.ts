import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from '../base.service';

@Injectable()
export class BloombergService extends BaseService {
    public getExchangeMoney(baseCurrency: string, exchangeStr: any): Observable<any> {
        return this.get<any>(this.serUrl.getExchangeMoney, {
            exchangeStr: exchangeStr,
            baseCurrency: baseCurrency
        });
    }
}

