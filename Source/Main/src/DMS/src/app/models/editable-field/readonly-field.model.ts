import { BaseFieldModel } from './base-field.model';

// Ref: https://editor.datatables.net/reference/field/readonly

export class ReadonlyFieldModel extends BaseFieldModel {
    public type: string = 'readonly';

    public constructor(init?: Partial<ReadonlyFieldModel>) {
        super(init);
        Object.assign(this, init);
    }
}