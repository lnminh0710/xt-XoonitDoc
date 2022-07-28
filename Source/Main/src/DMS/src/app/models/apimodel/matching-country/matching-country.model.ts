export class MatchingCountry {
    public IdRepIsoCountryCode: number;
    public DefaultValue: string;
    public IsoCode: string;
    public Selected: boolean;
    public Country: string;

    public constructor(init?: Partial<MatchingCountry>) {
        Object.assign(this, init);
        this.Country = this.IsoCode + ',' + this.DefaultValue;
    }
}