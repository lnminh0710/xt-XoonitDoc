import { BaseFieldModel } from './base-field.model';

// Ref: https://editor.datatables.net/reference/field/hidden

export class HiddenFieldModel extends BaseFieldModel {
    public type: string = 'hidden';
    public default: string = '';

    public constructor(init?: Partial<HiddenFieldModel>) {
        super(init);
        Object.assign(this, init);
    }
}