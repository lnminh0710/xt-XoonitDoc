/**
 * Currency
 */
export class Currency {
    public idRepCurrencyCode: number;
    public currencyCode: string;

    public constructor(init?: Partial<Currency>) {
        Object.assign(this, init);
    }
}