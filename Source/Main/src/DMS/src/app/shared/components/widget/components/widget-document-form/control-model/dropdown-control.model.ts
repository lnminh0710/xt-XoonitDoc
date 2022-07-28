import { BaseControl, ControlType } from './base-control.model';

export class DropdownControl extends BaseControl<string> {
    controlType = ControlType.DROP_DOWN;
    options: { key: string; value: string }[] = [];
    defaultOption: string;

    constructor(options: {} = {}) {
        super(options);
        this.options = options['options'] || [];
        this.defaultOption = options['defaultOption'] || '';
    }
}
