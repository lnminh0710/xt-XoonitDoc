import { BaseControl, ControlType } from './base-control.model';

export class TextControl extends BaseControl<string> {
    controlType = ControlType.TEXT_BOX;
    type: string;
    className: string;
    isShowClearField: boolean;

    constructor(options: {} = {}) {
        super(options);
        this.type = options['type'] || 'text';
        this.className = options['className'] || '';
    }
}
