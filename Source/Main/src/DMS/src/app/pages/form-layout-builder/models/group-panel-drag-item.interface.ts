import { LegendEntryComponent } from '@swimlane/ngx-charts';
import { DragItemTypeEnum } from './drag-item-type.enum';
import { BaseDragItem, IDragItem } from './drag-item.interface';
import { IRowDragItem } from './row-drag-item.interface';

export interface IGroupPanelDragItem extends IDragItem {
    children: IRowDragItem[];
}

export class GroupPanelDragItem extends BaseDragItem implements IGroupPanelDragItem {
    public children: IRowDragItem[];

    constructor(params?: Partial<GroupPanelDragItem>) {
        super();
        Object.assign(this, params);
        this.dragItemType = DragItemTypeEnum.GROUP_PANEL;
        this.title = 'Group Panel';
    }

    public getConnectedContainerIds(): string[] {
        if (!this.children || !this.children.length) {
            return super.getConnectedContainerIds();
        }

        let connectedContainerIds = [];

        this.children.forEach((child) => {
            const ids = child.getConnectedContainerIds();
            connectedContainerIds = connectedContainerIds.concat(ids);
        });

        connectedContainerIds.push(this.containerId);

        return connectedContainerIds;
    }
}
