import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule, ANALYZE_FOR_ENTRY_COMPONENTS } from '@angular/core';
import { ControlTemplatesComponent } from '@app/pages/form-layout-builder/components/control-templates/control-templates.component';
import { DraggableItemContainerComponent } from '@app/pages/form-layout-builder/components/control-templates/components/draggable-item-container/draggable-item-container.component';
import { RowDragItemComponent } from '@app/pages/form-layout-builder/components/control-templates/components/row-drag-item/row-drag-item.component';
import { ColumnDragItemComponent } from '@app/pages/form-layout-builder/components/control-templates/components/column-drag-item/column-drag-item.component';
import { TextboxDragItemComponent } from '@app/pages/form-layout-builder/components/control-templates/components/textbox-drag-item/textbox-drag-item.component';
import { GroupPanelDragItemComponent } from '@app/pages/form-layout-builder/components/control-templates/components/group-panel-drag-item/group-panel-drag-item.component';
import { XnDynamicMaterialControlModule } from '@xn-control/xn-dynamic-material-control';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@xn-control/light-material-ui/button';
import { MatIconModule } from '@xn-control/light-material-ui/icon';

@NgModule({
    declarations: [
        ControlTemplatesComponent,
        DraggableItemContainerComponent,
        RowDragItemComponent,
        ColumnDragItemComponent,
        GroupPanelDragItemComponent,
        TextboxDragItemComponent,
    ],
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        DragDropModule,
        XnDynamicMaterialControlModule,
    ],
    exports: [ControlTemplatesComponent, DraggableItemContainerComponent],
    providers: [],
})
export class ControlTemplatesModule {
    static withComponents(components: any[]) {
        return {
            ngModule: ControlTemplatesModule,
            providers: [{ provide: ANALYZE_FOR_ENTRY_COMPONENTS, useValue: components, multi: true }],
            entryComponents: [...components],
        };
    }
}
