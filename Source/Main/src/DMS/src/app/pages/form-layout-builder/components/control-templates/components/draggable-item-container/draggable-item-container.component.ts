import {
    Component,
    ComponentFactory,
    ComponentFactoryResolver,
    ComponentRef,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';
import { IDragItem } from '@app/pages/form-layout-builder/models/drag-item.interface';
import { DragItemTypeEnum } from '@app/pages/form-layout-builder/models/drag-item-type.enum';
import { BaseDragItemComponent } from '../base-drag-item.component';
import { RowDragItemComponent } from '../row-drag-item/row-drag-item.component';
import { ColumnDragItemComponent } from '../column-drag-item/column-drag-item.component';
import { TextboxDragItemComponent } from '../textbox-drag-item/textbox-drag-item.component';
import { GroupPanelDragItemComponent } from '../group-panel-drag-item/group-panel-drag-item.component';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DroppedComponentEvent } from '@app/pages/form-layout-builder/components/control-templates/events/dropped-component.event';

@Component({
    selector: 'draggable-item-container',
    styleUrls: ['draggable-item-container.component.scss'],
    templateUrl: 'draggable-item-container.component.html',
})
export class DraggableItemContainerComponent implements OnInit, OnDestroy {
    private _componentRef: ComponentRef<BaseDragItemComponent>;
    private _onDestroyEmitter = new ReplaySubject<boolean>();

    @Input() dragItem: IDragItem;
    @Output() onDropped = new EventEmitter<DroppedComponentEvent>();

    @ViewChild('draggableItemWrapper', { read: ViewContainerRef, static: true })
    draggableItemWrapper: ViewContainerRef;

    constructor(private componentFactoryResolver: ComponentFactoryResolver) {}

    ngOnInit() {
        if (!this.dragItem || !this.dragItem.dragItemType) return;

        this._renderContentComponent(this.dragItem);
    }

    ngOnDestroy(): void {
        this._onDestroyEmitter.next(true);
        this._componentRef.destroy();
        this.draggableItemWrapper.clear();
    }

    private _renderContentComponent(dragItem: IDragItem) {
        let _componentFactory: ComponentFactory<BaseDragItemComponent>;
        switch (dragItem.dragItemType) {
            case DragItemTypeEnum.ROW:
                _componentFactory = this.componentFactoryResolver.resolveComponentFactory(RowDragItemComponent);
                break;

            case DragItemTypeEnum.COLUMN:
                _componentFactory = this.componentFactoryResolver.resolveComponentFactory(ColumnDragItemComponent);
                break;

            case DragItemTypeEnum.TEXTBOX:
                _componentFactory = this.componentFactoryResolver.resolveComponentFactory(TextboxDragItemComponent);
                break;

            case DragItemTypeEnum.GROUP_PANEL:
                _componentFactory = this.componentFactoryResolver.resolveComponentFactory(GroupPanelDragItemComponent);
                break;

            default:
                return;
        }

        const _componentRef = this.draggableItemWrapper.createComponent<BaseDragItemComponent>(_componentFactory);
        _componentRef.instance.dragItem = this.dragItem;

        this._componentRef = _componentRef;

        // if outter has observed @Output hasDroppedEnd then we will emit when the inner component (dynamic) emit hasDroppedEnd event
        if (this.onDropped.observers && this.onDropped.observers.length) {
            this._componentRef.instance.hasAttachedComponent
                .pipe(takeUntil(this._onDestroyEmitter.asObservable()))
                .subscribe((val) => {
                    this.onDropped.emit(val);
                });
        }
    }
}
