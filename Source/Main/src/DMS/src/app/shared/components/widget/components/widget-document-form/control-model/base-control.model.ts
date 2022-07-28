import { DocumentFormType } from '@app/models/administration-document/document-form/document-form-type.model';
import { ValidatorsSetting } from '@app/models/common/column-definition.model';

export class BaseControl<T> {
    value: T;
    originalColumnName: string; // key
    columnName: string; // label
    required: boolean;
    orderBy: number;
    controlType: string;
    dataLength: string;
    wordsCoordinates: string;
    dataType: string;
    groupField: string;
    idRepTableModuleTemplateName: number;
    idTableModuleEntityTemplate: number;
    setting: any[];
    documentFormType: DocumentFormType;
    documentFormName: string;
    prefixTableName: string;
    canFocus: boolean;
    hidden: boolean;
    readOnly: boolean;
    ignoreKeyCodes: number[];
    validators: ValidatorsSetting;
    isFocus: boolean;

    constructor(
        options: {
            value?: T;
            originalColumnName?: string;
            columnName?: string;
            required?: boolean;
            orderBy?: number;
            controlType?: string;
            dataLength?: string;
            wordsCoordinates?: string;
            dataType?: string;
            groupField?: string;
            idRepTableModuleTemplateName?: number;
            idTableModuleEntityTemplate?: number;
            setting?: any[];
            documentFormType?: DocumentFormType;
            documentFormName?: string;
            prefixTableName?: string;
            canFocus?: boolean;
            hidden?: boolean;
            readOnly?: boolean;
            ignoreKeyCodes?: number[];
            validators?: ValidatorsSetting
        } = {},
    ) {
        this.value = options.value;
        this.originalColumnName = options.originalColumnName || '';
        this.columnName = options.columnName || '';
        this.required = !!options.required;
        this.orderBy = options.orderBy === undefined ? 1 : options.orderBy;
        this.controlType = options.controlType || '';
        this.dataLength = options.dataLength || '';
        this.wordsCoordinates = options.wordsCoordinates || '';
        this.dataType = options.dataType || '';
        this.groupField = options.groupField || '';
        this.idRepTableModuleTemplateName = options.idRepTableModuleTemplateName || null;
        this.idTableModuleEntityTemplate = options.idTableModuleEntityTemplate || null;
        this.setting = options.setting || null;
        this.documentFormType = options.documentFormType || null;
        this.documentFormName = options.documentFormName || '';
        this.prefixTableName = options.prefixTableName || '';
        this.canFocus = typeof options.canFocus === 'undefined' || options.canFocus === null ? true : false;
        this.hidden = options.hidden || false;
        this.readOnly = options.readOnly || false;
        this.ignoreKeyCodes = options.ignoreKeyCodes || null;
        this.validators = options.validators || null;
    }
}

export class PatternSetting {
    regex: string;
    message: string;
}

export const ControlType = {
    TEXT_BOX: 'textbox',
    TEXT_AREA: 'textArea',
    RADIO: 'radioToggle',
    DROP_DOWN: 'dropdown',
    DATE_TIME: 'datetime',
    AUTOCOMPLETE: 'autocomplete',
};
