import { Component, OnDestroy, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { GlobalSettingConstant } from '@app/app.constants';
import { BaseModuleComponent } from '@app/pages/private/base';
import {
    GlobalSettingService,
    ModuleSettingService,
    AppErrorHandler,
    LoadingService,
    PropertyPanelService,
    CommonService,
} from '@app/services';
import { AppState } from '@app/state-management/store';
import {
    ModuleSettingActions,
    TabButtonActions,
    PropertyPanelActions,
    AdditionalInformationActions,
    XnCommonActions,
} from '@app/state-management/store/actions';
import { Store } from '@ngrx/store';

@Component({
    selector: 'shared-module-container',
    templateUrl: 'shared-module-container.component.html',
    styleUrls: ['./shared-module-container.component.scss'],
})
export class SharedModuleContainerComponent extends BaseModuleComponent implements OnInit, OnDestroy, AfterViewInit {
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
        if (this.isGetModuleToPersonType) {
            super.getModuleToPersonType();
        }        
    }

    ngOnDestroy() {
        super.onDestroy();
    }
}
