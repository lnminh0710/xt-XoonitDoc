import { NgModule } from '@angular/core';

import { XnDocumentTreeNodeDialogComponent } from './xn-document-tree-node-dialog.component';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@xn-control/light-material-ui/dialog';
import { MatInputModule } from '@xn-control/light-material-ui/input';
import { MatRadioModule } from '@xn-control/light-material-ui/radio';
import { MatButtonModule } from '@xn-control/light-material-ui/button';
import { XnTranslationModule } from '../../translation/xn-translation.module';
import { MatIconModule } from '@xn-control/light-material-ui/icon';
import { XnDynamicMaterialControlModule } from '@xn-control/xn-dynamic-material-control';
import { XnMaterialInputControlComponent } from '@xn-control/xn-dynamic-material-control/components/xn-material-input-control/xn-material-input-control.component';
import { XnMaterialRadiosControlComponent } from '@xn-control/xn-dynamic-material-control/components/xn-material-radios-control/xn-material-radios-control.component';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatInputModule,
        MatRadioModule,
        MatButtonModule,
        MatIconModule,
        XnTranslationModule,
        XnDynamicMaterialControlModule.withComponents([
            XnMaterialInputControlComponent,
            XnMaterialRadiosControlComponent,
        ]),
    ],
    declarations: [XnDocumentTreeNodeDialogComponent],
    exports: [XnDocumentTreeNodeDialogComponent],
    providers: [],
})
export class XnDocumentTreeNodeDialogModule { }
