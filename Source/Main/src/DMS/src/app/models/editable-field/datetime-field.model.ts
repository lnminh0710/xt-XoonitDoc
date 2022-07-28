import { BaseFieldModel } from './base-field.model';

// Ref: https://editor.datatables.net/reference/field/datetime

export class DatetimeFieldModel extends BaseFieldModel {
    public type: string = 'datetime';
    public def: any = function () { };
    public format: string = 'YYYY-MM-DD';
    public opts: any = {
        disableDays: null,
        firstDay: 1,
        maxDate: null,
        minDate: null,
        minutesIncrement: 1,
        momentStrict: false,
        momentLocale: 'en',
        secondsIncrement: 1,
        showWeekNumber: false,
        yearRange: 10
    };

    public constructor(init?: Partial<DatetimeFieldModel>) {
        super(init);
        Object.assign(this, init);
    }
}