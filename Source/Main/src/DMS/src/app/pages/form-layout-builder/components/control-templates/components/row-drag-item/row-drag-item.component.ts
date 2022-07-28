import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IRowDragItem } from '@app/pages/form-layout-builder/models/row-drag-item.interface';
import { BaseDragItemComponent } from '../base-drag-item.component';
import { DragItemTypeEnum } from '@app/pages/form-layout-builder/models/drag-item-type.enum';
import { ColumnDragItem, IColumnDragItem } from '@app/pages/form-layout-builder/models/column-drag-item.interface';
import { CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { IDragItem } from '@app/pages/form-layout-builder/models/drag-item.interface';
import { FormLayoutBuilderSelectors } from '@app/pages/form-layout-builder/form-layout-builder.statemanagement/form-layout-builder.selectors';
import { takeUntil } from 'rxjs/operators';
import { IDroppableComponent } from '../droppable.component.interface';
import { DropZoneTypeEnum } from '@app/pages/form-layout-builder/models/drop-zone-type.enum';

@Component({
    selector: 'row-drag-item',
    styleUrls: ['row-drag-item.component.scss'],
    templateUrl: 'row-drag-item.component.html',
})
export class RowDragItemComponent extends BaseDragItemComponent implements IDroppableComponent, OnInit, AfterViewInit {
    public connectedContainerIds: string[];

    @Input() dragItem: IRowDragItem;

    @ViewChild(CdkDropList) cdkDropList: CdkDropList<IRowDragItem>;

    constructor(
        protected router: Router,
        private formLayoutBuilderSelectors: FormLayoutBuilderSelectors,
    ) {
        super(router);
    }


    ngOnInit() {
        if (!this.dragItem) {
            return;
        }

        this.dragItem.children = this.dragItem.children || [];

        if (!this.dragItem.children.length) {
            this.dragItem.children.push(
                new ColumnDragItem({
                    dragItemType: DragItemTypeEnum.COLUMN,
                    dropZone: DropZoneTypeEnum.CONTAINER,
                    title: 'Column',
                    children: [],
                }),
            );
        }
    }

    ngAfterViewInit() {
        this.dragItem.containerId = this.cdkDropList.id;
        if (this.dragItem.dropZone === DropZoneTypeEnum.CONTAINER) {
            this.dropped.emit(this.dragItem);
        } else {
            this.emitHasAttachedComponent();
        }
        this._subscribeCdkListDropConnectedChanges();
    }

    public drop($event: CdkDragDrop<IDragItem>) {
        const data = $event.item.data as IDragItem;
        // we only allow drop COLUMN
        if (data.dragItemType !== DragItemTypeEnum.COLUMN) {
            return;
        }

        const clonedData = super.cloneDragDropData($event);
        clonedData.dropZone = DropZoneTypeEnum.CONTAINER;
        this.dragItem.children.push(clonedData as IColumnDragItem);
    }

    public dropColumnDone($event: IDragItem) {
        // this case when column-drag-item run ngAfterViewInit and emit out
        // but row-drag-item has not run ngAfterViewInit yet
        if (typeof this.dragItem.containerId === 'undefined') return;

        if (this.dragItem.dropZone === DropZoneTypeEnum.CONTAINER) {
            this.dropped.emit(this.dragItem);
        } else {
            this.emitHasAttachedComponent();
        }
    }

    private _subscribeCdkListDropConnectedChanges() {
        this.formLayoutBuilderSelectors.zoneContainerIds$
            .pipe(
                takeUntil(this.getUnsubscriberNotifier())
            ).subscribe((zoneConnectedIds) => {
                const newZoneConnectedIds = [...zoneConnectedIds].filter((id: string) => id !== this.cdkDropList.id);
                this.cdkDropList.connectedTo = newZoneConnectedIds;
                this.connectedContainerIds = newZoneConnectedIds;
            });
    }
}
