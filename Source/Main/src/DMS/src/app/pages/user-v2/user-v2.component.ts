// import { Component, OnInit, AfterViewInit } from '@angular/core';
// import { BaseModuleComponent } from '../private/base';
// import { Router } from '@angular/router';
// import { Store } from '@ngrx/store';
// import {
//     TabButtonActions,
//     ModuleSettingActions,
//     XnCommonActions,
//     PropertyPanelActions,
//     AdditionalInformationActions,
// } from '@app/state-management/store/actions';
// import {
//     LoadingService,
//     GlobalSettingService,
//     AppErrorHandler,
//     CommonService,
//     PropertyPanelService,
//     ModuleSettingService,
// } from '@app/services';
// import { GlobalSettingConstant } from '@app/app.constants';
// import { AppState } from '@app/state-management/store';

// @Component({
//     selector: 'user-v2',
//     templateUrl: './user-v2.component.html',
//     styleUrls: ['./user-v2.component.scss'],
// })
// export class UserV2Component extends BaseModuleComponent implements OnInit, AfterViewInit {
//     constructor(
//         protected router: Router,
//         protected appStore: Store<AppState>,
//         protected appErrorHandler: AppErrorHandler,
//         protected globalSettingConstant: GlobalSettingConstant,

//         protected loadingService: LoadingService,
//         protected globalSettingService: GlobalSettingService,
//         protected moduleSettingService: ModuleSettingService,
//         protected propertyPanelService: PropertyPanelService,

//         protected moduleSettingActions: ModuleSettingActions,
//         protected tabButtonActions: TabButtonActions,
//         protected propertyPanelActions: PropertyPanelActions,
//         protected additionalInformationActions: AdditionalInformationActions,

//         protected commonService: CommonService,
//         protected xnCommonActions: XnCommonActions,
//         //-----------------------------------------

//     ) {
//         super(
//             router,
//             appStore,
//             appErrorHandler,
//             globalSettingConstant,
//             loadingService,
//             globalSettingService,
//             moduleSettingService,
//             propertyPanelService,
//             moduleSettingActions,
//             tabButtonActions,
//             propertyPanelActions,
//             additionalInformationActions,
//             commonService,
//             xnCommonActions,
//         );

//     }

//     ngOnInit(): void {
//         super.onInit();
//     }

//     ngAfterViewInit(): void {
//         super.getModuleToPersonType();
//     }

//     ngOnDestroy(): void {
//         super.onDestroy();
//     }

// }
import { Component } from '@angular/core';

@Component({
    selector: 'user-v2',
    templateUrl: './user-v2.component.html',
    styleUrls: ['./user-v2.component.scss'],
})
export class UserV2Component { }
