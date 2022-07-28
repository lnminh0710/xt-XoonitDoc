import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { DynamicFormTableComponent } from './dynamic-form-table.component';
import { XnAgGridModule } from '../../../shared/components/xn-control/xn-ag-grid';

@NgModule({
    imports: [
        CommonModule,
        XnAgGridModule
    ],
    exports: [DynamicFormTableComponent],
    declarations: [DynamicFormTableComponent],
    providers: [],
})
export class DynamicFormTableModule { }
