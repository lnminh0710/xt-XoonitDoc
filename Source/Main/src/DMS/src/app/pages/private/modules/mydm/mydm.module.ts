import { NgModule } from '@angular/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { CommonModule } from '@angular/common';
import { WIDGETS_COMPONENTS } from './components';
import { CloudRemoteConnectionComponent } from './components/cloud-remote-connection';
// import { APP_SERVICES } from './services';
import * as primengModule from 'primeng/primeng';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PipesModule } from '@app/pipes/pipes.module';
import { APP_SERVICES } from './services';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { AgGridModule } from 'ag-grid-angular';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { ImageControlModule } from '../image-control';
import { XnDocumentOcrModule } from '@app/shared/directives/xn-document-ocr';
import { MatFormFieldModule } from '@xn-control/light-material-ui/form-field';
import { MatSlideToggleModule } from '@xn-control/light-material-ui/slide-toggle';
import { MatRadioModule } from '@xn-control/light-material-ui/radio';
import { MatInputModule } from '@xn-control/light-material-ui/input';
import { MatButtonModule } from '@xn-control/light-material-ui/button';
import { MatSelectModule } from '@xn-control/light-material-ui/select';
import { MatIconModule } from '@xn-control/light-material-ui/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { XnErrorMessageModule } from '@app/xoonit-share/components/xn-error-message/xn-error-message.module';
import { XnEnterBreakDownDirectiveModule } from '@app/xoonit-share/directives/xn-enter-break-down/xn-enter-break-down.module';
import { MatDialogModule } from '@xn-control/light-material-ui/dialog';
import { XnTranslationModule } from '@app/shared/components/translation/xn-translation.module';

@NgModule({
    imports: [
        CommonModule,
        TooltipModule.forRoot(),
        primengModule.DialogModule,
        MatDialogModule,
        PerfectScrollbarModule,
        PipesModule,
        InfiniteScrollModule,
        AgGridModule,
        PdfViewerModule,
        ImageControlModule,
        XnDocumentOcrModule,
        MatSlideToggleModule,
        MatFormFieldModule,
        MatRadioModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
        FormsModule,
        ReactiveFormsModule,
        XnErrorMessageModule,
        XnEnterBreakDownDirectiveModule,
        XnTranslationModule,
    ],
    declarations: [...WIDGETS_COMPONENTS],
    entryComponents: [CloudRemoteConnectionComponent],
    exports: [...WIDGETS_COMPONENTS],
    providers: [...APP_SERVICES],
})
export class MyDMModule {}
