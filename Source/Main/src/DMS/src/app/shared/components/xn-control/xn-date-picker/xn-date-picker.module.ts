import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { DatePickerComponent } from './xn-date-picker.component';
import { NgxMyDatePickerModule } from './ngx-my-date-picker/ngx-my-date-picker.module';
import { TextMaskModule } from 'angular2-text-mask';

@NgModule({
    imports: [
        TextMaskModule,
        CommonModule,
        NgxMyDatePickerModule.forRoot()
    ],
    declarations: [
        DatePickerComponent
    ],
    exports: [DatePickerComponent ]
})
export class XnDatePickerModule {}
