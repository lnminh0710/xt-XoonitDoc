import { Injectable } from '@angular/core';
import { ApiResultResponse } from '@app/models';
import { ColumnDefinition } from '@app/models/common/column-definition.model';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { DynamicFormService } from '../services/dynamic-form.service';
import { GetDynamicColumnSettingsAction, SaveDynamicColumnSettingsAction, WidgetDynamicFailedAction, WidgetDynamicFormActionNames, WidgetDynamicSuccessAction } from './widget-dynamic-form.actions';

@Injectable()
export class WidgetDynamicFormEffects {

    constructor(
        private dynamicFormService: DynamicFormService,
        private actions$: Actions,
    ) {}

    @Effect()
    getColumnSettings$ = this.actions$.pipe(
        ofType(WidgetDynamicFormActionNames.GET_DYNAMIC_COLUMN_SETTINGS),
        switchMap((action: GetDynamicColumnSettingsAction) => {
            return this.dynamicFormService.getFormColumnSettings({
                idBranch: action.payload.idBranch,
                idMainDocument: action.payload.idMainDocument,
            })
            .pipe(
                map((response: ApiResultResponse) => {
                    return new WidgetDynamicSuccessAction(action.type, response.item);
                }),
                catchError((err) => of(new WidgetDynamicFailedAction(action.type, err)))
            )
        }),
    );

    @Effect()
    saveColumnSettings$ = this.actions$.pipe(
        ofType(WidgetDynamicFormActionNames.SAVE_DYNAMIC_COLUMN_SETTINGS),
        switchMap((action: SaveDynamicColumnSettingsAction) => {
            return this.dynamicFormService.saveFormColumnSettings(action.payload)
            .pipe(
                map((response: ApiResultResponse) => {
                    return new WidgetDynamicSuccessAction(action.type, response.item);
                }),
                catchError((err) => of(new WidgetDynamicFailedAction(action.type, err)))
            )
        }),
    );
}
