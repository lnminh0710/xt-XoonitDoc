import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SimpleFormModule } from '../widget-dynamic-form/components/simple-form/simple-form.module';

import { DynamicFormFieldListComponent } from './dynamic-form-field-list.component';
import { DynamicFormTableModule } from '../dynamic-form-table/dynamic-form-table.module';

@NgModule({
    imports: [
        CommonModule,
        SimpleFormModule,
        DynamicFormTableModule
    ],
    exports: [DynamicFormFieldListComponent],
    declarations: [DynamicFormFieldListComponent],
    providers: [],
})
export class DynamicFormFieldListModule { }
