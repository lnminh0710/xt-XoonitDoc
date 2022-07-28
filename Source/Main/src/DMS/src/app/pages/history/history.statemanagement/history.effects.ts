import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { DocumentService } from '@app/services';
import {
    GetScanningHistoryAction,
    HistorySuccessAction,
    HistoryFailedAction,
    GetScanningHistoryDetailAction,
    HistoryActionNames,
} from './history.actions';
import { Observable } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

@Injectable()
export class HistoryEffects {
    constructor(private actions$: Actions, private documentService: DocumentService) {}

    @Effect()
    getScanningHistory$ = this.actions$.pipe(
        ofType(HistoryActionNames.GET_SCANNING_HISTORY),
        switchMap((action: GetScanningHistoryAction) => {
            return this.documentService.getScanningHistory(action.payload).pipe(
                map((data) => {
                    return new HistorySuccessAction(action.type, data);
                }),
                catchError((err) => Observable.of(new HistoryFailedAction(action.type, err))),
            );
        }),
    );

    @Effect()
    getScanningHistoryDetail$ = this.actions$.pipe(
        ofType(HistoryActionNames.GET_SCANNING_HISTORY_DETAIL),
        switchMap((action: GetScanningHistoryDetailAction) => {
            return this.documentService.getScanningHistoryDetail(action.payload).pipe(
                map((data) => {
                    return new HistorySuccessAction(action.type, data);
                }),
                catchError((err) => Observable.of(new HistoryFailedAction(action.type, err))),
            );
        }),
    );
}
