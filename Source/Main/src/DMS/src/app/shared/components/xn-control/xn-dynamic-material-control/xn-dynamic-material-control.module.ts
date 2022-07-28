import { NgModule, ANALYZE_FOR_ENTRY_COMPONENTS } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicMaterialControlComponent } from './xn-dynamic-material-control.component';
import { ReactiveFormsModule } from '@angular/forms';
import { XnDynamicMaterialHelperService } from './services/xn-dynamic-matertial-helper.service';
import { XnMaterialInputControlModule } from './components/xn-material-input-control/xn-material-input-control.module';
import { XnMaterialDatepickerControlModule } from './components/xn-material-datepicker-control/xn-material-datepicker-control.module';
import { XnMaterialAutocompleteControlModule } from './components/xn-material-autocomplete-control/xn-material-autocomplete-control.module';
import { XnMaterialSelectControlModule } from './components/xn-material-select-control/xn-material-select-control.module';
import { XnMaterialRadiosControlModule } from './components/xn-material-radios-control/xn-material-radios-control.module';
import { XnMaterialSlideToggleControlModule } from './components/xn-material-slide-toggle-control/xn-material-slide-toggle-control.module';
import { MatButtonModule } from '@xn-control/light-material-ui/button';
import { HTMLInputControlModule } from './components/html-input-control/html-input-control.module';
import { XnMaterialCheckboxControlModule } from './components/xn-material-checkbox-control/xn-material-checkbox-control.module';
import { XnMaterialSelectSearchControlModule } from './components/xn-material-select-search-control/xn-material-select-search-control.module';

@NgModule({
    declarations: [DynamicMaterialControlComponent],
    imports: [
        CommonModule,
        MatButtonModule,
        XnMaterialInputControlModule,
        XnMaterialAutocompleteControlModule,
        XnMaterialDatepickerControlModule,
        XnMaterialSelectControlModule,
        XnMaterialRadiosControlModule,
        XnMaterialSlideToggleControlModule,
        HTMLInputControlModule,
        XnMaterialCheckboxControlModule,
        XnMaterialSelectSearchControlModule,
    ],
    exports: [
        DynamicMaterialControlComponent,
        ReactiveFormsModule,
        XnMaterialInputControlModule,
        XnMaterialAutocompleteControlModule,
        XnMaterialDatepickerControlModule,
        XnMaterialSelectControlModule,
        XnMaterialRadiosControlModule,
        XnMaterialSlideToggleControlModule,
        HTMLInputControlModule,
        XnMaterialSelectControlModule,
        XnMaterialSelectSearchControlModule,
    ],
    providers: [],
})
export class XnDynamicMaterialControlModule {
    static withComponents(components: any[]) {
        return {
            ngModule: XnDynamicMaterialControlModule,
            providers: [
                { provide: ANALYZE_FOR_ENTRY_COMPONENTS, useValue: components, multi: true },
                XnDynamicMaterialHelperService,
            ],
            entryComponents: [...components],
        };
    }
}
