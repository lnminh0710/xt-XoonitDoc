import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XnAgGridModule } from '@xn-control/xn-ag-grid';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WidgetPositionDetailComponent } from './widget-position-detail.component';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

@NgModule({
    declarations: [WidgetPositionDetailComponent],
    imports: [CommonModule, FormsModule, XnAgGridModule, TooltipModule],
    exports: [WidgetPositionDetailComponent],
    providers: [],
    entryComponents: [],
})
export class WidgetPositionDetailModule {}
