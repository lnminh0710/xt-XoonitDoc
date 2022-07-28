import { ControlBase } from './control-base';

export class RangeControl extends ControlBase<string> {
    public controlType: string = 'range';
    public type: string = '';

    public constructor(init?: Partial<RangeControl>) {
        super(init);
        Object.assign(this, init);
    }
}
