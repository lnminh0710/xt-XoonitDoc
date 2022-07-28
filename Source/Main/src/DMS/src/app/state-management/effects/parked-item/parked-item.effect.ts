import { Injectable } from '@angular/core';
import { Effect, Actions, ofType } from '@ngrx/effects';

import { ParkedItemModel, Module, ApiResultResponse } from '@app/models';

import { ParkedItemActions } from '@app/state-management/store/actions';
import { ParkedItemService, PersonService, ArticleService, CampaignService, DocumentService } from '@app/services';
import { Uti } from '@app/utilities';
import { MenuModuleId } from '@app/app.constants';
import { CustomAction } from '@app/state-management/store/actions/base';
import { ModuleList } from '@app/pages/private/base';
import { switchMap, map } from 'rxjs/operators';

@Injectable()
export class ParkedItemEffects {
    private actionData: any = null;

    constructor(
        private update$: Actions,
        private parkedItemActions: ParkedItemActions,
        private parkedItemService: ParkedItemService,
        private personService: PersonService,
        private articleService: ArticleService,
        private campaignService: CampaignService,
        private documentService: DocumentService,
    ) {}

    @Effect() loadParkedItems$ = this.update$.pipe(
        ofType<CustomAction>(ParkedItemActions.LOAD_PARKED_ITEMS),
        map((action) => action.payload),
        switchMap((payload: any) => {
            switch (payload.currentModule.idSettingsGUI) {
                default:
                    return this.parkedItemService.getListParkedItemByModule(payload.currentModule);
            }
        }),
        map((parkedItemResult: any) => {
            return this.parkedItemActions.loadParkedItemsSuccess(parkedItemResult);
        }),
    );

    @Effect() loadThenAddParkedItem = this.update$.pipe(
        ofType<CustomAction>(ParkedItemActions.LOAD_THEN_ADD_PARKED_ITEM),
        map((action) => {
            this.actionData = action.payload;
            return action.payload;
        }),
        switchMap((data: any) => {
            switch (data.currentModule.idSettingsGUI) {
                case MenuModuleId.processing:
                case MenuModuleId.contact:
                    return this.personService.getPersonById(data.parkedItemId);
                case MenuModuleId.invoice:
                    return this.articleService.getArticleById(data.parkedItemId);
                case MenuModuleId.campaign:
                    return this.campaignService.getCampaignWizardT1(data.parkedItemId);
                case MenuModuleId.businessCosts:
                    return this.campaignService.getCampaignCosts(data.parkedItemId, true);
                case MenuModuleId.orderProcessing:
                    return this.documentService.getDataOrderProcessingById(data.parkedItemId);
                default:
                    return this.personService.getPersonById(data.parkedItemId);
            }
        }),
        map((response: ApiResultResponse) => {
            if (!Uti.isResquestSuccess(response)) {
                return null;
            }
            let newParkedItem: any;

            if (this.actionData.currentModule.idSettingsGUI == MenuModuleId.campaign) {
                newParkedItem = new ParkedItemModel(response.item.collectionData[0]);
            } else if (this.actionData.currentModule.idSettingsGUI == MenuModuleId.invoice) {
                newParkedItem = new ParkedItemModel(response.item);
            } else {
                newParkedItem = new ParkedItemModel(response.item);
            }

            newParkedItem.id = newParkedItem[this.actionData.modulePrimaryKey];
            newParkedItem.keys = this.actionData.widgetListenKey;

            return this.parkedItemActions.loadThenAddParkedItemSuccess(newParkedItem, this.actionData.currentModule);
        }),
    );
}
