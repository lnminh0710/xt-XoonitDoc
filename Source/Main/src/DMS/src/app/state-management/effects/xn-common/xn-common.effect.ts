import { Injectable } from '@angular/core';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import { XnCommonActions } from '@app/state-management/store/actions';
import { CommonService } from '@app/services';
import { ComboBoxTypeConstant } from '@app/app.constants';
import { ApiResultResponse } from '@app/models';
import { Uti } from '@app/utilities/uti';
import { CustomAction } from '@app/state-management/store/actions/base';
import { map, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Injectable()
export class XnCommonEffects {
    private action: CustomAction;

    constructor(
        private store: Store<AppState>,
        private update$: Actions,
        private commonActions: XnCommonActions,
        private commonService: CommonService
    ) {
    }

    @Effect() loadComboBoxList$ = this.update$
        .pipe(
            ofType<CustomAction>(XnCommonActions.LOAD_COMBO_BOX_LIST),
            map(action => {
                this.action = action;
                return action.payload;
            }),
            debounceTime(500),
            distinctUntilChanged(),
            switchMap((listComboBoxIds: number[]) => {
                return this.commonService.getListComboBox(listComboBoxIds.join(','));
            }),
            map((response: ApiResultResponse) => {
                if (!Uti.isResquestSuccess(response)) {
                    return;
                }
                return this.commonActions.loadComboBoxListSuccess(response.item, this.action.module);
            }),
        );
}
