import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { XnDynamicMaterialControlModule } from '@xn-control/xn-dynamic-material-control';
import { HTMLInputControlComponent } from '@xn-control/xn-dynamic-material-control/components/html-input-control/html-input-control.component';
import { XnMaterialAutocompleteControlComponent } from '@xn-control/xn-dynamic-material-control/components/xn-material-autocomplete-control/xn-material-autocomplete-control.component';
import { XnMaterialInputControlComponent } from '@xn-control/xn-dynamic-material-control/components/xn-material-input-control/xn-material-input-control.component';
import { XnMaterialSlideToggleControlComponent } from '@xn-control/xn-dynamic-material-control/components/xn-material-slide-toggle-control/xn-material-slide-toggle-control.component';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';

import { SimpleFormComponent } from './simple-form.component';

@NgModule({
    imports: [
        CommonModule,
        PerfectScrollbarModule,
        XnDynamicMaterialControlModule.withComponents([
            XnMaterialInputControlComponent,
            XnMaterialAutocompleteControlComponent,
            XnMaterialAutocompleteControlComponent,
            XnMaterialInputControlComponent,
            XnMaterialSlideToggleControlComponent,
            HTMLInputControlComponent,
        ]),
    ],
    exports: [SimpleFormComponent],
    declarations: [SimpleFormComponent],
    providers: [],
})
export class SimpleFormModule {}
