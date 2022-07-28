import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { DynamicFormGroupComponent } from './dynamic-form-group.component';

@NgModule({
    imports: [
        CommonModule,
        PerfectScrollbarModule,
    ],
    exports: [DynamicFormGroupComponent],
    declarations: [DynamicFormGroupComponent],
    providers: [],
})
export class DynamicFormGroupModule { }
