import { forwardRef, Inject, Injectable, Injector } from '@angular/core';
import { ApiResultResponse } from '@app/models';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseService } from '../base.service';
import { LoadingService } from '../common';
import { ModalService } from '../control';

@Injectable()
export class HeadQuarterService extends BaseService {
    constructor(
        injector: Injector,
        @Inject(forwardRef(() => LoadingService)) protected loadingService: LoadingService,
        @Inject(forwardRef(() => ModalService)) protected modalService: ModalService,
    ) {
        super(injector);
    }

    public getById(id: string): Observable<ApiResultResponse> {
        return this.get<any>(this.serUrl.headquarterDetail, {
            idPerson: id,
        }).pipe(
            map((result: ApiResultResponse) => {
                return result.item;
            }),
        );
    }
    public save(jsonData: object): Observable<ApiResultResponse> {
        return this.post<any>(this.serUrl.headquarter, JSON.stringify(jsonData)).pipe(
            map((result: ApiResultResponse) => {
                return result.item;
            }),
        );
    }
}