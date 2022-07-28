import { ControlBase } from './control-base';

export class ButtonControl extends ControlBase<string> {
    public controlType: string = 'button';
    public clickFunc: Function = null;

    public constructor(init?: Partial<ButtonControl>) {
        super(init);
        Object.assign(this, init);
    }
}
