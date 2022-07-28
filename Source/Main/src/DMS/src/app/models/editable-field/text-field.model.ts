import { BaseFieldModel } from './base-field.model';

// Ref: https://editor.datatables.net/reference/field/text

export class TextFieldModel extends BaseFieldModel {
    public type: string = 'text';
    public attr: any = null;

    public constructor(init?: Partial<TextFieldModel>) {
        super(init);
        Object.assign(this, init);
    }
}