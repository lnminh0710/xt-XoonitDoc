import { NgModule } from '@angular/core';
import { WidgetContactDeailComponent } from './widget-contact-detail.component';
import { CommonModule } from '@angular/common';
import { XnDynamicMaterialControlModule } from '@xn-control/xn-dynamic-material-control';
import { XnMaterialAutocompleteControlComponent } from '@xn-control/xn-dynamic-material-control/components/xn-material-autocomplete-control/xn-material-autocomplete-control.component';
import { XnMaterialInputControlComponent } from '@xn-control/xn-dynamic-material-control/components/xn-material-input-control/xn-material-input-control.component';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { MatIconModule } from '@xn-control/light-material-ui/icon';

@NgModule({
    declarations: [WidgetContactDeailComponent],
    imports: [
        CommonModule,
        XnDynamicMaterialControlModule.withComponents([
            XnMaterialInputControlComponent,
            XnMaterialAutocompleteControlComponent,
        ]),
        TooltipModule.forRoot(),
        MatIconModule,
    ],
    exports: [WidgetContactDeailComponent],
    providers: [],
})
export class WidgetContactDetailModule {}
