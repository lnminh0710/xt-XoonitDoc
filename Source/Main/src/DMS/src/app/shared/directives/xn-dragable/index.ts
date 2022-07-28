import { NgModule } from '@angular/core';
import { DraggableDirective } from './xn-draggable.directive';
import { DropTargetDirective } from './xn-droptarget.directive';

@NgModule({
    imports: [],
    declarations: [DraggableDirective, DropTargetDirective],
    exports: [DraggableDirective, DropTargetDirective],
    providers: []
})
export class XnDragDropModule { }
