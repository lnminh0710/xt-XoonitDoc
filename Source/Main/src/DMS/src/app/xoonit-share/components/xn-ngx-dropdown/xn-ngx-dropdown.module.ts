import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XnNgxDropdownComponent } from './xn-ngx-dropdown.component';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

@NgModule({
    declarations: [XnNgxDropdownComponent],
    imports: [CommonModule, BsDropdownModule],
    exports: [XnNgxDropdownComponent],
    providers: [],
})
export class XnNgxDropdownModule {}
