/**
 * PaymentType
 */
export class PaymentType {
    public idRepInvoicePaymentType: number;
    public paymentType: string;
    public postageCosts: number;
    public paymentGroup: number;

    public constructor(init?: Partial<PaymentType>) {
        Object.assign(this, init);
    }
}
