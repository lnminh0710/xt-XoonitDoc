import { Injectable } from '@angular/core';
import { CommonService, DocumentService } from '@app/services';
import { AppState } from '@app/state-management/store';
import { GetFormGroupSettingsAction, DynamicFormStoreActionNames, DynamicFormStoreFailedAction, DynamicFormStoreSuccessAction } from '@app/state-management/store/actions/dynamic-form-store';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

@Injectable()
export class DynamicFormStoreEffects {
    constructor(
        private store: Store<AppState>,
        private actions$: Actions,
        private documentService: DocumentService,
        private commonService: CommonService,
    ) {}

    @Effect()
    getDocumentSummary$ = this.actions$.pipe(
        ofType(DynamicFormStoreActionNames.GET_FORM_GROUP_SETTINGS),
        switchMap((action: GetFormGroupSettingsAction) => {
            return this.documentService.getFormGroupSettings(action.payload).pipe(
                map((value) => {
                    if (!value)
                        return new DynamicFormStoreFailedAction(
                            action.type,
                            value,
                        );
                    return new DynamicFormStoreSuccessAction(action.type, value);
                }),
                catchError((err) =>
                    of(new DynamicFormStoreFailedAction(action.type, err)),
                ),
            );
        }),
    );
}
