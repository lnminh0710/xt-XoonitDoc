import { NgModule, ANALYZE_FOR_ENTRY_COMPONENTS } from '@angular/core';
import { SpreadsheetViewerComponent } from './components/spreadsheet-viewer/spreadsheet-viewer.component';
import { TextViewerComponent } from './components/text-viewer/text-viewer.component';
import { WidgetViewerComponent } from './widget-viewer.component';
import { WjCoreModule } from 'wijmo/wijmo.angular2.core';
import { WjGridModule } from 'wijmo/wijmo.angular2.grid';
import { WjGridSheetModule } from 'wijmo/wijmo.angular2.grid.sheet';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { DndModule } from 'ng2-dnd';
import { WidgetPdfViewerComponent } from './components/pdf-viewer/pdf-viewer.component';
import { ImageViewerComponent } from './components/image-viewer/image-viewer.component';
import { AudioViewerComponent } from './components/audio-viewer/audio-viewer.component';
import { VideoViewerComponent } from './components/video-viewer/video-viewer.component';
import { ZipViewerComponent } from './components/compressed-file-viewer/zip-viewer/zip-viewer.component';
import { RarViewerComponent } from './components/compressed-file-viewer/rar-viewer/rar-viewer.component';
import { DocumentManagementSelectors } from '@app/pages/document-management/document-management.statemanagement/document-management.selectors';
import { FileManagerModule } from '@app/pages/private/modules/file-manager/file-manager.module';
import { PdfViewerModule } from 'ng2-pdf-viewer';

@NgModule({
    declarations: [
        TextViewerComponent,
        SpreadsheetViewerComponent,
        WidgetViewerComponent,
        WidgetPdfViewerComponent,
        ImageViewerComponent,
        AudioViewerComponent,
        VideoViewerComponent,
        ZipViewerComponent,
        RarViewerComponent,
    ],
    imports: [
        WjCoreModule,
        WjGridModule,
        WjGridSheetModule,
        PerfectScrollbarModule,
        DndModule,
        FileManagerModule,
        PdfViewerModule,
    ],
    exports: [
        WidgetViewerComponent
    ],
    providers: [
        DocumentManagementSelectors
    ],
})
export class WidgetViewerModule {
    static withComponents(components: any[]) {
        return {
            ngModule: WidgetViewerModule,
            providers: [
                { provide: ANALYZE_FOR_ENTRY_COMPONENTS, useValue: components, multi: true }
            ],
            entryComponents: [
                ...components
            ]
        }
    }
}