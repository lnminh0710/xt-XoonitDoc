export interface ColumnDefinition {
    columnName: string;
    columnHeader: string;
    value: any;
    dataType: string;
    dataLength?: number;
    originalColumnName: string;
    setting: ColumnDefinitionSetting;
}

export interface ColumnDefinitionSetting {
    DisplayField?: DisplayFieldSetting;
    ControlType?: ControlTypeSetting;
    Validators?: ValidatorsSetting;
    CallConfigs?: CallConfigSetting[];
    CustomStyle?: string;
    CustomClass?: string;
}

export interface DisplayFieldSetting {
    Hidden?: string;
    ReadOnly?: string;
    OrderBy?: string;
    GroupHeader?: string;
    Icon: string;
}

export interface ControlTypeSetting {
    Type?: string;
    Value?: string;
    Cols?: string;
    Rows?: string;
    IsResize?: string;
}

export interface ValidatorsSetting {
    IgnoreKeyCharacters?: string;
    MaxLength?: string;
    IsRequired?: string;
    Pattern?: PatternValidator;
}

export interface PatternValidator {
    Message: string;
    Regex: string;
}

export interface CallConfigSetting {
    Alias: string;
    Value: any;
    IsExtParam: boolean;
    JsonText: CallConfigJsonText;
}

export interface CallConfigJsonText {
    Name: string;
    Path: string;
}

export interface DropdownSetting extends ControlTypeSetting {
    displayMember: string;
    valueMember: string;
}

export interface AutocompleteSetting extends ControlTypeSetting {
    displayMember: string;
    valueMember: string;
}
