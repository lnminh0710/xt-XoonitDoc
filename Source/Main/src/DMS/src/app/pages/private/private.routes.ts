import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UnsavedModulesGuard } from '@app/services';
import { PrivateComponent } from './private.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PrivateLoadResolve } from './private-load.resolve';
import { DMSDashboardComponent } from './dms-dashboard/dms-dashboard.component';
import { CapturedPageComponent } from './dms-dashboard/components/captured-page/captured-page.component';

const PRIVATE_ROUTES: Routes = [
    {
        path: 'Processing',
        component: DMSDashboardComponent,
        children: [
            { path: '', component: CapturedPageComponent }
        ],
    },
    { path: 'Invoice', component: DMSDashboardComponent },
    { path: 'Briefe', component: DMSDashboardComponent },
    { path: 'SystemManagement', component: DashboardComponent },

    { path: 'Tools', component: DashboardComponent },
    { path: 'Tools/TracksSetup', component: DashboardComponent },
    { path: 'Tools/ScanManagement', component: DashboardComponent },
    { path: 'Tools/DoubletCheckTool', component: DashboardComponent },
    { path: 'Tools/ToolsAddOn', component: DashboardComponent },
    { path: 'Tools/CampaignAddOn', component: DashboardComponent },
];

const routes: Routes = [
    {
        path: '',
        component: PrivateComponent,
        children: PRIVATE_ROUTES,
        canDeactivate: [UnsavedModulesGuard],
        resolve: { '': PrivateLoadResolve },
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class PrivateRoutingModule {}
