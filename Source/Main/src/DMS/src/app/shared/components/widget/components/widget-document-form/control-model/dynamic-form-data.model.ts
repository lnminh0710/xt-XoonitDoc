import { BaseControl } from './base-control.model';

export class DynamicFormData {
    nameForm: string;
    listControl: BaseControl<any>[];

    constructor() {
        this.nameForm = '';
        this.listControl = [];
    }
}

export const EnumGroupField = {
    contact: 'Contact',
    invoice: 'Invoice',
};
