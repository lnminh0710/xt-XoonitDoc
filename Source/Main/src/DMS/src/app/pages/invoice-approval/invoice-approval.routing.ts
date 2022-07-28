import { Routes } from '@angular/router';
import { PrivateLoadResolve } from '../private/private-load.resolve';
import { InvoiceApprovalComponent } from './invoice-approval.component';

export const invoiceApprovalRoutes: Routes = [
    {
        path: '',
        component: InvoiceApprovalComponent,
        resolve: { '': PrivateLoadResolve },
    },
];
