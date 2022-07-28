import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WidgetDynamicFormModule } from '../widget-dynamic-form/widget-dynamic-form.module';
import { WidgetSupplierInfoApprovalComponent } from './widget-supplier-info-approval.component';
import { XnSearchTableModule } from '../xn-search-table/xn-search-table.module';
import { XnTranslationModule } from '@app/shared/components/translation/xn-translation.module';


@NgModule({
    declarations: [WidgetSupplierInfoApprovalComponent],
    imports: [CommonModule, WidgetDynamicFormModule, XnSearchTableModule, XnTranslationModule],
    exports: [WidgetSupplierInfoApprovalComponent],
    providers: [],
    entryComponents: [],
})
export class WidgetSupplierInfoModule {}
