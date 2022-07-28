import { CdkDrag, CdkDragDrop, CdkDragStart, CdkDropList, transferArrayItem } from '@angular/cdk/drag-drop';
import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormLayoutBuilderSelectors } from '@app/pages/form-layout-builder/form-layout-builder.statemanagement/form-layout-builder.selectors';
import { IColumnDragItem } from '@app/pages/form-layout-builder/models/column-drag-item.interface';
import { DragItemTypeEnum } from '@app/pages/form-layout-builder/models/drag-item-type.enum';
import { IDragItem } from '@app/pages/form-layout-builder/models/drag-item.interface';
import { DropZoneTypeEnum } from '@app/pages/form-layout-builder/models/drop-zone-type.enum';
import { takeUntil } from 'rxjs/operators';
import { BaseDragItemComponent } from '../base-drag-item.component';
import { IDroppableComponent } from '../droppable.component.interface';
import { Store } from '@ngrx/store';
import { IFormLayoutBuilderState } from '../../../../form-layout-builder.statemanagement/form-layout-builder.state';
import { UpdateLayoutControlAction } from '../../../../form-layout-builder.statemanagement/form-layout-builder.actions';

@Component({
    selector: 'column-drag-item',
    styleUrls: ['column-drag-item.component.scss'],
    templateUrl: 'column-drag-item.component.html',
})
export class ColumnDragItemComponent
    extends BaseDragItemComponent
    implements IDroppableComponent, OnInit, AfterViewInit {
    private _zoneCtrlTemplateContainerId: string;

    public connectedContainerIds: string[];

    @Input() dragItem: IColumnDragItem;
    @ViewChild(CdkDropList) cdkDropList: CdkDropList<IColumnDragItem>;

    constructor(protected router: Router, private formLayoutBuilderSelectors: FormLayoutBuilderSelectors,
        private store: Store<IFormLayoutBuilderState>) {
        super(router);
        this._subscribeZoneControlTemplateContainerId();
    }

    ngOnInit() {
        if (!this.dragItem) {
            return;
        }

        if (!this.dragItem.children) {
            this.dragItem.children = [];
        }
    }

    ngAfterViewInit() {
        this.dragItem.containerId = this.cdkDropList.id;
        if (this.dragItem.dropZone === DropZoneTypeEnum.CONTAINER) {
            this.dropped.emit(this.dragItem);
        }

        this._subscribeCdkListDropConnectedChanges();
    }

    public drop($event: CdkDragDrop<IDragItem[]>) {
        const data = $event.item.data as IDragItem;
        // we don't allow drop GROUP PANEL, ROW, COLUMN inside COLUMN
        if (
            data.dragItemType === DragItemTypeEnum.GROUP_PANEL ||
            data.dragItemType === DragItemTypeEnum.ROW ||
            data.dragItemType === DragItemTypeEnum.COLUMN
        ) {
            return;
        }

        // column drag item just accept only 1 control inside
        if (!this.dragItem.children || this.dragItem.children.length >= 1) {
            return;
        }

        if (this._didMoveToNewContainer($event)) {
            transferArrayItem(
                $event.previousContainer.data,
                $event.container.data,
                $event.previousIndex,
                $event.currentIndex,
            );
            return;
        }
        this.store.dispatch(new UpdateLayoutControlAction(data));
        this.dragItem.children.push(data);
    }

    public dragStarted($event: CdkDragStart<IDragItem>) {
        // has assigned data property
        if ($event.source.data) return;

        // we only drag control inside column-drag-item component.
        // so we pass data of that control (textbox, label, select, autocomplete, datepicker, ...etc)
        $event.source.data = this.dragItem.children[0];
    }

    private _didMoveToNewContainer(event: CdkDragDrop<IDragItem[]>): boolean {
        // move to other container
        // previous container must be different from zone of control templates
        if (
            event.container.id !== event.previousContainer.id &&
            event.previousContainer.id !== this._zoneCtrlTemplateContainerId
        ) {
            return true;
        }

        return false;
    }

    private _subscribeCdkListDropConnectedChanges() {
        this.formLayoutBuilderSelectors.zoneContainerIds$
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((zoneConnectedIds) => {
                const newZoneConnectedIds = [...zoneConnectedIds].filter((id: string) => id !== this.cdkDropList.id);
                this.cdkDropList.connectedTo = newZoneConnectedIds;
                this.connectedContainerIds = newZoneConnectedIds;
            });
    }

    private _subscribeZoneControlTemplateContainerId() {
        this.formLayoutBuilderSelectors.zoneControlTemplateContainerId$
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((zoneCtrlTemplateContainerId) => {
                this._zoneCtrlTemplateContainerId = zoneCtrlTemplateContainerId;
            });
    }
}
