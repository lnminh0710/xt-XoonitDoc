export class ParkedItemModel {
    public id: any = {};
    public selected: boolean = false;
    public isNew: boolean = false;
    public isNewInsertedItem: boolean = false;
    public createDateValue: any;//Date
    [key: string]: any;

    public constructor(init?: Partial<ParkedItemModel>) {
        Object.assign(this, init);
    }
}
