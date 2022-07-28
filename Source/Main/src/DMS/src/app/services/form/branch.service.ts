import { Injectable, Injector } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from '../base.service';

@Injectable()
export class BranchService extends BaseService {
    constructor(injector: Injector) {
        super(injector);
    }

    public getBranchByHeadquarter(idHeadquarter: any): Observable<any> {
        return this.get<any>(this.serUrl.getBranchByHeadquarter, { idHeadquarter });
    }

    public updateBranch(params: any): Observable<any> {
        return this.post<any>(this.serUrl.getBranchByHeadquarter, params);
    }
}
