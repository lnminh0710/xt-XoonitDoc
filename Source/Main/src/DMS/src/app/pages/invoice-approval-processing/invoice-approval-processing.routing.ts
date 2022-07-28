import { Routes } from '@angular/router';
import { PrivateLoadResolve } from '../private/private-load.resolve';
import { InvoiceApprovalProcessingComponent } from './invoice-approval-processing.component';

export const invoiceApprovalProcessingRoutes: Routes = [
    {
        path: '',
        component: InvoiceApprovalProcessingComponent,
        resolve: { '': PrivateLoadResolve },
    },
];
