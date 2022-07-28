import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QRCodeCustomModule } from '@app/shared/components/qr-code/qr-code.module';
import { XnTranslationModule } from '@app/shared/components/translation/xn-translation.module';
import { XnEnterBreakDownDirectiveModule } from '@app/shared/directives/xn-enter-break-down';
import { XnHotKeyProcessingDirectiveModule } from '@app/shared/directives/xn-hot-key-processing';
import { MatOptionModule } from '@xn-control/light-material-ui/core';
import { MatInputModule } from '@xn-control/light-material-ui/input';
import { MatSelectModule } from '@xn-control/light-material-ui/select';
import { MatSlideToggleModule } from '@xn-control/light-material-ui/slide-toggle';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { XnErrorMessageModule } from '../xn-error-message/xn-error-message.module';
import { WidgetBranchModifyComponent } from './widget-branch-modify.component';

@NgModule({
    declarations: [WidgetBranchModifyComponent],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatInputModule,
        MatSelectModule,
        MatOptionModule,
        MatSlideToggleModule,
        XnTranslationModule,
        XnHotKeyProcessingDirectiveModule,
        TooltipModule.forRoot(),
        XnErrorMessageModule,
        XnEnterBreakDownDirectiveModule,
        PerfectScrollbarModule,
        QRCodeCustomModule,
    ],
    exports: [WidgetBranchModifyComponent],
    providers: [],
    entryComponents: [WidgetBranchModifyComponent],
})
export class WidgetBranchModifyModule { }