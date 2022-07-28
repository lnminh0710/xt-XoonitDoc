import { CdkDrag, CdkDragDrop, CdkDragEnter, CdkDragExit, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { AfterViewInit, Component, OnInit, ViewChild, EventEmitter, Output } from '@angular/core';
import { DragItemTypeEnum } from '../../models/drag-item-type.enum';
import { IDragItem } from '../../models/drag-item.interface';
import { cloneDeep } from 'lodash-es';
import { Store } from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import { DroppedComponentEvent } from '@app/pages/form-layout-builder/components/control-templates/events/dropped-component.event';
import { UpdateZoneContainerIdsFormDesigner, UpdateLayoutControlAction } from '../../form-layout-builder.statemanagement/form-layout-builder.actions';
import { GroupPanelDragItem, IGroupPanelDragItem } from '../../models/group-panel-drag-item.interface';

@Component({
    selector: 'form-designer',
    styleUrls: ['form-designer.component.scss'],
    templateUrl: 'form-designer.component.html',
})
export class FormDesignerComponent implements OnInit, AfterViewInit {
    public controls: IDragItem[] = [];
    @ViewChild(CdkDropList) cdkDropList: CdkDropList<IDragItem[]>;

    constructor(private store: Store<AppState>) {}

    ngOnInit() {}

    ngAfterViewInit(): void {
        this.store.dispatch(
            new UpdateZoneContainerIdsFormDesigner({
                containerIds: [this.cdkDropList.id],
            }),
        );
    }

    public drop($event: CdkDragDrop<IDragItem>) {
        // !must clone data from control templates
        const data = cloneDeep($event.item.data) as IDragItem;

        // we only allow drop GROUP_PANEL & ROW
        if (data.dragItemType !== DragItemTypeEnum.GROUP_PANEL && data.dragItemType !== DragItemTypeEnum.ROW) {
            return;
        }

        if (this.canBeDropped($event)) {
        }

        this.controls.push(data);
    }

    public canBeDropped(event: CdkDragDrop<IDragItem, IDragItem>) {
        const canBeDropped = true;
        return canBeDropped;
    }

    public dropComponentDone($event: DroppedComponentEvent) {
        // !must put this cdkDropList id at the end. that will make children cdkDropList can be able drop
        // !so that this cdkDropList at root top on UI but in list Ids then at the end
        this.store.dispatch(
            new UpdateZoneContainerIdsFormDesigner({
                containerIds: [...$event.containerIds],
            }),
        );
    }

    private _isNotSelfDrop(event: CdkDragDrop<IDragItem> | CdkDragEnter<IDragItem> | CdkDragExit<IDragItem>): boolean {
        return event.container.data.containerId !== event.item.data.containerId;
    }
}
