import { IColumnDragItem } from './column-drag-item.interface';
import { DragItemType, DragItemTypeEnum } from './drag-item-type.enum';
import { BaseDragItem, IDragItem } from './drag-item.interface';

export interface IRowDragItem extends IDragItem {
    children: IColumnDragItem[];
}

export class RowDragItem extends BaseDragItem implements IRowDragItem {
    public children: IColumnDragItem[];

    constructor(params?: Partial<RowDragItem>) {
        super();
        Object.assign(this, params);
        this.dragItemType = DragItemTypeEnum.ROW;
        this.title = 'Row';
    }

    public getConnectedContainerIds(): string[] {
        if (!this.children || !this.children.length) {
            return super.getConnectedContainerIds();
        }

        const connectedContainerIds = [];

        // regarding column children, we add the last column has dragged to first index in array ZoneContainerIds
        this.children.forEach((child) => {
            const ids = child.getConnectedContainerIds();
            connectedContainerIds.splice(0, 0, ...ids);
        });
        connectedContainerIds.push(this.containerId);

        return connectedContainerIds;
    }
}
