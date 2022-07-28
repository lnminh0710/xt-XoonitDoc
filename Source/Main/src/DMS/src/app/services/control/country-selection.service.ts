import { Injectable, Injector } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from '../base.service';

@Injectable()
export class CountrySelectionService extends BaseService {
    constructor(injector: Injector) {
        super(injector);
    }

    public getSelectionProjectCountry(idKeyValue: any, idSelectionWidget?: any): Observable<any> {
        return this.get<any>(this.serUrl.getSelectionProjectCountry, { idKeyValue: idKeyValue, idSelectionWidget: idSelectionWidget}, null, null);
    }

    public getCountryGroupsList(idRepCountryLangaugeGroupsName): Observable<any> {
        return this.get<any>(this.serUrl.getCountryGroupsList, { idRepCountryLangaugeGroupsName: idRepCountryLangaugeGroupsName }, null, null);
    }

    public getCountryGroupsName(idSelectionProject): Observable<any> {
        return this.get<any>(this.serUrl.getCountryGroupsName, { idSelectionProject: idSelectionProject }, null, null);
    }

    public saveCountryGroups(group, countries): Observable<any> {
        return this.post<any>(this.serUrl.saveCountryGroups, JSON.stringify({
            GroupsName: group.groupName,
            IdRepCountryLangaugeGroupsName: group.groupId,
            ProjectCoutry: countries
        }));
    }

    public saveProjectCountry(data: any): Observable<any> {
        return this.post<any>(this.serUrl.saveProjectCountry, JSON.stringify(data));
    }
}
