import { NgModule } from '@angular/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { CommonModule } from '@angular/common';
import { WIDGETS_COMPONENTS } from './components';
// import { APP_SERVICES } from './services';
import * as primengModule from 'primeng/primeng';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { XnDragDropModule } from '@app/shared/directives/xn-dragable';
import { PipesModule } from '@app/pipes/pipes.module';
import { DndModule } from 'ng2-dnd';
import { DragulaModule } from 'ng2-dragula';
import { APP_SERVICES } from './services';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { XnImageSpinnerModule } from '@app/shared/directives/xn-image-spinner';
import { ImageControlModule } from '../image-control';
import { MatSlideToggleModule } from '@xn-control/light-material-ui/slide-toggle';
import { MatRadioModule } from '@xn-control/light-material-ui/radio';
// import { MaterialModule } from '@app/shared/components/xn-control/light-material-ui/material.module';
import { MyDMModule } from '../mydm';
import { XnTranslationModule } from '@app/shared/components/translation/xn-translation.module';

@NgModule({
    imports: [
        CommonModule,
        TooltipModule.forRoot(),
        primengModule.DialogModule,
        PerfectScrollbarModule,
        XnDragDropModule,
        PipesModule,
        DragulaModule,
        InfiniteScrollModule,
        DndModule,
        XnImageSpinnerModule,
        ImageControlModule,
        // MaterialModule,
        MatSlideToggleModule,
        MatRadioModule,
        MyDMModule,
        XnTranslationModule,
    ],
    declarations: [...WIDGETS_COMPONENTS],
    exports: [...WIDGETS_COMPONENTS, CommonModule],
    providers: [...APP_SERVICES],
})
export class ScanningModule {}
