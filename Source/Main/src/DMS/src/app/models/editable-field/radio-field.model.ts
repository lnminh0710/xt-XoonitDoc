import { BaseFieldModel } from './base-field.model';

// Ref: https://editor.datatables.net/reference/field/radio

export class RadioFieldModel extends BaseFieldModel {
    public type: string = 'radio';
    public options: any = null;
    public optionsPair: any = null;

    constructor(init?: Partial<RadioFieldModel>) {
        super(init);
        Object.assign(this, init);
    }
}