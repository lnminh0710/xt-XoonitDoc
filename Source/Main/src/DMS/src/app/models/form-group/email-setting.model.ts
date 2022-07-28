
export class EmailTemplateModel {
    public id: any = null;
    public name: string = null;
    public emailBody: any = null;

    public constructor(init?: Partial<EmailTemplateModel>) {
        Object.assign(this, init);
    }
}

export class PlaceHolderModel {
    public id: any = null;
    public name: string = null;
    public data: string = null;

    public constructor(init?: Partial<PlaceHolderModel>) {
        Object.assign(this, init);
    }
}
