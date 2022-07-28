export class CheckCampaignNumber {
    public IdRepSalesCampaignNamePrefix: string;
    public CampaignNr1: string;
    public CampaignNr2: string;
    public CampaignNr3: string;    

    public constructor(init?: Partial<CheckCampaignNumber>) {
        Object.assign(this, init);        
    }
}