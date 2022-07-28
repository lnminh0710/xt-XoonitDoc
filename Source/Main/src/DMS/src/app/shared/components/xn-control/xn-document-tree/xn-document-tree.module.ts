import { NgModule } from '@angular/core';
import { XnDocumentTreeComponent } from './xn-document-tree.component';
import { CommonModule } from '@angular/common';
import { TreeModule } from '@circlon/angular-tree-component';
import { XnDocumentTreeNodeDialogModule } from '@xn-control/xn-document-tree-node-dialog/xn-document-tree-node-dialog.module';
import { MatInputModule } from '@xn-control/light-material-ui/input';
import { MatDialogModule } from '@xn-control/light-material-ui/dialog';
import { XnDocumentTreeNodeDialogComponent } from '@xn-control/xn-document-tree-node-dialog/xn-document-tree-node-dialog.component';
import { PipesModule } from '@app/pipes/pipes.module';
import { MatIconModule } from '@xn-control/light-material-ui/icon';
import { MatButtonModule } from '@xn-control/light-material-ui/button';
import { MatSlideToggleModule } from '@xn-control/light-material-ui/slide-toggle';
import { XnTranslationModule } from '../../translation/xn-translation.module';
import { XnDocumentTreeHeaderComponent } from './components/xn-document-tree-header/xn-document-tree-header.component';
import { XnDocumentTreeService } from './services/xn-document-tree.service';
import { FormsModule } from '@angular/forms';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatSlideToggleModule,
        MatDialogModule,
        TreeModule,
        PipesModule,
        XnDocumentTreeNodeDialogModule,
        XnTranslationModule,
        TooltipModule.forRoot(),
    ],
    exports: [XnDocumentTreeComponent, XnDocumentTreeHeaderComponent],
    declarations: [XnDocumentTreeComponent, XnDocumentTreeHeaderComponent],
    providers: [XnDocumentTreeService],
    entryComponents: [XnDocumentTreeNodeDialogComponent],
})
export class XnDocumentTreeModule {}
