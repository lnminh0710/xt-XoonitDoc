import { ControlBase } from './control-base';

export class DateControl extends ControlBase<Date> {
    public controlType: string = 'date';
    public format: string;
    public constructor(options: {} = {}) {
        super(options);
    }
}
