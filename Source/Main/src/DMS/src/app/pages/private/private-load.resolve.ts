import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, forkJoin, of } from 'rxjs';
import { AccessRightsService, SignalRService, CommonService } from '@app/services';
import { map } from 'rxjs/operators';
import { Uti } from '../../utilities';

@Injectable()
export class PrivateLoadResolve implements Resolve<any> {
    private isLoaded = false;
    constructor(
        //private accessRightsService: AccessRightsService,
        private commonService: CommonService,
        private signalRService: SignalRService,
    ) { }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        if (this.isLoaded) {
            return of(null);
        }

        // console.log('PrivateLoadResolve: ' + new Date());
        Uti.defineBrowserTabId();
        this.signalRService.initHub();

        const observableBatch = [];
        //observableBatch.push(this.accessRightsService.loadUserData());
        //observableBatch.push(this.accessRightsService.loginByUserId());
        observableBatch.push(
            this.commonService.getModuleToPersonType().pipe(
                map((result: any) => {
                    this.commonService.mappingDataForModuleToPersonType(result.item);
                    this.isLoaded = true;
                    return result;
                }),
            ),
        );

        return forkJoin(observableBatch);
    }
}
