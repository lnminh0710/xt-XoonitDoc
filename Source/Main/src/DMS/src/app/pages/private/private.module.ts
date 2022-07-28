import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DragulaModule } from 'ng2-dragula';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { SharedModule } from 'primeng/primeng';
import { ResizableModule } from 'angular-resizable-element';
import { DndModule } from 'ng2-dnd';
import { XnSharedModule } from '@app/shared';
import { StateManagementModule } from '@app/state-management';
import { AngularSplitModule } from 'angular-split';
import { HotkeyModule } from 'angular2-hotkeys';
import { ModalModule } from 'ngx-bootstrap/modal';
import { PrivateRoutingModule } from './private.routes';
import { PrivateComponent } from './private.component';
import { WIDGETS_COMPONENTS } from './';
import { GlobalSearchModule } from '@app/shared/components/global-search/global-search.module';
import { DmsDashboardHandlerService } from './modules/mydm/services/dms-dashboard-handler.service';
//import { SendEmailDialogModule } from '@app/shared/components/send-email-dialog/send-email-dialog.module';
import * as primengModule from 'primeng/primeng';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { MatButtonModule } from '@xn-control/light-material-ui/button';
import { XnHotKeyProcessingDirectiveModule } from '@app/shared/directives/xn-hot-key-processing';
import { XnProcessingDocumentDirectiveModule } from '@app/shared/directives/xn-processing-document';

let modules = [
    ModalModule,
    CommonModule,
    FormsModule,
    RouterModule,
    DragulaModule,
    PerfectScrollbarModule,
    SharedModule,
    ResizableModule,
    DndModule,
    AngularSplitModule,
    XnSharedModule,
    StateManagementModule,
    HotkeyModule,
    //---------------
    GlobalSearchModule,
    TooltipModule.forRoot(),
    MatButtonModule,
    // SendEmailDialogModule
    XnHotKeyProcessingDirectiveModule,
    XnProcessingDocumentDirectiveModule
];

@NgModule({
    bootstrap: [PrivateComponent],
    declarations: [PrivateComponent, ...WIDGETS_COMPONENTS],
    imports: [CommonModule, primengModule.DialogModule, PrivateRoutingModule, ...modules],
    exports: [PrivateComponent, ...WIDGETS_COMPONENTS],
    providers: [DmsDashboardHandlerService],
})
export class PrivateModule {}
