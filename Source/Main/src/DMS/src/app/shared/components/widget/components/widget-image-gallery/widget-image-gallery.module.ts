import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { WidgetImageGallery } from './widget-image-gallery.component';

import * as primengModule from 'primeng/primeng';
import { XnImageSpinnerModule } from '@app/shared/directives/xn-image-spinner';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { MatIconModule } from '@xn-control/light-material-ui/icon';
import { MatButtonModule } from '@xn-control/light-material-ui/button';
import { XnTranslationModule } from '../../../translation/xn-translation.module';
import { FormsModule } from '@angular/forms';
import { PdfAttachmentViewerComponent } from '../widget-attachment-viewer/pdf-attachment-viewer';
import { ImageAttachmentViewerComponent } from '../widget-attachment-viewer/image-attachment-viewer';
import { MediaAttachmentViewerComponent } from '../widget-attachment-viewer/media-attachment-viewer';
import { TxtAttachmentViewerComponent } from '../widget-attachment-viewer/txt-attachment-viewer';
import { AttachmentToolbarComponent } from '../widget-attachment-viewer/attachment-toolbar';
import { AttachmentEmailComponent } from '../widget-attachment-viewer/attachment-email';
import { OfficeAttachmentViewerComponent } from '../widget-attachment-viewer/office-attachment-viewer';
import { UnsupportAttachmentViewerComponent } from '../widget-attachment-viewer/unsupport-attachment-viewer';
import { WidgetAttachmentViewerModule } from '../widget-attachment-viewer/widget-attachment-viewer.module';
import { ImageControlModule } from '@app/pages/private/modules/image-control';
import { PipesModule } from '@app/pipes/pipes.module';
import { SlickCarouselModule } from 'ngx-slick-carousel';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        TooltipModule.forRoot(),
        PerfectScrollbarModule,
        MatIconModule,
        MatButtonModule,
        primengModule.DialogModule,
        XnTranslationModule,
        PipesModule,
        SlickCarouselModule,
        ImageControlModule,
        WidgetAttachmentViewerModule,
    ],
    exports: [WidgetImageGallery, XnTranslationModule],
    declarations: [WidgetImageGallery],
    providers: [],
})
export class WidgetImageGalleryModule {}
