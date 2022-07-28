import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WidgetMyDmFormComponent } from '@widget/components/widget-mydm-form/widget-mydm-form.component';
import { ContractFormComponent } from '@widget/components/widget-mydm-form/components/contract-form/contract-form.component';
import { InvoiceFormComponent } from '@widget/components/widget-mydm-form/components/invoice-form/invoice-form.component';
import { OtherDocumentsFormComponent } from '@widget/components/widget-mydm-form/components/other-documents-form/other-documents-form.component';
import { MatIconModule } from '@xn-control/light-material-ui/icon';
import { MatButtonModule } from '@xn-control/light-material-ui/button';
import { MatTooltipModule } from '@xn-control/light-material-ui/tooltip';
import { XnDynamicMaterialControlModule } from '@xn-control/xn-dynamic-material-control';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { MatDialogModule } from '@xn-control/light-material-ui/dialog';
import { DynamicFieldDialogComponent } from '@app/xoonit-share/components/dynamic-field-dialog/dynamic-field-dialog.component';
import { MatFormFieldModule } from '@xn-control/light-material-ui/form-field';
import { MatInputModule } from '@xn-control/light-material-ui/input';
import { MatAutocompleteModule } from '@xn-control/light-material-ui/autocomplete';
import { XnTranslationModule } from '@app/shared/components/translation/xn-translation.module';
import { SharingContactDialogComponent } from './components/sharing-contact-dialog/sharing-contact-dialog.component';
import { XnMaterialInputControlComponent } from '@xn-control/xn-dynamic-material-control/components/xn-material-input-control/xn-material-input-control.component';
import { XnMaterialAutocompleteControlComponent } from '@xn-control/xn-dynamic-material-control/components/xn-material-autocomplete-control/xn-material-autocomplete-control.component';
import { XnMaterialDatepickerControlComponent } from '@xn-control/xn-dynamic-material-control/components/xn-material-datepicker-control/xn-material-datepicker-control.component';
import { XnMaterialSelectControlComponent } from '@xn-control/xn-dynamic-material-control/components/xn-material-select-control/xn-material-select-control.component';
import { XnMaterialSlideToggleControlComponent } from '@xn-control/xn-dynamic-material-control/components/xn-material-slide-toggle-control/xn-material-slide-toggle-control.component';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { DynamicFieldDialogModule } from '@app/xoonit-share/components/dynamic-field-dialog/dynamic-field-dialog.module';
import { InvoiceAddonComponent } from './components/invoice-addon/invoice-addon.component';
import { XnMaterialCheckboxControlComponent } from '@xn-control/xn-dynamic-material-control/components/xn-material-checkbox-control/xn-material-checkbox-control.component';
import { XnMaterialSelectSearchControlComponent } from '@xn-control/xn-dynamic-material-control/components/xn-material-select-search-control/xn-material-select-search-control.component';

@NgModule({
    declarations: [
        WidgetMyDmFormComponent,
        ContractFormComponent,
        InvoiceFormComponent,
        OtherDocumentsFormComponent,
        InvoiceAddonComponent,
        SharingContactDialogComponent,
    ],
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
            XnMaterialDatepickerControlComponent,
            XnMaterialSelectControlComponent,
            XnMaterialSlideToggleControlComponent,
            XnMaterialCheckboxControlComponent,
            XnMaterialSelectSearchControlComponent,
        ]),
        XnTranslationModule,
        TooltipModule.forRoot(),
        DynamicFieldDialogModule,
    ],
    exports: [WidgetMyDmFormComponent],
    providers: [],
    entryComponents: [
        ContractFormComponent,
        InvoiceFormComponent,
        OtherDocumentsFormComponent,
        InvoiceAddonComponent,
        DynamicFieldDialogComponent,
        SharingContactDialogComponent,
    ],
})
export class WidgetMyDmFormModule {}
