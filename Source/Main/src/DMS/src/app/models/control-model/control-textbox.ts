import { ControlBase } from './control-base';

export class TextboxControl extends ControlBase<string> {
    public controlType: string = 'textbox';
    public type: string = '';

    public constructor(init?: Partial<TextboxControl>) {
        super(init);
        Object.assign(this, init);
    }
}


export class TextboxMaskControl extends ControlBase<string> {
    public controlType: string = 'textboxMask';
    public mask?: string = '';
    public constructor(init?: Partial<TextboxMaskControl>) {
        super(init);
        Object.assign(this, init);
    }
}
