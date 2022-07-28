import { Injectable } from '@angular/core';
import { Effect, Actions, ofType } from '@ngrx/effects';

import { TabSummaryActions } from '@app/state-management/store/actions';
import { TabService, BaseService } from '@app/services';
import { ApiResultResponse, Module } from '@app/models';
import { Uti } from '@app/utilities/uti';
import { CustomAction } from '@app/state-management/store/actions/base';
import { DocumentProcessingTypeEnum } from '@app/app.constants';
import { map, switchMap } from 'rxjs/operators';

@Injectable()
export class TabSummaryEffects {
    private module: Module;

    constructor(
        private update$: Actions,
        private tabSummaryActions: TabSummaryActions,
        private tabService: TabService,
    ) {}

    @Effect() loadTabs$ = this.update$.pipe(
        ofType<CustomAction>(TabSummaryActions.LOAD_TABS),
        map((action) => {
            this.module = action.payload.module;
            return action.payload;
        }),
        switchMap((param) => this.tabService.getTabSummaryInfor(param)),
        map((response: ApiResultResponse) => {
            if (!Uti.isResquestSuccess(response)) {
                return;
            }
            return this.tabSummaryActions.loadTabsSuccess(response.item, this.module);
        }),
    );

    @Effect() loadTabsByIdDocumentType$ = this.update$.pipe(
        ofType<CustomAction>(TabSummaryActions.LOAD_TABS_BY_IDDOCUMENTTYPE),
        map((action) => {
            this.module = action.payload.module;
            return action.payload;
        }),
        switchMap((param: any) => {
            return this.tabService.getTabByDocumentType(param);
        }),
        map((response: ApiResultResponse) => {
            if (!Uti.isResquestSuccess(response)) {
                return;
            }
            return this.tabSummaryActions.loadTabsSuccess(response.item, this.module);
        }),
    );
}
