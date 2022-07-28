import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WidgetInvoiceInfoApprovalComponent } from './widget-invoice-info-approval.component';
import { WidgetDynamicFormModule } from '../widget-dynamic-form/widget-dynamic-form.module';
import { XnSearchTableModule } from '../xn-search-table/xn-search-table.module';
import { XnTranslationModule } from '@app/shared/components/translation/xn-translation.module';

@NgModule({
    declarations: [WidgetInvoiceInfoApprovalComponent],
    imports: [CommonModule, XnSearchTableModule, WidgetDynamicFormModule, XnTranslationModule],
    exports: [WidgetInvoiceInfoApprovalComponent],
    providers: [],
    entryComponents: [],
})
export class WidgetInvoiceInfoModule {}
