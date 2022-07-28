import { BaseFieldModel } from './base-field.model';

// Ref: https://editor.datatables.net/reference/field/select

export class SelectFieldModel extends BaseFieldModel {
    public type:string = 'select'
    public options: any = null;
    public multiple: boolean = false;
    public separator: string = '';
    public placeholder: any = undefined;
    public placeholderDisabled: boolean = true;
    public placeholderValue: string = '';

    public constructor(init?: Partial<SelectFieldModel>) {
        super(init);
        Object.assign(this, init);
    }
}