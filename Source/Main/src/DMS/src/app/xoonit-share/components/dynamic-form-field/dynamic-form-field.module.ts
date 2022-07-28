import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SimpleFormModule } from '../widget-dynamic-form/components/simple-form/simple-form.module';

import { DynamicFormFieldComponent } from './dynamic-form-field.component';

@NgModule({
    imports: [
        CommonModule,
        SimpleFormModule,
    ],
    exports: [DynamicFormFieldComponent],
    declarations: [DynamicFormFieldComponent],
    providers: [],
})
export class DynamicFormFieldModule { }
