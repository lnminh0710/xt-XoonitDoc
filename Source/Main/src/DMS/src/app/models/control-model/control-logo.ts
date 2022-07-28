import { ControlBase } from './control-base';

export class LogoControl extends ControlBase<string> {
    public controlType: string = 'logo';

    public constructor(init?: Partial<LogoControl>) {
        super(init);
        Object.assign(this, init);
    }
}
