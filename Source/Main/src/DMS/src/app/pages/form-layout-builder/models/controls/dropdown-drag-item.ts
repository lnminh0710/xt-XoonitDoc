import { DragItemTypeEnum } from '../drag-item-type.enum';
import { BaseDragItem } from '../drag-item.interface';
import { ControlProperty, ControlTypeConst, DropdownControlProperty } from '../control-property';
import { ComboBoxTypeConstant } from '../../../../app.constants';

export class DropdownDragItem extends BaseDragItem {

    constructor(params?: Partial<DropdownDragItem>) {
        super();
        Object.assign(this, params);
        this.dragItemType = DragItemTypeEnum.DROPDOWN;
        this.title = 'Dropdown';
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
                        name: 'List Items',
                        visible: true
                    }),
                    new DropdownControlProperty({
                        controlType: ControlTypeConst.DROPDOWN,
                        name: 'Data source',
                        visible: true,
                        keyFromComboApi: ComboBoxTypeConstant.comboBoxType
                    }),
                    new DropdownControlProperty({
                        controlType: ControlTypeConst.DROPDOWN,
                        name: 'Default Selected',
                        visible: true,
                        loadDataFromField: 'Data source'
                    }),
                    new ControlProperty({
                        controlType: ControlTypeConst.CHECKBOX,
                        name: 'Allow to input',
                        visible: true
                    }),
                    new ControlProperty({
                        controlType: ControlTypeConst.CHECKBOX,
                        name: 'Multi Select',
                        visible: true
                    }),
                    new ControlProperty({
                        controlType: ControlTypeConst.CHECKBOX,
                        name: 'Multi Column',
                        visible: true
                    }),
                    new ControlProperty({
                        controlType: ControlTypeConst.CHECKBOX,
                        name: 'Mandatory',
                        visible: true
                    }),
                    new ControlProperty({
                        controlType: ControlTypeConst.TEXTBOX,
                        name: 'Validate mandatory message',
                        visible: true
                    })
                ]
            })
        ];
    }
}
