import { DragItemTypeEnum } from '../drag-item-type.enum';
import { BaseDragItem } from '../drag-item.interface';
import { ControlProperty, ControlTypeConst, DropdownControlProperty } from '../control-property';

export class NumericDragItem extends BaseDragItem {

    constructor(params?: Partial<NumericDragItem>) {
        super();
        Object.assign(this, params);
        this.dragItemType = DragItemTypeEnum.NUMERIC;
        this.title = 'Numeric';
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
                        name: 'Min',
                        visible: true
                    }),
                    new ControlProperty({
                        controlType: ControlTypeConst.TEXTBOX,
                        name: 'Validate min message',
                        visible: true
                    }),
                    new ControlProperty({
                        controlType: ControlTypeConst.NUMERIC,
                        name: 'Max',
                        visible: true
                    }),
                    new ControlProperty({
                        controlType: ControlTypeConst.TEXTBOX,
                        name: 'Validate max message',
                        visible: true
                    }),
                    new ControlProperty({
                        controlType: ControlTypeConst.TEXTBOX,
                        name: 'Title',
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
                        controlType: ControlTypeConst.NUMERIC,
                        name: 'Decimal Place',
                        visible: true
                    }),
                    new DropdownControlProperty({
                        controlType: ControlTypeConst.DROPDOWN,
                        name: 'Use 1000 seperator',
                        visible: true,
                        options: [
                            { key: ',', value: ',' },
                            { key: "'", value: "'" },
                            { key: '.', value: '.' }
                        ]
                    })
                ]
            })
        ];
    }
}
