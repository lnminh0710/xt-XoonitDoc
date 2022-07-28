import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WIDGETS_COMPONENTS } from './components';
import { APP_SERVICES } from './services';
import { DragulaModule } from 'ng2-dragula';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
// import { MaterialModule } from '@app/shared/components/xn-control/light-material-ui/material.module';
import * as primengModule from 'primeng/primeng';
import { InlineEditModule } from '@app/shared/components/widget';
import { WjInputModule } from 'wijmo/wijmo.angular2.input';

@NgModule({
  declarations: [...WIDGETS_COMPONENTS],
  imports: [CommonModule, DragulaModule, PerfectScrollbarModule, TooltipModule, /*MaterialModule,*/ primengModule.DialogModule, WjInputModule, InlineEditModule],
  exports: [WIDGETS_COMPONENTS[0]],
  providers: [...APP_SERVICES],
})
export class FormManagementModule {}
