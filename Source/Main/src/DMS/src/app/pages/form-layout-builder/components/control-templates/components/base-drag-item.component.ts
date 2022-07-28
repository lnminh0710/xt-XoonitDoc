import { Directive, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { BaseComponent } from '@app/pages/private/base';
import { Router } from '@angular/router';
import { IDragItem } from '@app/pages/form-layout-builder/models/drag-item.interface';
import { IDraggableComponent } from './draggable-component.interface';
import { Observable, Subject } from 'rxjs';
import { DroppedComponentEvent } from '@app/pages/form-layout-builder/components/control-templates/events/dropped-component.event';
import { cloneDeep } from 'lodash-es';
import { CdkDragDrop } from '@angular/cdk/drag-drop';

@Directive()
export abstract class BaseDragItemComponent extends BaseComponent implements IDraggableComponent, OnDestroy {
    @Input() dragItem: IDragItem;

    @Output() dropped = new EventEmitter<IDragItem>();

    private _hasAttachedEmitter = new Subject<DroppedComponentEvent>();

    constructor(protected router: Router) {
        super(router);
    }

    ngOnDestroy(): void {
        this.dragItem = null;
        this.onDestroy();
    }

    protected onDestroy() {
        super.onDestroy();
        this._hasAttachedEmitter.complete();
    }

    public get hasAttachedComponent(): Observable<DroppedComponentEvent> {
        return this._hasAttachedEmitter.asObservable();
    }

    protected emitHasAttachedComponent() {
        const containerIds = this.dragItem.getConnectedContainerIds();
        this._hasAttachedEmitter.next({
            containerIds,
        });
    }

    protected cloneDragDropData(event: CdkDragDrop<IDragItem>) {
        const data = cloneDeep(event.item.data) as IDragItem;
        return data;
    }
}
