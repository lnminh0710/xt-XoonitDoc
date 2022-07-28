import { DragItemType } from '@app/pages/form-layout-builder/models/drag-item-type.enum';
import { DropZoneType, DropZoneTypeEnum } from './drop-zone-type.enum';
import { ControlProperty } from './control-property';

export interface IDragItem {
    key: string;
    title: string;
    icon: string;
    dragItemType: DragItemType;
    dropZone: DropZoneType;
    containerId?: string;
    connectedContainerIds?: string[];
    config: Array<ControlProperty>;
    getConnectedContainerIds?(): string[];
}

export abstract class BaseDragItem implements IDragItem {
    public key: string;
    public icon: string;
    public title: string;
    public dragItemType: DragItemType;
    public containerId?: string;
    public connectedContainerIds: string[];
    public config: Array<ControlProperty>;
    dropZone: DropZoneType;

    constructor() {
        this.dropZone = DropZoneTypeEnum.ROOT;
    }

    public getConnectedContainerIds(): string[] {
        return [this.containerId];
    }
}
