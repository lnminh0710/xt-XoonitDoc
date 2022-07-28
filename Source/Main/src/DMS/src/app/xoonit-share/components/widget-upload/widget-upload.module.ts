import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { XnTranslationModule } from '@app/shared/components/translation/xn-translation.module';
import { XnDragDropModule } from '@app/shared/directives/xn-dragable';
import { MatCheckboxModule } from '@xn-control/light-material-ui/checkbox';
import { MatIconModule } from '@xn-control/light-material-ui/icon';
import { DndModule } from 'ng2-dnd';
import { DragulaModule } from 'ng2-dragula';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { WidgetUploadComponent } from './widget-upload.component';

@NgModule({
    declarations: [WidgetUploadComponent],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        XnTranslationModule,
        TooltipModule,
        MatIconModule,
        MatCheckboxModule,
        DndModule,
        XnDragDropModule,
        DragulaModule,
        PerfectScrollbarModule,
    ],
    exports: [WidgetUploadComponent],
    providers: [],
    entryComponents: [WidgetUploadComponent],
})
export class WidgetUploaModule {}
