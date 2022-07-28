import { Component, OnInit, AfterViewInit } from '@angular/core';
import { BaseModuleComponent } from '../private/base';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import {
    AppErrorHandler,
    LoadingService,
    PropertyPanelService,
    GlobalSettingService,
    CommonService,
    ModuleSettingService,
} from '@app/services';
import { GlobalSettingConstant } from '@app/app.constants';
import {
    ModuleSettingActions,
    XnCommonActions,
    TabButtonActions,
    PropertyPanelActions,
    AdditionalInformationActions,
} from '@app/state-management/store/actions';
import { AppState } from '@app/state-management/store';

@Component({
    selector: 'user-profile',
    templateUrl: './user-profile.component.html',
    styleUrls: ['./user-profile.component.scss'],
})
export class UserProfileComponent extends BaseModuleComponent implements OnInit, AfterViewInit {

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

    ) {
        super(
            router,
            appStore,
            appErrorHandler,
            globalSettingConstant,
            loadingService,
            globalSettingService,
            moduleSettingService,
            propertyPanelService,
            moduleSettingActions,
            tabButtonActions,
            propertyPanelActions,
            additionalInformationActions,
            commonService,
            xnCommonActions,
        );

    }

    ngOnInit(): void {
        super.onInit();
    }

    ngAfterViewInit(): void {
        super.getModuleToPersonType();
    }

    ngOnDestroy(): void {
        super.onDestroy();
    }

}
