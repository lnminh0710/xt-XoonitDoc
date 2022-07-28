export class EmailModel {
    public ToEmail: string = null;
    public Subject: string = null;
    public Body: string = null;
    public Priority: string = null;
    public ImageAttached: Array<string> = [];
    public BrowserInfo: any = null;
    public Type: string = null;
    public IdRepNotificationType: any = null;
    public DatabaseName: string = null;
    public FileAttachedUrl: string = null;

    public constructor(init?: Partial<EmailModel>) {
        Object.assign(this, init);
    }
}
