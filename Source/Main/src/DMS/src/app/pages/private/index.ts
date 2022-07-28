import { DashboardComponent } from './dashboard/dashboard.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { DMSDashboardComponent } from './dms-dashboard/dms-dashboard.component';
import { CapturedPageComponent } from './dms-dashboard/components/captured-page';
//import { CapturedDocumentDetailComponent } from './dms-dashboard/components/captured-document-detail';

export const WIDGETS_COMPONENTS = [
    DashboardComponent,
    DMSDashboardComponent,
    CapturedPageComponent,
    // CapturedDocumentDetailComponent,
    NotFoundComponent,
];
