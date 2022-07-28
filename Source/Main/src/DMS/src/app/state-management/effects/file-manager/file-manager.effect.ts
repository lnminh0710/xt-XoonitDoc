import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import { CustomAction } from '@app/state-management/store/actions/base';
import {
    FileManagerActions,
    FileManagerActionNames,
} from '@app/state-management/store/actions/file-manager/file-manager.action';
import { FileManagerService } from '@app/pages/private/modules/file-manager/services/file-manager.service';
import { switchMap, map, catchError } from 'rxjs/operators';

@Injectable()
export class FileManagerEffects {
    private action: CustomAction;

    constructor(
        private store: Store<AppState>,
        private update$: Actions,
        private fileManagerActions: FileManagerActions,
        private fileManagerService: FileManagerService,
    ) {}

    @Effect()
    getFile$ = this.update$.pipe(
        ofType(FileManagerActionNames.GET_FILE_BY_URL),
        switchMap((action: any) => {
            return this.fileManagerService.getFileByUrl(action.payload).pipe(
                map((value) => {
                    return this.fileManagerActions.fileManagerSuccess(action.type, value);
                }),
                catchError((err) => of(this.fileManagerActions.fileManagerFailed(action.type, err))),
            );
        }),
    );

    @Effect()
    getFileByUrlForWidgetViewerId$ = this.update$.pipe(
        ofType(FileManagerActionNames.GET_FILE_BY_URL_FOR_WIDGET_VIEWER_ID),
        switchMap((action: any) => {
            return this.fileManagerService.getFileByUrl(action.payload.url).pipe(
                map((file) => {
                    return this.fileManagerActions.fileManagerSuccess(action.type, {
                        file: file,
                        widgetViewerId: action.payload.widgetViewerId,
                    });
                }),
                catchError((err) => of(this.fileManagerActions.fileManagerFailed(action.type, err))),
            );
        }),
    );
}
