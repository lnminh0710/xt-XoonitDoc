import { CommonModule } from '@angular/common';
import { NgModule, ErrorHandler } from '@angular/core';
import { FormsModule } from '@angular/forms';
// import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { ToasterModule } from 'angular2-toaster/angular2-toaster';
import { ToasterService } from "angular2-toaster";
import { DragulaModule } from 'ng2-dragula';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { SharedModule } from 'primeng/primeng';
import { ResizableModule } from 'angular-resizable-element';
import { DndModule } from 'ng2-dnd';
import { XnSharedModule } from '@app/shared';
import { StateManagementModule } from '@app/state-management';
import { AngularSplitModule } from 'angular-split';
import { HotkeyModule } from 'angular2-hotkeys';
import { AppErrorHandler } from '@app/services';
// import { ModalModule } from 'ngx-bootstrap/modal/modal.module';
import { APP_SERVICES } from '@app/services';
import { GlobalSearchModule } from '@app/shared/components/global-search/global-search.module';
//import { XnWorkingModulesModule } from '@app/shared/components/xn-working-modules/xn-working-modules.module';
//import { PropertyPanelModule } from '@app/shared/components/property-panel/property-panel.module';
//import { ModuleWelcomeModule } from 'app/shared/components/module-welcome/module-welcome.module';
//import { AppHeaderModule } from '@app/shared/components/layout';
//import { ControlSidebarModule } from '@app/shared/components/layout';
import { EffectsModule } from '@ngrx/effects';
import {
    MainModuleEffects,
    ParkedItemEffects,
    TabSummaryEffects,
    WidgetTemplateSettingEffects,
    ModuleSettingEffects,
    XnCommonEffects,
    HotkeySettingEffects,
    GlobalSearchEffects,
    // WidgetContentDetailEffects
} from '@app/state-management/effects';
//import { XnMessageModalModule } from 'app/shared/components/xn-control/xn-message-modal';
//import { XnResourceTranslationModule } from 'app/shared/directives/xn-resource-translation';
//import { LabelTranslationModule } from '@app/shared/components/label-translation/label-translation.module';
import { WidgetComponent } from '@app/pages/widget/widget.component';
import { WidgetRoutingModule } from '@app/pages/widget/widget.routes';

const modules = [
    // ModalModule.forRoot(),
    CommonModule,
    FormsModule,
    RouterModule,
    ToasterModule,
    DragulaModule,
    PerfectScrollbarModule,
    GlobalSearchModule,
    SharedModule,
    ResizableModule,
    DndModule.forRoot(),
    AngularSplitModule,
    XnSharedModule,
    StateManagementModule,
    HotkeyModule.forRoot(),
    //PropertyPanelModule,
    //XnWorkingModulesModule,
    //ModuleWelcomeModule,
    //AppHeaderModule,
    //ControlSidebarModule,
    //XnMessageModalModule,
    //XnResourceTranslationModule,
    //LabelTranslationModule
];

@NgModule({
    bootstrap: [WidgetComponent],
    declarations: [
        WidgetComponent
    ],
    imports: [
        CommonModule,
        WidgetRoutingModule,
        ...modules,
        //EffectsModule.forRoot([
        //    MainModuleEffects,
        //    ParkedItemEffects,
        //    TabSummaryEffects,
        //    WidgetTemplateSettingEffects,
        //    ModuleSettingEffects,
        //    XnCommonEffects,
        //    HotkeySettingEffects,
        //    GlobalSearchEffects,
        //    // WidgetContentDetailEffects
        //])
    ],
    exports: [
        WidgetComponent
    ],
    providers: [
        ...APP_SERVICES,
        ToasterService,
        { provide: ErrorHandler, useClass: AppErrorHandler }
    ]
})
export class WidgetModule { }
