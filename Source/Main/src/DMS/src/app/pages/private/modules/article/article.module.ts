import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { WIDGETS_COMPONENTS } from './components';
import { RouterModule } from '@angular/router';
import { XnImageLoaderModule } from '@app/shared/directives/xn-image-loader';
import { WjInputModule } from 'wijmo/wijmo.angular2.input';
import { APP_SERVICES } from './services';
import { XnGalleriaModule } from '@app/shared/components/xn-control/xn-galleria/xn-galleria.module';
import { PipesModule } from '@app/pipes/pipes.module';
import { XnAgGridModule } from '@app/shared/components/xn-control/xn-ag-grid';
import { AgGridModule } from 'ag-grid-angular';
import { TemplateHeaderCellRenderer, TemplateCellRenderer, TemplateEditCellRenderer } from '@app/shared/components/xn-control/xn-ag-grid/components';
// import { MaterialModule } from '@app/shared/components/xn-control/light-material-ui/material.module';
import * as primengModule from 'primeng/primeng';
import { MatCheckboxModule } from '@xn-control/light-material-ui/checkbox';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        XnImageLoaderModule,
        WjInputModule,
        XnGalleriaModule,
        PipesModule,
        XnAgGridModule,
        AgGridModule.withComponents([TemplateHeaderCellRenderer, TemplateCellRenderer, TemplateEditCellRenderer]),
        // MaterialModule,
        primengModule.DialogModule,
        MatCheckboxModule,
    ],
    declarations: [
        ...WIDGETS_COMPONENTS
    ],
    exports: [
        CommonModule,
        ...WIDGETS_COMPONENTS
    ],
    providers: [
        ...APP_SERVICES,
        DatePipe
    ]
})
export class ArticleModule { }
