import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XnBsDatepickerComponent } from './xn-bs-datepicker.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

@NgModule({
    declarations: [XnBsDatepickerComponent],
    imports: [CommonModule, BsDatepickerModule],
    exports: [XnBsDatepickerComponent],
    providers: [],
})
export class XnBsDatepickerModule {}
