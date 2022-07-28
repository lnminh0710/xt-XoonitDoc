import { Injectable } from '@angular/core';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { ModuleActions } from '@app/state-management/store/actions';
import { ModuleService } from '@app/services';
import { Module, ApiResultResponse } from '@app/models';
import { Uti } from '@app/utilities';
import { CustomAction } from '@app/state-management/store/actions/base';
import { map, switchMap } from 'rxjs/operators';

@Injectable()
export class MainModuleEffects {
    constructor(
        private update$: Actions,
        private moduleActions: ModuleActions,
        private moduleService: ModuleService
    ) { }

    @Effect() loadMainModules$ = this.update$.pipe(
        ofType(ModuleActions.LOAD_MAIN_MODULES),
        switchMap(() => this.moduleService.getModules()),
        map((response: ApiResultResponse) => {
            if (!Uti.isResquestSuccess(response)) {
                return null;
            }
            return this.moduleActions.loadMainModulesSuccess(response.item);
        }),
    );

    @Effect() loadSubModules$ = this.update$.pipe(
        ofType<CustomAction>(ModuleActions.ACTIVE_MODULE),
        map((action) => action.payload),
        switchMap((module: Module) => this.moduleService.getDetailSubModule(module.idSettingsGUI)),
        map((response: ApiResultResponse) => {
            if (!Uti.isResquestSuccess(response)) {
                return;
            }
            return this.moduleActions.getSubModuleSuccess(response.item);
        }),
    );
}
