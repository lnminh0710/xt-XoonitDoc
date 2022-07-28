export class SignalRNotifyModel {
    public GroupName: string = '';
    public IdLogin: string = '';
    public IpAddress: string = '';
    public Message: string = '';
    public Data: any = undefined; // Object
    public IdApplicationOwner: string = '';
    public UserName: string = '';    
    public DisplayName: string = '';
    public Color: string = '';
    public Type: string = ''; //WidgetForm,CustomerForm,...
    public ObjectId: string = ''; //CustomerId, PersonId, ArticleId, OrderId,...
    public Job: string = ''; //Editing
    public Action: string = ''; //ConnectEditing, DisconnectEditing, IsThereAnyoneEditing

    public constructor(init?: Partial<SignalRNotifyModel>) {
        Object.assign(this, init);
    }
}
