import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { XnTranslationModule } from '@app/shared/components/translation/xn-translation.module';
import { MatDatepickerModule } from '@xn-control/light-material-ui/datepicker';
import { MatFormFieldModule } from '@xn-control/light-material-ui/form-field';
import { MatIconModule } from '@xn-control/light-material-ui/icon';
import { MatInputModule } from '@xn-control/light-material-ui/input';
import { DateAdapter, MAT_DATE_FORMATS } from '@xn-control/light-material-ui/core';
import { XnDateAdapter } from './helpers/xn-date-adapter';

import { XnMaterialDatepickerControlComponent } from './xn-material-datepicker-control.component';
import { MatButtonModule } from '@xn-control/light-material-ui/button';
import { XnMaterialEnterNextFocusModule } from '../../directives/xn-material-enter-next-focus/xn-material-enter-next-focus.module';

@NgModule({
    imports: [
        CommonModule,
        XnTranslationModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatDatepickerModule,
        MatButtonModule,
        MatIconModule,
        XnMaterialEnterNextFocusModule
    ],
    exports: [XnMaterialDatepickerControlComponent],
    declarations: [XnMaterialDatepickerControlComponent],
    providers: [{
        provide: DateAdapter,
        useClass: XnDateAdapter,
    },
    {
        provide: MAT_DATE_FORMATS,
        useValue: {
            parse: {
                dateInput: 'DD.MM.YYYY',
            },
            display: {
                dateInput: 'DD.MM.YYYY',
                monthYearLabel: 'MMM YYYY',
                dateA11yLabel: 'DD.MM.YYYY',
                monthYearA11yLabel: 'MMMM YYYY',
              },
        },
    },],
})
export class XnMaterialDatepickerControlModule {}
