import { ControlBase } from './control-base';

export class NumberBoxControl extends ControlBase<number> {
    public controlType: string = 'numberbox';
    public type: string = '';
    public maxValue: number;

    public constructor(init?: Partial<NumberBoxControl>) {    	
        super(init);
        Object.assign(this, init);        
    }
}
