import { BaseControl, ControlType } from './base-control.model';

export class AutocompleteControl extends BaseControl<string> {
    controlType = ControlType.AUTOCOMPLETE;
    options: { key: string; value: string }[] = [];
    className: string;

    constructor(options: {} = {}) {
        super(options);
        this.options = options['options'] || [];
        this.className = options['className'] || '';
    }
}
