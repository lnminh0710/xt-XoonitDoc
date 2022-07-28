export class BrowserInfoModel {
    public IP: string = null;
    public Screen: string = null;
    public Browser: string = null;
    public BrowserVersion: string = null;
    public BrowserMajorVersion: string = null;
    public Mobile: string = null;
    public Os: string = null;
    public OsVersion: string = null;
    public Cookies: string = null;
    public Module: string = null;
    public SubModule: string = null;
    public SelectedTab: string = null;
    public SelectedODETab: string = null;
    public SelectedSubTab: string = null;
    public EntityId: string = null;
    public Mediacode: string = null;
    public CampaignNumber: string = null;
    public CustomerNumber: string = null;
    public Url: string = null;
    public CaptureTime: string = null;
    public IdScansContainerItems: string = null;
    public SendToAdminImage: string = null;    
    
    public constructor(init?: Partial<BrowserInfoModel>) {
        Object.assign(this, init);
    }
}
