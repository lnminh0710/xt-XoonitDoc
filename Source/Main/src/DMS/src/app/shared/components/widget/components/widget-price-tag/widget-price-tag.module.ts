import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { WidgetPriceTag } from './widget-price-tag.component';

import { XnTranslationModule } from '../../../translation/xn-translation.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { XnDragDropModule } from '@app/shared/directives/xn-dragable';
import { DndModule } from 'ng2-dnd';
import { DragulaModule } from 'ng2-dragula';
import { XnErrorMessageModule } from '@app/xoonit-share/components/xn-error-message/xn-error-message.module';
import { MatSelectModule } from '@xn-control/light-material-ui/select';
import { MatInputModule } from '@xn-control/light-material-ui/input';
import { MatOptionModule } from '@xn-control/light-material-ui/core';
import { XnEnterBreakDownDirectiveModule } from '@app/shared/directives/xn-enter-break-down';
import { MatCheckboxModule } from '@xn-control/light-material-ui/checkbox';
import { InputCurrencyMaskDirectiveModule } from '@app/xoonit-share/directives/input-currency-mask/input-currency-mask.module';
import { MatSliderModule } from '@xn-control/light-material-ui/slider';
import { MatIconModule } from '@xn-control/light-material-ui/icon';
import { MatButtonModule } from '@xn-control/light-material-ui/button';
import { MatDatepickerModule } from '@xn-control/light-material-ui/datepicker';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        TooltipModule.forRoot(),
        MatSliderModule,
        PerfectScrollbarModule,
        XnDragDropModule,
        XnTranslationModule,
        DndModule,
        DragulaModule,
        MatIconModule,
        MatButtonModule,
        ReactiveFormsModule,
        XnErrorMessageModule,
        MatSelectModule,
        MatInputModule,
        MatOptionModule,
        XnEnterBreakDownDirectiveModule,
        MatCheckboxModule,
        InputCurrencyMaskDirectiveModule,
        MatDatepickerModule,
    ],
    exports: [WidgetPriceTag, XnTranslationModule],
    declarations: [WidgetPriceTag],
    providers: [],
})
export class WidgetPriceTagModule {}
