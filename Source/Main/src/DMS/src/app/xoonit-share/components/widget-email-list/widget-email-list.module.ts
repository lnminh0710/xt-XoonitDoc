import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { XnTranslationModule } from '@app/shared/components/translation/xn-translation.module';
import { XnDragDropModule } from '@app/shared/directives/xn-dragable';
import { XnHotKeyProcessingDirectiveModule } from '@app/shared/directives/xn-hot-key-processing';
import { MatIconModule } from '@xn-control/light-material-ui/icon';
import { XnAgGridModule } from '@xn-control/xn-ag-grid';
import { DndModule } from 'ng2-dnd';
import { DragulaModule } from 'ng2-dragula';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { WidgetUploaModule } from '../widget-upload/widget-upload.module';
import { WidgetEmailListComponent } from './widget-email-list.component';

@NgModule({
    declarations: [WidgetEmailListComponent],
    imports: [
        CommonModule,
        XnTranslationModule,
        XnHotKeyProcessingDirectiveModule,
        TooltipModule.forRoot(),
        PerfectScrollbarModule,
        MatIconModule,
        XnAgGridModule,
        DndModule,
        XnDragDropModule,
        DragulaModule,
        WidgetUploaModule,
    ],
    exports: [WidgetEmailListComponent],
    providers: [],
    entryComponents: [],
})
export class WidgetEmailListModule {}
