import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { XnInputNumericDirective } from './xn-input-numeric.directive';

@NgModule({
    imports: [ReactiveFormsModule],
    declarations: [XnInputNumericDirective],
    exports: [XnInputNumericDirective],
    providers: [DecimalPipe]
})
export class XnInputNumericModule { }
