import { Injectable, Injector } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from '../base.service';

@Injectable()
export class ProjectService extends BaseService {
    constructor(injector: Injector) {
        super(injector);
    }

    public getSelectionProject(idSelectionProject): Observable<any> {
        return this.get<any>(this.serUrl.getSelectionProject, { idSelectionProject });
    }

    public getMediaCodePricing(idSelectionProject, idSelectionProjectCountry): Observable<any> {
        return this.get<any>(this.serUrl.getMediaCodePricing, { idSelectionProject, idSelectionProjectCountry });
    }

    public saveProject(data): Observable<any> {
        return this.post<any>(this.serUrl.saveProject, JSON.stringify(data));
    }

    public saveMediaCodePricing(data): Observable<any> {
        return this.post<any>(this.serUrl.saveMediaCodePricing, JSON.stringify(data));
    }
}
