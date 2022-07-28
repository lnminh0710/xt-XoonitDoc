import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { XnTranslationModule } from '@app/shared/components/translation/xn-translation.module';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { MatAutocompleteModule } from '@xn-control/light-material-ui/autocomplete';
import { MatButtonModule } from '@xn-control/light-material-ui/button';
import { MatDialogModule } from '@xn-control/light-material-ui/dialog';
import { MatFormFieldModule } from '@xn-control/light-material-ui/form-field';
import { MatIconModule } from '@xn-control/light-material-ui/icon';
import { MatInputModule } from '@xn-control/light-material-ui/input';
import { MatTooltipModule } from '@xn-control/light-material-ui/tooltip';
import { XnDynamicMaterialControlModule } from '@xn-control/xn-dynamic-material-control';
import { XnMaterialAutocompleteControlComponent } from '@xn-control/xn-dynamic-material-control/components/xn-material-autocomplete-control/xn-material-autocomplete-control.component';
import { XnMaterialInputControlComponent } from '@xn-control/xn-dynamic-material-control/components/xn-material-input-control/xn-material-input-control.component';
import { XnMaterialSlideToggleControlComponent } from '@xn-control/xn-dynamic-material-control/components/xn-material-slide-toggle-control/xn-material-slide-toggle-control.component';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { DynamicFormService } from './services/dynamic-form.service';

import { WidgetDynamicFormComponent } from './widget-dynamic-form.component';
import { WidgetDynamicFormEffects } from './widget-dynamic-form.state/widget-dynamic-form.effects';
import { dynamicFormReducer } from './widget-dynamic-form.state/widget-dynamic-form.reducer';
import { WidgetDynamicFormSelectors } from './widget-dynamic-form.state/widget-dynamic-form.selectors';
import { DynamicFormGroupModule } from '../dynamic-form-group/dynamic-form-group.module';
import { SimpleFormModule } from './components/simple-form/simple-form.module';
import { DynamicFormFieldModule } from '../dynamic-form-field/dynamic-form-field.module';
import { DynamicFormTableModule } from '../dynamic-form-table/dynamic-form-table.module';
import { HTMLInputControlComponent } from '@xn-control/xn-dynamic-material-control/components/html-input-control/html-input-control.component';
import { DynamicFormFieldListModule } from '../dynamic-form-field-list/dynamic-form-field-list.module';
import { XnMaterialCheckboxControlComponent } from '@xn-control/xn-dynamic-material-control/components/xn-material-checkbox-control/xn-material-checkbox-control.component';

@NgModule({
    imports: [
        CommonModule,
        MatFormFieldModule,
        MatInputModule,
        MatAutocompleteModule,
        MatButtonModule,
        MatIconModule,
        MatDialogModule,
        MatTooltipModule,
        PerfectScrollbarModule,
        XnDynamicMaterialControlModule.withComponents([
            XnMaterialInputControlComponent,
            XnMaterialAutocompleteControlComponent,
            XnMaterialAutocompleteControlComponent,
            XnMaterialInputControlComponent,
            XnMaterialSlideToggleControlComponent,
            XnMaterialCheckboxControlComponent,
            HTMLInputControlComponent,
        ]),
        XnTranslationModule,
        TooltipModule.forRoot(),
        StoreModule.forFeature('dynamicFormReducer', dynamicFormReducer),
        EffectsModule.forFeature([WidgetDynamicFormEffects]),
        DynamicFormGroupModule,
        SimpleFormModule,
        DynamicFormFieldModule,
        DynamicFormTableModule,
        DynamicFormFieldListModule
    ],
    exports: [WidgetDynamicFormComponent],
    declarations: [WidgetDynamicFormComponent],
    providers: [DynamicFormService, WidgetDynamicFormSelectors],
    entryComponents: [],
})
export class WidgetDynamicFormModule {}
