import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { CommonModule, DatePipe } from '@angular/common';
import { WIDGETS_COMPONENTS } from './components';
import { RouterModule } from '@angular/router';
import { XnImageLoaderModule } from '@app/shared/directives/xn-image-loader';
import { WjInputModule } from 'wijmo/wijmo.angular2.input';
// import { MaterialModule } from '@app/shared/components/xn-control/light-material-ui/material.module';
import { InlineEditModule } from '@app/shared/components/widget';
import { XnInputDebounceModule } from '@app/shared/components/xn-control/xn-input-debounce/xn-input-debounce.module';
import { GlobalSearchModule } from '@app/shared/components/global-search/global-search.module';
import * as primengModule from 'primeng/primeng';
import { XnFormFocusDirectiveModule } from '@app/shared/directives/xn-form-focus';
import { MatCheckboxModule } from '@xn-control/light-material-ui/checkbox';
//import { NgxImgZoomModule } from 'ngx-img-zoom';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        TooltipModule.forRoot(),
        XnImageLoaderModule,
        WjInputModule,
        // MaterialModule,
        InlineEditModule,
        XnInputDebounceModule,
        GlobalSearchModule,
        primengModule.DialogModule,
        XnFormFocusDirectiveModule,
       //NgxImgZoomModule
       MatCheckboxModule,
    ],
    declarations: [
        ...WIDGETS_COMPONENTS
    ],
    exports: [
        CommonModule,
        ...WIDGETS_COMPONENTS
    ],
    providers: [
        DatePipe
    ]
})
export class CustomerModule { }
