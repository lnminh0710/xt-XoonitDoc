import { BaseFieldModel } from './base-field.model';

// Ref: https://editor.datatables.net/reference/field/textarea

export class TextareaFieldModel extends BaseFieldModel {
    public type: string = 'textarea';
    public attr: any = null;

    public constructor(init?: Partial<TextareaFieldModel>) {
        super(init);
        Object.assign(this, init);
    }
}