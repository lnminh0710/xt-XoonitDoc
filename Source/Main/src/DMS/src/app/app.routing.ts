import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Default Component
import { HomeComponent } from './pages/home/home.component';
import { AppCustomPreloader } from './app-routing-loader';
import { CanLoadGuard } from './services';
import { AppleAppSiteAssociationComponent } from './pages/apple-app-site-association/apple-app-site-association.component';
import { AppleAppSiteAssociationGuard } from './pages/apple-app-site-association/apple-app-site-association.guard';
import { PrivateModule } from './pages/private/private.module';

export function getPrivateModule() {
    return PrivateModule;
}

const routes: Routes = [
    {
        path: '', // load with main core bundle
        // redirectTo: 'index',
        // pathMatch: 'full'
        component: HomeComponent,
    },
    {
        path: 'apple-app-site-association',
        component: AppleAppSiteAssociationComponent,
        canActivate: [AppleAppSiteAssociationGuard],
    },
    {
        path: 'index', // load with main core bundle
        component: HomeComponent,
    },
    {
        path: 'auth',
        loadChildren: () => import('./pages/public/public.module').then((module) => module.PublicModule),
        data: { preload: true }, // preload in background to be ready to use when user navigates to this route
    },
    {
        path: 'module',
        canLoad: [CanLoadGuard],
        loadChildren: () => import('./pages/private/private.module').then((module) => module.PrivateModule),
        data: { preload: true }, // preload in background to be ready to use when user navigates to this route
    },
    {
        path: 'search',
        canLoad: [CanLoadGuard],
        loadChildren: () => import('./pages/search/search.module').then((module) => module.SearchModule),
        data: { preload: true }, // preload in background to be ready to use when user navigates to this route
    },
    {
        path: 'advancesearch',
        canLoad: [CanLoadGuard],
        loadChildren: () =>
            import('./pages/search/advance-search/advance-search.module').then((module) => module.AdvanceSearchModule),
        data: { preload: true }, // preload in background to be ready to use when user navigates to this route
    },
    {
        path: 'Scan',
        canLoad: [CanLoadGuard],
        loadChildren: () =>
            import('./pages/scanning-input/scanning-input.module').then((module) => module.ScanningInputModule),
        data: { preload: true }, // preload in background to be ready to use when user navigates to this route
    },
    {
        path: 'Contact',
        canLoad: [CanLoadGuard],
        loadChildren: () => import('./pages/my-contact/my-contact.module').then((module) => module.MyContactModule),
        data: { preload: true },
    },
    {
        path: 'Document',
        canLoad: [CanLoadGuard],
        loadChildren: () =>
            import('./pages/document-management/document-management.module').then(
                (module) => module.DocumentManagementModule,
            ),
        data: { preload: true },
    },
    {
        path: 'Cloud',
        canLoad: [CanLoadGuard],
        loadChildren: () =>
            import('./pages/cloud-integration/cloud-integration.module').then(
                (module) => module.CloudIntegrationModule,
            ),
        data: { preload: true },
    },
    {
        path: 'Import',
        canLoad: [CanLoadGuard],
        loadChildren: () =>
            import('./pages/import-upload/import-upload.module').then((module) => module.ImportUploadModule),
        data: { preload: true },
    },
    {
        path: 'Export',
        canLoad: [CanLoadGuard],
        loadChildren: () => import('./pages/export/export.module').then((module) => module.ExportModule),
        data: { preload: true },
    },
    {
        path: 'UserGuide',
        canLoad: [CanLoadGuard],
        loadChildren: () => import('./pages/user-guide/user-guide.module').then((module) => module.UserGuideModule),
        data: { preload: true },
    },
    {
        path: 'History',
        canLoad: [CanLoadGuard],
        loadChildren: () => import('./pages/history/history.module').then((module) => module.HistoryModule),
        data: { preload: true },
    },
    {
        path: 'ChangePassword',
        canLoad: [CanLoadGuard],
        loadChildren: () =>
            import('./pages/user-profile/user-profile.module').then((module) => module.UserProfileModule),
        data: { preload: true },
    },
    {
        path: 'User_Old',
        canLoad: [CanLoadGuard],
        loadChildren: () =>
            import('./pages/user-management/user-management.module').then((module) => module.UserManagementModule),
        data: { preload: true },
    },
    {
        path: 'FormBuilder',
        canLoad: [CanLoadGuard],
        loadChildren: () =>
            import('./pages/form-layout-builder/form-layout-builder.module').then(
                (module) => module.FormLayoutBuilderModule,
            ),
        data: { preload: true },
    },
    {
        path: 'Email',
        canLoad: [CanLoadGuard],
        loadChildren: () => import('./pages/email/email.module').then((module) => module.EmailModule),
        data: { preload: true },
    },
    {
        path: 'Approval',
        canLoad: [CanLoadGuard],
        loadChildren: () =>
            import('./pages/invoice-approval/invoice-approval.module').then((module) => module.InvoiceApprovalModule),
        data: { preload: true },
    },
    {
        path: 'ApprovalProcessing',
        canLoad: [CanLoadGuard],
        loadChildren: () =>
            import('./pages/invoice-approval-processing/invoice-approval-processing.module').then(
                (module) => module.InvoiceApprovalProcessingModule,
            ),
        data: { preload: true },
    },
    {
        path: 'Processing',
        canLoad: [CanLoadGuard],
        loadChildren: () =>
            import('./pages/document-processing/document-processing.module').then(
                (module) => module.DocumentProcessingModule,
            ),
        data: { preload: true },
    },
    {
        path: 'widget',
        canLoad: [CanLoadGuard],
        loadChildren: () => import('./pages/widget/widget.module').then((module) => module.WidgetModule),
        data: { preload: true },
    },
    {
        path: 'User',
        canLoad: [CanLoadGuard],
        loadChildren: () => import('./pages/user-v2/user-v2.module').then((module) => module.UserV2Module),
        data: { preload: true },
    },
    {
        path: 'Indexing',
        canLoad: [CanLoadGuard],
        loadChildren: () => import('./pages/indexing/indexing.module').then((module) => module.IndexingModule),
        data: { preload: true },
    },
    {
        path: 'PreissChild',
        canLoad: [CanLoadGuard],
        loadChildren: () => import('./pages/preisschild/preisschild.module').then((module) => module.PreissChildModule),
        data: { preload: true },
    },
    {
        path: 'Company',
        canLoad: [CanLoadGuard],
        loadChildren: () => import('./pages/customer/customer.module').then((module) => module.CustomerPageModule),
        data: { preload: true },
    },
    {
        path: '**',
        redirectTo: 'index',
        pathMatch: 'full',
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { preloadingStrategy: AppCustomPreloader })], // PreloadAllModules, AppCustomPreloader
    exports: [RouterModule],
    providers: [AppCustomPreloader],
})
export class AppRoutingModule {}
