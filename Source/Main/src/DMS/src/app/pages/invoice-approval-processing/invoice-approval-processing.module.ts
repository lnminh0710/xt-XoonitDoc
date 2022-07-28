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
import { InvoiceApprovalProcessingComponent } from './invoice-approval-processing.component';
import { InvoiceApprovalProcessingEffects } from './invoice-approval-processing.statemanagement/invoice-approval-processing.effects';
import { invoiceApprovalProcessingRoutes } from './invoice-approval-processing.routing';
import { invoiceApprovalProcessingReducer } from './invoice-approval-processing.statemanagement/invoice-approval-processing.reducer';
import { InvoiceApprovalProcessingSelectors } from './invoice-approval-processing.statemanagement/invoice-approval-processing.selectors';
import { XnApprovalFormProcessingDirectiveModule } from '../../shared/directives/xn-approval-form-processing';
import { CommonModule } from '@angular/common';
import { XnHotKeyProcessingDirectiveModule } from '../../shared/directives/xn-hot-key-processing';
import { ExtractedDataApprovalProcessingModule } from '@app/xoonit-share/components/extracted-data-approval-processing/extracted-data-approval-processing.module';

@NgModule({
    declarations: [InvoiceApprovalProcessingComponent],
    imports: [
        CommonModule,
        AngularSplitModule,
        PerfectScrollbarModule,
        ModalModule,
        RouterModule.forChild(invoiceApprovalProcessingRoutes),
        EffectsModule.forFeature([InvoiceApprovalProcessingEffects]),
        StoreModule.forFeature('invoiceApprovalPageReducer', invoiceApprovalProcessingReducer),
        XnSharedModule,
        GlobalSearchModule,
        BsDatepickerModule,
        XnBsDatepickerModule,
        TypeaheadModule,
        XnApprovalFormProcessingDirectiveModule,
        XnHotKeyProcessingDirectiveModule,
        ExtractedDataApprovalProcessingModule,
    ],
    exports: [],
    providers: [InvoiceApprovalProcessingSelectors],
})
export class InvoiceApprovalProcessingModule {}
