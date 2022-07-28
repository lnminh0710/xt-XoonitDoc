export class SendOrderToAdministatorModel {
	public idLoginToAdmin:number;
    public idScansContainerItems: number ;
    public idRepNotificationType:number;
    public notes:string;
    
	public constructor(init?: Partial<SendOrderToAdministatorModel>) {
        Object.assign(this, init);
    }
}