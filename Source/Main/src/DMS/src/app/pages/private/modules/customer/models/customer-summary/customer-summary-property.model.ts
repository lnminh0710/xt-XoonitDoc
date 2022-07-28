export class CustomerSummaryProperty {
    public OriginalColumnName: string;
    public Value: string;
    public Style: any = {};
    public Date?: any;

    public constructor(init?: Partial<CustomerSummaryProperty>) {
        Object.assign(this, init);
    }
}
