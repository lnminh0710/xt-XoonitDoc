import { Injectable } from '@angular/core';
import { Effect, Actions, ofType } from '@ngrx/effects';

import { AppState } from '@app/state-management/store';
import { HotKeySettingActions } from '@app/state-management/store/actions';
import { GlobalSettingService } from '@app/services';
import { GlobalSettingModel } from '@app/models';
import * as uti from '@app/utilities';
import { CustomAction } from '@app/state-management/store/actions/base';
import {
    GlobalSettingConstant
} from '@app/app.constants';
import { map, switchMap } from 'rxjs/operators';

@Injectable()
export class HotkeySettingEffects {

    private actionData: CustomAction = null;

    constructor(
        private update$: Actions,
        private hotKeySettingActions: HotKeySettingActions,
        private globalSettingService: GlobalSettingService,
        private globalSettingConstant: GlobalSettingConstant,
    ) {
    }

    @Effect() loadHotkeySetting$ = this.update$
        .pipe(
            ofType<CustomAction>(HotKeySettingActions.LOAD_HOT_KEY_SETTING),
            map(action => {
                this.actionData = action;
                return action.payload;
            }),
            switchMap((payload: any) => {
                return this.globalSettingService.getAllGlobalSettings(this.actionData.module.idSettingsGUI);
            }),
            map((data: Array<GlobalSettingModel>) => {
                if (data) {
                    const globalSettingModel: GlobalSettingModel = data.find(x => x.globalName === this.getHotkeySettingName());
                    if (globalSettingModel && globalSettingModel.jsonSettings) {
                        return this.hotKeySettingActions.loadHotKeySettingSuccess(JSON.parse(globalSettingModel.jsonSettings));
                    }
                }
                return this.hotKeySettingActions.loadHotKeySettingSuccess({});
            })
        );

    /**
     * getHotkeySettingName
     */
    private getHotkeySettingName() {
        return uti.String.Format('{0}_{1}',
            this.globalSettingConstant.hotkeySetting,
            this.actionData.module ? uti.String.hardTrimBlank(this.actionData.module.moduleName) : '');
    }

}
