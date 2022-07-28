import { NgModule, ErrorHandler } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    AppErrorHandler,
    // CanActivateGuard,
    UserService,
    AuthenticationService,
    CommonService,
    ModalService,
    GlobalSettingService,
    ModuleSettingService,
    PropertyPanelService,
    SearchService,
} from '@app/services';
import { StateManagementModule } from '@app/state-management';
import { GlobalSettingConstant } from '@app/app.constants';
import { ToasterService } from 'angular2-toaster';
import { AdvanceSearchRoutingModule } from './advance-search.routes';
import { AdvanceSearchComponent } from './advance-search.component';
import { AdvanceSearchBuilderModule } from '@app/shared/components/advance-search-builder/advance-search-builder.module';
import { AdvanceSearchProfileModule } from '@app/shared/components/advance-search-profile';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { ToasterModule } from 'angular2-toaster/angular2-toaster';
import { AngularSplitModule } from 'angular-split';
import { FormsModule } from '@angular/forms';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { XnTranslationModule } from '@app/shared/components/translation/xn-translation.module';
import { ModalModule } from 'ngx-bootstrap/modal';
import { XnSharedModule } from '@app/shared';
import { MatButtonModule } from '@xn-control/light-material-ui/button';

@NgModule({
    bootstrap: [AdvanceSearchComponent],
    declarations: [AdvanceSearchComponent],
    imports: [
        CommonModule,
        StateManagementModule,
        AdvanceSearchRoutingModule,
        AdvanceSearchBuilderModule,
        AdvanceSearchProfileModule,
        FormsModule,
        TooltipModule.forRoot(),
        PerfectScrollbarModule,
        ToasterModule,
        AngularSplitModule,
        XnTranslationModule,
        ModalModule,
        XnSharedModule,
        MatButtonModule,
    ],
    exports: [AdvanceSearchComponent],
    providers: [
        // CanActivateGuard,
        UserService,
        ModuleSettingService,
        PropertyPanelService,
        GlobalSettingService,
        AuthenticationService,
        CommonService,
        ModalService,
        SearchService,
        AppErrorHandler,
        GlobalSettingService,
        GlobalSettingConstant,
        ToasterService,
        { provide: ErrorHandler, useClass: AppErrorHandler },
    ],
})
export class AdvanceSearchModule {}
