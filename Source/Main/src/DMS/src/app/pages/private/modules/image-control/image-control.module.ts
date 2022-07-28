import { NgModule } from '@angular/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { CommonModule } from '@angular/common';
import { WIDGETS_COMPONENTS } from './components';
import * as primengModule from 'primeng/primeng';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { XnDragDropModule } from '@app/shared/directives/xn-dragable';
import { PipesModule } from '@app/pipes/pipes.module';
import { DndModule } from 'ng2-dnd';
import { XnDocumentOcrModule } from '@app/shared/directives/xn-document-ocr';
import { DragulaModule } from 'ng2-dragula';
import { APP_SERVICES } from './services';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { XnImageSpinnerModule } from '@app/shared/directives/xn-image-spinner';
import { FormsModule } from '@angular/forms';
import { DocumentManagementHandlerService } from '@app/pages/document-management/services/document-management-handler.service';
import { DmsDashboardHandlerService } from '../mydm/services/dms-dashboard-handler.service';
import { XnInputDebounceModule } from '@xn-control/xn-input-debounce/xn-input-debounce.module';
import { XnTranslationModule } from '@app/shared/components/translation/xn-translation.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        TooltipModule.forRoot(),
        primengModule.DialogModule,
        PerfectScrollbarModule,
        XnDragDropModule,
        PipesModule,
        XnDocumentOcrModule,
        DragulaModule,
        InfiniteScrollModule,
        DndModule,
        XnImageSpinnerModule,
        XnInputDebounceModule,
        XnTranslationModule,
    ],
    declarations: [...WIDGETS_COMPONENTS],
    exports: [...WIDGETS_COMPONENTS, CommonModule],
    providers: [...APP_SERVICES, DocumentManagementHandlerService, DmsDashboardHandlerService],
})
export class ImageControlModule {}
