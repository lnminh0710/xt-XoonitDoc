import { CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormLayoutBuilderSelectors } from '@app/pages/form-layout-builder/form-layout-builder.statemanagement/form-layout-builder.selectors';
import { IColumnDragItem } from '@app/pages/form-layout-builder/models/column-drag-item.interface';
import { DragItemTypeEnum } from '@app/pages/form-layout-builder/models/drag-item-type.enum';
import { IDragItem } from '@app/pages/form-layout-builder/models/drag-item.interface';
import { DropZoneTypeEnum } from '@app/pages/form-layout-builder/models/drop-zone-type.enum';
import { IGroupPanelDragItem } from '@app/pages/form-layout-builder/models/group-panel-drag-item.interface';
import { IRowDragItem, RowDragItem } from '@app/pages/form-layout-builder/models/row-drag-item.interface';
import { takeUntil } from 'rxjs/operators';
import { BaseDragItemComponent } from '../base-drag-item.component';
import { IDroppableComponent } from '../droppable.component.interface';


@Component({
    selector: 'group-panel-drag-item',
    styleUrls: ['group-panel-drag-item.component.scss'],
    templateUrl: 'group-panel-drag-item.component.html',
})
export class GroupPanelDragItemComponent extends BaseDragItemComponent implements IDroppableComponent, OnInit, AfterViewInit {
    public connectedContainerIds: string[];

    @Input() dragItem: IGroupPanelDragItem;
    @ViewChild(CdkDropList) cdkDropList: CdkDropList<IColumnDragItem>;

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
                new RowDragItem(
                {
                    dragItemType: DragItemTypeEnum.ROW,
                    title: 'Row',
                    dropZone: DropZoneTypeEnum.CONTAINER,
                    children: [],
                }),
            );
        }
    }

    ngAfterViewInit(): void {
        this.dragItem.containerId = this.cdkDropList.id;
        this.emitHasAttachedComponent();
        this._subscribeCdkListDropConnectedChanges();
    }

    public drop($event: CdkDragDrop<IDragItem>) {
        const data = super.cloneDragDropData($event);
        // we only allow drop ROW
        if (data.dragItemType !== DragItemTypeEnum.ROW) {
            return;
        }

        const clonedData = super.cloneDragDropData($event);
        clonedData.dropZone = DropZoneTypeEnum.CONTAINER;
        this.dragItem.children.push(clonedData as IRowDragItem);
    }

    public dropRowDone($event: IDragItem) {
        // this case when row-drag-item run ngAfterViewInit and emit out
        // but group-panel-drag-item has not run ngAfterViewInit yet
        if (typeof this.dragItem.containerId === 'undefined') return;

        this.emitHasAttachedComponent();
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
