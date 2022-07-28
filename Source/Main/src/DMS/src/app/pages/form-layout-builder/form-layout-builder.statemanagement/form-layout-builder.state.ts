import { IDragItem } from '../models/drag-item.interface';

export interface IFormLayoutBuilderState {
    zoneControlTemplateId: string;
    zoneContainerIds: string[];
    controls: Array<IDragItem>;
    currentSettingControl: IDragItem;
}
