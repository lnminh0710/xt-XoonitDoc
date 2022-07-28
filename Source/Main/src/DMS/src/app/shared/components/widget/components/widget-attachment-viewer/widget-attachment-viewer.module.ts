import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { WidgetAttachmentViewer } from './widget-attachment-viewer.component';
import { PdfAttachmentViewerComponent } from './pdf-attachment-viewer';
import { ImageAttachmentViewerComponent } from './image-attachment-viewer';
import { MediaAttachmentViewerComponent } from './media-attachment-viewer';
import { TxtAttachmentViewerComponent } from './txt-attachment-viewer';
import { AttachmentToolbarComponent } from './attachment-toolbar';
import { AttachmentEmailComponent } from './attachment-email';
import { UnsupportAttachmentViewerComponent } from './unsupport-attachment-viewer';
import { OfficeAttachmentViewerComponent } from './office-attachment-viewer';
import * as primengModule from 'primeng/primeng';
import { XnImageSpinnerModule } from '@app/shared/directives/xn-image-spinner';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { MatIconModule } from '@xn-control/light-material-ui/icon';
import { MatButtonModule } from '@xn-control/light-material-ui/button';
import { XnTranslationModule } from '../../../translation/xn-translation.module';
import { FormsModule } from '@angular/forms';
import { PipesModule } from '@app/pipes/pipes.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        TooltipModule.forRoot(),
        PdfViewerModule,
        PerfectScrollbarModule,
        XnImageSpinnerModule,
        NgxDocViewerModule,
        MatIconModule,
        MatButtonModule,
        primengModule.DialogModule,
        XnTranslationModule,
        PipesModule,
    ],
    exports: [
        WidgetAttachmentViewer,
        XnTranslationModule,
        PdfAttachmentViewerComponent,
        ImageAttachmentViewerComponent,
        MediaAttachmentViewerComponent,
        TxtAttachmentViewerComponent,
        AttachmentToolbarComponent,
        AttachmentEmailComponent,
        OfficeAttachmentViewerComponent,
        UnsupportAttachmentViewerComponent,
    ],
    declarations: [
        WidgetAttachmentViewer,
        PdfAttachmentViewerComponent,
        ImageAttachmentViewerComponent,
        MediaAttachmentViewerComponent,
        TxtAttachmentViewerComponent,
        AttachmentToolbarComponent,
        AttachmentEmailComponent,
        OfficeAttachmentViewerComponent,
        UnsupportAttachmentViewerComponent,
    ],
    providers: [],
})
export class WidgetAttachmentViewerModule {}
