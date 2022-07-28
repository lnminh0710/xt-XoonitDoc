import { ControlBase } from './control-base';

export class CheckboxControl extends ControlBase<boolean> {
    public controlType: string = 'checkbox';
    public groupName: string = '';

    public constructor(init?: Partial<CheckboxControl>) {
        super(init);
        Object.assign(this, init);
    }
}
