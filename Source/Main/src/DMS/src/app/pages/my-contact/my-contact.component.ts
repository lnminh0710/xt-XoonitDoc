import { Component, OnInit, AfterViewInit } from '@angular/core';
import { BaseModuleComponent, ModuleList } from '../private/base';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { TabButtonActions, ModuleSettingActions, XnCommonActions, PropertyPanelActions, AdditionalInformationActions, CustomAction, GlobalSearchActions } from '@app/state-management/store/actions';
import { LoadingService, GlobalSettingService, AppErrorHandler, CommonService, PropertyPanelService, ModuleSettingService } from '@app/services';
import { Uti } from '@app/utilities';
import { GlobalSettingConstant, LocalStorageKey, MenuModuleId } from '@app/app.constants';
import { AppState } from '@app/state-management/store';
import { SearchPageType } from '../../models/search-page/search-page-type.model';
import { Actions, ofType } from '@ngrx/effects';
import { takeUntil, filter } from 'rxjs/operators';

@Component({
    selector: 'my-contact',
    templateUrl: './my-contact.component.html',
    styleUrls: ['./my-contact.component.scss']
})
export class MyContactComponent extends BaseModuleComponent implements OnInit, AfterViewInit {
    public menuModuleId = MenuModuleId;
    public isShowSearchPage = true;
    public searchPageContactParam: SearchPageType;
    
    constructor(
        protected router: Router,
        protected appStore: Store<AppState>,
        protected appErrorHandler: AppErrorHandler,
        protected globalSettingConstant: GlobalSettingConstant,

        protected loadingService: LoadingService,
        protected globalSettingService: GlobalSettingService,
        protected moduleSettingService: ModuleSettingService,
        protected propertyPanelService: PropertyPanelService,

        protected moduleSettingActions: ModuleSettingActions,
        protected tabButtonActions: TabButtonActions,
        protected propertyPanelActions: PropertyPanelActions,
        protected additionalInformationActions: AdditionalInformationActions,

        protected commonService: CommonService,
        protected xnCommonActions: XnCommonActions,
        //-----------------------------------------        
        private action$: Actions,
    ) {
        super(router, appStore, appErrorHandler, globalSettingConstant,
            loadingService, globalSettingService, moduleSettingService, propertyPanelService,
            moduleSettingActions, tabButtonActions, propertyPanelActions, additionalInformationActions,
            commonService, xnCommonActions);

        this.searchPageContactParam = <SearchPageType>{
            idSettingsGUI: this.ofModule.idSettingsGUI,
            placeHolderText: 'Search in Contact',
        };

    }

    ngOnInit(): void {
        super.onInit();

        const actions = JSON.parse(window.localStorage.getItem(LocalStorageKey.buildKey(LocalStorageKey.LocalStorageGSStepKey, Uti.defineBrowserTabId())),) as CustomAction[];

        if (actions && this.isValidPayloadContactDetail(actions[0])) {
            this.isShowSearchPage = false;
        } else {
            this.isShowSearchPage = true;
        }

        this.subscribe();
    }

    ngAfterViewInit(): void {
        super.getModuleToPersonType();
    }

    ngOnDestroy(): void {
        this.isShowSearchPage = true;
        super.onDestroy();
    }

    private subscribe() {
        this.action$
            .pipe(
                ofType(GlobalSearchActions.ROW_DOUBLE_CLICK),
                filter((action: CustomAction) => this.isValidPayloadContactDetail(action)),
                takeUntil(super.getUnsubscriberNotifier()),
            )
            .subscribe((action: CustomAction) => {
                this.isShowSearchPage = false;
            });
    }

    private isValidPayloadContactDetail(action: CustomAction) {
        return (
            action.payload &&
            action.payload.selectedModule &&
            (action.payload.selectedModule.idSettingsGUI === ModuleList.Contact.idSettingsGUI ||
                action.payload.selectedModule.idSettingsGUI === ModuleList.AttachmentGlobalSearch.idSettingsGUI)
        );
    }
}
