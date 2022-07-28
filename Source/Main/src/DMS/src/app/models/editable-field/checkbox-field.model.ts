import { BaseFieldModel } from './base-field.model';

// Ref: https://editor.datatables.net/reference/field/checkbox

export class CheckboxFieldModel extends BaseFieldModel {
    public type: string = 'checkbox';
    public options: Array<any> = [];
    public optionsPair: any = null;
    public separator: string = null;
    public unselectedValue: any = null;

    public constructor(init?: Partial<CheckboxFieldModel>) {
        super(init);
        Object.assign(this, init);
    }
}