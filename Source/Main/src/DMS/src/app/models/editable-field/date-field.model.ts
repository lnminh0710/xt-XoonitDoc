import { BaseFieldModel } from './base-field.model';

// Ref: https://editor.datatables.net/reference/field/date

export class DateFieldModel extends BaseFieldModel {
    public type: string = 'date';
    public def: any = function () { };
    public dateFormat: string = null;
    public opts: any = null;

    public constructor(init?: Partial<DateFieldModel>) {
        super(init);
        Object.assign(this, init);
    }
}