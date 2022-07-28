import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormDesignerComponent } from '@app/pages/form-layout-builder/components/form-designer/form-designer.component';
import { ControlTemplatesModule } from '../control-templates/control-templates.module';
import { RowDragItemComponent } from '@app/pages/form-layout-builder/components/control-templates/components/row-drag-item/row-drag-item.component';
import { ColumnDragItemComponent } from '@app/pages/form-layout-builder/components/control-templates/components/column-drag-item/column-drag-item.component';
import { TextboxDragItemComponent } from '@app/pages/form-layout-builder/components/control-templates/components/textbox-drag-item/textbox-drag-item.component';
import { GroupPanelDragItemComponent } from '../control-templates/components/group-panel-drag-item/group-panel-drag-item.component';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';

@NgModule({
    imports: [
        CommonModule,
        DragDropModule,
        ControlTemplatesModule.withComponents([
            RowDragItemComponent,
            ColumnDragItemComponent,
            TextboxDragItemComponent,
            GroupPanelDragItemComponent,
        ]),
        PerfectScrollbarModule,
    ],
    exports: [FormDesignerComponent],
    declarations: [FormDesignerComponent],
    providers: [],
})
export class FormDesignerModule { }
