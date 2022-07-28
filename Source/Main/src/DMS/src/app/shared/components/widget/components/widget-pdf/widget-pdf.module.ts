import {NgModule} from '@angular/core';
import {WidgetPdfComponent} from './widget-pdf.component';
import {CommonModule} from '@angular/common';
import { WjViewerModule } from 'wijmo/wijmo.angular2.viewer';

@NgModule({
    imports: [CommonModule, WjViewerModule],
    exports: [WidgetPdfComponent],
    declarations: [WidgetPdfComponent],
})
export class WidgetPdfModule {
}
