import { Injectable, Injector } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from '../base.service';

@Injectable()
export class FrequencyService extends BaseService {
    constructor(injector: Injector) {
        super(injector);
    }

    public rebuildFrequencies(idSelectionProject): Observable<any> {
        return this.get<any>(this.serUrl.rebuildFrequencies, { idSelectionProject });
    }

    public getFrequencyBusyIndicator(idSelectionProject): Observable<any> {
        return this.get<any>(this.serUrl.getFrequencyBusyIndicator, { idSelectionProject });
    }

    public getFrequency(idSelectionProject, idSelectionProjectCountry): Observable<any> {
        return this.get<any>(this.serUrl.getFrequency, { idSelectionProject, idSelectionProjectCountry });
    }

    public saveFrequency(frequency): Observable<any> {
        return this.post<any>(this.serUrl.saveFrequency, JSON.stringify(frequency));
    }
}
