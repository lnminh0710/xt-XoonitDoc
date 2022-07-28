import { BaseControl, ControlType } from './base-control.model';

export class DatetimeControl extends BaseControl<string> {
    controlType = ControlType.DATE_TIME;
    type: string;
    className: string;
    partern: string;

    constructor(options: {} = {}) {
        super(options);
        this.type = options['type'] || 'text';
        this.className = options['className'] || '';
    }
}
