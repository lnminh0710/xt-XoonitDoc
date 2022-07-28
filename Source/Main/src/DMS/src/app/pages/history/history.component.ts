import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { BaseModuleComponent } from '../private/base';
import { Router} from '@angular/router';
import { Store } from '@ngrx/store';
import {
    AppErrorHandler,
    LoadingService,
    PropertyPanelService,
    CommonService,
    ModuleSettingService,
    GlobalSettingService,
} from '@app/services';
import { Uti} from '@app/utilities';
import { AppState } from '@app/state-management/store';
import {
    XnCommonActions,
    TabButtonActions,
    PropertyPanelActions,
    AdditionalInformationActions,
    ModuleSettingActions,
    AdministrationDocumentActions,
} from '@app/state-management/store/actions';
import { fadeInRightFlexBasis } from '@app/shared/animations/fade-in-right-flex-basic.animation';
import { GlobalSettingConstant} from '../../app.constants';

@Component({
    selector: 'history',
    templateUrl: './history.component.html',
    styleUrls: ['./history.component.scss'],
    animations: [fadeInRightFlexBasis],
})
export class HistoryComponent extends BaseModuleComponent implements OnInit, AfterViewInit, OnDestroy {
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
        private admintrationDocumentActions: AdministrationDocumentActions,
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

        this.appStore.dispatch(this.admintrationDocumentActions.getDocumentTree({ shouldGetDocumentQuantity: false, idPerson: '' }));
    }

    ngOnInit(): void {
        super.onInit();
    }

    ngAfterViewInit(): void {
        this.getModuleToPersonType();
    }

    ngOnDestroy(): void {
        super.onDestroy();
        Uti.unsubscribe(this);
    }
}
