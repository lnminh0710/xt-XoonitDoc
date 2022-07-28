export class ReturnPaymentModel {
    public returnReason: any = null;
    public returnNotes: string = null;

    public constructor(init?: Partial<ReturnPaymentModel>) {
        Object.assign(this, init);
    }
}