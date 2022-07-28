export class CommunicationModel {
    public communicationId: string = null;
    public communicationType: string = null;
    public communicationValue: string = null;
    public communicationNote: string = null;
    public select: boolean = null;

    public constructor(init?: Partial<CommunicationModel>) {
        Object.assign(this, init);
    }
}
