import { NgModule } from '@angular/core';
import { WIDGETS_COMPONENTS } from './components';
import { APP_SERVICES } from './services';
import * as primengModule from 'primeng/primeng';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { XnFolderManagementModule } from '@app/shared/directives/xn-folder-management';
import { FileUploadModule } from '@app/shared/components/xn-file';
import { DndModule } from 'ng2-dnd';
import { AgGridModule } from 'ag-grid-angular';

@NgModule({
    declarations: [...WIDGETS_COMPONENTS],
    imports: [
        primengModule.DialogModule,
        TooltipModule.forRoot(),
        PerfectScrollbarModule,
        XnFolderManagementModule,
        FileUploadModule,
        DndModule,
        AgGridModule,
    ],
    exports: [...WIDGETS_COMPONENTS],
    providers: [...APP_SERVICES],
})
export class FileManagerModule {}
