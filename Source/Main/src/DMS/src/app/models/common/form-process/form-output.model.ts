
export class FormOutputModel {
    public formValue: any = null;
    public submitResult: any = null;
    public isValid: boolean = null;
    public isDirty: boolean = null;
    public returnID: string = null;
    public errorMessage?: string = null;
    public customData?: any = null;

    public constructor(init?: Partial<FormOutputModel>) {
        Object.assign(this, init);
    }
}
