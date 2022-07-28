export class CommunicationTypeModel {
    public textValue: string = null;
    public idValue: string = null;

    get label(): string {
        return this.textValue;
    }

    get value(): string {
        return this.textValue;
    }

    public constructor(init?: Partial<CommunicationTypeModel>) {
        Object.assign(this, init);
    }
}
