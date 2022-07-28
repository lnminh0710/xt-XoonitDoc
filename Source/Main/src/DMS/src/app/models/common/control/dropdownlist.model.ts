
export class DropdownListModel {
    public textValue: string = '';
    public idValue: any = null;

    public constructor(init?: Partial<DropdownListModel>) {
        Object.assign(this, init);
    }
}