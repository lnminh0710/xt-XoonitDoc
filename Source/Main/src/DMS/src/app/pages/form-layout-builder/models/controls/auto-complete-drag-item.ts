import { DragItemTypeEnum } from '../drag-item-type.enum';
import { BaseDragItem } from '../drag-item.interface';
import { ControlProperty, ControlTypeConst } from '../control-property';

export class AutoCompleteDragItem extends BaseDragItem {

    constructor(params?: Partial<AutoCompleteDragItem>) {
        super();
        Object.assign(this, params);
        this.dragItemType = DragItemTypeEnum.AUTO_COMPLETE;
        this.title = 'Auto Complete';
        this.setConfig();
    }

    private setConfig() {
        this.config = [
            new ControlProperty({
                name: 'General',
                visible: true,
                children: [
                    new ControlProperty({
                        controlType: ControlTypeConst.NUMERIC,
                        name: 'Min Length',
                        visible: true
                    }),
                    new ControlProperty({
                        controlType: ControlTypeConst.TEXTBOX,
                        name: 'Validate min length message',
                        visible: true
                    }),
                    new ControlProperty({
                        controlType: ControlTypeConst.NUMERIC,
                        name: 'Max Length',
                        visible: true
                    }),
                    new ControlProperty({
                        controlType: ControlTypeConst.TEXTBOX,
                        name: 'Validate max length message',
                        visible: true
                    }),
                    new ControlProperty({
                        controlType: ControlTypeConst.CHECKBOX,
                        name: 'Mandantory',
                        visible: true
                    }),
                    new ControlProperty({
                        controlType: ControlTypeConst.TEXTBOX,
                        name: 'Validate mandantory message',
                        visible: true
                    }),
                    new ControlProperty({
                        controlType: ControlTypeConst.TEXTBOX,
                        name: 'Regex',
                        visible: true
                    }),
                    new ControlProperty({
                        controlType: ControlTypeConst.TEXTBOX,
                        name: 'Validate Regex message',
                        visible: true
                    }),
                    new ControlProperty({
                        controlType: ControlTypeConst.DROPDOWN,
                        name: 'Lookup data',
                        visible: true
                    }),
                    new ControlProperty({
                        controlType: ControlTypeConst.TEXTBOX,
                        name: 'Placeholder',
                        visible: true
                    }),
                    new ControlProperty({
                        controlType: ControlTypeConst.TEXTBOX,
                        name: 'Mask Textbox',
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
