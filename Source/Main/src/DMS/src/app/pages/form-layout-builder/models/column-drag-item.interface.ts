import { DragItemTypeEnum } from './drag-item-type.enum';
import { BaseDragItem, IDragItem } from './drag-item.interface';

export interface IColumnDragItem extends IDragItem {
    children: IDragItem[];
}

export class ColumnDragItem extends BaseDragItem implements IColumnDragItem {
    public children: IDragItem[];

    constructor(params?: Partial<ColumnDragItem>) {
        super();
        Object.assign(this, params);
        this.dragItemType = DragItemTypeEnum.COLUMN;
        this.title = 'Column';
    }

    public getConnectedContainerIds(): string[] {
        return super.getConnectedContainerIds();
    }
}
