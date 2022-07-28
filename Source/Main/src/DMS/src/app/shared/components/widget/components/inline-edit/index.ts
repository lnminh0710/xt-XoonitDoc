import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { PipesModule } from '@app/pipes/pipes.module';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { XnDatePickerModule } from "@app/shared/components/xn-control/xn-date-picker";
import { PopoverModule } from 'ngx-bootstrap/popover';
import { WjInputModule } from 'wijmo/wijmo.angular2.input';
import { InlineEditComponent } from './inline-edit.component';
// import { MaterialModule } from '@app/shared/components/xn-control/light-material-ui/material.module';
import { XnAppendStyleModule } from '@app/shared/directives/xn-append-style';
import { MatCheckboxModule } from '@xn-control/light-material-ui/checkbox';
import { MatButtonModule } from '@xn-control/light-material-ui/button';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        PipesModule,
        TooltipModule,
        XnDatePickerModule,
        PopoverModule,
        WjInputModule,
        XnAppendStyleModule,
        PerfectScrollbarModule,
        MatCheckboxModule,
        MatButtonModule,
    ],
    declarations: [InlineEditComponent],
    exports: [InlineEditComponent],
    providers: []
})
export class InlineEditModule { }
export { InlineEditComponent } from './inline-edit.component';
