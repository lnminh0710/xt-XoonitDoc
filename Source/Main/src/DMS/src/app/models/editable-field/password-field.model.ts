import { BaseFieldModel } from './base-field.model';

// Ref: https://editor.datatables.net/reference/field/password

export class PasswordFieldModel extends BaseFieldModel {
    public type: string = 'password';

    constructor(init?: Partial<PasswordFieldModel>) {
        super(init);
        Object.assign(this, init);
    }
}