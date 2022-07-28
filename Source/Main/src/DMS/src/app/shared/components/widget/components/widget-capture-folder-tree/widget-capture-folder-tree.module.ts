import { NgModule } from '@angular/core';
import { WidgetCaptureFolderTreeComponent } from './widget-capture-folder-tree.component';
import { MatSlideToggleModule } from '@xn-control/light-material-ui/slide-toggle';
import { CommonModule } from '@angular/common';
import { XnDocumentTreeModule } from '@xn-control/xn-document-tree/xn-document-tree.module';
import { XnTranslationModule } from '@app/shared/components/translation/xn-translation.module';
import { MatIconModule } from '@xn-control/light-material-ui/icon';
import { FormsModule } from '@angular/forms';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ContextMenuModule } from 'ngx-contextmenu';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        MatSlideToggleModule,
        MatIconModule,
        XnDocumentTreeModule,
        XnTranslationModule,
        TooltipModule.forRoot(),
        ContextMenuModule.forRoot()
    ],
    exports: [WidgetCaptureFolderTreeComponent],
    declarations: [WidgetCaptureFolderTreeComponent],
    providers: [],
})
export class WidgetCaptureFolderTreeModule {}
