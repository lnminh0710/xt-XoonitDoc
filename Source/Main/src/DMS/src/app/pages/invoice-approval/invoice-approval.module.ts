import { NgModule } from '@angular/core';
import { XnSharedModule } from '@app/shared';
import { RouterModule } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { AngularSplitModule } from 'angular-split';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { ModalModule } from 'ngx-bootstrap/modal';
import { EffectsModule } from '@ngrx/effects';
import { GlobalSearchModule } from '@app/shared/components/global-search/global-search.module';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { XnBsDatepickerModule } from '@app/xoonit-share/components/xn-bs-datepicker/xn-bs-datepicker.module';
import { InvoiceApprovalComponent } from './invoice-approval.component';
import { InvoiceApprovalEffects } from './invoice-approval.statemanagement/invoice-approval.effects';
import { invoiceApprovalRoutes } from './invoice-approval.routing';
import { invoiceApprovalReducer } from './invoice-approval.statemanagement/invoice-approval.reducer';
import { InvoiceApprovalSelectors } from './invoice-approval.statemanagement/invoice-approval.selectors';
import { XnApprovalFormProcessingDirectiveModule } from '../../shared/directives/xn-approval-form-processing';
import { WidgetSearchPageModule } from '@app/xoonit-share/components/widget-search-page/widget-search-page.module';
import { XnHotKeyProcessingDirectiveModule } from '../../shared/directives/xn-hot-key-processing';

@NgModule({
    declarations: [InvoiceApprovalComponent],
    imports: [
        AngularSplitModule,
        BsDatepickerModule,
        XnBsDatepickerModule,
        TypeaheadModule,
        PerfectScrollbarModule,
        ModalModule,
        RouterModule.forChild(invoiceApprovalRoutes),
        EffectsModule.forFeature([InvoiceApprovalEffects]),
        StoreModule.forFeature('invoiceApprovalPageReducer', invoiceApprovalReducer),
        XnSharedModule,
        GlobalSearchModule,
        XnApprovalFormProcessingDirectiveModule,
        WidgetSearchPageModule,
        XnHotKeyProcessingDirectiveModule
    ],
    exports: [],
    providers: [InvoiceApprovalSelectors],
})
export class InvoiceApprovalModule {}
