import { DragItemTypeEnum } from '../drag-item-type.enum';
import { BaseDragItem } from '../drag-item.interface';
import { ControlProperty, ControlTypeConst, DropdownControlProperty } from '../control-property';

export class CheckboxDragItem extends BaseDragItem {

    constructor(params?: Partial<CheckboxDragItem>) {
        super();
        Object.assign(this, params);
        this.dragItemType = DragItemTypeEnum.CHECKBOX;
        this.title = 'Checkbox';
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
                        name: 'List items',
                        visible: true
                    }),
                    new DropdownControlProperty({
                        controlType: ControlTypeConst.DROPDOWN,
                        name: 'Layout',
                        visible: true,
                        options: [
                            { key: 'Horizontal', value: 'Horizontal' },
                            { key: "Vertical", value: "Vertical" }
                        ]
                    }),
                    new ControlProperty({
                        controlType: ControlTypeConst.CHECKBOX,
                        name: 'Mandatory',
                        visible: true
                    }),
                    new ControlProperty({
                        controlType: ControlTypeConst.TEXTBOX,
                        name: 'Validate mandantory message',
                        visible: true
                    }),
                    new DropdownControlProperty({
                        controlType: ControlTypeConst.DROPDOWN,
                        name: 'Title Position',
                        visible: true,
                        options: [
                            { key: 'Left', value: 'Left' },
                            { key: "Right", value: "Right" }
                        ]
                    }),
                ]
            })
        ];
    }
}
