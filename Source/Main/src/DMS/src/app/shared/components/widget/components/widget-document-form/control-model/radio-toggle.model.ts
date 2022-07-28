import { BaseControl, ControlType } from './base-control.model';

export class RadioToggleControl extends BaseControl<string> {
    controlType = ControlType.RADIO;
    textValueTrue: string;
    textValueFalse: string;

    constructor(options: {} = {}) {
        super(options);
        this.textValueTrue = options['textValueTrue'] || '';
        this.textValueFalse = options['textValueFalse'] || '';
    }
}
