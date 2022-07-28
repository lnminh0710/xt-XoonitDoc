import { Injectable, Injector } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from '../base.service';
import {
    MatchingCountry,
    ScanAssignmentUserLanguageCountry
} from '@app/models';
import { map } from 'rxjs/operators';

@Injectable()
export class ToolsService extends BaseService {
    constructor(injector: Injector) {
        super(injector);
    }

    public getAllScanCenters(mode: string): Observable<any> {
        return this.get<any>(this.serUrl.getAllScanCenters, {
            mode: mode
        }).pipe(map((result: any) => {
            return result.item;
        }));
    }

    public getScanCenterPools(idScanCenter: string): Observable<any> {
        return this.get<any>(this.serUrl.getScanCenterPools, {
            idScanCenter: idScanCenter
        }).pipe(map((result: any) => {
            return result.item;
        }));
    }

    public getAllScanDataEntryCenters(): Observable<any> {
        return this.get<any>(this.serUrl.getAllScanDataEntryCenters).pipe(map((result: any) => {
            return result.item;
        }));
    }

    public getScanCenterDispatcher(idScanCenter: string): Observable<any> {
        return this.get<any>(this.serUrl.getScanCenterDispatcher, {
            idScanCenter: idScanCenter
        }).pipe(map((result: any) => {
            return result.item;
        }));
    }

    public saveScanDispatcherPool(dispatcherData: any): Observable<any> {
        return this.post<any>(this.serUrl.saveScanDispatcherPool, JSON.stringify(dispatcherData)).pipe(map((result: any) => {
            return result.item;
        }));
    }

    public saveScanUndispatch(unDispatcherData: any) {
        return this.post<any>(this.serUrl.saveScanUndispatch, JSON.stringify(unDispatcherData)).pipe(map((result: any) => {
            return result.item;
        }));
    }

    /* For Assignment */

    public getScanAssignmentDataEntryCenter(): Observable<any> {
        return this.get<any>(this.serUrl.getScanAssignmentDataEntryCenter).pipe(map((result: any) => {
            return result.item;
        }));
    }

    public getScanAssignmentPool(idPerson: string): Observable<any> {
        return this.get<any>(this.serUrl.getScanAssignmentPool, {
            idPerson: idPerson
        }).pipe(map((result: any) => {
            return result.item;
        }));
    }

    public getScanAssignedPool(idPerson: string): Observable<any> {
        return this.get<any>(this.serUrl.getScanAssignedPool, {
            idPerson: idPerson
        }).pipe(map((result: any) => {
            return result.item;
        }));
    }

    public getScanAssignmentUserLanguageAndCountry(model: ScanAssignmentUserLanguageCountry): Observable<any> {
        return this.get<any>(this.serUrl.getScanAssignmentUserLanguageAndCountry, model).pipe(map((result: any) => {
            return result.item;
        }));
    }

    public getScanAssignmentUsers(): Observable<any> {
        return this.get<any>(this.serUrl.getScanAssignmentUsers).pipe(map((result: any) => {
            return result.item;
        }));
    }

    public scanAssignmentAssignPoolsToUsers(data: any): Observable<any> {
        return this.post<any>(this.serUrl.scanAssignmentAssignPoolsToUsers, JSON.stringify(data)).pipe(map((result: any) => {
            return result.item;
        }));
    }

    public scanAssignmentUnassignPoolsToUsers(data: any): Observable<any> {
        return this.post<any>(this.serUrl.scanAssignmentUnassignPoolsToUsers, JSON.stringify(data)).pipe(map((result: any) => {
            return result.item;
        }));
    }

    public getMatchingCountry(): Observable<any> {
        return this.get<any>(this.serUrl.matchingCountry);
    }

    public getMatchingColumns(): Observable<any> {
        return this.get<any>(this.serUrl.getMatchingColumns);
    }

    public getMatchingConfiguration(): Observable<any> {
        return this.get<any>(this.serUrl.getMatchingConfiguration);
    }

    public saveMatchingConfiguration(data: any): Observable<any> {
        return this.post<any>(this.serUrl.saveMatchingConfiguration, JSON.stringify(data));
    }

    public getScheduleTime(): Observable<any> {
        return this.get<any>(this.serUrl.getScheduleTime);
    }

    public saveScheduleTime(data: any): Observable<any> {
        return this.post<any>(this.serUrl.saveScheduleTime, JSON.stringify(data));
    }

    public listSystemScheduleService(idSharingTreeGroups?: any, runDateTime?: any): Observable<any> {
        return this.get<any>(this.serUrl.listSystemScheduleService, {
            IdSharingTreeGroups: idSharingTreeGroups,
            RunDateTime: runDateTime
        });
    }

    public getScheduleServiceStatusByQueueId(idAppSystemScheduleQueue: any): Observable<any> {
        return this.get<any>(this.serUrl.getScheduleServiceStatusByQueueId, {
            idAppSystemScheduleQueue: idAppSystemScheduleQueue
        });
    }

    public getSummayFileResultSystemSchedule(data): Observable<any> {
        return this.get<any>(this.serUrl.getSummayFileResultSystemSchedule, data);
    }

    public getScheduleByServiceId(idRepAppSystemScheduleServiceName: number): Observable<any> {
        return this.get<any>(this.serUrl.getScheduleByServiceId, {idRepAppSystemScheduleServiceName: idRepAppSystemScheduleServiceName});
    }
    
    public saveSystemSchedule(data: any): Observable<any> {
        return this.post<any>(this.serUrl.saveSystemSchedule, JSON.stringify(data));
    }

    public saveStatusSystemSchedule(data: any): Observable<any> {
        return this.post<any>(this.serUrl.saveStatusSystemSchedule, JSON.stringify(data));
    }

    public savingQueue(data: any): Observable<any> {
        return this.post<any>(this.serUrl.savingQueue, JSON.stringify(data));
    }
}
