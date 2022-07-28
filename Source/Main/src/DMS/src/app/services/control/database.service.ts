import { Injectable, Injector } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from '../base.service';

@Injectable()
export class DatabaseService extends BaseService {
    constructor(injector: Injector) {
        super(injector);
    }

    public getListOfDatabaseNames(idSelectionProject): Observable<any> {
        return this.get<any>(this.serUrl.getListOfDatabaseNames, { idSelectionProject: idSelectionProject });
    }

    public getListOfDatabaseCountry(idSelectionProject, idSelectionDatabaseName): Observable<any> {
        return this.get<any>(this.serUrl.getListOfDatabaseCountry, { IdSelectionProject: idSelectionProject, IdSelectionDatabaseName: idSelectionDatabaseName });
    }

    public saveProjectDatabase(database): Observable<any> {
        return this.post<any>(this.serUrl.saveProjectDatabase, JSON.stringify(database));
    }
}
