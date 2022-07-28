import { BaseControl, ControlType } from './base-control.model';

export class TextAreaControl extends BaseControl<string> {
    controlType = ControlType.TEXT_AREA;
    type: string;
    rows: number;

    constructor(options: {} = {}) {
        super(options);
        this.type = options['type'] || '';
        this.rows = options['rows'] || 1;
    }
}
