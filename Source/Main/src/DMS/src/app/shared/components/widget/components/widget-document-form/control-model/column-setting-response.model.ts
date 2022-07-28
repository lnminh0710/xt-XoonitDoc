import { BaseControl } from './base-control.model';

export class ColumnSettingReponseModel {
    listControl: BaseControl<any>[];
    numberOfComboBox: number;

    constructor() {
        this.listControl = [];
        this.numberOfComboBox = 0;
    }
}

export class ColumnSettingModel {
    columnName: string;
    dataLength: string;
    dataType: string;
    originalColumnName: string;
    setting: SettingField;
    value: string;
}

export class SettingField {
    displayField: DisplaySettingField;
    controlType: ControlTypeSettingField;
}

export class DisplaySettingField {
    hidden: string;
    readOnly: string;
    orderBy: string;
}

export class ControlTypeSettingField {
    hidden: string;
    readOnly: string;
    orderBy: string;
}
