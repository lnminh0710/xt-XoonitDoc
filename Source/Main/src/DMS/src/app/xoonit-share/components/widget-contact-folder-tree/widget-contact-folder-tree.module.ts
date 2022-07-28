import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@xn-control/light-material-ui/icon';
import { XnDocumentTreeModule } from '@xn-control/xn-document-tree/xn-document-tree.module';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { WidgetContactFolderTreeComponent } from './widget-contact-folder-tree.component';

@NgModule({
    declarations: [WidgetContactFolderTreeComponent],
    imports: [CommonModule, XnDocumentTreeModule, MatIconModule, TooltipModule.forRoot()],
    exports: [WidgetContactFolderTreeComponent],
    providers: [],
})
export class WidgetContactFolderTreeModule {}
