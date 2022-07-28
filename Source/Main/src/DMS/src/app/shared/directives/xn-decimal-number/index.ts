import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { XnDecimalNumberDirective } from './xn-decimal-number.directive';

@NgModule({
    imports: [ReactiveFormsModule, FormsModule],
    declarations: [XnDecimalNumberDirective],
    exports: [XnDecimalNumberDirective],
    providers: []
})
export class XnDecimalNumberModule { }
