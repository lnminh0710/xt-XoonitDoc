import { NgModule } from '@angular/core';
import { WidgetEmailFolderTreeComponent_REMOVED } from './widget-email-folder-tree_REMOVED.component';
import { MatSlideToggleModule } from '@xn-control/light-material-ui/slide-toggle';
import { CommonModule } from '@angular/common';
import { XnDocumentTreeModule } from '@xn-control/xn-document-tree/xn-document-tree.module';
import { XnTranslationModule } from '@app/shared/components/translation/xn-translation.module';
import { FormsModule } from '@angular/forms';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        MatSlideToggleModule,
        XnDocumentTreeModule,
        XnTranslationModule,
        TooltipModule.forRoot(),
    ],
    exports: [WidgetEmailFolderTreeComponent_REMOVED],
    declarations: [WidgetEmailFolderTreeComponent_REMOVED],
    providers: [],
})
export class WidgetEmailFolderTreeModule_REMOVED {}
