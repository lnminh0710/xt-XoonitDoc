import { DragItemTypeEnum } from '../drag-item-type.enum';
import { BaseDragItem } from '../drag-item.interface';
import { ControlProperty, ControlTypeConst, DropdownControlProperty } from '../control-property';

export class RangeDateDragItem extends BaseDragItem {

    constructor(params?: Partial<RangeDateDragItem>) {
        super();
        Object.assign(this, params);
        this.dragItemType = DragItemTypeEnum.RANGE_DATEPICKER;
        this.title = 'Rang Date';
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
                        name: 'Min Date',
                        visible: true
                    }),
                    new ControlProperty({
                        controlType: ControlTypeConst.TEXTBOX,
                        name: 'Validate min date message',
                        visible: true
                    }),
                    new ControlProperty({
                        controlType: ControlTypeConst.TEXTBOX,
                        name: 'Max Date',
                        visible: true
                    }),
                    new ControlProperty({
                        controlType: ControlTypeConst.TEXTBOX,
                        name: 'Validate max date message',
                        visible: true
                    }),
                    new ControlProperty({
                        controlType: ControlTypeConst.TEXTBOX,
                        name: 'Message when From  > To',
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
                        controlType: ControlTypeConst.CHECKBOX,
                        name: 'Allow Input',
                        visible: true
                    }),
                    new DropdownControlProperty({
                        controlType: ControlTypeConst.DROPDOWN,
                        name: 'Date Format',
                        visible: true,
                        options: [
                            { key: 'dd.MM.yyyy', value: 'dd.MM.yyyy' },
                            { key: 'dd/MM/yyyy', value: 'dd/MM/yyyy' },
                            { key: 'yyyy-MM-dd', value: 'yyyy-MM-dd' }
                        ]
                    }),
                ]
            })
        ];
    }
}
