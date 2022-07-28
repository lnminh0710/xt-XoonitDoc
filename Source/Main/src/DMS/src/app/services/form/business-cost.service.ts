import { Injectable, Injector} from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from '../base.service';
import isNil from 'lodash-es/isNil';

@Injectable()
export class BusinessCostService extends BaseService {
    constructor(injector: Injector) {
        super(injector);
    }

    public getBusinessCosts(id: any, _isWrap?: boolean): Observable<any> {
        if (isNil(_isWrap))
            _isWrap = false;
        return this.get<any>(this.serUrl.getCampaignCosts, {
            idBusinessCosts: id,
            isWrap: _isWrap
        });
    }

    public getBusinessCostsItem(idBusinessCosts: any): Observable<any> {
        return this.get<any>(this.serUrl.getBusinessCostsItem, {
            idBusinessCosts: idBusinessCosts
        });
    }
    public getBusinessCostsCountries(idBusinessCostsItems: any, idSalesCampaignWizard: any): Observable<any> {
        return this.get<any>(this.serUrl.getBusinessCostsCountries, {
            idBusinessCostsItems: idBusinessCostsItems,
            idSalesCampaignWizard: idSalesCampaignWizard
        });
    }

    public getFilesByBusinessCostsId(idBusinessCosts: any): Observable<any> {
        return this.get<any>(this.serUrl.getFilesByBusinessCostsId, {
            idBusinessCosts: idBusinessCosts
        });
    }

    public saveFilesByBusinessCostsId(data: any): Observable<any> {
        return this.post<any>(this.serUrl.saveFilesByBusinessCostsId, JSON.stringify(data));
    }

    public saveBusinessCostsItem(data: any): Observable<any> {
        return this.post<any>(this.serUrl.saveBusinessCostsItem, JSON.stringify(data));
    }
}
