import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExtractedDataApprovalProcessingComponent } from './extracted-data-approval-processing.component';
import { ExtractedDataHandlerComponent } from './extracted-data-handler/extracted-data-handler.component';
import { WidgetDynamicFormModule } from '../widget-dynamic-form/widget-dynamic-form.module';
import { XnAgGridModule } from '@xn-control/xn-ag-grid';
import { XnTranslationModule } from '@app/shared/components/translation/xn-translation.module';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { AngularSplitModule } from 'angular-split';
import { MatIconModule } from '@xn-control/light-material-ui/icon';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ImageControlModule } from '@app/pages/private/modules/image-control/image-control.module';

@NgModule({
    declarations: [ExtractedDataApprovalProcessingComponent, ExtractedDataHandlerComponent],
    imports: [
        CommonModule,
        WidgetDynamicFormModule,
        XnAgGridModule,
        XnTranslationModule,
        DragDropModule,
        AngularSplitModule,
        ImageControlModule,
        MatIconModule,
        TooltipModule
    ],
    exports: [ExtractedDataApprovalProcessingComponent],
    providers: [],
    entryComponents: [],
})
export class ExtractedDataApprovalProcessingModule {}
