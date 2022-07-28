import { FormGroup } from '@angular/forms';
export class FormGroupChild {
    public form: FormGroup = null;
    public name: string = null;
    
    public constructor(init?: Partial<FormGroupChild>) {
        Object.assign(this, init);
    }
}

export class FormModel {
    public formValue: any = null;
    public rawData: any = null;
    public mappedData: any = null;
    public name: string = null;
    public isValid: boolean = false;
    public isDirty: boolean = false;
    [key: string]: any;
    public constructor(init?: Partial<FormModel>) {
        Object.assign(this, init);
    }
}