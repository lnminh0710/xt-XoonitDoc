import { DragItemTypeEnum } from '../drag-item-type.enum';
import { BaseDragItem, IDragItem } from '../drag-item.interface';
import { ControlProperty, ControlTypeConst, DropdownControlProperty } from '../control-property';

export interface ITextboxDragItem extends IDragItem {}

export class TextboxDragItem extends BaseDragItem implements ITextboxDragItem {

    constructor(params?: Partial<TextboxDragItem>) {
        super();
        Object.assign(this, params);
        this.dragItemType = DragItemTypeEnum.TEXTBOX;
        this.title = 'Textbox';
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
                    new DropdownControlProperty({
                        controlType: ControlTypeConst.DROPDOWN,
                        name: 'Dependency lookup field',
                        visible: true,
                        dropdownFieldDepend: 'autocomplete'
                    }),
                    new ControlProperty({
                        controlType: ControlTypeConst.DROPDOWN,
                        name: 'Data field from lookup',
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
