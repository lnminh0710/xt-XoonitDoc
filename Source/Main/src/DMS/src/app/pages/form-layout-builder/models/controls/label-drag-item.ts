import { DragItemTypeEnum } from '../drag-item-type.enum';
import { BaseDragItem } from '../drag-item.interface';
import { ControlProperty, ControlTypeConst } from '../control-property';

export class LabelDragItem extends BaseDragItem {

    constructor(params?: Partial<LabelDragItem>) {
        super();
        Object.assign(this, params);
        this.dragItemType = DragItemTypeEnum.LABEL;
        this.title = 'Label';
        this.setConfig();
    }

    private setConfig() {
        this.config = [
            new ControlProperty({
                name: 'General',
                visible: true,
                children: [
                    new ControlProperty({
                        controlType: ControlTypeConst.TEXTBOX,
                        name: 'Id',
                        visible: true
                    }),
                    new ControlProperty({
                        controlType: ControlTypeConst.TEXTBOX,
                        name: 'Title',
                        visible: true
                    })
                ]
            })
        ];
    }
}
