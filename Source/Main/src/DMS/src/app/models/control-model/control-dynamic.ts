import { ControlBase } from './control-base';

export class DynamicControl extends ControlBase<any> {
    public controlType: string = 'dynamic';
    public isRawDynamicData: boolean = false;

    public constructor(init?: Partial<DynamicControl>) {
        super(init);
        Object.assign(this, init);
    }
}
