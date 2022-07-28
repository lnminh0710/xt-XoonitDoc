import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { XnTranslationModule } from '@app/shared/components/translation/xn-translation.module';
import { XnEnterBreakDownDirectiveModule } from '@app/shared/directives/xn-enter-break-down';
import { XnHotKeyProcessingDirectiveModule } from '@app/shared/directives/xn-hot-key-processing';
import { MatOptionModule } from '@xn-control/light-material-ui/core';
import { MatIconModule } from '@xn-control/light-material-ui/icon';
import { MatInputModule } from '@xn-control/light-material-ui/input';
import { MatSelectModule } from '@xn-control/light-material-ui/select';
import { XnInputDebounceModule } from '@xn-control/xn-input-debounce/xn-input-debounce.module';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { XnErrorMessageModule } from '../xn-error-message/xn-error-message.module';
import { WidgetHeadquarterManagementComponent } from './widget-headquarter-management.component';
import { WidgetHeadquarterModifyComponent } from './widget-headquarter-modify/widget-headquarter-modify.component';

@NgModule({
  declarations: [WidgetHeadquarterManagementComponent, WidgetHeadquarterModifyComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatIconModule,
    XnTranslationModule,
    XnHotKeyProcessingDirectiveModule,
    TooltipModule.forRoot(),
    XnErrorMessageModule,
    XnEnterBreakDownDirectiveModule,
    PerfectScrollbarModule,
    XnInputDebounceModule,
  ],
  exports: [WidgetHeadquarterManagementComponent],
  providers: [],
  entryComponents: [WidgetHeadquarterModifyComponent],
})
export class WidgetHeadquaterManagementModule {}
