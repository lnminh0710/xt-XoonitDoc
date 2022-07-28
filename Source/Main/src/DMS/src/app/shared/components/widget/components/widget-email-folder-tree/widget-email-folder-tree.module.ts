import { NgModule } from '@angular/core';
import { WidgetEmailFolderTreeComponent } from './widget-email-folder-tree.component';
import { MatSlideToggleModule } from '@xn-control/light-material-ui/slide-toggle';
import { CommonModule } from '@angular/common';
import { XnDocumentTreeModule } from '@xn-control/xn-document-tree/xn-document-tree.module';
import { XnTranslationModule } from '@app/shared/components/translation/xn-translation.module';
import { MatIconModule } from '@xn-control/light-material-ui/icon';
import { FormsModule } from '@angular/forms';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ContextMenuModule } from 'ngx-contextmenu';
import { MatButtonModule } from '@xn-control/light-material-ui/button';
import { WidgetMemberPermissionDialogModule } from '@app/xoonit-share/components/widget-member-permission-dialog/widget-member-permission-dialog.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        MatSlideToggleModule,
        MatIconModule,
        MatButtonModule,
        XnDocumentTreeModule,
        XnTranslationModule,
        TooltipModule.forRoot(),
        ContextMenuModule.forRoot(),
        // WidgetMemberPermissionDialogModule,
    ],
    exports: [WidgetEmailFolderTreeComponent],
    declarations: [WidgetEmailFolderTreeComponent],
    providers: [],
})
export class WidgetEmailFolderTreeModule {}
