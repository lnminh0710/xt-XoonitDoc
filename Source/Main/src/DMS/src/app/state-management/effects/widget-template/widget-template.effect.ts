import { Injectable } from '@angular/core';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { WidgetTemplateActions } from '@app/state-management/store/actions';
import { WidgetTemplateSettingService } from '@app/services';
import { WidgetTemplateSettingModel } from '@app/models';
import { CustomAction } from '@app/state-management/store/actions/base';
import { map, switchMap } from 'rxjs/operators';

@Injectable()
export class WidgetTemplateSettingEffects {
	private actionData: any = null;

    constructor(
        private update$: Actions,
        private widgetTemplateActions: WidgetTemplateActions,
        private widgetTemplateService: WidgetTemplateSettingService
    ) {
    }

    @Effect() loadWidgetTemplateSetting$ = this.update$
        .pipe(
            ofType<CustomAction>(WidgetTemplateActions.LOAD_All_WIDGET_TEMPLATE_SETTING_BY_MODULE_ID),
            map(action => {
                this.actionData = action;
                return action.payload;
            }),
            switchMap((moduleId: number) => this.widgetTemplateService.getAllWidgetTemplateByModuleId(moduleId.toString())),
            map((widgetTemplateSettings: WidgetTemplateSettingModel[]) => {
                return this.widgetTemplateActions.loadWidgetTemplateSettingSuccess(widgetTemplateSettings, this.actionData.module);
            })
        );
}
